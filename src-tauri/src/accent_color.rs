//! Reads the OS accent color once at startup, exposed to the frontend as a
//! `#rrggbb` string via the `get_os_accent_color` command (see
//! `--accent-default` in tokens.css). Deliberately a one-shot read, not
//! polled or pushed live - the frontend picks up the current value on
//! launch; changing it in OS settings takes effect on the next app start.

#[cfg(target_os = "windows")]
fn read() -> Option<(u8, u8, u8)> {
    use windows::core::w;
    use windows::Win32::System::Registry::{RegGetValueW, HKEY_CURRENT_USER, RRF_RT_REG_DWORD};

    // Deliberately not `DwmGetColorizationColor`: that returns the window
    // colorization/glow color, which Windows tints differently per
    // light/dark mode - not the flat accent color the user picked in
    // Settings > Personalization > Colors (what this token is meant to
    // reflect). This registry value is the same one Electron's
    // `systemPreferences.getAccentColor()` reads on Windows, and matches the
    // swatch shown in Settings regardless of theme.
    let mut value: u32 = 0;
    let mut size = std::mem::size_of::<u32>() as u32;
    let status = unsafe {
        RegGetValueW(
            HKEY_CURRENT_USER,
            w!("Software\\Microsoft\\Windows\\DWM"),
            w!("AccentColor"),
            RRF_RT_REG_DWORD,
            None,
            Some((&mut value) as *mut u32 as *mut _),
            Some(&mut size),
        )
    };
    if status.is_err() {
        return None;
    }

    // Stored as 0xAABBGGRR.
    let r = (value & 0xFF) as u8;
    let g = ((value >> 8) & 0xFF) as u8;
    let b = ((value >> 16) & 0xFF) as u8;
    Some((r, g, b))
}

#[cfg(target_os = "macos")]
fn read() -> Option<(u8, u8, u8)> {
    use cocoa::appkit::NSColorSpace;
    use cocoa::base::{id, nil};
    use objc::{class, msg_send, sel, sel_impl};

    unsafe {
        let accent_color: id = msg_send![class!(NSColor), controlAccentColor];
        if accent_color == nil {
            return None;
        }

        // controlAccentColor isn't guaranteed to be in a component-addressable
        // color space - convert to sRGB before reading components.
        let srgb_space = id::sRGBColorSpace(nil);
        let rgb_color: id = msg_send![accent_color, colorUsingColorSpace: srgb_space];
        if rgb_color == nil {
            return None;
        }

        let r: f64 = msg_send![rgb_color, redComponent];
        let g: f64 = msg_send![rgb_color, greenComponent];
        let b: f64 = msg_send![rgb_color, blueComponent];
        Some((
            (r * 255.0).round() as u8,
            (g * 255.0).round() as u8,
            (b * 255.0).round() as u8,
        ))
    }
}

#[cfg(not(any(target_os = "windows", target_os = "macos")))]
fn read() -> Option<(u8, u8, u8)> {
    None
}

/// The OS accent color as `#rrggbb`, or `None` where it can't be read
/// (Linux, or a platform API failure).
#[tauri::command]
pub fn get_os_accent_color() -> Option<String> {
    read().map(|(r, g, b)| format!("#{:02x}{:02x}{:02x}", r, g, b))
}
