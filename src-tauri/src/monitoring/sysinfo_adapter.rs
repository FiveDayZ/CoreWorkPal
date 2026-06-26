use std::{
    process::Command,
    time::{Duration, Instant},
};

use sysinfo::{Components, Networks, ProcessRefreshKind, System, UpdateKind};

use crate::{
    models::{
        current_timestamp_ms, HardwareDeviceInventory, HardwareSnapshot, ProcessUsageSnapshot,
    },
    monitoring::HardwareSensorAdapter,
};

#[cfg(windows)]
use std::os::windows::process::CommandExt;

#[cfg(windows)]
use super::windows_perf::{
    query_primary_gpu_info, WindowsGpuInfo, WindowsPerformanceCounters,
};

#[cfg(windows)]
const CREATE_NO_WINDOW: u32 = 0x08000000;

pub struct SysinfoAdapter {
    system: System,
    components: Components,
    networks: Networks,
    last_sample_at: Instant,
    cached_nvidia_sample: Option<NvidiaSmiSample>,
    last_nvidia_query_at: Option<Instant>,
    cached_device_inventory: HardwareDeviceInventory,
    #[cfg(windows)]
    gpu_info: WindowsGpuInfo,
    #[cfg(windows)]
    performance_counters: Option<WindowsPerformanceCounters>,
}

impl SysinfoAdapter {
    pub fn new() -> Self {
        let mut system = System::new_all();
        system.refresh_all();
        let mut components = Components::new_with_refreshed_list();
        components.refresh();
        let mut networks = Networks::new_with_refreshed_list();
        networks.refresh();

        Self {
            system,
            components,
            networks,
            last_sample_at: Instant::now(),
            cached_nvidia_sample: None,
            last_nvidia_query_at: None,
            cached_device_inventory: query_device_inventory().unwrap_or_default(),
            #[cfg(windows)]
            gpu_info: query_primary_gpu_info(),
            #[cfg(windows)]
            performance_counters: WindowsPerformanceCounters::new(),
        }
    }

    fn sample_network_bytes_per_second(&mut self, elapsed_seconds: f32) -> (Option<f32>, Option<f32>) {
        self.networks.refresh();

        if self.networks.is_empty() {
            return (None, None);
        }

        let received_bytes = self
            .networks
            .iter()
            .map(|(_, network)| network.received())
            .sum::<u64>() as f32;
        let transmitted_bytes = self
            .networks
            .iter()
            .map(|(_, network)| network.transmitted())
            .sum::<u64>() as f32;
        let elapsed = elapsed_seconds.max(0.001);

        (
            Some(received_bytes / elapsed),
            Some(transmitted_bytes / elapsed),
        )
    }

    fn sample_cpu_temperature(&mut self) -> Option<f32> {
        self.components.refresh();
        self.components
            .iter()
            .filter_map(|component| {
                let value = component.temperature();
                value.is_finite().then_some(value)
            })
            .filter(|value| (-30.0..=125.0).contains(value))
            .max_by(|left, right| left.total_cmp(right))
    }

    fn sample_nvidia_smi(&mut self) -> Option<NvidiaSmiSample> {
        const NVIDIA_QUERY_INTERVAL: Duration = Duration::from_secs(3);

        let now = Instant::now();
        if self
            .last_nvidia_query_at
            .is_some_and(|previous| now.duration_since(previous) < NVIDIA_QUERY_INTERVAL)
        {
            return self.cached_nvidia_sample.clone();
        }

        self.last_nvidia_query_at = Some(now);
        if let Some(sample) = query_nvidia_smi() {
            self.cached_nvidia_sample = Some(sample.clone());
        }

        self.cached_nvidia_sample.clone()
    }

