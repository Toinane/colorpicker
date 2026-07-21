// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Listener, Manager};

mod commands;
mod i18n;
mod logger;
mod picker;
mod shortcuts;
mod tray;

/// Apply platform-specific window effects
/// - Windows: Mica effect (Windows 11+ blur that adapts to desktop wallpaper)
/// - macOS: UnderWindowBackground vibrancy (adapts to wallpaper and system theme)
fn apply_window_effects(window: &tauri::WebviewWindow) {
    #[cfg(target_os = "windows")]
    {
        use tauri::utils::config::WindowEffectsConfig;
        use tauri_utils::{WindowEffect, WindowEffectState};
        use tauri::window::Color;

        let effects = WindowEffectsConfig {
            effects: vec![WindowEffect::Mica],
            state: Some(WindowEffectState::FollowsWindowActiveState),
            radius: Some(8.0),
            color: Some(Color(0, 0, 0, 0)),
        };

        if let Err(e) = window.set_effects(Some(effects)) {
            log::warn!("Failed to apply Mica effect on Windows: {}", e);
        } else {
            log::debug!("Applied Mica window effect");
        }
    }

    #[cfg(target_os = "macos")]
    {
        use tauri::utils::config::WindowEffectsConfig;
        use tauri_utils::{WindowEffect, WindowEffectState};
        use tauri::window::Color;

        let effects = WindowEffectsConfig {
            effects: vec![WindowEffect::UnderWindowBackground],
            state: Some(WindowEffectState::FollowsWindowActiveState),
            radius: Some(8.0),
            color: Some(Color(0, 0, 0, 0)),
        };

        if let Err(e) = window.set_effects(Some(effects)) {
            log::warn!("Failed to apply UnderWindowBackground effect on macOS: {}", e);
        } else {
            log::debug!("Applied UnderWindowBackground vibrancy effect");
        }
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        log::debug!("Window effects not supported on this platform");
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            println!("{}, {argv:?}, {cwd}", app.package_info().name);
        }))
        .plugin(logger::create_logger().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            log::info!("ColorPicker v{} starting", env!("CARGO_PKG_VERSION"));

            // Apply platform-specific window effects
            if let Some(window) = app.get_webview_window("colorpicker") {
                apply_window_effects(&window);

                // Closing the main window either quits the app (closing the settings
                // window along with it) or, if the user opted in, just hides both
                // windows and keeps the app running in the tray.
                let app_handle = app.handle().clone();
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        if tray::should_close_to_tray(&app_handle) {
                            api.prevent_close();
                            if let Some(w) = app_handle.get_webview_window("colorpicker") {
                                let _ = w.hide();
                            }
                            if let Some(s) = app_handle.get_webview_window("settings") {
                                let _ = s.hide();
                            }
                        } else if let Some(settings) = app_handle.get_webview_window("settings") {
                            let _ = settings.close();
                        }
                    }
                });
            }

            // Build the system tray icon and menu
            tray::create_tray(app.handle())?;

            // Register the global picker hotkey from persisted settings (or default)
            let hotkey = shortcuts::load_persisted_hotkey(app.handle());
            if let Err(e) = shortcuts::register_picker_shortcut(app.handle(), &hotkey) {
                log::error!("Failed to register picker global hotkey: {}", e);
            }

            // Listen for window-ready events from frontend
            let app_handle = app.handle().clone();
            app.listen("window-ready", move |event| {
                let window_label = event.payload().trim_matches('"');
                log::debug!("Window ready event received: {}", window_label);

                // Show any window when it's ready
                // This allows both colorpicker (on startup) and settings (on-demand) to work
                if let Some(window) = app_handle.get_webview_window(window_label) {
                    let _ = window.show();
                    let _ = window.set_focus();
                    log::debug!("Window shown and focused: {}", window_label);
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::pick_color,
            commands::set_picker_hotkey,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
