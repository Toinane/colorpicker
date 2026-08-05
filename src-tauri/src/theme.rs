//! Native window theme (light/dark), driven by the persisted `theme` setting
//! rather than only the OS preference - so the Mica/vibrancy tint applied in
//! `apply_window_effects` matches what the user picked in Settings > General
//! > Colorpicker instead of only ever following the OS. Mirrors the
//! frontend's `useTheme` (light/dark/system) resolution.

use tauri::{AppHandle, Listener, Manager};
use tauri_plugin_store::StoreExt;

fn settings_file() -> String {
    crate::portable::resolve_filename("settings.json")
}

/// Read the persisted `theme` setting, defaulting to "system" - same default
/// as `DEFAULT_SETTINGS.theme` on the frontend.
pub fn persisted_theme_setting(app: &AppHandle) -> String {
    app.store(settings_file())
        .ok()
        .and_then(|store| store.get("theme"))
        .and_then(|v| v.as_str().map(str::to_string))
        .unwrap_or_else(|| "system".to_string())
}

/// `None` lets the window follow the OS theme (`set_theme`'s own default);
/// `Some(_)` pins it regardless of the OS, for the "light"/"dark" settings.
fn resolve_native_theme(setting: &str) -> Option<tauri::Theme> {
    match setting {
        "light" => Some(tauri::Theme::Light),
        "dark" => Some(tauri::Theme::Dark),
        _ => None,
    }
}

/// Apply the resolved theme to a single window. Window effects are
/// re-applied afterward: Mica reads the window's dark-mode state at the time
/// effects are (re-)applied, so a theme change needs both calls to actually
/// repaint the tint.
pub fn apply_theme_to_window(window: &tauri::WebviewWindow, setting: &str) {
    if let Err(e) = window.set_theme(resolve_native_theme(setting)) {
        log::warn!("Failed to set window theme: {}", e);
    }
    crate::apply_window_effects(window);
}

/// Apply the given theme setting to every currently open window.
pub fn apply_theme_to_all_windows(app: &AppHandle, setting: &str) {
    for label in ["colorpicker", "settings", "palettes"] {
        if let Some(window) = app.get_webview_window(label) {
            apply_theme_to_window(&window, setting);
        }
    }
}

/// React live to the user changing the theme setting from any window -
/// mirrors `tray.rs`'s language-change listener.
pub fn listen_theme_changes(app: &AppHandle) {
    let app_handle = app.clone();
    app.listen("settings-changed", move |event| {
        let Some(theme) = serde_json::from_str::<serde_json::Value>(event.payload())
            .ok()
            .and_then(|payload| {
                payload
                    .get("updates")?
                    .get("theme")?
                    .as_str()
                    .map(str::to_string)
            })
        else {
            return;
        };

        apply_theme_to_all_windows(&app_handle, &theme);
    });
}
