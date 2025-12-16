// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Listener, Manager};

mod commands;
mod picker;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Listen for window-ready events from frontend
            let app_handle = app.handle().clone();
            app.listen("window-ready", move |event| {
                let window_label = event.payload().trim_matches('"');

                if let Some(window) = app_handle.get_webview_window(window_label) {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::pick_color,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
