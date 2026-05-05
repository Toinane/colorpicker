// Window Management for macOS Picker
// Creates and manages the floating magnifier window with Metal rendering

use crate::picker::{PickedColor, PickerConfig};
use crate::picker::color::Color;
use crate::picker::platform::common::primitives::{CURSOR_MOVE_NORMAL, CURSOR_MOVE_FAST};

use cocoa::appkit::{NSApp, NSApplication, NSApplicationActivationPolicyAccessory, NSEvent, NSEventMask, NSEventModifierFlags, NSEventType, NSScreen, NSWindow, NSWindowCollectionBehavior, NSWindowStyleMask, NSView, NSBackingStoreType, NSCursor};
use cocoa::base::{id, nil, YES, NO};
use cocoa::foundation::{NSPoint, NSRect, NSSize, NSString, NSAutoreleasePool, NSArray};
use core_graphics::display::{CGPoint, CGWarpMouseCursorPosition};
use core_graphics::event::{CGEvent, CGEventType, EventField};
use objc::runtime::{Object, Class};
use objc::{msg_send, sel, sel_impl, class};
use metal::*;

use std::sync::{Arc, Mutex};
use std::cell::RefCell;
use std::rc::Rc;

// Virtual key codes for macOS keyboard events
const KEY_ESCAPE: u16 = 0x35;
const KEY_RETURN: u16 = 0x24;
const KEY_ENTER: u16 = 0x4C;
const KEY_ARROW_LEFT: u16 = 0x7B;
const KEY_ARROW_RIGHT: u16 = 0x7C;
const KEY_ARROW_DOWN: u16 = 0x7D;
const KEY_ARROW_UP: u16 = 0x7E;

