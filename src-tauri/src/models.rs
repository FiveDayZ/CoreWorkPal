use std::collections::BTreeMap;

use chrono::{Local, TimeZone};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct HardwareSnapshot {
    pub timestamp: i64,
    pub cpu_usage_percent: Option<f32>,
    pub gpu_usage_percent: Option<f32>,
    pub memory_usage_percent: Option<f32>,
    pub cpu_temperature_celsius: Option<f32>,
    pub gpu_temperature_celsius: Option<f32>,
    pub disk_read_bytes_per_second: Option<f32>,
    pub disk_write_bytes_per_second: Option<f32>,
    pub network_download_bytes_per_second: Option<f32>,
    pub network_upload_bytes_per_second: Option<f32>,
    pub cpu_name: Option<String>,
    pub gpu_name: Option<String>,
    pub gpu_memory_used_bytes: Option<u64>,
    pub gpu_memory_total_bytes: Option<u64>,
    pub total_memory_bytes: Option<u64>,
    pub used_memory_bytes: Option<u64>,
    pub cpu_physical_core_count: Option<u32>,
    pub cpu_logical_core_count: Option<u32>,
    pub device_inventory: HardwareDeviceInventory,
}

impl Default for HardwareSnapshot {
    fn default() -> Self {
        Self {
            timestamp: current_timestamp_ms(),
            cpu_usage_percent: None,
            gpu_usage_percent: None,
            memory_usage_percent: None,
            cpu_temperature_celsius: None,
            gpu_temperature_celsius: None,
            disk_read_bytes_per_second: None,
            disk_write_bytes_per_second: None,
            network_download_bytes_per_second: None,
            network_upload_bytes_per_second: None,
            cpu_name: None,
            gpu_name: None,
            gpu_memory_used_bytes: None,
            gpu_memory_total_bytes: None,
            total_memory_bytes: None,
            used_memory_bytes: None,
            cpu_physical_core_count: None,
            cpu_logical_core_count: None,
            device_inventory: HardwareDeviceInventory::default(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
pub struct HardwareDeviceInventory {
    pub motherboard: Vec<HardwareDeviceInfo>,
    pub memory_modules: Vec<MemoryModuleInfo>,
    pub gpus: Vec<HardwareDeviceInfo>,
    pub displays: Vec<HardwareDeviceInfo>,
    pub disks: Vec<HardwareDeviceInfo>,
    pub audio_devices: Vec<HardwareDeviceInfo>,
    pub network_adapters: Vec<HardwareDeviceInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
pub struct HardwareDeviceInfo {
    pub name: String,
    pub detail: Option<String>,
    pub vendor: Option<String>,
    pub capacity_bytes: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
pub struct MemoryModuleInfo {
    pub manufacturer: Option<String>,
    pub part_number: Option<String>,
    pub capacity_bytes: Option<u64>,
    pub speed_mhz: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum CatState {
    Idle,
    RepairLight,
    RepairHeavy,
    TemperatureCheck,
    MemoryCrowded,
    DataSorting,
    Sleep,
    Interactive,
    Celebrate,
    Hidden,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum MonitorMetric {
    Cpu,
    Ram,
    Disk,
    Network,
    Gpu,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum MonitorBarMode {
    Micro,
    Default,
    Expanded,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CatStateChangedEvent {
    pub timestamp: i64,
    pub cat_state: CatState,
    pub cat_message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct AppSettings {
    pub schema_version: u32,
    pub launch_at_startup: bool,
    pub is_cat_visible: bool,
    pub is_monitor_bar_visible: bool,
    pub enable_sleep_mode: bool,
    pub enable_sound: bool,
    pub enable_notifications: bool,
    pub is_production_paused: bool,
    pub enable_low_power_mode: bool,
    pub enable_static_cat_mode: bool,
    pub enable_pet_bubble: bool,
    pub show_monitor_data_in_taskbar: bool,
    pub sampling_interval_ms: u64,
    pub background_sampling_interval_ms: u64,
    pub data_sorting_cpu_threshold: f32,
    pub cat_size: f64,
    pub cat_opacity: f64,
    pub cat_window_x: f64,
    pub cat_window_y: f64,
    pub monitor_bar_x: f64,
    pub monitor_bar_y: f64,
    pub cpu_temperature_warning: f32,
    pub gpu_temperature_warning: f32,
    pub memory_crowded_threshold: f32,
    pub error_glitch_cpu_threshold: f32,
    pub theme_name: String,
    pub visible_monitor_metrics: Vec<MonitorMetric>,
    pub monitor_bar_mode: MonitorBarMode,
    pub visible_taskbar_metrics: Vec<MonitorMetric>,
    pub taskbar_monitor_mode: MonitorBarMode,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            schema_version: 1,
            launch_at_startup: false,
            is_cat_visible: true,
            is_monitor_bar_visible: true,
            enable_sleep_mode: true,
            enable_sound: false,
            enable_notifications: false,
            is_production_paused: false,
            enable_low_power_mode: false,
            enable_static_cat_mode: false,
            enable_pet_bubble: true,
            show_monitor_data_in_taskbar: true,
            sampling_interval_ms: 2000,
            background_sampling_interval_ms: 5000,
            data_sorting_cpu_threshold: 40.0,
            cat_size: 1.0,
            cat_opacity: 0.95,
            cat_window_x: 1200.0,
            cat_window_y: 520.0,
            monitor_bar_x: 580.0,
            monitor_bar_y: 24.0,
            cpu_temperature_warning: 80.0,
            gpu_temperature_warning: 82.0,
            memory_crowded_threshold: 82.0,
            error_glitch_cpu_threshold: 96.0,
            theme_name: "coreworkpal".to_string(),
            visible_monitor_metrics: vec![
                MonitorMetric::Cpu,
                MonitorMetric::Ram,
                MonitorMetric::Gpu,
                MonitorMetric::Network,
            ],
            monitor_bar_mode: MonitorBarMode::Default,
            visible_taskbar_metrics: vec![
                MonitorMetric::Cpu,
                MonitorMetric::Ram,
                MonitorMetric::Gpu,
                MonitorMetric::Network,
            ],
            taskbar_monitor_mode: MonitorBarMode::Default,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
pub struct AppSettingsPatch {
    pub launch_at_startup: Option<bool>,
    pub is_cat_visible: Option<bool>,
    pub is_monitor_bar_visible: Option<bool>,
    pub enable_sleep_mode: Option<bool>,
    pub enable_sound: Option<bool>,
    pub enable_notifications: Option<bool>,
    pub is_production_paused: Option<bool>,
    pub enable_low_power_mode: Option<bool>,
    pub enable_static_cat_mode: Option<bool>,
    pub enable_pet_bubble: Option<bool>,
    pub show_monitor_data_in_taskbar: Option<bool>,
    pub sampling_interval_ms: Option<u64>,
    pub background_sampling_interval_ms: Option<u64>,
    pub data_sorting_cpu_threshold: Option<f32>,
    pub cat_size: Option<f64>,
    pub cat_opacity: Option<f64>,
    pub cat_window_x: Option<f64>,
    pub cat_window_y: Option<f64>,
    pub monitor_bar_x: Option<f64>,
    pub monitor_bar_y: Option<f64>,
    pub cpu_temperature_warning: Option<f32>,
    pub gpu_temperature_warning: Option<f32>,
    pub memory_crowded_threshold: Option<f32>,
    pub error_glitch_cpu_threshold: Option<f32>,
    pub theme_name: Option<String>,
    pub visible_monitor_metrics: Option<Vec<MonitorMetric>>,
    pub monitor_bar_mode: Option<MonitorBarMode>,
    pub visible_taskbar_metrics: Option<Vec<MonitorMetric>>,
    pub taskbar_monitor_mode: Option<MonitorBarMode>,
}

impl AppSettings {
    pub fn apply_patch(&mut self, patch: AppSettingsPatch) {
        if let Some(value) = patch.launch_at_startup {
            self.launch_at_startup = value;
        }
        if let Some(value) = patch.is_cat_visible {
            self.is_cat_visible = value;
        }
        if let Some(value) = patch.is_monitor_bar_visible {
            self.is_monitor_bar_visible = value;
        }
        if let Some(value) = patch.enable_sleep_mode {
            self.enable_sleep_mode = value;
        }
        if let Some(value) = patch.enable_sound {
            self.enable_sound = value;
        }
        if let Some(value) = patch.enable_notifications {
            self.enable_notifications = value;
        }
        if let Some(value) = patch.is_production_paused {
            self.is_production_paused = value;
        }
        if let Some(value) = patch.enable_low_power_mode {
            self.enable_low_power_mode = value;
        }
        if let Some(value) = patch.enable_static_cat_mode {
            self.enable_static_cat_mode = value;
        }
        if let Some(value) = patch.enable_pet_bubble {
            self.enable_pet_bubble = value;
        }
        if let Some(value) = patch.show_monitor_data_in_taskbar {
            self.show_monitor_data_in_taskbar = value;
        }
        if let Some(value) = patch.sampling_interval_ms {
            self.sampling_interval_ms = value.max(1000);
        }
        if let Some(value) = patch.background_sampling_interval_ms {
            self.background_sampling_interval_ms = value.max(3000);
        }
        if let Some(value) = patch.data_sorting_cpu_threshold {
            self.data_sorting_cpu_threshold = value.clamp(10.0, 95.0);
        }
        if let Some(value) = patch.cat_size {
            self.cat_size = value.clamp(0.5, 2.0);
        }
        if let Some(value) = patch.cat_opacity {
            self.cat_opacity = value.clamp(0.1, 1.0);
        }
        if let Some(value) = patch.cat_window_x {
            self.cat_window_x = value;
        }
        if let Some(value) = patch.cat_window_y {
            self.cat_window_y = value;
        }
        if let Some(value) = patch.monitor_bar_x {
            self.monitor_bar_x = value;
        }
        if let Some(value) = patch.monitor_bar_y {
            self.monitor_bar_y = value;
        }
        if let Some(value) = patch.cpu_temperature_warning {
            self.cpu_temperature_warning = value.clamp(50.0, 110.0);
        }
        if let Some(value) = patch.gpu_temperature_warning {
            self.gpu_temperature_warning = value.clamp(50.0, 110.0);
        }
        if let Some(value) = patch.memory_crowded_threshold {
            self.memory_crowded_threshold = value.clamp(50.0, 98.0);
        }
        if let Some(value) = patch.error_glitch_cpu_threshold {
            self.error_glitch_cpu_threshold = value.clamp(50.0, 100.0);
        }
        if let Some(value) = patch.theme_name {
            self.theme_name = value;
        }
        if let Some(value) = patch.visible_monitor_metrics {
            self.visible_monitor_metrics = value;
        }
        if let Some(value) = patch.monitor_bar_mode {
            self.monitor_bar_mode = value;
        }
        if let Some(value) = patch.visible_taskbar_metrics {
            self.visible_taskbar_metrics = value;
        }
        if let Some(value) = patch.taskbar_monitor_mode {
            self.taskbar_monitor_mode = value;
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct ModuleUpgradeLevels {
    pub parts: u32,
    pub process: u32,
}

impl Default for ModuleUpgradeLevels {
    fn default() -> Self {
        Self {
            parts: 1,
            process: 1,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct WorkshopModuleLevels {
    pub cpu: ModuleUpgradeLevels,
    pub gpu: ModuleUpgradeLevels,
    pub ram: ModuleUpgradeLevels,
    pub network: ModuleUpgradeLevels,
    pub temperature: ModuleUpgradeLevels,
    pub disk: ModuleUpgradeLevels,
}

impl Default for WorkshopModuleLevels {
    fn default() -> Self {
        Self {
            cpu: ModuleUpgradeLevels::default(),
            gpu: ModuleUpgradeLevels::default(),
            ram: ModuleUpgradeLevels::default(),
            network: ModuleUpgradeLevels::default(),
            temperature: ModuleUpgradeLevels::default(),
            disk: ModuleUpgradeLevels::default(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct WorkshopState {
    pub schema_version: u32,
    pub parts: f64,
    pub insight: f64,
    pub workshop_level: u32,
    pub cat_affinity_level: u32,
    pub module_levels: WorkshopModuleLevels,
    pub last_production_time: i64,
    pub total_online_seconds: u64,
    pub today_parts: f64,
    pub today_insight: f64,
    pub last_daily_reset_date: String,
}

impl Default for WorkshopState {
    fn default() -> Self {
        Self {
            schema_version: 1,
            parts: 0.0,
            insight: 0.0,
            workshop_level: 1,
            cat_affinity_level: 1,
            module_levels: WorkshopModuleLevels::default(),
            last_production_time: current_timestamp_ms(),
            total_online_seconds: 0,
            today_parts: 0.0,
            today_insight: 0.0,
            last_daily_reset_date: Local::now().format("%Y-%m-%d").to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct WorkLogBook {
    pub schema_version: u32,
    pub entries: BTreeMap<String, WorkLogEntry>,
}

impl Default for WorkLogBook {
    fn default() -> Self {
        Self {
            schema_version: 1,
            entries: BTreeMap::new(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct WorkLogEntry {
    pub date: String,
    pub active_seconds: u64,
    pub sample_count: u64,
    pub cpu_load_points: f64,
    pub gpu_load_points: f64,
    pub memory_load_points: f64,
    pub thermal_pressure_points: f64,
    pub io_activity_points: f64,
    pub high_load_seconds: u64,
    pub cpu_over_50_seconds: u64,
    pub memory_over_70_seconds: u64,
    pub gpu_over_70_seconds: u64,
    pub cpu_over_80c_seconds: u64,
    pub gpu_over_80c_seconds: u64,
    pub disk_read_bytes_total: u64,
    pub disk_write_bytes_total: u64,
    pub network_download_bytes_total: u64,
    pub network_upload_bytes_total: u64,
    pub mouse_click_count: u64,
    pub keyboard_press_count: u64,
    pub started_at: i64,
    pub updated_at: i64,
}

impl Default for WorkLogEntry {
    fn default() -> Self {
        Self {
            date: today_key(),
            active_seconds: 0,
            sample_count: 0,
            cpu_load_points: 0.0,
            gpu_load_points: 0.0,
            memory_load_points: 0.0,
            thermal_pressure_points: 0.0,
            io_activity_points: 0.0,
            high_load_seconds: 0,
            cpu_over_50_seconds: 0,
            memory_over_70_seconds: 0,
            gpu_over_70_seconds: 0,
            cpu_over_80c_seconds: 0,
            gpu_over_80c_seconds: 0,
            disk_read_bytes_total: 0,
            disk_write_bytes_total: 0,
            network_download_bytes_total: 0,
            network_upload_bytes_total: 0,
            mouse_click_count: 0,
            keyboard_press_count: 0,
            started_at: 0,
            updated_at: 0,
        }
    }
}

impl WorkLogEntry {
    pub fn new(date: String, timestamp: i64) -> Self {
        Self {
            date,
            started_at: timestamp,
            updated_at: timestamp,
            ..Default::default()
        }
    }

    pub fn record_snapshot(&mut self, snapshot: &HardwareSnapshot, timestamp: i64) {
        if self.started_at == 0 {
            self.started_at = timestamp;
        }

        let delta_seconds = if self.updated_at > 0 {
            timestamp
                .saturating_sub(self.updated_at)
                .clamp(0, 60_000) as u64
                / 1000
        } else {
            0
        };

        let cpu = bounded_metric(snapshot.cpu_usage_percent);
        let gpu = bounded_metric(snapshot.gpu_usage_percent);
        let memory = bounded_metric(snapshot.memory_usage_percent);
        let thermal = thermal_pressure(snapshot);
        let io = io_activity(snapshot);

        self.active_seconds = self.active_seconds.saturating_add(delta_seconds);
        self.sample_count = self.sample_count.saturating_add(1);
        self.cpu_load_points += cpu;
        self.gpu_load_points += gpu;
        self.memory_load_points += memory;
        self.thermal_pressure_points += thermal;
        self.io_activity_points += io;

        if cpu > 50.0 {
            self.cpu_over_50_seconds = self.cpu_over_50_seconds.saturating_add(delta_seconds);
        }
        if memory > 70.0 {
            self.memory_over_70_seconds =
                self.memory_over_70_seconds.saturating_add(delta_seconds);
        }
        if gpu > 70.0 {
            self.gpu_over_70_seconds = self.gpu_over_70_seconds.saturating_add(delta_seconds);
        }
        if snapshot.cpu_temperature_celsius.unwrap_or(0.0) > 80.0 {
            self.cpu_over_80c_seconds =
                self.cpu_over_80c_seconds.saturating_add(delta_seconds);
        }
        if snapshot.gpu_temperature_celsius.unwrap_or(0.0) > 80.0 {
            self.gpu_over_80c_seconds =
                self.gpu_over_80c_seconds.saturating_add(delta_seconds);
        }

        self.disk_read_bytes_total = self.disk_read_bytes_total.saturating_add(
            rate_total_bytes(snapshot.disk_read_bytes_per_second, delta_seconds),
        );
        self.disk_write_bytes_total = self.disk_write_bytes_total.saturating_add(
            rate_total_bytes(snapshot.disk_write_bytes_per_second, delta_seconds),
        );
        self.network_download_bytes_total = self.network_download_bytes_total.saturating_add(
            rate_total_bytes(snapshot.network_download_bytes_per_second, delta_seconds),
        );
        self.network_upload_bytes_total = self.network_upload_bytes_total.saturating_add(
            rate_total_bytes(snapshot.network_upload_bytes_per_second, delta_seconds),
        );

        if cpu > 50.0 || memory > 70.0 || gpu > 70.0 || thermal >= 55.0 || io >= 55.0 {
            self.high_load_seconds = self.high_load_seconds.saturating_add(delta_seconds);
        }

        self.updated_at = timestamp;
    }

    pub fn record_input_activity(&mut self, mouse_clicks: u64, keyboard_presses: u64) {
        self.mouse_click_count = self.mouse_click_count.saturating_add(mouse_clicks);
        self.keyboard_press_count = self
            .keyboard_press_count
            .saturating_add(keyboard_presses);
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkLogReport {
    pub date: String,
    pub total_score: u32,
    pub summary: String,
    pub active_seconds: u64,
    pub sample_count: u64,
    pub dimensions: Vec<WorkLogScoreDimension>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkLogScoreDimension {
    pub key: String,
    pub title: String,
    pub score: u32,
    pub max_score: u32,
    pub value: String,
    pub explanation: String,
    pub facts: Vec<WorkLogMetricFact>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkLogMetricFact {
    pub label: String,
    pub value: String,
}

impl WorkLogReport {
    pub fn from_entry(entry: WorkLogEntry) -> Self {
        let samples = entry.sample_count.max(1) as f64;
        let cpu_avg = entry.cpu_load_points / samples;
        let gpu_avg = entry.gpu_load_points / samples;
        let memory_avg = entry.memory_load_points / samples;
        let thermal_avg = entry.thermal_pressure_points / samples;
        let io_avg = entry.io_activity_points / samples;
        let hours = entry.active_seconds as f64 / 3600.0;
        let high_load_ratio = if entry.active_seconds > 0 {
            entry.high_load_seconds as f64 / entry.active_seconds as f64
        } else {
            0.0
        };
        let cpu_over_50_ratio = duration_ratio(entry.cpu_over_50_seconds, entry.active_seconds);
        let memory_over_70_ratio =
            duration_ratio(entry.memory_over_70_seconds, entry.active_seconds);
        let gpu_over_70_ratio = duration_ratio(entry.gpu_over_70_seconds, entry.active_seconds);
        let cpu_over_80c_ratio =
            duration_ratio(entry.cpu_over_80c_seconds, entry.active_seconds);
        let gpu_over_80c_ratio =
            duration_ratio(entry.gpu_over_80c_seconds, entry.active_seconds);
        let disk_total = entry
            .disk_read_bytes_total
            .saturating_add(entry.disk_write_bytes_total);
        let network_total = entry
            .network_download_bytes_total
            .saturating_add(entry.network_upload_bytes_total);

        let duration_score = ((hours / 6.0) * 30.0).clamp(0.0, 30.0);
        let sustained_load_index = cpu_over_50_ratio * 32.0
            + memory_over_70_ratio * 28.0
            + gpu_over_70_ratio * 24.0;
        let load_score = ((cpu_avg * 0.27
            + memory_avg * 0.22
            + gpu_avg * 0.20
            + io_avg * 0.08
            + sustained_load_index)
            / 100.0
            * 25.0)
            .clamp(0.0, 25.0);
        let disk_volume_score = volume_score(disk_total, 3.0 * 1024.0 * 1024.0 * 1024.0);
        let network_volume_score = volume_score(network_total, 1024.0 * 1024.0 * 1024.0);
        let complexity_score = (high_load_ratio * 5.0
            + disk_volume_score * 7.0
            + network_volume_score * 5.0
            + (io_avg / 100.0) * 3.0)
            .clamp(0.0, 20.0);
        let stability_score = (15.0
            - (thermal_avg / 100.0) * 5.0
            - cpu_over_80c_ratio * 5.0
            - gpu_over_80c_ratio * 5.0)
            .clamp(0.0, 15.0);
        let input_score = volume_score(entry.mouse_click_count, 1_500.0) * 3.0
            + volume_score(entry.keyboard_press_count, 5_000.0) * 3.0;
        let continuity_score = (((hours / 8.0) * 4.0) + input_score).clamp(0.0, 10.0);
        let total_score = (duration_score
            + load_score
            + complexity_score
            + stability_score
            + continuity_score)
            .round()
            .clamp(0.0, 100.0) as u32;

        Self {
            date: entry.date.clone(),
            total_score,
            summary: summarize_work_score(total_score),
            active_seconds: entry.active_seconds,
            sample_count: entry.sample_count,
            dimensions: vec![
                WorkLogScoreDimension {
                    key: "duration".to_string(),
                    title: "CoreCat 运行时长".to_string(),
                    score: duration_score.round() as u32,
                    max_score: 30,
                    value: format!("{hours:.1}h"),
                    explanation: "按当日 CoreCat 连续在线与生产观察时长折算，6 小时达到满额。"
                        .to_string(),
                    facts: vec![
                        metric_fact("运行时长", format_duration(entry.active_seconds)),
                        metric_fact("采样记录", format!("{} 次", entry.sample_count)),
                    ],
                },
                WorkLogScoreDimension {
                    key: "load".to_string(),
                    title: "硬件负载强度".to_string(),
                    score: load_score.round() as u32,
                    max_score: 25,
                    value: format!("CPU {cpu_avg:.0}% / RAM {memory_avg:.0}% / GPU {gpu_avg:.0}%"),
                    explanation: "综合平均负载与 CPU>50%、RAM>70%、GPU>70% 的持续时长。"
                        .to_string(),
                    facts: vec![
                        metric_fact("CPU>50%", format_duration(entry.cpu_over_50_seconds)),
                        metric_fact("RAM>70%", format_duration(entry.memory_over_70_seconds)),
                        metric_fact("GPU>70%", format_duration(entry.gpu_over_70_seconds)),
                    ],
                },
                WorkLogScoreDimension {
                    key: "complexity".to_string(),
                    title: "任务复杂度".to_string(),
                    score: complexity_score.round() as u32,
                    max_score: 20,
                    value: format!("高负载 {:.0}% / IO {:.0}%", high_load_ratio * 100.0, io_avg),
                    explanation: "结合高负载比例、磁盘读写总量、网络上传与访问流量。"
                        .to_string(),
                    facts: vec![
                        metric_fact("磁盘读", format_bytes(entry.disk_read_bytes_total)),
                        metric_fact("磁盘写", format_bytes(entry.disk_write_bytes_total)),
                        metric_fact("上传", format_bytes(entry.network_upload_bytes_total)),
                        metric_fact("访问", format_bytes(entry.network_download_bytes_total)),
                    ],
                },
                WorkLogScoreDimension {
                    key: "stability".to_string(),
                    title: "运行稳定性".to_string(),
                    score: stability_score.round() as u32,
                    max_score: 15,
                    value: format!("压力 {:.0}%", thermal_avg),
                    explanation: "高温持续时间越短，说明高强度工作下系统越稳定。".to_string(),
                    facts: vec![
                        metric_fact("CPU>80C", format_duration(entry.cpu_over_80c_seconds)),
                        metric_fact("GPU>80C", format_duration(entry.gpu_over_80c_seconds)),
                    ],
                },
                WorkLogScoreDimension {
                    key: "continuity".to_string(),
                    title: "连续工作投入".to_string(),
                    score: continuity_score.round() as u32,
                    max_score: 10,
                    value: format!(
                        "点击 {} / 按键 {}",
                        entry.mouse_click_count, entry.keyboard_press_count
                    ),
                    explanation: "结合持续观察窗口、鼠标点击和键盘按键次数，体现实际操作密度。"
                        .to_string(),
                    facts: vec![
                        metric_fact("鼠标点击", format!("{} 次", entry.mouse_click_count)),
                        metric_fact("键盘按键", format!("{} 次", entry.keyboard_press_count)),
                    ],
                },
            ],
        }
    }
}

pub fn today_key() -> String {
    Local::now().format("%Y-%m-%d").to_string()
}

pub fn date_key_from_timestamp(timestamp: i64) -> String {
    Local
        .timestamp_millis_opt(timestamp)
        .single()
        .unwrap_or_else(Local::now)
        .format("%Y-%m-%d")
        .to_string()
}

fn summarize_work_score(score: u32) -> String {
    match score {
        91..=100 => "极高投入工作日：长时间运行、硬件负载、IO 吞吐和键鼠操作都很密集。".to_string(),
        76..=90 => "高投入工作日：CoreCat 观察到持续运行、明确任务压力和较高操作密度。".to_string(),
        51..=75 => "稳定推进日：运行时长、硬件参与度与操作记录较均衡，工作投入清晰。".to_string(),
        31..=50 => "轻中度工作日：有一定运行与操作记录，但高强度负载或复杂 IO 较少。".to_string(),
        1..=30 => "轻量维护日：工作窗口较短或操作密度较低，偏向整理与低强度任务。".to_string(),
        _ => "暂无足够数据：保持 CoreCat 运行后，将自动生成当天工作投入度。".to_string(),
    }
}

fn bounded_metric(value: Option<f32>) -> f64 {
    value.unwrap_or(0.0).clamp(0.0, 100.0) as f64
}

fn thermal_pressure(snapshot: &HardwareSnapshot) -> f64 {
    let cpu_pressure = snapshot
        .cpu_temperature_celsius
        .map(|value| ((value - 45.0) / 50.0 * 100.0).clamp(0.0, 100.0))
        .unwrap_or(0.0);
    let gpu_pressure = snapshot
        .gpu_temperature_celsius
        .map(|value| ((value - 45.0) / 50.0 * 100.0).clamp(0.0, 100.0))
        .unwrap_or(0.0);

    cpu_pressure.max(gpu_pressure) as f64
}

fn io_activity(snapshot: &HardwareSnapshot) -> f64 {
    let bytes_per_second = snapshot.disk_read_bytes_per_second.unwrap_or(0.0)
        + snapshot.disk_write_bytes_per_second.unwrap_or(0.0)
        + snapshot.network_download_bytes_per_second.unwrap_or(0.0)
        + snapshot.network_upload_bytes_per_second.unwrap_or(0.0);

    (bytes_per_second as f64 / (5.0 * 1024.0 * 1024.0) * 100.0).clamp(0.0, 100.0)
}

fn duration_ratio(seconds: u64, active_seconds: u64) -> f64 {
    if active_seconds == 0 {
        return 0.0;
    }

    seconds as f64 / active_seconds as f64
}

fn rate_total_bytes(rate_bytes_per_second: Option<f32>, delta_seconds: u64) -> u64 {
    if delta_seconds == 0 {
        return 0;
    }

    (rate_bytes_per_second.unwrap_or(0.0).max(0.0) as f64 * delta_seconds as f64).round() as u64
}

fn volume_score(value: u64, full_value: f64) -> f64 {
    if full_value <= 0.0 {
        return 0.0;
    }

    (value as f64 / full_value).clamp(0.0, 1.0)
}

fn metric_fact(label: impl Into<String>, value: impl Into<String>) -> WorkLogMetricFact {
    WorkLogMetricFact {
        label: label.into(),
        value: value.into(),
    }
}

fn format_duration(seconds: u64) -> String {
    let hours = seconds / 3600;
    let minutes = (seconds % 3600) / 60;
    let remaining_seconds = seconds % 60;

    if hours > 0 {
        return format!("{hours}h {minutes}m");
    }

    if minutes > 0 {
        return format!("{minutes}m {remaining_seconds}s");
    }

    format!("{remaining_seconds}s")
}

fn format_bytes(bytes: u64) -> String {
    let units = ["B", "KB", "MB", "GB", "TB"];
    let mut value = bytes as f64;
    let mut unit_index = 0;

    while value >= 1024.0 && unit_index < units.len() - 1 {
        value /= 1024.0;
        unit_index += 1;
    }

    if unit_index == 0 {
        return format!("{} {}", bytes, units[unit_index]);
    }

    format!("{value:.1} {}", units[unit_index])
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct LayoutState {
    pub schema_version: u32,
    pub cat_window_x: f64,
    pub cat_window_y: f64,
    pub monitor_bar_x: f64,
    pub monitor_bar_y: f64,
}

impl Default for LayoutState {
    fn default() -> Self {
        let settings = AppSettings::default();
        Self {
            schema_version: 1,
            cat_window_x: settings.cat_window_x,
            cat_window_y: settings.cat_window_y,
            monitor_bar_x: settings.monitor_bar_x,
            monitor_bar_y: settings.monitor_bar_y,
        }
    }
}

pub fn current_timestamp_ms() -> i64 {
    chrono::Utc::now().timestamp_millis()
}
