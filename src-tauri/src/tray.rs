//! System tray icon, menu, and left-click toggle for the main window

use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder, TrayIconEvent},
    AppHandle, Listener, Manager, Wry,
};
use tauri_plugin_store::StoreExt;

fn settings_file() -> String {
    crate::portable::resolve_filename("settings.json")
}

fn persisted_language(app: &AppHandle) -> String {
    app.store(settings_file())
        .ok()
        .and_then(|store| store.get("language"))
        .and_then(|v| v.as_str().map(str::to_string))
        .unwrap_or_else(|| "en_US".to_string())
}

/// Read the persisted "close to tray" preference, defaulting to quitting normally
pub fn should_close_to_tray(app: &AppHandle) -> bool {
    app.store(settings_file())
        .ok()
        .and_then(|store| store.get("closeToTray"))
        .and_then(|v| v.as_bool())
        .unwrap_or(false)
}

fn show_main_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("colorpicker") {
        let _ = window.show();
        let _ = window.set_focus();
    }
}

fn build_menu(app: &AppHandle) -> tauri::Result<Menu<Wry>> {
    let language = persisted_language(app);
    let t = |key: &str| crate::i18n::t(&language, key);

    let open_item = MenuItem::with_id(app, "open", t("common:tray.open"), true, None::<&str>)?;
    let settings_item = MenuItem::with_id(
        app,
        "settings",
        t("common:tray.settings"),
        true,
        None::<&str>,
    )?;
    let pick_item = MenuItem::with_id(app, "pick", t("common:tray.pick"), true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", t("common:tray.quit"), true, None::<&str>)?;

    Menu::with_items(
        app,
        &[
            &open_item,
            &settings_item,
            &pick_item,
            &PredefinedMenuItem::separator(app)?,
            &quit_item,
        ],
    )
}

/// Build and register the tray icon with its menu and click handlers
pub fn create_tray(app: &AppHandle) -> tauri::Result<()> {
    let menu = build_menu(app)?;

    let tray = TrayIconBuilder::with_id("main-tray")
        .icon(app.default_window_icon().cloned().unwrap())
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "open" => show_main_window(app),
            "settings" => {
                let app_handle = app.clone();
                tauri::async_runtime::spawn(async move {
                    if let Err(e) = crate::commands::open_settings(app_handle).await {
                        log::error!("Failed to open settings window: {}", e);
                    }
                });
            }
            "pick" => {
                let app_handle = app.clone();
                tauri::async_runtime::spawn(crate::shortcuts::trigger_global_pick(app_handle));
            }
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("colorpicker") {
                    let is_visible = window.is_visible().unwrap_or(false);
                    if is_visible {
                        let _ = window.hide();
                    } else {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
            }
        })
        .build(app)?;

    app.manage(tray);

    // Rebuild the tray menu labels whenever the language setting changes
    let app_handle = app.clone();
    app.listen("settings-changed", move |event| {
        let language_changed = serde_json::from_str::<serde_json::Value>(event.payload())
            .ok()
            .and_then(|payload| payload.get("updates")?.get("language").map(|_| ()))
            .is_some();

        if !language_changed {
            return;
        }

        if let (Some(tray), Ok(menu)) = (
            app_handle.try_state::<TrayIcon<Wry>>(),
            build_menu(&app_handle),
        ) {
            let _ = tray.set_menu(Some(menu));
        }
    });

    Ok(())
}
