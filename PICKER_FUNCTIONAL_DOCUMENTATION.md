# Color Picker - Functional Documentation

## Overview

The **Color Picker** is a high-performance, screen-wide color selection tool that allows users to precisely identify and capture any color visible on their screen. The picker provides a magnified, real-time view of pixels around the cursor position, enabling pixel-perfect color selection from any application, image, video, or UI element.

---

## User Experience

### Launch Behavior

When the picker is launched, the application enters a dedicated color-picking mode where:

- A **circular magnifier window** appears on screen
- The magnifier follows the user's cursor movements in real-time with exceptional smoothness (144+ frames per second)
- The system cursor becomes invisible, replaced by the magnifier itself
- The magnifier stays on top of all other windows
- The picker can be captured from screen captures and recordings, but only if it's possible technically, otherwise, it do not appear.

### Visual Interface

The picker interface consists of two main visual elements:

#### 1. Magnifier Circle

A circular window that displays a magnified grid view of the pixels surrounding the cursor position.

**Grid Display:**

- Shows a configurable grid of pixels (default: 9×9 pixels)
- Each pixel in the grid is enlarged to make precise color selection easier
- The **center cell** is highlighted with a distinctive border to indicate which color will be selected
- The border color of the center cell automatically adapts to ensure visibility:
  - **Dark border** on light colors
  - **Light border** on dark colors

**Circular Border:**

- The magnifier has a circular border that frames the entire grid
- Border color segments adapt intelligently to the colors they're adjacent to
- This ensures the border remains visible regardless of the underlying screen content

#### 2. Color Label

Below the magnifier circle, a color information label displays:

**Content:**

- The **hexadecimal color value** (format: `#RRGGBB`) of the center pixel
- Example: `#FF5733`, `#2C3E50`, `#FFFFFF`

**Appearance:**

- Rounded rectangle box
- Background color matches the center pixel color
- Text color automatically adapts for optimal readability:
  - **Dark text** on light backgrounds
  - **Light text** on dark backgrounds
- Border around the label adapts to match the background color

**Positioning:**

- Located below the magnifier circle
- Slightly overlaps with the magnifier for a compact, unified appearance
- Moves with the magnifier as the cursor moves

---

## User Controls

### Color Selection

**Primary Actions:**

- **Left Mouse Click**: Pick the center color and close the picker
- **Enter Key**: Pick the center color and close the picker

Both actions capture the color value of the center pixel in the magnifier grid and return it to the application.

### Cancellation

**Cancel Action:**

- **Escape Key**: Cancel the color picking operation without selecting a color

This closes the picker and returns no color value to the application.

### Precise Navigation

For pixel-perfect color selection, arrow keys provide fine control:

**Normal Speed:**

- **Arrow Keys** (↑ ↓ ← →): Move cursor by 1 pixel in the respective direction

**Fast Speed:**

- **Shift + Arrow Keys**: Move cursor by 10 pixels in the respective direction

This allows users to navigate precisely to a specific pixel, even in areas with similar colors or fine details.

---

## Functional Capabilities

### Real-Time Color Tracking

**Cursor Following:**

- The magnifier window tracks cursor movements with minimal latency
- Provides immediate visual feedback as the user explores the screen
- Window positioning is smooth and does not lag behind cursor movement

**Pixel Grid Updates:**

- The magnified pixel grid updates continuously as the cursor moves
- Hex color value updates in real-time to reflect the center pixel
- Performance remains consistent even during rapid cursor movements

### Adaptive Visual Feedback

**Intelligent Color Contrast:**

- All text, borders, and UI elements automatically adjust their colors based on luminance
- Uses perceptual luminance calculations (ITU-R BT.709 standard) to determine if colors are light or dark
- Ensures all interface elements remain clearly visible regardless of screen content

**Examples:**

- When hovering over a bright white area, borders and text become dark
- When hovering over a dark background, borders and text become light
- The hex label background changes to match the center pixel while maintaining readable text

### Screen Capture Integration

**Comprehensive Capture:**

- Captures colors from any visible element on screen:
  - Desktop wallpaper
  - Application windows
  - Images and graphics
  - Video content (see Dynamic Content Detection)
  - UI elements in any state

**Multi-Monitor Support:**

