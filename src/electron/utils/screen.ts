import { Rectangle, screen } from 'electron'

/**
 * Validates if a window position is within any visible display bounds
 * @param position - The window position to validate
 * @returns true if the position is valid and visible on any screen
 */
export const isPositionVisible = (position: Rectangle): boolean => {
  const displays = screen.getAllDisplays()

  // Calculate the center point of the window
  const windowCenterX = position.x + position.width / 2
  const windowCenterY = position.y + position.height / 2

  // Check if the window center is within any display bounds
  for (const display of displays) {
    const bounds = display.workArea

    if (
      windowCenterX >= bounds.x &&
      windowCenterX <= bounds.x + bounds.width &&
      windowCenterY >= bounds.y &&
      windowCenterY <= bounds.y + bounds.height
    ) {
      return true
    }
  }

  return false
}

/**
 * Gets a safe center position on the primary display
 * @param width - The window width
 * @param height - The window height
 * @returns A safe centered position on the primary display
 */
export const getSafeCenterPosition = (width: number, height: number): { x: number; y: number } => {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { workArea } = primaryDisplay

  const x = Math.round(workArea.x + (workArea.width - width) / 2)
  const y = Math.round(workArea.y + (workArea.height - height) / 2)

  return { x, y }
}