    fn sample_processes(&mut self, elapsed_seconds: f32) -> Vec<ProcessUsageSnapshot> {
        self.system.refresh_processes_specifics(
            ProcessRefreshKind::new()
                .with_cpu()
                .with_memory()
                .with_disk_usage()
                .with_exe(UpdateKind::OnlyIfNotSet),
        );

        let current_pid = std::process::id();
        let elapsed = elapsed_seconds.max(0.001);
        let mut processes = self
            .system
            .processes()
            .iter()
            .filter_map(|(pid, process)| {
                let pid = pid.as_u32();
                if pid == current_pid || pid <= 4 {
                    return None;
                }

                let name = process.name().trim();
                if name.is_empty() || should_skip_process_name(name) {
                    return None;
                }

                let disk_usage = process.disk_usage();
                let disk_read_bytes_per_second = (disk_usage.read_bytes > 0)
                    .then_some(disk_usage.read_bytes as f32 / elapsed);
                let disk_write_bytes_per_second = (disk_usage.written_bytes > 0)
                    .then_some(disk_usage.written_bytes as f32 / elapsed);
                let disk_rate = disk_read_bytes_per_second.unwrap_or(0.0)
                    + disk_write_bytes_per_second.unwrap_or(0.0);
                let cpu_usage_percent = process.cpu_usage().max(0.0);
                let memory_bytes = process.memory();

                if cpu_usage_percent < 0.2
                    && memory_bytes < 32 * 1024 * 1024
                    && disk_rate < 8.0 * 1024.0
                {
                    return None;
                }

                Some(ProcessUsageSnapshot {
                    pid,
                    name: name.to_string(),
                    cpu_usage_percent,
                    memory_bytes,
                    disk_read_bytes_per_second,
                    disk_write_bytes_per_second,
                })
            })
            .collect::<Vec<_>>();

        processes.sort_by(|left, right| {
            process_snapshot_score(right)
                .total_cmp(&process_snapshot_score(left))
                .then_with(|| right.memory_bytes.cmp(&left.memory_bytes))
        });
        processes.truncate(32);
        processes
    }
}

impl HardwareSensorAdapter for SysinfoAdapter {
    fn sample(&mut self) -> HardwareSnapshot {
        let now = Instant::now();
        let elapsed_seconds = now.duration_since(self.last_sample_at).as_secs_f32();
        self.last_sample_at = now;

        self.system.refresh_cpu();
        self.system.refresh_memory();

        let total_memory_bytes = self.system.total_memory();
        let used_memory_bytes = self.system.used_memory();
        let memory_usage_percent = if total_memory_bytes > 0 {
            Some((used_memory_bytes as f32 / total_memory_bytes as f32) * 100.0)
        } else {
            None
        };

        let cpu_temperature_celsius = self.sample_cpu_temperature();
        let (network_download_bytes_per_second, network_upload_bytes_per_second) =
            self.sample_network_bytes_per_second(elapsed_seconds);
        let nvidia_sample = self.sample_nvidia_smi();
        let processes = self.sample_processes(elapsed_seconds);

        #[cfg(windows)]
        let performance_sample = self
            .performance_counters
            .as_mut()
            .map(|counters| counters.sample())
            .unwrap_or_default();

        #[cfg(not(windows))]
        let performance_sample = EmptyPerformanceSample::default();

        HardwareSnapshot {
            timestamp: current_timestamp_ms(),
            cpu_usage_percent: Some(self.system.global_cpu_info().cpu_usage()),
            gpu_usage_percent: nvidia_sample
                .as_ref()
                .and_then(|sample| sample.usage_percent)
                .or(performance_sample.gpu_usage_percent),
            memory_usage_percent,
            cpu_temperature_celsius: cpu_temperature_celsius
                .or(performance_sample.cpu_temperature_celsius),
            gpu_temperature_celsius: nvidia_sample
                .as_ref()
                .and_then(|sample| sample.temperature_celsius),
            disk_read_bytes_per_second: performance_sample.disk_read_bytes_per_second,
            disk_write_bytes_per_second: performance_sample.disk_write_bytes_per_second,
            network_download_bytes_per_second,
            network_upload_bytes_per_second,
            cpu_name: self
                .system
                .cpus()
                .first()
                .map(|cpu| cpu.brand().to_string())
                .filter(|name| !name.is_empty()),
            gpu_name: nvidia_sample
                .as_ref()
                .and_then(|sample| sample.name.clone())
                .or_else(|| {
                    #[cfg(windows)]
                    {
                        self.gpu_info.name.clone()
                    }
                    #[cfg(not(windows))]
                    {
                        None
                    }
                }),
            gpu_memory_used_bytes: nvidia_sample
                .as_ref()
                .and_then(|sample| sample.memory_used_bytes)
                .or(performance_sample.gpu_memory_used_bytes),
            gpu_memory_total_bytes: nvidia_sample
                .as_ref()
                .and_then(|sample| sample.memory_total_bytes)
                .or_else(|| {
                    #[cfg(windows)]
                    {
                        self.gpu_info.dedicated_memory_bytes
                    }
                    #[cfg(not(windows))]
                    {
                        None
                    }
                }),
            total_memory_bytes: Some(total_memory_bytes),
            used_memory_bytes: Some(used_memory_bytes),
            cpu_physical_core_count: self.system.physical_core_count().map(|count| count as u32),
            cpu_logical_core_count: Some(self.system.cpus().len() as u32),
            device_inventory: self.cached_device_inventory.clone(),
            processes,
        }
    }
}

