use tauri::{AppHandle, Emitter, Manager, PhysicalPosition, WindowEvent};

use crate::{
    app_state::AppState,
    models::{AppSettings, AppSettingsPatch},
};

pub fn handle_window_event(window: &tauri::Window, event: &WindowEvent) {
    if window.label() == "main" {
        if let WindowEvent::CloseRequested { api, .. } = event {
            api.prevent_close();
            if let Err(error) = window.hide() {
                tracing::warn!("failed to hide main window on close: {error}");
            }
        }
    }
}

pub fn show_window(app: &AppHandle, label: &str, focus: bool) -> Result<(), String> {
    let window = app
        .get_webview_window(label)
        .ok_or_else(|| format!("window '{label}' not found"))?;

    window
        .show()
        .map_err(|error| format!("failed to show {label}: {error}"))?;

    if focus {
        window
            .set_focus()
            .map_err(|error| format!("failed to focus {label}: {error}"))?;
    }

    Ok(())
}

pub fn hide_window(app: &AppHandle, label: &str) -> Result<(), String> {
    let window = app
        .get_webview_window(label)
        .ok_or_else(|| format!("window '{label}' not found"))?;

    window
        .hide()
        .map_err(|error| format!("failed to hide {label}: {error}"))
}

pub fn toggle_window(app: &AppHandle, label: &str) -> Result<bool, String> {
    let window = app
        .get_webview_window(label)
        .ok_or_else(|| format!("window '{label}' not found"))?;

    let visible = window
        .is_visible()
        .map_err(|error| format!("failed to read {label} visibility: {error}"))?;

    if visible {
        window
            .hide()
            .map_err(|error| format!("failed to hide {label}: {error}"))?;
        Ok(false)
    } else {
        window
            .show()
            .map_err(|error| format!("failed to show {label}: {error}"))?;
        Ok(true)
    }
}

pub async fn save_window_position(
    app: &AppHandle,
    state: &AppState,
    label: &str,
    x: f64,
    y: f64,
) -> Result<AppSettings, String> {
    let settings = {
        let mut settings = state.settings.write().await;
        let mut layout = state.layout.write().await;

        match label {
            "pet" => {
                settings.apply_patch(AppSettingsPatch {
                    cat_window_x: Some(x),
                    cat_window_y: Some(y),
                    ..Default::default()
                });
                layout.cat_window_x = x;
                layout.cat_window_y = y;
            }
            "monitor-bar" => {
                settings.apply_patch(AppSettingsPatch {
                    monitor_bar_x: Some(x),
                    monitor_bar_y: Some(y),
                    ..Default::default()
                });
                layout.monitor_bar_x = x;
                layout.monitor_bar_y = y;
            }
            other => return Err(format!("unsupported window position label: {other}")),
        }

        state.storage.save_settings(&settings)?;
        state.storage.save_layout(&layout)?;
        settings.clone()
    };

    app.emit("settings:updated", settings.clone())
        .map_err(|error| format!("failed to emit settings:updated: {error}"))?;

    Ok(settings)
}

pub async fn apply_saved_window_positions(app: &AppHandle) {
    let state = app.state::<AppState>();
    let settings = state.settings.read().await.clone();

    if let Some(window) = app.get_webview_window("pet") {
        if let Err(error) = window.set_position(PhysicalPosition::new(
            settings.cat_window_x.round() as i32,
            settings.cat_window_y.round() as i32,
        )) {
            tracing::warn!("failed to restore pet position: {error}");
        }
    }

    if let Some(window) = app.get_webview_window("monitor-bar") {
        if let Err(error) = window.set_position(PhysicalPosition::new(
            settings.monitor_bar_x.round() as i32,
            settings.monitor_bar_y.round() as i32,
        )) {
            tracing::warn!("failed to restore monitor-bar position: {error}");
        }
    }
}
