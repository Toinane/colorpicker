mod window;
mod capture;
mod render;

use super::super::{PickerConfig, PickedColor};
use std::sync::{Arc, Mutex};

// pub struct PickerState {
//     pub config: PickerConfig,
//     pub cursor_pos: (i32, i32),
//     pub pixel_grid: Vec<PixelColor>,
// }

#[derive(Clone, Copy, Debug)]
pub struct PixelColor {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

pub fn run_picker(config: PickerConfig) -> Option<PickedColor> {
    let result = Arc::new(Mutex::new(None));
    let result_clone = Arc::clone(&result);

    match window::create_and_run(config, result_clone) {
        Ok(_) => result.lock().unwrap().clone(),
        Err(e) => {
            eprintln!("Picker error: {}", e);
            None
        }
    }
}
