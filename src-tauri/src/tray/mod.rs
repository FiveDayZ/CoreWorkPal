use tauri::{
    image::Image,
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    App, AppHandle, Emitter, Manager,
};

use crate::{
    app_state::AppState,
    models::{AppSettings, AppSettingsPatch},
    window_manager,
};

const TRAY_ID: &str = "coreworkpal";
const MENU_OPEN_MAIN: &str = "open-main";
const MENU_TOGGLE_CAT: &str = "toggle-cat";
const MENU_TOGGLE_MONITOR: &str = "toggle-monitor";
const MENU_TOGGLE_PRODUCTION: &str = "toggle-production";
const MENU_OPEN_SETTINGS: &str = "open-settings";
const MENU_OPEN_ABOUT: &str = "open-about";
const MENU_QUIT: &str = "quit";

pub fn setup_tray(app: &App) -> tauri::Result<()> {
    let open_main = MenuItem::with_id(app, MENU_OPEN_MAIN, "打开主界面", true, None::<&str>)?;
    let toggle_cat = MenuItem::with_id(
        app,
        MENU_TOGGLE_CAT,
        "显示/隐藏 CoreCat",
        true,
        None::<&str>,
    )?;
    let toggle_monitor = MenuItem::with_id(
        app,
        MENU_TOGGLE_MONITOR,
        "显示/隐藏监控条",
        true,
        None::<&str>,
    )?;
    let toggle_production = MenuItem::with_id(
        app,
        MENU_TOGGLE_PRODUCTION,
        "暂停/继续产出",
        true,
        None::<&str>,
    )?;
    let open_settings = MenuItem::with_id(app, MENU_OPEN_SETTINGS, "设置", true, None::<&str>)?;
    let open_about = MenuItem::with_id(app, MENU_OPEN_ABOUT, "关于", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, MENU_QUIT, "退出", true, None::<&str>)?;
    let separator_a = PredefinedMenuItem::separator(app)?;
    let separator_b = PredefinedMenuItem::separator(app)?;

    let menu = Menu::with_items(
        app,
        &[
            &open_main,
            &separator_a,
            &toggle_cat,
            &toggle_monitor,
            &toggle_production,
            &separator_b,
            &open_settings,
            &open_about,
            &quit,
        ],
    )?;

    let state = app.state::<AppState>();
    let theme_name = tauri::async_runtime::block_on(async {
        let settings = state.settings.read().await;
        settings.theme_name.clone()
    });

    let mut builder = TrayIconBuilder::with_id(TRAY_ID)
        .menu(&menu)
        .tooltip("CoreWorkPal")
        .show_menu_on_left_click(false)
        .on_menu_event(handle_menu_event)
        .on_tray_icon_event(|tray, event| {
            let should_show_main = matches!(
                event,
                TrayIconEvent::Click {
                    button: MouseButton::Left,
                    button_state: MouseButtonState::Up,
                    ..
                } | TrayIconEvent::DoubleClick {
                    button: MouseButton::Left,
                    ..
                }
            );

            if should_show_main {
                let app = tray.app_handle().clone();
                tauri::async_runtime::spawn(async move {
                    if let Err(error) = show_main_route(&app, "dashboard").await {
                        tracing::warn!("failed to open main window from tray icon: {error}");
                    }
                });
            }
        });

    builder = builder.icon(create_tray_icon(&theme_name));

    builder.build(app)?;
    Ok(())
}

