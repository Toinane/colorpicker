// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Listener, Manager};

mod commands;
mod logger;
mod picker;

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
        .setup(|app| {
            log::info!("ColorPicker v{} starting", env!("CARGO_PKG_VERSION"));

            // Apply platform-specific window effects
            if let Some(window) = app.get_webview_window("colorpicker") {
                apply_window_effects(&window);
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
