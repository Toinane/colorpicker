pub mod platform;

#[derive(Clone, Copy, Debug, serde::Serialize)]
pub struct PickedColor {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

#[derive(Clone, Debug)]
pub struct PickerConfig {
    pub grid_size: usize,
    pub show_hex: bool,
}

/// Launch native picker (blocks until color selected or cancelled)
pub fn launch_picker(config: PickerConfig) -> Option<PickedColor> {
    #[cfg(target_os = "windows")]
    {
        platform::windows::run_picker(config)
    }

    #[cfg(not(target_os = "windows"))]
    {
        eprintln!("Picker not implemented for this platform");
        None
    }
}
