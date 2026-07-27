//! Global hotkey registration for launching the picker without a focused window

use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};
use tauri_plugin_store::StoreExt;

use crate::picker::{self, PickerConfig};

pub const DEFAULT_HOTKEY: &str = "CommandOrControl+Shift+C";
const SETTINGS_FILE: &str = "settings.json";

/// Read the persisted picker hotkey, falling back to the default if unset
pub fn load_persisted_hotkey(app: &AppHandle) -> String {
    app.store(SETTINGS_FILE)
        .ok()
        .and_then(|store| store.get("pickerHotkey"))
        .and_then(|v| v.as_str().map(str::to_string))
        .unwrap_or_else(|| DEFAULT_HOTKEY.to_string())
}

fn load_picker_config(app: &AppHandle) -> PickerConfig {
    let store = app.store(SETTINGS_FILE).ok();

    let get_num = |key: &str, default: usize| -> usize {
        store
            .as_ref()
            .and_then(|s| s.get(key))
            .and_then(|v| v.as_u64())
            .map(|v| v as usize)
            .unwrap_or(default)
    };
    let get_bool = |key: &str, default: bool| -> bool {
        store
            .as_ref()
            .and_then(|s| s.get(key))
            .and_then(|v| v.as_bool())
            .unwrap_or(default)
    };

    let defaults = PickerConfig::default();

    PickerConfig {
        grid_size: get_num("eyedropperGridSize", defaults.grid_size),
        show_hex: get_bool("eyedropperShowHex", defaults.show_hex),
        magnifier_size: get_num("eyedropperMagnifierSize", defaults.magnifier_size),
        detect_background_changes: get_bool(
            "eyedropperDetectBackgroundChanges",
            defaults.detect_background_changes,
        ),
        allow_hover_through: get_bool("eyedropperAllowHoverThrough", defaults.allow_hover_through),
        show_pixel_grid: get_bool("eyedropperShowPixelGrid", defaults.show_pixel_grid),
        adaptive_border: get_bool("eyedropperAdaptiveBorder", defaults.adaptive_border),
    }
}

/// Launch the picker using the current persisted settings, triggered from the global hotkey
/// or the tray menu's "Launch Picker" item. Hides/shows the main colorpicker window per the
/// `eyedropperHideMain` setting (skipped entirely in headless quick-pick mode — see
/// `quickPickHeadless`), and emits each pick to the frontend via a `color-picked` event
/// since there's no `invoke` caller. Multi-pick sessions (Shift+Click, see B8) emit one
/// event per pick, not just at the end.
pub async fn trigger_global_pick(app: AppHandle) {
    let config = load_picker_config(&app);
    let store = app.store(SETTINGS_FILE).ok();
    let hide_main = store
        .as_ref()
        .and_then(|s| s.get("eyedropperHideMain"))
        .and_then(|v| v.as_bool())
        .unwrap_or(true);
    // Headless quick-pick: window state is left completely untouched (no
    // hide/show/restore at all) — clipboard + notification are handled by
    // the frontend's color-picked listener, same event this fn already emits.
    let headless = store
        .as_ref()
        .and_then(|s| s.get("quickPickHeadless"))
        .and_then(|v| v.as_bool())
        .unwrap_or(false);

    let window = app.get_webview_window("colorpicker");

    if hide_main && !headless {
        if let Some(window) = &window {
            let _ = window.hide();
        }
    }

    let app_for_picks = app.clone();
    let result = tokio::task::spawn_blocking(move || {
        let (tx, rx) = std::sync::mpsc::channel();
        picker::launch_picker(
            config,
            move |color| {
                // Emit immediately on every pick — a multi-pick session
                // fires this several times before the session actually ends.
                if let Err(e) = app_for_picks.emit("color-picked", &Some(color)) {
                    log::error!("Failed to emit color-picked event: {}", e);
                }
            },
            move |result| {
                let _ = tx.send(result);
            },
        );
        rx.recv().unwrap_or(None)
    })
        .await
        .unwrap_or_else(|e| {
            log::error!("Global hotkey picker task failed: {}", e);
            None
        });

    if !headless {
        if hide_main {
            if let Some(window) = &window {
                let _ = window.show();
                let _ = window.set_focus();
            }
        } else if result.is_some() {
            // Bring the main window back if it was closed to tray or minimized,
            // so the user can see the color that was just picked
            if let Some(window) = &window {
                let is_minimized = window.is_minimized().unwrap_or(false);
                let is_visible = window.is_visible().unwrap_or(true);
                if is_minimized || !is_visible {
                    let _ = window.unminimize();
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        }
    }

    if let Some(ref color) = result {
        log::info!(
            "Color picked via global hotkey: #{:02X}{:02X}{:02X}",
            color.r,
            color.g,
            color.b
        );
    } else {
        // The final color (if any) was already emitted above via on_pick —
        // only a fully-cancelled session (no picks at all) still needs its
        // own event, so the frontend has something to react to either way.
        if let Err(e) = app.emit("color-picked", &Option::<crate::picker::PickedColor>::None) {
            log::error!("Failed to emit color-picked event: {}", e);
        }
    }
}

/// Register the picker global hotkey, replacing any previously registered shortcut
pub fn register_picker_shortcut(app: &AppHandle, hotkey: &str) -> Result<(), String> {
    app.global_shortcut()
        .unregister_all()
        .map_err(|e| format!("Failed to unregister existing shortcuts: {}", e))?;

    let shortcut: Shortcut = hotkey
        .parse()
        .map_err(|e| format!("Invalid shortcut '{}': {}", hotkey, e))?;

    app.global_shortcut()
        .on_shortcut(shortcut, move |app, _shortcut, event| {
            if event.state() == ShortcutState::Pressed {
                let app_handle = app.clone();
                tauri::async_runtime::spawn(trigger_global_pick(app_handle));
            }
        })
        .map_err(|e| format!("Failed to register shortcut '{}': {}", hotkey, e))?;

    log::info!("Registered picker global hotkey: {}", hotkey);
    Ok(())
}
