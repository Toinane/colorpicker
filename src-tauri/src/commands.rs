/// Launch the native high-performance color picker
///
/// Opens a circular magnifier that follows the cursor and allows precise color picking.
/// The picker achieves 144fps+ performance through direct bitmap manipulation and
/// hardware-accelerated window compositing.
///
/// # User Controls
/// - **Left Click** or **Enter**: Pick the center color
/// - **Escape**: Cancel without picking
/// - **Arrow Keys**: Fine-tune cursor position pixel-by-pixel
///
/// # Parameters
///
/// ## `grid_size` (default: 9)
/// Size of the magnifier grid in pixels. The picker shows a grid_size × grid_size
/// grid of magnified pixels. Typical values: 5, 7, 9, 11.
///
/// ## `show_hex` (default: true)
/// Whether to display the hex color value at the bottom of the magnifier.
///
/// ## `magnifier_size` (default: 300)
/// Diameter of the circular magnifier window in pixels. Larger sizes show more
/// detail but may impact performance on slower systems.
///
/// ## `detect_background_changes` (default: false)
/// Enable 30fps polling to detect color changes when the cursor is stationary.
/// Useful for picking colors from videos or animations. Has minimal performance
/// impact but adds slight CPU usage when enabled.
///
/// ## `allow_hover_through` (default: false)
/// Allow mouse events to pass through the magnifier to underlying windows.
/// When enabled, hovering over UI elements will trigger their hover states,
/// allowing you to pick hover colors (e.g., a button's red color on hover).
/// Uses global hooks for input when enabled.
///
/// # Returns
/// - `Some(PickedColor)` if user picked a color
/// - `None` if user cancelled (Escape key)
///
/// # Example
/// ```javascript
/// // Basic usage
/// const color = await invoke('pick_color');
///
/// // Pick colors from video with hover-through
/// const color = await invoke('pick_color', {
///   detect_background_changes: true,
///   allow_hover_through: true,
///   magnifier_size: 400
/// });
/// ```
#[tauri::command]
pub async fn pick_color(
    grid_size: Option<u32>,
    show_hex: Option<bool>,
    magnifier_size: Option<u32>,
    detect_background_changes: Option<bool>,
    allow_hover_through: Option<bool>,
) -> Result<Option<crate::picker::PickedColor>, String> {
    let config = crate::picker::PickerConfig {
        grid_size: grid_size.unwrap_or(9) as usize,
        show_hex: show_hex.unwrap_or(true),
        magnifier_size: magnifier_size.unwrap_or(300) as usize,
        detect_background_changes: detect_background_changes.unwrap_or(false),
        allow_hover_through: allow_hover_through.unwrap_or(false),
    };

    log::debug!(
        "pick_color command invoked: grid_size={}, show_hex={}, magnifier_size={}, detect_background_changes={}, allow_hover_through={}",
        config.grid_size,
        config.show_hex,
        config.magnifier_size,
        config.detect_background_changes,
        config.allow_hover_through
    );

    // Spawn blocking task (runs native window)
    let result = tokio::task::spawn_blocking(move || {
        let (tx, rx) = std::sync::mpsc::channel();
        crate::picker::launch_picker(config, move |result| {
            let _ = tx.send(result);
        });
        rx.recv().unwrap_or(None)
    })
        .await
        .map_err(|e| {
            let error_msg = format!("Picker task failed: {}", e);
            log::error!("{}", error_msg);
            error_msg
        })?;

    if let Some(ref color) = result {
        log::info!(
            "Color picked successfully: #{:02X}{:02X}{:02X}",
            color.r,
            color.g,
            color.b
        );
    } else {
        log::debug!("Color picker cancelled by user");
    }

    Ok(result)
}

/// Register a new global hotkey for launching the picker, replacing any previously
/// registered shortcut. The caller is responsible for persisting the value.
#[tauri::command]
pub fn set_picker_hotkey(app: tauri::AppHandle, hotkey: String) -> Result<(), String> {
    crate::shortcuts::register_picker_shortcut(&app, &hotkey)
}
