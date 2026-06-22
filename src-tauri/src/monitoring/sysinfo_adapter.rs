use std::{
    process::Command,
    time::{Duration, Instant},
};

use sysinfo::{Components, Networks, System};

use crate::{
    models::{current_timestamp_ms, HardwareSnapshot},
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
        }
    }
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

#[cfg(not(windows))]
#[derive(Default)]
struct EmptyPerformanceSample {
    cpu_temperature_celsius: Option<f32>,
    disk_read_bytes_per_second: Option<f32>,
    disk_write_bytes_per_second: Option<f32>,
    gpu_usage_percent: Option<f32>,
    gpu_memory_used_bytes: Option<u64>,
}
