mod app_state;
pub mod achievements;
mod commands;
pub mod events;
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
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .init();

    tauri::Builder::default()
        .setup(|app| {
            let state = AppState::load().map_err(std::io::Error::other)?;
            app.manage(state);
            tray::setup_tray(app)?;
            let corruption_rebuilds = app
                .state::<AppState>()
                .storage
                .take_corruption_rebuilds();
            let launch_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                for (index, file_name) in corruption_rebuilds.into_iter().enumerate() {
                    let now = models::current_timestamp_ms();
                    if let Err(error) = commands::record_internal_achievement_event(
                        &launch_handle,
                        "storage.corruption_rebuilt",
                        format!("storage.corruption_rebuilt:{file_name}:{now}:{index}"),
                        serde_json::json!({
                            "fileName": file_name,
                        }),
                    )
                    .await
                    {
                        tracing::warn!(
                            "failed to record storage.corruption_rebuilt achievement event: {error}"
                        );
                    }
                }
                let now = models::current_timestamp_ms();
                if let Err(error) = commands::record_internal_achievement_event(
                    &launch_handle,
                    "app.launch",
                    format!("app.launch:{now}"),
                    serde_json::json!({
                        "appVersion": env!("CARGO_PKG_VERSION"),
                    }),
                )
                .await
                {
                    tracing::warn!("failed to record app.launch achievement event: {error}");
                }
            });
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
            commands::track_achievement_event,
            commands::get_achievement_summary,
            commands::list_achievements,
            commands::get_achievement_detail,
            commands::mark_achievement_notifications_seen,
            commands::get_hardware_snapshot,
            commands::get_app_settings,
            commands::update_app_settings,
            commands::get_workshop_state,
            commands::reward_corecat_interaction,
            commands::get_work_log_report,
            commands::get_daily_work_assessment,
            commands::get_daily_work_assessment_history,
            commands::get_daily_work_assessment_trend,
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
            commands::update_workshop_state,
            commands::start_focus_session,
            commands::complete_focus_session,
            commands::abandon_focus_session,
            commands::updater::check_update,
            commands::updater::download_update,
            commands::updater::install_update
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
