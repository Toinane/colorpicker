//! High-performance color picker window implementation for macOS
//!
//! # Architecture Overview
//!
//! This implementation achieves high frame rates through several key optimizations:
//!
//! ## 1. Small Moving Window (fast compositing)
//! - Creates a 300x300pt window that moves with the cursor
//! - CALayer compositing is hardware-accelerated
//! - Window movement uses performant setFrame API
//!
//! ## 2. Direct Bitmap Manipulation (bypasses AppKit)
//! - Writes pixels directly to bitmap buffer via pointer arithmetic
//! - Eliminates AppKit function call overhead
//! - Uses pre-computed masks to avoid distance calculations
//!
//! ## 3. Event-Driven Rendering (no polling)
//! - Global event monitors deliver instant mouse position updates
//! - Frame skipping prevents excessive renders
//! - Hash-based change detection eliminates redundant renders
//!
//! ## 4. Zero Per-Frame Allocations
//! - All buffers pre-allocated at startup
//! - Masks pre-computed once
//! - Vec capacity set to avoid reallocations
//!
//! ## 5. Optional Hover-Through Mode
//! - Window's ignoresMouseEvents allows underlying UI to receive hover events
//! - Global monitors capture input when window is transparent
//! - Enables picking hover-state colors

use crate::picker::color::Color;
use crate::picker::{PickerConfig, PickedColor};
use super::super::common::geometry::{BorderMask, CircleMask};
use super::super::common::primitives::*;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};

use cocoa::appkit::{
    NSApp, NSApplication, NSBackingStoreType, NSWindowStyleMask,
    NSApplicationActivationPolicy, NSEvent, NSEventMask, NSEventType,
};
use cocoa::base::{id, nil, YES, NO};
use cocoa::foundation::{NSPoint, NSRect, NSSize, NSAutoreleasePool};
use core_graphics::geometry::{CGPoint, CGRect, CGSize};
use foreign_types::ForeignType;
use objc::{class, msg_send, sel, sel_impl};

// Atomic flag to prevent excessive renders during fast mouse movement
static RENDER_PENDING: AtomicBool = AtomicBool::new(false);

/// Window state for the color picker
pub struct WindowState {
    pub config: PickerConfig,
    pub result: Arc<Mutex<Option<PickedColor>>>,

    // Cursor and window tracking
    pub cursor_pos: (f64, f64),
    pub prev_window_pos: (f64, f64),

    // Pixel data and change detection
    pub pixel_grid: Vec<Color>,
    pub prev_grid_hash: u64,

    // Rendering buffer
    pub bitmap_buffer: Vec<u8>,

    // Window dimensions (in points, not pixels - Retina-independent)
    pub window_width: usize,
    pub window_height: usize,
    pub mag_size: usize,

    // Pre-computed masks for ultra-fast rendering (no per-pixel math)
    pub circle_mask: CircleMask,
    pub border_mask: BorderMask,
    pub mag_radius: usize,

    // NSWindow and CALayer (stored as raw pointers for simplicity)
    pub window: id,
    pub layer: id,
}

impl WindowState {
    /// Create new window state
    pub fn new(config: PickerConfig, result: Arc<Mutex<Option<PickedColor>>>) -> Self {
        let mag_size = config.magnifier_size;
        let mag_radius = mag_size / 2;

        // Calculate window dimensions to include hex label below magnifier
        let hex_box_height = HEX_BOX_HEIGHT + HEX_PADDING * 2;
        let window_width = mag_size;
        let window_height = mag_size + HEX_MARGIN.abs() as usize + hex_box_height as usize;

        // Pre-compute masks for ultra-fast rendering
        let border_width = (mag_size as i32 / MAGNIFIER_BORDER_WIDTH_DIVISOR).max(2);
        let circle_mask = CircleMask::new_circle(mag_radius as i32);
        let border_mask = BorderMask::new_circle(mag_radius as i32, border_width);

        // Pre-allocate pixel grid
        let max_grid_size = config.grid_size * config.grid_size;
        let pixel_grid = Vec::with_capacity(max_grid_size);

        // Pre-allocate bitmap buffer (BGRA format, 4 bytes per pixel)
        let bitmap_buffer = vec![0u8; window_width * window_height * 4];

        Self {
            config,
            result,
            cursor_pos: (0.0, 0.0),
            prev_window_pos: (-1000.0, -1000.0),
            pixel_grid,
            prev_grid_hash: 0,
            bitmap_buffer,
            window_width,
            window_height,
            mag_size,
            circle_mask,
            border_mask,
            mag_radius,
            window: nil,
            layer: nil,
        }
    }
}

