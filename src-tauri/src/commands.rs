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

    log::debug!(
        "pick_color command invoked: grid_size={}, show_hex={}",
        config.grid_size,
        config.show_hex
    );

    // Spawn blocking task (runs native window)
    let result = tokio::task::spawn_blocking(move || crate::picker::launch_picker(config))
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