- Works seamlessly across multiple displays
- Correctly handles different screen resolutions
- Respects per-monitor DPI settings for accurate color capture

### Dynamic Content Detection

**Background Change Detection** (Optional Feature):

When enabled, this feature allows picking colors from content that changes over time:

**Use Cases:**

- **Videos and animations**: Capture a specific color from a moving scene
- **Dynamic UI elements**: Pick colors from animations or transitions
- **Changing backgrounds**: Select colors from content that updates automatically

**Behavior:**

- Monitors the screen area under the cursor at 30 frames per second
- Detects when colors change even when the cursor is stationary
- Updates the magnifier grid and hex value when changes are detected
- Minimal performance impact (2-5% CPU when active)

**Default State:** Disabled (to conserve resources)

### Hover-Through Mode

**Hover-Through Capability** (Optional Feature):

This advanced feature enables capturing colors from UI elements in their hover states:

**Purpose:**

- Pick colors from interactive elements that change appearance on hover
- Examples:
  - A button that turns red when you hover over it
  - A link that underlines when the cursor is over it
  - A menu item that highlights on hover

**Behavior:**

- The magnifier becomes transparent to mouse hover events
- Underlying windows and UI elements receive hover notifications as if the magnifier wasn't there
- User can see the hover effect happen in real-time within the magnifier
- Click and keyboard events are still captured by the picker for selection/cancellation

**Default State:** Disabled (standard behavior blocks hover events)

---

## Configuration Options

The picker can be customized with the following parameters:

### Grid Size

- **Purpose**: Controls how many pixels are shown in the magnified grid
- **Default**: 9 (displays a 9×9 grid = 81 pixels)
- **Range**: Typically 5-11 pixels
- **Effect**:
  - Smaller values = fewer pixels, larger magnification per pixel
  - Larger values = more pixels visible, smaller magnification per pixel

### Magnifier Size

- **Purpose**: Controls the diameter of the circular magnifier window
- **Default**: 300 pixels
- **Range**: Any positive value, typically 200-500 pixels
- **Effect**:
  - Larger values = bigger window, more screen space used, more detail visible
  - Smaller values = smaller window, less screen space, more compact interface

### Show Hex Label

- **Purpose**: Controls whether the hex color value is displayed
- **Default**: true (label is shown)
- **Options**: true or false
- **Effect**:
  - When true: Hex label appears below magnifier
  - When false: Only the magnifier is shown (more compact)

### Detect Background Changes

- **Purpose**: Enables detection of color changes in the area under the cursor
- **Default**: false (feature disabled)
- **Options**: true or false
- **Effect**:
  - When true: Monitors for changes at 30fps, useful for videos/animations
  - When false: Only updates on cursor movement (better performance)

### Allow Hover Through

- **Purpose**: Enables hover-through mode for picking hover-state colors
- **Default**: false (magnifier blocks hover events)
- **Options**: true or false
- **Effect**:
  - When true: Underlying windows receive hover events through the magnifier
  - When false: Standard behavior, magnifier blocks all events except click/keyboard

---

## Performance Characteristics

### Visual Performance

**Frame Rate:**

- Target: 144+ frames per second
- Ensures smooth, responsive magnifier movement
- No visible lag between cursor movement and magnifier update

**Latency:**

- Less than 7 milliseconds from cursor movement to screen update
- Imperceptible delay for the user
- Professional-grade responsiveness

### Resource Usage

**When Stationary:**

- CPU: ~0% (virtually no resources used)
- The picker uses intelligent frame skipping when nothing changes

**When Moving:**

- CPU: ~2-5% on modern systems
- Memory: Minimal, fixed allocation (no per-frame allocations)

**With Background Detection Enabled:**

- Adds slight CPU overhead (30fps polling)
- Still minimal resource usage overall

---

## Color Format

### Output Format

**RGB Color Model:**

- Colors are returned in the RGB (Red, Green, Blue) color model
- Each channel has 8-bit precision (0-255 range)
- Supports 16.7 million distinct colors (24-bit true color)

**Hexadecimal Representation:**

