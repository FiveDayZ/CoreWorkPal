use chrono::Local;

use crate::models::{AppSettings, HardwareSnapshot, ModuleUpgradeLevels, WorkshopState};

const BASE_PARTS_PER_MINUTE: f64 = 1.2;
const BASE_INSIGHT_PER_MINUTE: f64 = 0.08;
const MAX_DELTA_SECONDS: i64 = 30;

pub struct ProductionService;

impl ProductionService {
    pub fn apply_tick(
        workshop: &mut WorkshopState,
        settings: &AppSettings,
        snapshot: &HardwareSnapshot,
        now_ms: i64,
    ) -> bool {
        let today = Local::now().format("%Y-%m-%d").to_string();
        let mut changed = false;

        if workshop.last_daily_reset_date != today {
            workshop.today_parts = 0.0;
            workshop.today_insight = 0.0;
            workshop.last_daily_reset_date = today;
            changed = true;
        }

        let delta_ms = now_ms.saturating_sub(workshop.last_production_time);
        let delta_seconds = (delta_ms / 1000).clamp(0, MAX_DELTA_SECONDS);

        if delta_seconds == 0 {
            return changed;
        }

        workshop.last_production_time = now_ms;
        workshop.total_online_seconds = workshop
            .total_online_seconds
            .saturating_add(delta_seconds as u64);
        changed = true;

        if settings.is_production_paused {
            return changed;
        }

        let delta_minutes = delta_seconds as f64 / 60.0;
        let output = calculate_output(settings, snapshot, workshop);
        let parts_per_minute = output.parts_per_minute;
        let insight_per_minute = output.insight_per_minute;
        let parts_delta = parts_per_minute * delta_minutes;
        let insight_delta = insight_per_minute * delta_minutes;

        workshop.parts += parts_delta;
        workshop.insight += insight_delta;
        workshop.today_parts += parts_delta;
        workshop.today_insight += insight_delta;

        changed
    }
}

#[derive(Debug, Clone, Copy)]
struct ProductionOutput {
    parts_per_minute: f64,
    insight_per_minute: f64,
}

fn calculate_output(
    settings: &AppSettings,
    snapshot: &HardwareSnapshot,
    workshop: &WorkshopState,
) -> ProductionOutput {
    let cpu = percent_score(snapshot.cpu_usage_percent);
    let gpu = percent_score(snapshot.gpu_usage_percent);
    let memory = percent_score(snapshot.memory_usage_percent);
    let gpu_memory = ratio_score(
        snapshot.gpu_memory_used_bytes,
        snapshot.gpu_memory_total_bytes,
    );
    let network = throughput_score(
        snapshot.network_download_bytes_per_second.unwrap_or(0.0) as f64
            + snapshot.network_upload_bytes_per_second.unwrap_or(0.0) as f64,
    );
    let disk = throughput_score(
        snapshot.disk_read_bytes_per_second.unwrap_or(0.0) as f64
            + snapshot.disk_write_bytes_per_second.unwrap_or(0.0) as f64,
    );

    let module_levels = &workshop.module_levels;
    let parts_activity = cpu * 0.40 + memory * 0.30 + gpu * 0.20 + gpu_memory * 0.10;
    let insight_activity = network * 0.60 + disk * 0.40;

    let workshop_bonus = 1.0 + workshop.workshop_level.saturating_sub(1) as f64 * 0.12;
    let parts_module_bonus = module_bonus(
        &[
            (&module_levels.cpu, 0.050, 0.025),
            (&module_levels.gpu, 0.040, 0.020),
            (&module_levels.ram, 0.045, 0.020),
        ],
    );
    let insight_module_bonus = module_bonus(
        &[
            (&module_levels.network, 0.036, 0.072),
            (&module_levels.disk, 0.032, 0.056),
        ],
    );
    let stability = stability_multiplier(settings, snapshot, workshop);

    let parts_per_minute = (BASE_PARTS_PER_MINUTE
        * (0.70 + parts_activity * 1.35)
        * workshop_bonus
        * parts_module_bonus
        * stability)
        .clamp(0.0, 50000.0);
    let insight_per_minute = (BASE_INSIGHT_PER_MINUTE
        * (0.62 + insight_activity * 1.60)
        * workshop_bonus
        * insight_module_bonus
        * stability)
        .clamp(0.0, 5000.0);

    ProductionOutput {
        parts_per_minute,
        insight_per_minute,
    }
}

