mod fake;
mod sysinfo_adapter;
#[cfg(windows)]
mod windows_perf;

use std::time::Duration;

pub use fake::FakeHardwareSensorAdapter;
pub use sysinfo_adapter::SysinfoAdapter;
use tauri::{AppHandle, Emitter, Manager};

use crate::{
    app_state::AppState,
    models::{current_timestamp_ms, HardwareMetricsSnapshot, HardwareSnapshot},
    pet::PetStateService,
    workshop::ProductionService,
};

pub trait HardwareSensorAdapter: Send + Sync {
    fn sample(&mut self) -> HardwareSnapshot;
}

pub fn create_default_adapter() -> Box<dyn HardwareSensorAdapter> {
    match std::env::var("COREWORKPAL_HARDWARE_ADAPTER") {
        Ok(value) if value.eq_ignore_ascii_case("fake") => {
            Box::new(FakeHardwareSensorAdapter::new())
        }
        _ => Box::new(SysinfoAdapter::new()),
    }
}

pub fn start_hardware_snapshot_pump(app: AppHandle) {
    tauri::async_runtime::spawn(async move {
        loop {
            let (snapshot, interval_ms) = {
                let state = app.state::<AppState>();
                let settings = state.settings.read().await.clone();
                let interval_ms = resolve_sampling_interval_ms(&app, &settings);

                let snapshot = match state.hardware_adapter.lock() {
                    Ok(mut adapter) => adapter.sample(),
                    Err(error) => {
                        tracing::warn!("hardware adapter lock failed: {error}");
                        HardwareSnapshot::default()
                    }
                };

                {
                    let mut last_snapshot = state.last_snapshot.write().await;
                    *last_snapshot = Some(snapshot.clone());
                }

                (snapshot, interval_ms)
            };

            if let Err(error) = app.emit(
                "hardware:metrics",
                HardwareMetricsSnapshot::from(&snapshot),
            ) {
                tracing::warn!("failed to emit hardware:metrics: {error}");
            }

            update_workshop_for_snapshot(&app, &snapshot).await;
            update_work_log_for_snapshot(&app, &snapshot).await;
            PetStateService::update_for_snapshot(&app, &snapshot).await;

            tokio::time::sleep(Duration::from_millis(interval_ms.max(1000))).await;
        }
    });
}

fn resolve_sampling_interval_ms(app: &AppHandle, settings: &crate::models::AppSettings) -> u64 {
    if settings.enable_low_power_mode {
        return 5000;
    }

    if has_visible_monitor_surface(app) {
        settings.sampling_interval_ms.max(1000)
    } else {
        settings.background_sampling_interval_ms.max(3000)
    }
}

fn has_visible_monitor_surface(app: &AppHandle) -> bool {
    ["main", "monitor-bar", "pet-panel", "taskbar-monitor"]
        .into_iter()
        .any(|label| {
            app.get_webview_window(label)
                .and_then(|window| window.is_visible().ok())
                .unwrap_or(false)
        })
}

async fn update_work_log_for_snapshot(app: &AppHandle, snapshot: &HardwareSnapshot) {
    let state = app.state::<AppState>();
    let date = crate::models::date_key_from_timestamp(snapshot.timestamp);
    let updated_report = {
        let mut work_logs = state.work_logs.write().await;
        let entry = work_logs
            .entries
            .entry(date.clone())
            .or_insert_with(|| crate::models::WorkLogEntry::new(date, snapshot.timestamp));

        entry.record_snapshot(snapshot, snapshot.timestamp);
        let report = crate::models::WorkLogReport::from_entry(entry.clone());

        if let Err(error) = state.storage.save_work_logs(&work_logs) {
            tracing::warn!("failed to save work logs: {error}");
        }

        report
    };

    if let Err(error) = app.emit("worklog:updated", updated_report) {
        tracing::warn!("failed to emit worklog:updated: {error}");
    }
}

async fn update_workshop_for_snapshot(app: &AppHandle, snapshot: &HardwareSnapshot) {
    let state = app.state::<AppState>();
    let settings = state.settings.read().await.clone();
    let updated_workshop = {
        let mut workshop = state.workshop.write().await;
        let changed = ProductionService::apply_tick(
            &mut workshop,
            &settings,
            snapshot,
            current_timestamp_ms(),
        );

        if !changed {
            return;
        }

        if let Err(error) = state.storage.save_workshop(&workshop) {
            tracing::warn!("failed to save workshop state: {error}");
        }

        workshop.clone()
    };

    if let Err(error) = app.emit("workshop:updated", updated_workshop) {
        tracing::warn!("failed to emit workshop:updated: {error}");
    }
}
