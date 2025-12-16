/// Launch native color picker with optional configuration
///
/// # Parameters
/// - `grid_size`: Size of the magnifier grid (default: 5)
/// - `show_hex`: Whether to show hex value in picker (default: true)
#[tauri::command]
pub async fn pick_color(
    grid_size: Option<u32>,
    show_hex: Option<bool>,
) -> Result<Option<crate::picker::PickedColor>, String> {
    let config = crate::picker::PickerConfig {
        grid_size: grid_size.unwrap_or(5) as usize,
        show_hex: show_hex.unwrap_or(true),
    };

    // Spawn blocking task (runs native window)
    let result = tokio::task::spawn_blocking(move || crate::picker::launch_picker(config))
        .await
        .map_err(|e| format!("Picker task failed: {}", e))?;

    Ok(result)
}
