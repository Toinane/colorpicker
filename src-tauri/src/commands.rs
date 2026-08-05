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

    const WINDOW_WIDTH: f64 = 543.0;
    const WINDOW_HEIGHT: f64 = 550.0;

    // Only used to find which monitor to open on (see below) — not passed to
    // `.parent()`.
    let parent = app
        .get_webview_window("colorpicker")
        .ok_or_else(|| "colorpicker window not found".to_string())?;

    // Deliberately no `.parent()`: on Windows that sets an *owner* relationship
    // (GWLP_HWNDPARENT), and owned windows don't get their own taskbar button —
    // minimizing one just shrinks it to the screen corner with no way back.
    // The "closes/hides with the main window" lifecycle we'd get from ownership
    // is already handled explicitly in main.rs's CloseRequested handler, so
    // nothing is lost by keeping this a normal top-level window.
    //
    // Hidden until the settings frontend emits "window-ready" (main.rs), same
    // as the main window — avoids a flash of unstyled/unpositioned content.
    let mut builder = tauri::WebviewWindowBuilder::new(
        app,
        "settings",
        tauri::WebviewUrl::App("/#/settings".into()),
    )
    .title("Settings")
    .inner_size(WINDOW_WIDTH, WINDOW_HEIGHT)
    .min_inner_size(555.0, 560.0)
    .resizable(true)
    .transparent(true)
    .decorations(false)
    .visible(false);

    // `.center()` centers on the *new* window's own current monitor, which
    // for a freshly created window is wherever the OS defaults to — not
    // necessarily where the main window actually is on a multi-monitor
    // setup. Center on the main window's monitor instead, falling back to
    // the builder's own `.center()` if that can't be determined.
    builder = match parent.current_monitor().ok().flatten() {
        Some(monitor) => {
            let area = monitor.work_area();
            let scale = monitor.scale_factor();
            let area_x = area.position.x as f64 / scale;
            let area_y = area.position.y as f64 / scale;
            let area_width = area.size.width as f64 / scale;
            let area_height = area.size.height as f64 / scale;
            builder.position(
                area_x + (area_width - WINDOW_WIDTH) / 2.0,
                area_y + (area_height - WINDOW_HEIGHT) / 2.0,
            )
        }
        None => builder.center(),
    };

    let window = builder
        .build()
        .map_err(|e| format!("Failed to create settings window: {}", e))?;

    crate::theme::apply_theme_to_window(&window, &crate::theme::persisted_theme_setting(app));

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

/// The portable data directory, if this is a portable build (see `portable.rs`).
/// The frontend uses this to build absolute paths for its own `plugin-store`
/// files, mirroring the same redirection the Rust side already applies to
/// settings.json/window-state.json/logs.
#[tauri::command]
pub fn get_portable_data_dir() -> Option<String> {
    crate::portable::data_dir().map(|p| p.to_string_lossy().into_owned())
}

/// Open the Palettes window (saved categories/colors), creating it if it
/// doesn't exist yet or focusing it otherwise. Same create-or-focus pattern
/// as `open_settings`.
#[tauri::command]
pub async fn open_palettes(app: tauri::AppHandle) -> Result<(), String> {
    let (tx, rx) = tokio::sync::oneshot::channel();
    let app_handle = app.clone();

    app.run_on_main_thread(move || {
        let _ = tx.send(open_or_focus_palettes_window(&app_handle));
    })
    .map_err(|e| format!("Failed to schedule palettes window creation: {}", e))?;

    rx.await
        .map_err(|_| "Palettes window task was dropped".to_string())?
}

fn open_or_focus_palettes_window(app: &tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("palettes") {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
        return Ok(());
    }

    const WINDOW_WIDTH: f64 = 480.0;
    const WINDOW_HEIGHT: f64 = 620.0;

    // Only used to find which monitor to open on (see `open_or_focus_settings_window`).
    let parent = app
        .get_webview_window("colorpicker")
        .ok_or_else(|| "colorpicker window not found".to_string())?;

    let mut builder = tauri::WebviewWindowBuilder::new(
        app,
        "palettes",
        tauri::WebviewUrl::App("/#/palettes".into()),
    )
    .title("Palettes")
    .inner_size(WINDOW_WIDTH, WINDOW_HEIGHT)
    .min_inner_size(600.0, 400.0)
    .resizable(true)
    .transparent(true)
    .decorations(false)
    .visible(false);

    builder = match parent.current_monitor().ok().flatten() {
        Some(monitor) => {
            let area = monitor.work_area();
            let scale = monitor.scale_factor();
            let area_x = area.position.x as f64 / scale;
            let area_y = area.position.y as f64 / scale;
            let area_width = area.size.width as f64 / scale;
            let area_height = area.size.height as f64 / scale;
            builder.position(
                area_x + (area_width - WINDOW_WIDTH) / 2.0,
                area_y + (area_height - WINDOW_HEIGHT) / 2.0,
            )
        }
        None => builder.center(),
    };

    let window = builder
        .build()
        .map_err(|e| format!("Failed to create palettes window: {}", e))?;

    crate::theme::apply_theme_to_window(&window, &crate::theme::persisted_theme_setting(app));

    Ok(())
}

/// Path to the legacy v2 (Electron) storage file, if this OS/install has one.
/// `electron-json-storage` wrote it to `<userData>/storage/<key>.json`, and
/// the v2 app's Electron `name`/`productName` was "colorpicker", giving
/// `%APPDATA%/colorpicker/storage/colorpicker.json` on Windows.
fn legacy_palettes_path() -> Option<std::path::PathBuf> {
    let appdata = std::env::var("APPDATA").ok()?;
    Some(
        std::path::Path::new(&appdata)
            .join("colorpicker")
            .join("storage")
            .join("colorpicker.json"),
    )
}

/// Read the legacy v2 storage file's raw text, if present. Returns `None`
/// (not an error) when the file doesn't exist — that's the normal fresh-install
/// case, not a failure. Parsing is deliberately left to the caller (TS side)
/// so migration logic stays in one place; this command only does the
/// OS-specific path resolution + read.
#[tauri::command]
pub fn read_legacy_palettes() -> Result<Option<String>, String> {
    let Some(path) = legacy_palettes_path() else {
        return Ok(None);
    };
    if !path.exists() {
        return Ok(None);
    }
    std::fs::read_to_string(&path)
        .map(Some)
        .map_err(|e| format!("Failed to read legacy storage file: {}", e))
}

/// Back up the legacy v2 storage file to `<path>.bak` (overwriting any
/// previous backup) without touching the original, when it fails to parse.
/// The legacy app used to `fs.rmSync` the file on any read error, destroying
/// the user's data (G14); this is the deliberate opposite.
#[tauri::command]
pub fn backup_corrupt_legacy_palettes() -> Result<(), String> {
    let path = legacy_palettes_path()
        .ok_or_else(|| "Could not resolve legacy storage path".to_string())?;
    let backup_path = path.with_extension("json.bak");
    std::fs::copy(&path, &backup_path)
        .map(|_| ())
        .map_err(|e| format!("Failed to back up corrupt legacy storage file: {}", e))
}