/// Main window creation and event loop
pub fn create_and_run(config: PickerConfig) -> Result<Option<PickedColor>, String> {
    unsafe {
        let pool = NSAutoreleasePool::new(nil);

        // Shared result - will be populated when user picks/cancels
        let result: Arc<Mutex<Option<PickedColor>>> = Arc::new(Mutex::new(None));

        // Get NSApp instance (create if needed)
        let app = NSApp();
        if app == nil {
            let app_class = class!(NSApplication);
            let app: id = msg_send![app_class, sharedApplication];
            let _: () = msg_send![app, setActivationPolicy: NSApplicationActivationPolicyAccessory];
        }

        // Calculate window dimensions
        let magnifier_size = config.magnifier_size as f64;
        let hex_height = if config.show_hex { 60.0 } else { 0.0 };
        let total_height = magnifier_size + hex_height;

        // Get cursor position to center window
        let cursor_location = NSEvent::mouseLocation(nil);
        let window_origin = NSPoint::new(
            cursor_location.x - magnifier_size / 2.0,
            cursor_location.y - total_height / 2.0,
        );

        // Create borderless, transparent window
        let window_frame = NSRect::new(
            window_origin,
            NSSize::new(magnifier_size, total_height),
        );

        let window = NSWindow::alloc(nil).initWithContentRect_styleMask_backing_defer_(
            window_frame,
            NSWindowStyleMask::NSWindowStyleMaskBorderless,
            NSBackingStoreType::NSBackingStoreBuffered,
            NO,
        );

        // Configure window properties for floating overlay
        window.setOpaque_(NO);
        window.setBackgroundColor_(cocoa::appkit::NSColor::clearColor(nil));
        window.setLevel_(((cocoa::appkit::NSMainMenuWindowLevel + 2) as i64) as i64);
        window.setCollectionBehavior_(
            NSWindowCollectionBehavior::NSWindowCollectionBehaviorCanJoinAllSpaces
                | NSWindowCollectionBehavior::NSWindowCollectionBehaviorStationary
                | NSWindowCollectionBehavior::NSWindowCollectionBehaviorIgnoresCycle,
        );
        window.setHasShadow_(NO);
        window.setAcceptsMouseMovedEvents_(YES);
        window.setIgnoresMouseEvents_(if config.allow_hover_through { YES } else { NO });

        // Initialize Metal device
        let device = Device::system_default().ok_or("Metal not available")?;

        // Create CAMetalLayer for rendering
        let layer = MetalLayer::new();
        layer.set_device(&device);
        layer.set_pixel_format(MTLPixelFormat::BGRA8Unorm);
        layer.set_framebuffer_only(false);
        layer.set_presents_with_transaction(false);

        // Set layer drawable size
        let scale = NSScreen::mainScreen(nil).backingScaleFactor();
        layer.set_drawable_size(metal::MTLSize {
            width: (magnifier_size * scale) as u64,
            height: (total_height * scale) as u64,
            depth: 1,
        });

        // Create NSView and attach Metal layer
        let view = NSView::alloc(nil).initWithFrame_(window_frame);
        view.setWantsLayer_(YES);
        view.setLayer_(std::mem::transmute(layer.as_ref()));
        window.setContentView_(view);

        // Show window
        window.makeKeyAndOrderFront_(nil);

        // Hide system cursor
        NSCursor::hide(nil);

        // Set up render state
        let render_state = Arc::new(Mutex::new(super::render::RenderState::new(&device, &config)?));

        // Set up capture state
        let capture_state = Arc::new(Mutex::new(super::capture::CaptureState::new()?));

        // Install event monitors
        let result_for_events = result.clone();
        let config_for_events = config.clone();
        let render_state_for_events = render_state.clone();
        let capture_state_for_events = capture_state.clone();
        let window_for_events = window;

        // Track current cursor position
        let cursor_pos: Rc<RefCell<(i32, i32)>> = Rc::new(RefCell::new((
            cursor_location.x as i32,
            cursor_location.y as i32,
        )));

        // Keyboard monitor
        let result_for_keyboard = result_for_events.clone();
        let cursor_pos_for_keyboard = cursor_pos.clone();
        let render_state_for_keyboard = render_state_for_events.clone();
        let capture_state_for_keyboard = capture_state_for_events.clone();
        let config_for_keyboard = config_for_events.clone();

        let keyboard_monitor = NSEvent::addGlobalMonitorForEventsMatchingMask_handler(
            NSEventMask::NSKeyDownMask,
            move |event: id| {
                let keycode: u16 = msg_send![event, keyCode];
                let modifiers: NSEventModifierFlags = msg_send![event, modifierFlags];

                match keycode {
                    KEY_ESCAPE => {
                        // Cancel - set result to None
                        *result_for_keyboard.lock().unwrap() = None;
                        let app: id = msg_send![class!(NSApplication), sharedApplication];
                        let _: () = msg_send![app, stop: nil];
                        // Post dummy event to break out of event loop
                        let _: () = msg_send![app, abortModal];
                    }
                    KEY_RETURN | KEY_ENTER => {
                        // Pick current color
                        let pos = *cursor_pos_for_keyboard.borrow();
                        if let Ok(capture) = capture_state_for_keyboard.lock() {
                            if let Some(grid) = capture.get_current_grid() {
                                let center_idx = (grid.len() / 2) as usize;
                                if center_idx < grid.len() {
                                    let color = &grid[center_idx];
                                    *result_for_keyboard.lock().unwrap() = Some(PickedColor {
                                        r: color.r,
                                        g: color.g,
                                        b: color.b,
                                        hex: color.hex(),
                                    });
                                }
                            }
                        }
                        let app: id = msg_send![class!(NSApplication), sharedApplication];
                        let _: () = msg_send![app, stop: nil];
                        let _: () = msg_send![app, abortModal];
                    }
                    KEY_ARROW_UP | KEY_ARROW_DOWN | KEY_ARROW_LEFT | KEY_ARROW_RIGHT => {
                        // Arrow key navigation
                        let move_amount = if modifiers.contains(NSEventModifierFlags::NSShiftKeyMask) {
                            CURSOR_MOVE_FAST as f64
                        } else {
                            CURSOR_MOVE_NORMAL as f64
                        };

                        let current_pos = NSEvent::mouseLocation(nil);
                        let new_x = current_pos.x + match keycode {
                            KEY_ARROW_LEFT => -move_amount,
                            KEY_ARROW_RIGHT => move_amount,
                            _ => 0.0,
                        };
                        let new_y = current_pos.y + match keycode {
                            KEY_ARROW_UP => move_amount,
                            KEY_ARROW_DOWN => -move_amount,
                            _ => 0.0,
                        };

                        // Warp cursor to new position
                        CGWarpMouseCursorPosition(CGPoint::new(new_x, new_y));
                    }
                    _ => {}
                }
            },
        );

        // Mouse click monitor
        let result_for_click = result_for_events.clone();
        let cursor_pos_for_click = cursor_pos.clone();
        let capture_state_for_click = capture_state_for_events.clone();

        let click_monitor = NSEvent::addGlobalMonitorForEventsMatchingMask_handler(
            NSEventMask::NSLeftMouseDownMask,
            move |_event: id| {
                // Pick current color
                let _pos = *cursor_pos_for_click.borrow();
                if let Ok(capture) = capture_state_for_click.lock() {
                    if let Some(grid) = capture.get_current_grid() {
                        let center_idx = (grid.len() / 2) as usize;
                        if center_idx < grid.len() {
                            let color = &grid[center_idx];
                            *result_for_click.lock().unwrap() = Some(PickedColor {
                                r: color.r,
                                g: color.g,
                                b: color.b,
                                hex: color.hex(),
                            });
                        }
                    }
                }
                let app: id = msg_send![class!(NSApplication), sharedApplication];
                let _: () = msg_send![app, stop: nil];
                let _: () = msg_send![app, abortModal];
            },
        );

        // Mouse movement monitor
        let cursor_pos_for_move = cursor_pos.clone();
        let window_for_move = window_for_events;
        let config_for_move = config_for_events.clone();
        let render_state_for_move = render_state_for_events.clone();
        let capture_state_for_move = capture_state_for_events.clone();

        let move_monitor = NSEvent::addGlobalMonitorForEventsMatchingMask_handler(
            NSEventMask::NSMouseMovedMask | NSEventMask::NSLeftMouseDraggedMask | NSEventMask::NSRightMouseDraggedMask,
            move |_event: id| {
                let new_pos = NSEvent::mouseLocation(nil);

                // Update cursor position
                *cursor_pos_for_move.borrow_mut() = (new_pos.x as i32, new_pos.y as i32);

                // Update window position
                let window_frame = NSRect::new(
                    NSPoint::new(
                        new_pos.x - (config_for_move.magnifier_size as f64 / 2.0),
                        new_pos.y - (if config_for_move.show_hex { config_for_move.magnifier_size as f64 + 60.0 } else { config_for_move.magnifier_size as f64 }) / 2.0,
                    ),
                    NSSize::new(
                        config_for_move.magnifier_size as f64,
                        if config_for_move.show_hex { config_for_move.magnifier_size as f64 + 60.0 } else { config_for_move.magnifier_size as f64 },
                    ),
                );
                let _: () = msg_send![window_for_move, setFrame:window_frame display:NO];

                // Capture new pixel grid
                if let Ok(mut capture) = capture_state_for_move.lock() {
                    let _ = capture.update_grid((new_pos.x as i32, new_pos.y as i32), config_for_move.grid_size);
                }

                // Trigger render
                if let Ok(mut render) = render_state_for_move.lock() {
                    if let Ok(capture) = capture_state_for_move.lock() {
                        if let Some(grid) = capture.get_current_grid() {
                            let _ = render.render_frame(&layer, grid, &config_for_move);
                        }
                    }
                }
            },
        );

        // Initial capture and render
        {
            let mut capture = capture_state.lock().unwrap();
            let _ = capture.update_grid((cursor_location.x as i32, cursor_location.y as i32), config.grid_size);

            if let Some(grid) = capture.get_current_grid() {
                let mut render = render_state.lock().unwrap();
                let _ = render.render_frame(&layer, grid, &config);
            }
        }

        // Run the application event loop
        let app: id = msg_send![class!(NSApplication), sharedApplication];
        let _: () = msg_send![app, run];

        // Cleanup
        NSCursor::unhide(nil);
        NSEvent::removeMonitor(keyboard_monitor);
        NSEvent::removeMonitor(click_monitor);
        NSEvent::removeMonitor(move_monitor);
        window.close();

        pool.drain();

        // Return result
        let final_result = result.lock().unwrap().clone();
        Ok(final_result)
    }
}