fn percent_score(value: Option<f32>) -> f64 {
    value.unwrap_or(0.0).clamp(0.0, 100.0) as f64 / 100.0
}

fn ratio_score(used: Option<u64>, total: Option<u64>) -> f64 {
    let Some(total) = total.filter(|value| *value > 0) else {
        return 0.0;
    };
    let used = used.unwrap_or(0);
    (used as f64 / total as f64).clamp(0.0, 1.0)
}

fn throughput_score(bytes_per_second: f64) -> f64 {
    let mib_per_second = (bytes_per_second.max(0.0)) / 1024.0 / 1024.0;
    (mib_per_second.ln_1p() / 64.0_f64.ln_1p()).clamp(0.0, 1.0)
}

fn thermal_balance(settings: &AppSettings, snapshot: &HardwareSnapshot) -> f64 {
    let cpu_balance = snapshot
        .cpu_temperature_celsius
        .map(|temp| 1.0 - (temp as f64 / settings.cpu_temperature_warning.max(1.0) as f64))
        .unwrap_or(0.65);
    let gpu_balance = snapshot
        .gpu_temperature_celsius
        .map(|temp| 1.0 - (temp as f64 / settings.gpu_temperature_warning.max(1.0) as f64))
        .unwrap_or(0.65);

    ((cpu_balance + gpu_balance) / 2.0).clamp(0.0, 1.0)
}

fn module_bonus(modules: &[(&ModuleUpgradeLevels, f64, f64)]) -> f64 {
    modules
        .iter()
        .fold(1.0, |bonus, (module, parts_weight, process_weight)| {
            bonus
                + module.parts.max(1).saturating_sub(1) as f64 * parts_weight
                + module.process.max(1).saturating_sub(1) as f64 * process_weight
        })
        .clamp(1.0, 1000.0)
}

fn stability_multiplier(
    settings: &AppSettings,
    snapshot: &HardwareSnapshot,
    workshop: &WorkshopState,
) -> f64 {
    let memory = snapshot
        .memory_usage_percent
        .unwrap_or(0.0)
        .clamp(0.0, 100.0);
    let memory_over = if memory > settings.memory_crowded_threshold {
        (memory - settings.memory_crowded_threshold)
            / (100.0 - settings.memory_crowded_threshold).max(1.0)
    } else {
        0.0
    } as f64;

    let cpu_temp_over = temperature_overage(
        snapshot.cpu_temperature_celsius,
        settings.cpu_temperature_warning,
    );
    let gpu_temp_over = temperature_overage(
        snapshot.gpu_temperature_celsius,
        settings.gpu_temperature_warning,
    );
    let ram_relief = workshop
        .module_levels
        .ram
        .process
        .max(1)
        .saturating_sub(1) as f64
        * 0.025;
    let cooling_relief = workshop
        .module_levels
        .temperature
        .process
        .max(1)
        .saturating_sub(1) as f64
        * 0.035;
    let memory_penalty = (memory_over * (0.34 - ram_relief).max(0.10)).clamp(0.0, 0.30);
    let thermal_penalty =
        ((cpu_temp_over + gpu_temp_over) * (0.24 - cooling_relief).max(0.08)).clamp(0.0, 0.42);

    (1.0 - memory_penalty - thermal_penalty).clamp(0.35, 1.08)
}

fn temperature_overage(value: Option<f32>, warning: f32) -> f64 {
    value
        .filter(|temp| *temp > warning)
        .map(|temp| ((temp - warning) / 30.0).clamp(0.0, 1.0) as f64)
        .unwrap_or(0.0)
}

#[cfg(test)]
mod tests {
    use crate::models::{
        current_timestamp_ms, AppSettings, HardwareSnapshot, ModuleUpgradeLevels, WorkshopState,
        WorkshopModuleLevels,
    };

    use super::ProductionService;

