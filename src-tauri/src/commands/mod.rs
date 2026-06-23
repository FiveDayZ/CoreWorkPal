use tauri::{AppHandle, Emitter, State};

use crate::{
    app_state::AppState,
    models::{today_key, AppSettings, AppSettingsPatch, HardwareSnapshot, WorkLogEntry, WorkLogReport, WorkshopState},
    taskbar_embed,
    window_manager,
};

#[tauri::command]
pub async fn get_hardware_snapshot(state: State<'_, AppState>) -> Result<HardwareSnapshot, String> {
    if let Some(snapshot) = state.last_snapshot.read().await.clone() {
        return Ok(snapshot);
    }

    let snapshot = {
        let mut adapter = state
            .hardware_adapter
            .lock()
            .map_err(|error| format!("hardware adapter lock failed: {error}"))?;
        adapter.sample()
    };

    *state.last_snapshot.write().await = Some(snapshot.clone());
    Ok(snapshot)
}

#[tauri::command]
pub async fn get_app_settings(state: State<'_, AppState>) -> Result<AppSettings, String> {
    Ok(state.settings.read().await.clone())
}

#[tauri::command]
pub async fn update_app_settings(
    patch: AppSettingsPatch,
    state: State<'_, AppState>,
    app: AppHandle,
) -> Result<AppSettings, String> {
    let launch_at_startup = patch.launch_at_startup;

    if let Some(enabled) = launch_at_startup {
        sync_launch_at_startup(enabled)?;
    }

    let settings = {
        let mut settings = state.settings.write().await;
        settings.apply_patch(patch);
        state.storage.save_settings(&settings)?;
        settings.clone()
    };

    app.emit("settings:updated", settings.clone())
        .map_err(|error| format!("failed to emit settings:updated: {error}"))?;

    taskbar_embed::sync_taskbar_monitor(&app).await;

    Ok(settings)
}

#[cfg(windows)]
fn sync_launch_at_startup(enabled: bool) -> Result<(), String> {
    use std::os::windows::process::CommandExt;

    const CREATE_NO_WINDOW: u32 = 0x08000000;
    const RUN_KEY: &str = r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run";
    const VALUE_NAME: &str = "CoreWorkPal";

    let mut command = std::process::Command::new("reg.exe");
    command.creation_flags(CREATE_NO_WINDOW);

    if enabled {
        let exe_path = std::env::current_exe()
            .map_err(|error| format!("failed to resolve current executable: {error}"))?;
        let exe_command = format!("\"{}\"", exe_path.display());
        command.args([
            "add",
            RUN_KEY,
            "/v",
            VALUE_NAME,
            "/t",
            "REG_SZ",
            "/d",
            &exe_command,
            "/f",
        ]);
    } else {
        command.args(["delete", RUN_KEY, "/v", VALUE_NAME, "/f"]);
    }

    let output = command
        .output()
        .map_err(|error| format!("failed to update startup registry: {error}"))?;

    if output.status.success() || (!enabled && output.status.code() == Some(1)) {
        return Ok(());
    }

    let stderr = String::from_utf8_lossy(&output.stderr);
    Err(format!("failed to update startup registry: {stderr}"))
}

#[cfg(not(windows))]
fn sync_launch_at_startup(_enabled: bool) -> Result<(), String> {
    Ok(())
}

#[tauri::command]
pub async fn get_workshop_state(state: State<'_, AppState>) -> Result<WorkshopState, String> {
    Ok(state.workshop.read().await.clone())
}

#[tauri::command]
pub async fn reward_corecat_interaction(
    action: String,
    state: State<'_, AppState>,
    app: AppHandle,
) -> Result<WorkshopState, String> {
    let (animation_state, next_workshop) = {
        let mut workshop = state.workshop.write().await;
        apply_corecat_interaction_reward(&mut workshop, action.as_str())?;
        state.storage.save_workshop(&workshop)?;
        let animation_state = match action.as_str() {
            "pet" => "pettingHearts",
            "sortParts" => "dataSorting",
            _ => unreachable!("validated in apply_corecat_interaction_reward"),
        };
        (animation_state, workshop.clone())
    };

    app.emit("workshop:updated", next_workshop.clone())
        .map_err(|error| format!("failed to emit workshop:updated: {error}"))?;
    emit_corecat_interaction_state(&app, animation_state)?;
    Ok(next_workshop)
}

#[tauri::command]
pub async fn get_work_log_report(
    date: Option<String>,
    state: State<'_, AppState>,
) -> Result<WorkLogReport, String> {
    let date = date.unwrap_or_else(today_key);
    let entry = state
        .work_logs
        .read()
        .await
        .entries
        .get(&date)
        .cloned()
        .unwrap_or_else(|| WorkLogEntry {
            date,
            ..Default::default()
        });

    Ok(WorkLogReport::from_entry(entry))
}

#[tauri::command]
pub async fn toggle_production_paused(
    state: State<'_, AppState>,
    app: AppHandle,
) -> Result<AppSettings, String> {
    let is_production_paused = {
        let settings = state.settings.read().await;
        !settings.is_production_paused
    };

    update_app_settings(
        AppSettingsPatch {
            is_production_paused: Some(is_production_paused),
            ..Default::default()
        },
        state,
        app,
    )
    .await
}