fn process_snapshot_score(process: &ProcessUsageSnapshot) -> f32 {
    let disk_rate = process.disk_read_bytes_per_second.unwrap_or(0.0)
        + process.disk_write_bytes_per_second.unwrap_or(0.0);

    process.cpu_usage_percent * 2.0
        + process.memory_bytes as f32 / (128.0 * 1024.0 * 1024.0)
        + disk_rate / (1024.0 * 1024.0)
}

fn should_skip_process_name(name: &str) -> bool {
    let normalized = name.to_ascii_lowercase();
    normalized.contains("coreworkpal")
        || normalized.contains("core-work-pal")
        || normalized == "system idle process"
        || normalized == "idle"
}

#[derive(Debug, Clone, Default)]
struct NvidiaSmiSample {
    name: Option<String>,
    usage_percent: Option<f32>,
    memory_used_bytes: Option<u64>,
    memory_total_bytes: Option<u64>,
    temperature_celsius: Option<f32>,
}

fn query_nvidia_smi() -> Option<NvidiaSmiSample> {
    let mut command = Command::new("nvidia-smi");
    command.args([
        "--query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu",
        "--format=csv,noheader,nounits",
    ]);

    #[cfg(windows)]
    command.creation_flags(CREATE_NO_WINDOW);

    let output = command.output().ok()?;

    if !output.status.success() {
        return None;
    }

    let stdout = String::from_utf8(output.stdout).ok()?;
    stdout.lines().find_map(parse_nvidia_smi_line)
}

fn parse_nvidia_smi_line(line: &str) -> Option<NvidiaSmiSample> {
    let parts = line.split(',').map(str::trim).collect::<Vec<_>>();
    if parts.len() < 5 {
        return None;
    }

    Some(NvidiaSmiSample {
        name: (!parts[0].is_empty()).then(|| parts[0].to_string()),
        usage_percent: parse_f32(parts[1]),
        memory_used_bytes: parse_mib(parts[2]),
        memory_total_bytes: parse_mib(parts[3]),
        temperature_celsius: parse_f32(parts[4]),
    })
}

fn parse_f32(value: &str) -> Option<f32> {
    value.parse::<f32>().ok().filter(|value| value.is_finite())
}

fn parse_mib(value: &str) -> Option<u64> {
    value
        .parse::<f64>()
        .ok()
        .filter(|value| value.is_finite() && *value >= 0.0)
        .map(|value| (value * 1024.0 * 1024.0).round() as u64)
}

