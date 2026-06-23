mod app_state;
mod commands;
mod input_activity;
mod models;
mod monitoring;
mod pet;
mod storage;
mod taskbar_embed;
mod tray;
mod window_manager;
mod workshop;

use app_state::AppState;
use input_activity::start_input_activity_pump;
use monitoring::start_hardware_snapshot_pump;
use tauri::Manager;

pub static IS_EXITING: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(false);

pub fn run() {
    #[cfg(debug_assertions)]
    tracing_subscriber::fmt::init();

    tauri::Builder::default()
        .setup(|app| {
            let state = AppState::load().map_err(std::io::Error::other)?;
            app.manage(state);
            tray::setup_tray(app)?;
            start_hardware_snapshot_pump(app.handle().clone());
            start_input_activity_pump(app.handle().clone());
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                window_manager::apply_saved_window_positions(&app_handle).await;
                apply_saved_visibility(&app_handle).await;
                loop {
                    taskbar_embed::sync_taskbar_monitor(&app_handle).await;
                    tokio::time::sleep(std::time::Duration::from_secs(5)).await;
                }
            });
            Ok(())
        })
        .on_window_event(window_manager::handle_window_event)
        .invoke_handler(tauri::generate_handler![
            commands::get_hardware_snapshot,
            commands::get_app_settings,
            commands::update_app_settings,
            commands::get_workshop_state,
            commands::reward_corecat_interaction,
            commands::get_work_log_report,
            commands::toggle_production_paused,
            commands::show_main_window,
            commands::show_main_route,
            commands::hide_main_window,
            commands::show_pet_window,
            commands::hide_pet_window,
            commands::toggle_monitor_bar,
            commands::show_monitor_bar,
            commands::hide_monitor_bar,
            commands::show_pet_panel,
            commands::hide_pet_panel,
            commands::toggle_pet_panel,
            commands::save_window_position,
            commands::exit_app,
            commands::update_workshop_state
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|_app_handle, event| {
            if let tauri::RunEvent::ExitRequested { api, .. } = event {
                if !IS_EXITING.load(std::sync::atomic::Ordering::SeqCst) {
                    api.prevent_exit();
                }
            }
        });
}

async fn apply_saved_visibility(app: &tauri::AppHandle) {
    let Some(state) = app.try_state::<AppState>() else {
        return;
    };
    let settings = state.settings.read().await.clone();

    let pet_result = if settings.is_cat_visible {
        window_manager::show_window(app, "pet", false).await
    } else {
        window_manager::hide_window(app, "pet").await
    };
    if let Err(error) = pet_result {
        tracing::warn!("failed to apply pet visibility: {error}");
    }

    let monitor_result = if settings.is_monitor_bar_visible {
        window_manager::show_window(app, "monitor-bar", false).await
    } else {
        window_manager::hide_window(app, "monitor-bar").await
    };
    if let Err(error) = monitor_result {
        tracing::warn!("failed to apply monitor-bar visibility: {error}");
    }

    taskbar_embed::sync_taskbar_monitor(app).await;
}
