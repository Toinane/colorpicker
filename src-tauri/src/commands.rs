//! Tauri commands. The TS-side call signatures for these are hand-mirrored in
//! `src/common/ipc.ts` — keep both in sync (see that file for why it's not
//! generated via tauri-specta yet).

use tauri::Manager;
use tauri_plugin_autostart::ManagerExt;

/// Launch the native color picker using the current persisted settings.
///
/// This is the single launch path for the picker: the toolbar button, the
/// tray "pick" menu item, and the global hotkey all end up here (the tray
/// and hotkey call `shortcuts::trigger_global_pick` directly since they have
/// no `invoke` caller to resolve to). Hides/shows the main window per the
/// `eyedropperHideMain` setting and emits the result via the `color-picked`
/// event — the frontend listens for that event rather than this command's
/// return value, so all three trigger paths are handled identically.
#[tauri::command]
pub async fn launch_picker(app: tauri::AppHandle) {
    crate::shortcuts::trigger_global_pick(app).await
}

/// Register a new global hotkey for launching the picker, replacing any previously
/// registered shortcut. The caller is responsible for persisting the value.
#[tauri::command]
pub fn set_picker_hotkey(app: tauri::AppHandle, hotkey: String) -> Result<(), String> {
    crate::shortcuts::register_picker_shortcut(&app, &hotkey)
}

/// Open the settings window, creating it if it doesn't exist yet or focusing
/// it otherwise. The toolbar button and the tray "Settings" menu item both
/// call this, so there's a single creation path (no more racing
/// `getAllWebviewWindows` calls from two different windows).
///
/// A plain sync `#[tauri::command]` runs on Tauri's command thread pool, not
/// the main thread — but window creation is thread-affine on Windows (must
/// happen on the thread owning the message loop). Creating it from a pool
/// thread doesn't error, it just hangs/misbehaves. So the actual work is
/// marshaled onto the main thread via `run_on_main_thread`, and this stays
/// `async` to await that result without blocking a pool thread on it.
#[tauri::command]
pub async fn open_settings(app: tauri::AppHandle) -> Result<(), String> {
    let (tx, rx) = tokio::sync::oneshot::channel();
    let app_handle = app.clone();

    app.run_on_main_thread(move || {
        let _ = tx.send(open_or_focus_settings_window(&app_handle));
    })
    .map_err(|e| format!("Failed to schedule settings window creation: {}", e))?;

    rx.await
        .map_err(|_| "Settings window task was dropped".to_string())?
}

fn open_or_focus_settings_window(app: &tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("settings") {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
        return Ok(());
    }

    // Deliberately no `.parent()`: on Windows that sets an *owner* relationship
    // (GWLP_HWNDPARENT), and owned windows don't get their own taskbar button —
    // minimizing one just shrinks it to the screen corner with no way back.
    // The "closes/hides with the main window" lifecycle we'd get from ownership
    // is already handled explicitly in main.rs's CloseRequested handler, so
    // nothing is lost by keeping this a normal top-level window.
    //
    // Hidden until the settings frontend emits "window-ready" (main.rs), same
    // as the main window — avoids a flash of unstyled/unpositioned content.
    let window = tauri::WebviewWindowBuilder::new(
        app,
        "settings",
        tauri::WebviewUrl::App("/#/settings".into()),
    )
    .title("Settings")
    .inner_size(543.0, 550.0)
    .min_inner_size(555.0, 560.0)
    .resizable(true)
    .transparent(true)
    .center()
    .decorations(false)
    .visible(false)
    .build()
    .map_err(|e| format!("Failed to create settings window: {}", e))?;

    crate::apply_window_effects(&window);

    Ok(())
}

/// Apply the "keep on top" setting to the main colorpicker window immediately.
/// Also applied at startup from the persisted setting (see `main.rs`).
#[tauri::command]
pub fn set_keep_on_top(app: tauri::AppHandle, enabled: bool) -> Result<(), String> {
    let window = app
        .get_webview_window("colorpicker")
        .ok_or_else(|| "colorpicker window not found".to_string())?;
    window.set_always_on_top(enabled).map_err(|e| e.to_string())
}

/// Enable or disable launching the app at OS login.
#[tauri::command]
pub fn set_open_at_login(app: tauri::AppHandle, enabled: bool) -> Result<(), String> {
    let autolaunch = app.autolaunch();
    if enabled {
        autolaunch.enable().map_err(|e| e.to_string())
    } else {
        autolaunch.disable().map_err(|e| e.to_string())
    }
}

/// Read the actual OS-level autostart registration state. Used to reconcile
/// the persisted setting with reality when the settings page loads, in case
/// it drifted (e.g. the user removed the startup entry via Task Manager).
#[tauri::command]
pub fn get_open_at_login(app: tauri::AppHandle) -> Result<bool, String> {
    app.autolaunch().is_enabled().map_err(|e| e.to_string())
}