#[cfg(windows)]
fn query_device_inventory() -> Option<HardwareDeviceInventory> {
    let script = r#"
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
function Clean($Value) {
  if ($null -eq $Value) { return $null }
  $Text = [string]$Value
  if ([string]::IsNullOrWhiteSpace($Text)) { return $null }
  return $Text.Trim()
}
function Capacity($Value) {
  if ($null -eq $Value) { return $null }
  try {
    $Number = [double]$Value
    if ([double]::IsNaN($Number) -or $Number -le 0) { return $null }
    return [UInt64]$Number
  } catch {
    return $null
  }
}
function Device($Name, $Detail, $Vendor, $CapacityBytes) {
  $CleanName = Clean $Name
  if ($null -eq $CleanName) { return $null }
  return [ordered]@{
    name = $CleanName
    detail = Clean $Detail
    vendor = Clean $Vendor
    capacityBytes = Capacity $CapacityBytes
  }
}
function DecodeMonitorString($Values) {
  if ($null -eq $Values) { return $null }
  $Chars = @()
  foreach ($Value in $Values) {
    if ($Value -eq 0) { break }
    $Chars += [char][int]$Value
  }
  Clean (-join $Chars)
}
function IsVirtualDeviceName($Value) {
  $Text = Clean $Value
  if ($null -eq $Text) { return $false }
  return $Text -match '(?i)virtual|remote|mirror|indirect|idd|oray|gameviewer|parsec|splashtop|spacedesk|dummy|basic render|basic display'
}
$DisplayWmi = @(Get-CimInstance -Namespace root\wmi -ClassName WmiMonitorID -ErrorAction SilentlyContinue | Where-Object {
  $_.Active -eq $true -and
  (Clean $_.InstanceName) -like 'DISPLAY\*' -and
  -not (IsVirtualDeviceName $_.InstanceName)
} | ForEach-Object {
  $Name = DecodeMonitorString $_.UserFriendlyName
  if ($null -eq $Name) {
    $Name = DecodeMonitorString $_.ProductCodeID
  }
  $Vendor = DecodeMonitorString $_.ManufacturerName
  Device $Name $_.InstanceName $Vendor $null
} | Where-Object { $_ -ne $null })
$DisplayFallback = @(Get-CimInstance Win32_DesktopMonitor -ErrorAction SilentlyContinue | Where-Object {
  (Clean $_.PNPDeviceID) -like 'DISPLAY\*' -and
  -not (IsVirtualDeviceName $_.Name) -and
  -not (IsVirtualDeviceName $_.PNPDeviceID) -and
  (Clean $_.Name) -notmatch '(?i)^default monitor$'
} | ForEach-Object {
  $Detail = if ($_.ScreenWidth -and $_.ScreenHeight) { "$($_.ScreenWidth)x$($_.ScreenHeight)" } else { $_.PNPDeviceID }
  Device $_.Name $Detail $_.MonitorManufacturer $null
} | Where-Object { $_ -ne $null })
$Inventory = [ordered]@{
  motherboard = @(Get-CimInstance Win32_BaseBoard -ErrorAction SilentlyContinue | ForEach-Object {
    $BoardName = @($_.Manufacturer, $_.Product) | ForEach-Object { Clean $_ } | Where-Object { $_ }
    Device ($BoardName -join ' ') $_.SerialNumber $_.Manufacturer $null
  } | Where-Object { $_ -ne $null })
  memoryModules = @(Get-CimInstance Win32_PhysicalMemory -ErrorAction SilentlyContinue | ForEach-Object {
    [ordered]@{
      manufacturer = Clean $_.Manufacturer
      partNumber = Clean $_.PartNumber
      capacityBytes = Capacity $_.Capacity
      speedMhz = if ($null -eq $_.Speed) { $null } else { [UInt32]$_.Speed }
    }
  })
  gpus = @(Get-CimInstance Win32_VideoController -ErrorAction SilentlyContinue | Where-Object {
    (Clean $_.PNPDeviceID) -like 'PCI\VEN_*' -and
    -not (IsVirtualDeviceName $_.Name) -and
    -not (IsVirtualDeviceName $_.AdapterCompatibility)
  } | ForEach-Object {
    Device $_.Name $_.DriverVersion $_.AdapterCompatibility $_.AdapterRAM
  } | Where-Object { $_ -ne $null })
  displays = @(if ($DisplayWmi.Count -gt 0) { $DisplayWmi } else { $DisplayFallback })
  disks = @(Get-CimInstance Win32_DiskDrive -ErrorAction SilentlyContinue | ForEach-Object {
    Device $_.Model $_.InterfaceType $_.Manufacturer $_.Size
  } | Where-Object { $_ -ne $null })
  audioDevices = @(Get-CimInstance Win32_SoundDevice -ErrorAction SilentlyContinue | ForEach-Object {
    Device $_.Name $_.Status $_.Manufacturer $null
  } | Where-Object { $_ -ne $null })
  networkAdapters = @(Get-CimInstance Win32_NetworkAdapter -ErrorAction SilentlyContinue | Where-Object { $_.PhysicalAdapter -eq $true } | ForEach-Object {
    $Detail = if ($_.NetConnectionID) { $_.NetConnectionID } else { $_.AdapterType }
    Device $_.Name $Detail $_.Manufacturer $null
  } | Where-Object { $_ -ne $null })
}
$Inventory | ConvertTo-Json -Depth 5 -Compress
"#;

    let mut command = Command::new("powershell.exe");
    command.args([
        "-NoProfile",
        "-NonInteractive",
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        script,
    ]);
    command.creation_flags(CREATE_NO_WINDOW);

    let output = command.output().ok()?;
    if !output.status.success() {
        return None;
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    serde_json::from_str::<HardwareDeviceInventory>(stdout.trim()).ok()
}

#[cfg(not(windows))]
fn query_device_inventory() -> Option<HardwareDeviceInventory> {
    Some(HardwareDeviceInventory::default())
}

#[cfg(not(windows))]
#[derive(Default)]
struct EmptyPerformanceSample {
    cpu_temperature_celsius: Option<f32>,
    disk_read_bytes_per_second: Option<f32>,
    disk_write_bytes_per_second: Option<f32>,
    gpu_usage_percent: Option<f32>,
    gpu_memory_used_bytes: Option<u64>,
}