- Colors are displayed and commonly returned in hexadecimal format
- Format: `#RRGGBB`
- Examples:
  - Pure red: `#FF0000`
  - Pure green: `#00FF00`
  - Pure blue: `#0000FF`
  - White: `#FFFFFF`
  - Black: `#000000`
  - Orange: `#FF5733`

**RGB Components:**

- Also available as separate R, G, B values (0-255 each)
- Enables direct use in APIs that require component values

---

## Interaction Scenarios

### Scenario 1: Quick Color Pick

**Goal**: Quickly grab a color from a visible element

**Steps**:

1. Launch the picker
2. Move cursor over the desired color
3. Click or press Enter
4. Color is captured and picker closes

**Time**: Typically 1-2 seconds

---

### Scenario 2: Precise Color Selection

**Goal**: Select an exact pixel from a complex image

**Steps**:

1. Launch the picker
2. Move cursor near the target area
3. Use arrow keys to navigate precisely to the exact pixel
4. Observe the hex value to confirm it's the right color
5. Press Enter to select
6. Color is captured and picker closes

**Time**: Varies based on precision required (5-15 seconds typical)

---

### Scenario 3: Video Color Pick

**Goal**: Capture a color from a playing video

**Steps**:

1. Launch picker with "Detect Background Changes" enabled
2. Move cursor over the video element
3. Wait for the desired moment/color to appear in the video
4. Watch the magnifier update as the video plays
5. Click when the desired color appears in the center
6. Color is captured and picker closes

**Notes**: The 30fps background detection ensures the magnifier updates even as video frames change

---

### Scenario 4: Hover State Color

**Goal**: Pick the red color that appears when hovering over a close button

**Steps**:

1. Launch picker with "Allow Hover Through" enabled
2. Move cursor over the close button
3. The button changes to red (hover effect passes through the magnifier)
4. The magnifier shows the red color
5. Click to capture the hover-state color
6. Color is captured and picker closes

**Notes**: Without hover-through, the button would not show its hover state

---

## Platform Availability

### Currently Supported

- **Windows**: Full feature set available
  - All capabilities enabled
  - Optimized for Windows 10 and 11
  - Supports multi-monitor setups

### In Development

- **macOS**: Planned support
  - Native implementation in consideration

### Not Yet Supported

- **Linux**: Not currently implemented
  - Future consideration

---

## Integration with ColorPicker Application

The picker is invoked through the main ColorPicker application as a command:

**Command Name**: `pick_color`

**Invocation**: Typically triggered by a button or keyboard shortcut in the main application

**Return Value**:

- **Success**: Returns the selected color (RGB components + hex value)
- **Cancellation**: Returns no value (user pressed Escape)

**Application Flow**:

1. User triggers color picking action in ColorPicker
2. Main application window minimizes or hides
3. Picker launches in dedicated mode
4. User selects a color (or cancels)
5. Picker closes
6. Main application window reappears
7. Selected color (if any) is added to the application or used as specified

---

## Design Philosophy

### Precision First

Every feature is designed to enable accurate, pixel-perfect color selection. The magnifier, center cell highlighting, and arrow key navigation all serve this goal.

### Visual Clarity

Adaptive colors ensure the interface remains visible regardless of screen content. The picker never becomes invisible or hard to read.

### Performance Without Compromise

High frame rates and low latency create a professional, responsive experience that doesn't feel sluggish or laggy.

### Unobtrusive Operation

The picker minimizes its footprint (small moving window instead of fullscreen) and hides the cursor to stay out of the way. It must never sample its own rendering (the lens sits over the sampled pixels); on Windows this currently requires excluding the window from screen capture (`WDA_EXCLUDEFROMCAPTURE`) — a correctness fix, not a goal. Wherever a platform allows solving this without global exclusion, the picker stays visible in screenshots and recordings.

### Flexibility

Configuration options allow users to customize the experience for different use cases (video picking, hover states, compact mode, etc.).

---

## Summary

The Color Picker is a sophisticated yet intuitive tool for capturing colors from any source on screen. Its combination of real-time magnification, adaptive visual feedback, and precise navigation capabilities make it suitable for both quick color grabs and detailed, pixel-perfect selection work. Advanced features like background change detection and hover-through mode extend its capabilities to handle dynamic content and interactive UI elements, making it a comprehensive solution for color selection across all scenarios.
