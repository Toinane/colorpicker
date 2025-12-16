/// Custom logging configuration for ColorPicker
///
/// Philosophy: Logs should be beautiful, informative, and never overwhelming.
/// In development, we want clarity. In production, we want complete records.

use log::LevelFilter;
use tauri_plugin_log::{Target, TargetKind};

/// ANSI color codes for beautiful terminal output
mod colors {
    pub const RESET: &str = "\x1b[0m";
    pub const DIM: &str = "\x1b[2m";

    // Level colors
    pub const TRACE: &str = "\x1b[35m"; // Magenta
    pub const DEBUG: &str = "\x1b[36m"; // Cyan
    pub const INFO: &str = "\x1b[32m"; // Green
    pub const WARN: &str = "\x1b[33m"; // Yellow
    pub const ERROR: &str = "\x1b[31m"; // Red
}

/// Extract scope tag from message
///
/// Looks for "[ScopeName]" at the start of the message
fn extract_scope_from_message(message: &str) -> Option<String> {
    let trimmed = message.trim_start();
    if trimmed.starts_with('[') {
        if let Some(end) = trimmed.find(']') {
            let scope = &trimmed[1..end];
            return Some(scope.to_string());
        }
    }
    None
}

/// Extract window name from log message context
///
/// Looks for "window=xxx" in the message and extracts it
fn extract_window_from_message(message: &str) -> Option<String> {
    if let Some(start) = message.find("window=") {
        let window_part = &message[start + 7..]; // Skip "window="

        // Extract until the next space or end of string
        let end = window_part.find(' ').unwrap_or(window_part.len());

        let window_name = &window_part[..end];
        Some(window_name.to_string())
    } else {
        None
    }
}

/// Remove scope tag and window context from message
fn clean_message(message: &str) -> String {
    let mut cleaned = message.to_string();

    // Remove scope tag if present
    if let Some(scope) = extract_scope_from_message(&cleaned) {
        // Remove "[ScopeName] " from the start
        cleaned = cleaned
            .trim_start()
            .strip_prefix(&format!("[{}]", scope))
            .unwrap_or(&cleaned)
            .trim_start()
            .to_string();
    }

    // Remove window context
    if let Some(start) = cleaned.find("window=") {
        let before = &cleaned[..start];
        let after_window = &cleaned[start..];

        if let Some(space_pos) = after_window.find(' ') {
            let after = &after_window[space_pos + 1..];
            format!("{}{}", before.trim_end(), after)
        } else {
            before.trim_end().to_string()
        }
    } else {
        cleaned
    }
}

/// Determine the display target for logs
///
/// For webview logs: combine window name and scope as "[window:name][Scope]"
/// For Rust logs: use the module name (e.g., "picker", "commands")
fn get_display_target(target: &str, message: &str) -> String {
    if target.starts_with("webview:") {
        // Extract window and scope from message
        let window = extract_window_from_message(message).unwrap_or_else(|| "main".to_string());
        let scope = extract_scope_from_message(message);

        if let Some(scope_name) = scope {
            format!("window:{}][{}", window, scope_name)
        } else {
            format!("window:{}", window)
        }
    } else {
        // For Rust logs, extract the module name
        // E.g., "colorpicker::picker::launch" -> "picker"
        //       "colorpicker::commands" -> "commands"
        //       "colorpicker" -> "colorpicker"
        let parts: Vec<&str> = target.split("::").collect();
        if parts.len() >= 2 {
            // Take the second part (the module name)
            parts[1].to_string()
        } else {
            // Fallback to the crate name
            parts[0].to_string()
        }
    }
}

/// Get color code for log level
fn level_color(level: log::Level) -> &'static str {
    match level {
        log::Level::Error => colors::ERROR,
        log::Level::Warn => colors::WARN,
        log::Level::Info => colors::INFO,
        log::Level::Debug => colors::DEBUG,
        log::Level::Trace => colors::TRACE,
    }
}

/// Get level string with consistent width for alignment
fn format_level(level: log::Level, colored: bool) -> String {
    let level_str = match level {
        log::Level::Error => "ERROR",
        log::Level::Warn => "WARN ",
        log::Level::Info => "INFO ",
        log::Level::Debug => "DEBUG",
        log::Level::Trace => "TRACE",
    };

    if colored {
        format!(
            "{}{}{}",
            level_color(level),
            level_str,
            colors::RESET
        )
    } else {
        level_str.to_string()
    }
}

/// Create the logging plugin with custom formatting
pub fn create_logger() -> tauri_plugin_log::Builder {
    let is_debug = cfg!(debug_assertions);

    tauri_plugin_log::Builder::new()
        .targets([
            Target::new(TargetKind::Stdout),
            #[cfg(not(debug_assertions))]
            Target::new(TargetKind::LogDir { file_name: None }),
        ])
        .level(if is_debug {
            LevelFilter::Debug
        } else {
            LevelFilter::Info
        })
        .format(move |out, message, record| {
            let level = record.level();
            let message_str = message.to_string();

            // Extract target (window name for frontend, module for backend)
            let target = get_display_target(record.target(), &message_str);

            // Clean the message (remove window= tag to avoid duplication)
            let clean_msg = clean_message(&message_str);

            // In debug mode: only show time (HH:MM:SS)
            // In release mode: show full timestamp for log files
            let timestamp = if is_debug {
                chrono::Local::now().format("%H:%M:%S")
            } else {
                chrono::Local::now().format("%Y-%m-%d %H:%M:%S")
            };

            // Colored output only in debug mode (terminal)
            let colored = is_debug;

            if colored {
                out.finish(format_args!(
                    "{dim}[{time}]{reset} {level} {dim}[{target}]{reset} {message}",
                    dim = colors::DIM,
                    time = timestamp,
                    reset = colors::RESET,
                    level = format_level(level, true),
                    target = target,
                    message = clean_msg,
                ))
            } else {
                out.finish(format_args!(
                    "[{time}] {level} [{target}] {message}",
                    time = timestamp,
                    level = format_level(level, false),
                    target = target,
                    message = clean_msg,
                ))
            }
        })
}