fn handle_menu_event(app: &AppHandle, event: tauri::menu::MenuEvent) {
    match event.id().as_ref() {
        MENU_OPEN_MAIN => {
            let app = app.clone();
            tauri::async_runtime::spawn(async move {
                if let Err(error) = show_main_route(&app, "dashboard").await {
                    tracing::warn!("failed to open main window from tray: {error}");
                }
            });
        }
        MENU_OPEN_SETTINGS => {
            let app = app.clone();
            tauri::async_runtime::spawn(async move {
                if let Err(error) = show_main_route(&app, "settings").await {
                    tracing::warn!("failed to open settings from tray: {error}");
                }
            });
        }
        MENU_OPEN_ABOUT => {
            let app = app.clone();
            tauri::async_runtime::spawn(async move {
                if let Err(error) = show_main_route(&app, "about").await {
                    tracing::warn!("failed to open about from tray: {error}");
                }
            });
        }
        MENU_TOGGLE_CAT => {
            let app = app.clone();
            tauri::async_runtime::spawn(async move {
                if let Err(error) = toggle_cat_visibility(app).await {
                    tracing::warn!("failed to toggle CoreCat from tray: {error}");
                }
            });
        }
        MENU_TOGGLE_MONITOR => {
            let app = app.clone();
            tauri::async_runtime::spawn(async move {
                if let Err(error) = toggle_monitor_visibility(app).await {
                    tracing::warn!("failed to toggle monitor bar from tray: {error}");
                }
            });
        }
        MENU_TOGGLE_PRODUCTION => {
            let app = app.clone();
            tauri::async_runtime::spawn(async move {
                if let Err(error) = toggle_production(app).await {
                    tracing::warn!("failed to toggle production from tray: {error}");
                }
            });
        }
        MENU_QUIT => {
            crate::IS_EXITING.store(true, std::sync::atomic::Ordering::SeqCst);
            app.exit(0);
        }
        _ => {}
    }
}

async fn show_main_route(app: &AppHandle, route: &str) -> Result<(), String> {
    window_manager::show_window(app, "main", true).await?;
    app.emit("ui:navigate-main", route)
        .map_err(|error| format!("failed to emit ui:navigate-main: {error}"))
}

async fn toggle_cat_visibility(app: AppHandle) -> Result<(), String> {
    let is_cat_visible = window_manager::toggle_window(&app, "pet").await?;
    if !is_cat_visible {
        window_manager::hide_window(&app, "pet-panel").await?;
    }

    apply_settings_patch(
        &app,
        AppSettingsPatch {
            is_cat_visible: Some(is_cat_visible),
            ..Default::default()
        },
    )
    .await
    .map(|_| ())
}

async fn toggle_monitor_visibility(app: AppHandle) -> Result<(), String> {
    let is_monitor_bar_visible = window_manager::toggle_window(&app, "monitor-bar").await?;

    apply_settings_patch(
        &app,
        AppSettingsPatch {
            is_monitor_bar_visible: Some(is_monitor_bar_visible),
            ..Default::default()
        },
    )
    .await
    .map(|_| ())
}

async fn toggle_production(app: AppHandle) -> Result<(), String> {
    let is_production_paused = {
        let state = app.state::<AppState>();
        let settings = state.settings.read().await;
        !settings.is_production_paused
    };

    apply_settings_patch(
        &app,
        AppSettingsPatch {
            is_production_paused: Some(is_production_paused),
            ..Default::default()
        },
    )
    .await
    .map(|_| ())
}

async fn apply_settings_patch(
    app: &AppHandle,
    patch: AppSettingsPatch,
) -> Result<AppSettings, String> {
    let state = app.state::<AppState>();
    let settings = {
        let mut settings = state.settings.write().await;
        settings.apply_patch(patch);
        state.storage.save_settings(&settings)?;
        settings.clone()
    };

    if let Some(tray) = app.tray_by_id(TRAY_ID) {
        let icon = create_tray_icon(&settings.theme_name);
        let _ = tray.set_icon(Some(icon));
    }

    app.emit("settings:updated", settings.clone())
        .map_err(|error| format!("failed to emit settings:updated: {error}"))?;

    Ok(settings)
}

fn create_tray_icon(theme: &str) -> Image<'static> {
    let bytes = match theme {
        "cyber" => include_bytes!("../../../src/assets/icons/tray_icon_blue.png").as_slice(),
        "steampunk" => include_bytes!("../../../src/assets/icons/tray_icon_gold.png").as_slice(),
        _ => include_bytes!("../../../src/assets/icons/tray_icon_orange.png").as_slice(),
    };
    Image::from_bytes(bytes).expect("failed to load tray icon")
}
