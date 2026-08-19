// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Listener, Manager};
use tauri_plugin_store::StoreExt;

mod accent_color;
mod commands;
mod i18n;
mod logger;
mod picker;
mod platform_info;
mod portable;
mod shortcuts;
mod theme;
mod tray;

/// Apply platform-specific window effects
/// - Windows: Mica effect (Windows 11+ blur that adapts to desktop wallpaper)
/// - macOS: UnderWindowBackground vibrancy (adapts to wallpaper and system theme)
pub(crate) fn apply_window_effects(window: &tauri::WebviewWindow) {
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

/// Clamp a window's position so it's fully within a visible monitor's work
/// area (excludes the taskbar etc.). Guards against restoring a saved
/// position that's no longer valid — e.g. a monitor was unplugged, or its
/// resolution/arrangement changed since the position was saved. The
/// window-state plugin's own restore only skips repositioning when the
/// saved spot has *zero* overlap with any monitor; it doesn't stop a window
/// from being restored mostly (or partially) off-screen otherwise.
fn clamp_window_to_visible_monitor(window: &tauri::WebviewWindow) {
    // A maximized/fullscreen window's bounds are already exactly the monitor's
    // work area by definition — nothing to clamp. Also, calling `set_position`
    // on one (even a no-op-looking one, e.g. from DPI rounding) can make
    // Windows silently drop the maximized show-state back to normal.
    if window.is_maximized().unwrap_or(false) || window.is_fullscreen().unwrap_or(false) {
        return;
    }

    let (Ok(monitors), Ok(position), Ok(size)) = (
        window.available_monitors(),
        window.outer_position(),
        window.outer_size(),
    ) else {
        return;
    };

    if monitors.is_empty() {
        return;
    }

    let center_x = position.x + size.width as i32 / 2;
    let center_y = position.y + size.height as i32 / 2;

    let contains_center = |m: &&tauri::Monitor| {
        let area = m.work_area();
        center_x >= area.position.x
            && center_x < area.position.x + area.size.width as i32
            && center_y >= area.position.y
            && center_y < area.position.y + area.size.height as i32
    };

    // Prefer the monitor the window is (mostly) on; if it's off every
    // monitor entirely (e.g. that monitor is gone now), fall back to
    // whichever is nearest by center-to-center distance.
    let monitor = monitors.iter().find(contains_center).unwrap_or_else(|| {
        monitors
            .iter()
            .min_by_key(|m| {
                let area = m.work_area();
                let mx = area.position.x + area.size.width as i32 / 2;
                let my = area.position.y + area.size.height as i32 / 2;
                let dx = (center_x - mx) as i64;
                let dy = (center_y - my) as i64;
                dx * dx + dy * dy
            })
            .expect("monitors is non-empty")
    });

    let area = monitor.work_area();
    // .max(...) guards against a window bigger than the work area, which
    // would otherwise make min > max and panic in `.clamp()`.
    let max_x = (area.position.x + area.size.width as i32 - size.width as i32).max(area.position.x);
    let max_y = (area.position.y + area.size.height as i32 - size.height as i32).max(area.position.y);

    let clamped_x = position.x.clamp(area.position.x, max_x);
    let clamped_y = position.y.clamp(area.position.y, max_y);

    if clamped_x != position.x || clamped_y != position.y {
        let _ = window.set_position(tauri::PhysicalPosition::new(clamped_x, clamped_y));
    }
}

fn main() {
    // DPI awareness is process-wide and only the first call ever succeeds, so it
    // must be set once here rather than per picker session (see picker W5).
    #[cfg(target_os = "windows")]
    {
        use windows::Win32::UI::HiDpi::{
            SetProcessDpiAwarenessContext, DPI_AWARENESS_CONTEXT_PER_MONITOR_AWARE_V2,
        };
        unsafe {
            let _ = SetProcessDpiAwarenessContext(DPI_AWARENESS_CONTEXT_PER_MONITOR_AWARE_V2);
        }
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            println!("{}, {argv:?}, {cwd}", app.package_info().name);
        }))
        .plugin(logger::create_logger(portable::data_dir()).build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(
            // "settings" is transient/on-demand and gets its own fixed
            // geometry from commands::open_settings every time. "colorpicker"
            // and "palettes" have their geometry persisted and restored
            // automatically (the plugin hooks every window's on-ready event,
            // not just ones declared in tauri.conf.json, so this works for
            // "palettes" even though it's created on-demand rather than at
            // startup).
            // VISIBLE is excluded: visibility is fully owned by our own
            // window-ready show flow (windows are created hidden and shown
            // once their frontend has painted, to avoid a flash of unstyled
            // content); letting the plugin also call `.show()` during its
            // own early on-window-ready restore would reintroduce that flash.
            {
                let mut window_state_builder = tauri_plugin_window_state::Builder::default()
                    .with_denylist(&["settings"])
                    .with_state_flags(
                        tauri_plugin_window_state::StateFlags::all()
                            - tauri_plugin_window_state::StateFlags::VISIBLE,
                    );
                if let Some(dir) = portable::data_dir() {
                    window_state_builder = window_state_builder.with_filename(
                        dir.join(tauri_plugin_window_state::DEFAULT_FILENAME)
                            .to_string_lossy()
                            .into_owned(),
                    );
                }
                window_state_builder.build()
            },
        )
        .setup(|app| {
            log::info!("ColorPicker v{} starting", env!("CARGO_PKG_VERSION"));

            // Apply platform-specific window effects
            if let Some(window) = app.get_webview_window("colorpicker") {
                theme::apply_theme_to_window(
                    &window,
                    &theme::persisted_theme_setting(app.handle()),
                );

                // keepOnTop is a runtime window attribute (unlike openAtLogin, which
                // is persisted OS-side), so it must be re-applied on every startup;
                // afterward it's kept in sync via the set_keep_on_top command.
                let keep_on_top = app
                    .store(portable::resolve_filename("settings.json"))
                    .ok()
                    .and_then(|store| store.get("keepOnTop"))
                    .and_then(|v| v.as_bool())
                    .unwrap_or(false);
                let _ = window.set_always_on_top(keep_on_top);

                // The window-state plugin already restored position/size by this
                // point (it does so as soon as the window is created); clamp it
                // back into a visible monitor's work area if that restore left it
                // off-screen or straddling a monitor that's no longer there.
                clamp_window_to_visible_monitor(&window);

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
                            if let Some(p) = app_handle.get_webview_window("palettes") {
                                let _ = p.hide();
                            }
                        } else {
                            if let Some(settings) = app_handle.get_webview_window("settings") {
                                let _ = settings.close();
                            }
                            if let Some(palettes) = app_handle.get_webview_window("palettes") {
                                let _ = palettes.close();
                            }
                        }
                    }
                });
            }

            // Keep every open window's native theme (and Mica/vibrancy tint)
            // in sync with the theme setting whenever it changes.
            theme::listen_theme_changes(app.handle());

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
            accent_color::get_os_accent_color,
            platform_info::get_build_info,
            platform_info::get_platform_info,
            commands::launch_picker,
            commands::set_picker_hotkey,
            commands::open_settings,
            commands::open_palettes,
            commands::set_keep_on_top,
            commands::set_open_at_login,
            commands::get_open_at_login,
            commands::read_legacy_palettes,
            commands::backup_corrupt_legacy_palettes,
            commands::get_portable_data_dir,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