#[tauri::command]
pub async fn show_main_window(app: AppHandle) -> Result<(), String> {
    window_manager::show_window(&app, "main", true).await
}

#[tauri::command]
pub async fn show_main_route(route: String, app: AppHandle) -> Result<(), String> {
    window_manager::show_window(&app, "main", true).await?;
    app.emit("ui:navigate-main", route)
        .map_err(|error| format!("failed to emit ui:navigate-main: {error}"))
}

#[tauri::command]
pub async fn hide_main_window(app: AppHandle) -> Result<(), String> {
    window_manager::hide_window(&app, "main").await
}

#[tauri::command]
pub async fn show_pet_window(app: AppHandle, state: State<'_, AppState>) -> Result<(), String> {
    window_manager::show_window(&app, "pet", false).await?;
    update_app_settings(
        AppSettingsPatch {
            is_cat_visible: Some(true),
            ..Default::default()
        },
        state,
        app,
    )
    .await
    .map(|_| ())
}

#[tauri::command]
pub async fn hide_pet_window(app: AppHandle, state: State<'_, AppState>) -> Result<(), String> {
    window_manager::hide_window(&app, "pet").await?;
    window_manager::hide_window(&app, "pet-panel").await?;
    update_app_settings(
        AppSettingsPatch {
            is_cat_visible: Some(false),
            ..Default::default()
        },
        state,
        app,
    )
    .await
    .map(|_| ())
}

#[tauri::command]
pub async fn toggle_monitor_bar(app: AppHandle, state: State<'_, AppState>) -> Result<(), String> {
    let is_monitor_bar_visible = window_manager::toggle_window(&app, "monitor-bar").await?;

    update_app_settings(
        AppSettingsPatch {
            is_monitor_bar_visible: Some(is_monitor_bar_visible),
            ..Default::default()
        },
        state,
        app,
    )
    .await
    .map(|_| ())
}

#[tauri::command]
pub async fn show_monitor_bar(app: AppHandle, state: State<'_, AppState>) -> Result<(), String> {
    window_manager::show_window(&app, "monitor-bar", false).await?;
    update_app_settings(
        AppSettingsPatch {
            is_monitor_bar_visible: Some(true),
            ..Default::default()
        },
        state,
        app,
    )
    .await
    .map(|_| ())
}

#[tauri::command]
pub async fn hide_monitor_bar(app: AppHandle, state: State<'_, AppState>) -> Result<(), String> {
    window_manager::hide_window(&app, "monitor-bar").await?;
    update_app_settings(
        AppSettingsPatch {
            is_monitor_bar_visible: Some(false),
            ..Default::default()
        },
        state,
        app,
    )
    .await
    .map(|_| ())
}

#[tauri::command]
pub async fn show_pet_panel(app: AppHandle) -> Result<(), String> {
    window_manager::show_window(&app, "pet-panel", true).await?;
    emit_corecat_interaction_state(&app, "panelOpen")
}

#[tauri::command]
pub async fn hide_pet_panel(app: AppHandle) -> Result<(), String> {
    window_manager::hide_window(&app, "pet-panel").await
}

#[tauri::command]
pub async fn toggle_pet_panel(app: AppHandle) -> Result<(), String> {
    let is_visible = window_manager::toggle_window(&app, "pet-panel").await?;
    emit_corecat_interaction_state(
        &app,
        if is_visible {
            "panelOpen"
        } else {
            "panelClose"
        },
    )
}

fn emit_corecat_interaction_state(app: &AppHandle, state: &'static str) -> Result<(), String> {
    app.emit("corecat:interaction-state", state)
        .map_err(|error| format!("failed to emit corecat:interaction-state: {error}"))
}

fn apply_corecat_interaction_reward(
    workshop: &mut WorkshopState,
    action: &str,
) -> Result<(), String> {
    let today = today_key();
    if workshop.last_daily_reset_date != today {
        workshop.today_parts = 0.0;
        workshop.today_insight = 0.0;
        workshop.last_daily_reset_date = today;
    }

    match action {
        "pet" => {
            workshop.insight += 0.01;
            workshop.today_insight += 0.01;
            Ok(())
        }
        "sortParts" => {
            workshop.parts += 0.1;
            workshop.today_parts += 0.1;
            Ok(())
        }
        _ => Err(format!("unknown CoreCat interaction action: {action}")),
    }
}

#[tauri::command]
pub async fn save_window_position(
    window_label: String,
    x: f64,
    y: f64,
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<AppSettings, String> {
    window_manager::save_window_position(&app, &state, &window_label, x, y).await
}

#[tauri::command]
pub async fn exit_app(app: AppHandle) -> Result<(), String> {
    crate::IS_EXITING.store(true, std::sync::atomic::Ordering::SeqCst);
    app.exit(0);
    Ok(())
}

#[tauri::command]
pub async fn update_workshop_state(
    workshop: WorkshopState,
    state: State<'_, AppState>,
    app: AppHandle,
) -> Result<WorkshopState, String> {
    let next_workshop = {
        let mut w = state.workshop.write().await;
        *w = workshop;
        state.storage.save_workshop(&w)?;
        w.clone()
    };

    app.emit("workshop:updated", next_workshop.clone())
        .map_err(|error| format!("failed to emit workshop:updated: {error}"))?;
    Ok(next_workshop)
}