    #[test]
    fn production_increases_parts_and_insight_when_not_paused() {
        let settings = AppSettings::default();
        let mut workshop = WorkshopState::default();
        let start = current_timestamp_ms();
        workshop.last_production_time = start;
        let snapshot = HardwareSnapshot {
            cpu_usage_percent: Some(50.0),
            gpu_usage_percent: Some(35.0),
            memory_usage_percent: Some(50.0),
            disk_read_bytes_per_second: Some(8.0 * 1024.0 * 1024.0),
            disk_write_bytes_per_second: Some(2.0 * 1024.0 * 1024.0),
            network_download_bytes_per_second: Some(3.0 * 1024.0 * 1024.0),
            network_upload_bytes_per_second: Some(512.0 * 1024.0),
            ..Default::default()
        };

        let changed =
            ProductionService::apply_tick(&mut workshop, &settings, &snapshot, start + 10_000);

        assert!(changed);
        assert!(workshop.parts > 0.0);
        assert!(workshop.insight > 0.0);
        assert_eq!(workshop.total_online_seconds, 10);
    }

    #[test]
    fn all_monitor_signals_raise_output_against_idle_baseline() {
        let settings = AppSettings::default();
        let start = current_timestamp_ms();
        let mut idle = WorkshopState::default();
        idle.last_production_time = start;
        let mut active = idle.clone();
        let active_snapshot = HardwareSnapshot {
            cpu_usage_percent: Some(72.0),
            gpu_usage_percent: Some(58.0),
            memory_usage_percent: Some(64.0),
            cpu_temperature_celsius: Some(62.0),
            gpu_temperature_celsius: Some(66.0),
            disk_read_bytes_per_second: Some(22.0 * 1024.0 * 1024.0),
            disk_write_bytes_per_second: Some(7.0 * 1024.0 * 1024.0),
            network_download_bytes_per_second: Some(12.0 * 1024.0 * 1024.0),
            network_upload_bytes_per_second: Some(2.0 * 1024.0 * 1024.0),
            gpu_memory_used_bytes: Some(3 * 1024 * 1024 * 1024),
            gpu_memory_total_bytes: Some(8 * 1024 * 1024 * 1024),
            ..Default::default()
        };

        ProductionService::apply_tick(&mut idle, &settings, &HardwareSnapshot::default(), start + 10_000);
        ProductionService::apply_tick(&mut active, &settings, &active_snapshot, start + 10_000);

        assert!(active.parts > idle.parts);
        assert!(active.insight > idle.insight);
    }

    #[test]
    fn module_upgrades_increase_output() {
        let settings = AppSettings::default();
        let start = current_timestamp_ms();
        let snapshot = HardwareSnapshot {
            cpu_usage_percent: Some(55.0),
            gpu_usage_percent: Some(45.0),
            memory_usage_percent: Some(55.0),
            disk_read_bytes_per_second: Some(6.0 * 1024.0 * 1024.0),
            network_download_bytes_per_second: Some(4.0 * 1024.0 * 1024.0),
            ..Default::default()
        };
        let mut base = WorkshopState::default();
        base.last_production_time = start;
        let mut upgraded = base.clone();
        upgraded.module_levels = WorkshopModuleLevels {
            cpu: ModuleUpgradeLevels {
                parts: 4,
                process: 4,
            },
            gpu: ModuleUpgradeLevels {
                parts: 4,
                process: 4,
            },
            ram: ModuleUpgradeLevels {
                parts: 3,
                process: 3,
            },
            network: ModuleUpgradeLevels {
                parts: 3,
                process: 3,
            },
            temperature: ModuleUpgradeLevels {
                parts: 3,
                process: 3,
            },
            disk: ModuleUpgradeLevels {
                parts: 4,
                process: 4,
            },
        };

        ProductionService::apply_tick(&mut base, &settings, &snapshot, start + 10_000);
        ProductionService::apply_tick(&mut upgraded, &settings, &snapshot, start + 10_000);

        assert!(upgraded.parts > base.parts);
        assert!(upgraded.insight > base.insight);
    }

    #[test]
    fn paused_production_updates_time_but_not_resources() {
        let mut settings = AppSettings::default();
        settings.is_production_paused = true;
        let mut workshop = WorkshopState::default();
        let start = current_timestamp_ms();
        workshop.last_production_time = start;

        let changed = ProductionService::apply_tick(
            &mut workshop,
            &settings,
            &HardwareSnapshot::default(),
            start + 5_000,
        );

        assert!(changed);
        assert_eq!(workshop.parts, 0.0);
        assert_eq!(workshop.insight, 0.0);
        assert_eq!(workshop.total_online_seconds, 5);
    }
}