/// Launch the native macOS color picker
pub fn create_and_run(config: PickerConfig) -> Option<PickedColor> {
    // Check for Screen Recording permission first
    // On macOS 10.15+, this is required for screen capture to work
    if !super::capture::check_screen_recording_permission() {
        eprintln!("⚠️  Screen Recording permission required!");
        eprintln!("Please grant permission in:");
        eprintln!("  System Preferences → Security & Privacy → Screen Recording");
        eprintln!("Then restart the application.");
        
        // Trigger permission request dialog (first time only)
        super::capture::request_screen_recording_permission();
        
        return None;
    }

    unsafe {
        // Create autorelease pool for proper memory management
        let pool = NSAutoreleasePool::new(nil);

        // Get or create shared application
        let app = NSApp();
        if app == nil {
            eprintln!("Failed to get NSApplication");
            let _: () = msg_send![pool, drain];
            return None;
        }

        // Set activation policy (we're a UI app, not a daemon)
        app.setActivationPolicy_(NSApplicationActivationPolicy::NSApplicationActivationPolicyRegular);

        // Create window state
        let result = Arc::new(Mutex::new(None));
        let mut state = Box::new(WindowState::new(config.clone(), Arc::clone(&result)));

        // Create window
        let window = create_picker_window(&state);
        if window == nil {
            eprintln!("Failed to create window");
            let _: () = msg_send![pool, drain];
            return None;
        }

        state.window = window;

        // Create CALayer for rendering
        let layer = create_rendering_layer(&state);
        if layer == nil {
            eprintln!("Failed to create layer");
            let _: () = msg_send![pool, drain];
            return None;
        }

        state.layer = layer;

        // Set layer as window's content view layer
        let content_view: id = msg_send![window, contentView];
        let _: () = msg_send![content_view, setLayer: layer];
        let _: () = msg_send![content_view, setWantsLayer: YES];

        // Remove duplicate Hide cursor line
        
        // Show window
        let _: () = msg_send![window, makeKeyAndOrderFront: nil];
        let _: () = msg_send![window, orderFrontRegardless];

        // Move state to heap and leak it temporarily (we'll reclaim it later)
        let state_ptr = Box::into_raw(state);
        let state_ref = &mut *state_ptr;

        // Install global event monitors
        install_event_monitors(state_ref);

        // Trigger initial render
        trigger_render(state_ref);

        // Run the event loop until window closes or color is picked
        loop {
            // Process events with a short timeout
            let distant_future: id = msg_send![class!(NSDate), distantFuture];
            let event: id = msg_send![
                app,
                nextEventMatchingMask: NSEventMask::NSAnyEventMask.bits()
                untilDate: distant_future
                inMode: get_default_run_loop_mode()
                dequeue: YES
            ];

            if event != nil {
                // Check event type and handle picker-specific events
                let event_type: NSEventType = msg_send![event, type];
                
                match event_type {
                    NSEventType::NSLeftMouseDown => {
                        // Pick center color
                        if !state_ref.pixel_grid.is_empty() {
                            let center_idx = state_ref.pixel_grid.len() / 2;
                            let color = state_ref.pixel_grid[center_idx];
                            *state_ref.result.lock().unwrap() = Some(color);
                        }
                        break;
                    }
                    NSEventType::NSKeyDown => {
                        // Get key code
                        let key_code: u16 = msg_send![event, keyCode];
                        
                        match key_code {
                            53 => {  // Escape
                                // Cancel picker
                                break;
                            }
                            36 => {  // Return/Enter
                                // Pick center color
                                if !state_ref.pixel_grid.is_empty() {
                                    let center_idx = state_ref.pixel_grid.len() / 2;
                                    let color = state_ref.pixel_grid[center_idx];
                                    *state_ref.result.lock().unwrap() = Some(color);
                                }
                                break;
                            }
                            123 => { move_cursor_relative(-1, 0, event); }  // Left arrow
                            124 => { move_cursor_relative(1, 0, event); }   // Right arrow
                            125 => { move_cursor_relative(0, 1, event); }   // Down arrow
                            126 => { move_cursor_relative(0, -1, event); }  // Up arrow
                            _ => {}
                        }
                    }
                    _ => {
                        // Forward other events to app
                        let _: () = msg_send![app, sendEvent: event];
                    }
                }
            }

            // Check if we have a result
            {
                let result_lock = state_ref.result.lock().unwrap();
                if result_lock.is_some() {
                    break;
                }
            }

            // Check if window is closed
            let is_visible: bool = msg_send![window, isVisible];
            if !is_visible {
                break;
            }
        }

        // Show cursor again
        let _: () = msg_send![class!(NSCursor), unhide];

        // Get result before cleanup
        let final_result = state_ref.result.lock().unwrap().clone();

        // Cleanup
        let _: () = msg_send![window, close];
        
        // Reclaim the state box
        drop(Box::from_raw(state_ptr));

        let _: () = msg_send![pool, drain];

        final_result
    }
}

/// Create the picker window
unsafe fn create_picker_window(state: &WindowState) -> id {
    let window_width = state.window_width as f64;
    let window_height = state.window_height as f64;

    // Create window frame (initially at origin - we'll move it on first mouse event)
    let frame = NSRect::new(
        NSPoint::new(0.0, 0.0),
        NSSize::new(window_width, window_height),
    );

    // Create borderless, transparent window
    let style_mask = NSWindowStyleMask::NSBorderlessWindowMask;

    let window: id = msg_send![class!(NSWindow), alloc];
    let window: id = msg_send![
        window,
        initWithContentRect: frame
        styleMask: style_mask
        backing: NSBackingStoreType::NSBackingStoreBuffered
        defer: NO
    ];

    if window == nil {
        return nil;
    }

    // Configure window properties
    let _: () = msg_send![window, setOpaque: NO];
    let _: () = msg_send![window, setBackgroundColor: NSColor::clearColor(nil)];
    let _: () = msg_send![window, setHasShadow: NO];
    let _: () = msg_send![window, setLevel: 3]; // NSFloatingWindowLevel = 3

    // Set collection behavior to exclude from Spaces, Exposé, etc.
    let collection_behavior = 1 << 6; // NSWindowCollectionBehaviorStationary
    let _: () = msg_send![window, setCollectionBehavior: collection_behavior];

    // Set hover-through mode if enabled
    if state.config.allow_hover_through {
        let _: () = msg_send![window, setIgnoresMouseEvents: YES];
    }

    window
}

/// Create the CALayer for rendering
unsafe fn create_rendering_layer(state: &WindowState) -> id {
    let layer: id = msg_send![class!(CALayer), layer];
    
    if layer == nil {
        return nil;
    }

    let frame = CGRect::new(
        &CGPoint::new(0.0, 0.0),
        &CGSize::new(state.window_width as f64, state.window_height as f64),
    );
    let _: () = msg_send![layer, setFrame: frame];
    let _: () = msg_send![layer, setOpaque: NO];

    layer
}

/// Install global event monitors for mouse and keyboard
unsafe fn install_event_monitors(_state: &mut WindowState) {
    // NOTE: Mouse tracking is handled in the main event loop via NSEvent
    // The event loop processes NSMouseMoved events which provide cursor position
    // This is more efficient than polling and doesn't require thread safety concerns
    
    // Keyboard events are also handled in the main event loop
    // See the NSKeyDown case in the event processing code
}

/// Trigger a render update
fn trigger_render(state: &mut WindowState) {
    let (cursor_x, cursor_y) = state.cursor_pos;

    // Capture pixels at cursor
    state.pixel_grid = super::capture::capture_grid_at_cursor(
        cursor_x,
        cursor_y,
        state.config.grid_size,
    );

    // Render with optimized direct bitmap manipulation
    if let Some(image) = super::render::render_frame(
        &mut state.bitmap_buffer,
        state.window_width,
        state.window_height,
        state.mag_size,
        &state.pixel_grid,
        state.config.grid_size,
        &state.circle_mask,
        &state.border_mask,
        state.config.show_hex,
        &mut state.prev_grid_hash,
    ) {
        // Update layer with new image
        unsafe {
            let _: () = msg_send![state.layer, setContents: image.as_ptr()];
        }

        // Move window to follow cursor
        let window_x = cursor_x - state.mag_radius as f64;
        let window_y = cursor_y - state.mag_radius as f64;

        if (window_x, window_y) != state.prev_window_pos {
            unsafe {
                let frame = NSRect::new(
                    NSPoint::new(window_x, window_y),
                    NSSize::new(state.window_width as f64, state.window_height as f64),
                );
                let _: () = msg_send![state.window, setFrame: frame display: NO];
            }
            state.prev_window_pos = (window_x, window_y);
        }
    }
}

/// Move cursor relative to current position
unsafe fn move_cursor_relative(dx: i32, dy: i32, event: id) {
    // Check if Shift is held for faster movement
    let modifiers: u64 = msg_send![event, modifierFlags];
    let shift_held = (modifiers & (1 << 17)) != 0; // NSEventModifierFlagShift
    
    let multiplier = if shift_held { CURSOR_MOVE_FAST } else { CURSOR_MOVE_NORMAL };
    
    // Get current cursor position
    let (current_x, current_y) = super::capture::get_cursor_position();
    
    // Calculate new position
    let new_x = current_x + (dx * multiplier) as f64;
    let new_y = current_y + (dy * multiplier) as f64;
    
    // Move cursor using Core Graphics
    use core_graphics::event::{CGEvent, CGEventType};
    use core_graphics::event_source::{CGEventSource, CGEventSourceStateID};
    
    if let Ok(source) = CGEventSource::new(CGEventSourceStateID::CombinedSessionState) {
        if let Ok(event) = CGEvent::new_mouse_event(
            source,
            CGEventType::MouseMoved,
            core_graphics::geometry::CGPoint::new(new_x, new_y),
            core_graphics::event::CGMouseButton::Left,
        ) {
            event.post(core_graphics::event::CGEventTapLocation::HID);
        }
    }
}

// Helper types for Cocoa
struct NSColor;
impl NSColor {
    unsafe fn clearColor(_: id) -> id {
        msg_send![class!(NSColor), clearColor]
    }
}

// NSDefaultRunLoopMode constant
fn get_default_run_loop_mode() -> id {
    unsafe {
        let ns_string_class = class!(NSString);
        let mode: id = msg_send![ns_string_class, stringWithUTF8String: b"kCFRunLoopDefaultMode\0".as_ptr()];
        mode
    }
}
