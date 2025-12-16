import { useMemo } from 'react'
import { createScopedLogger } from '@common/logger'

/**
 * React hook that provides a logger with automatic component scope tagging.
 *
 * This hook creates a scoped logger that automatically tags all log messages
 * with the component name, making it easier to trace logs back to their source.
 *
 * @param componentName - Name of the component or module using the logger
 *
 * @example
 * ```tsx
 * function ColorPicker() {
 *   const logger = useLogger('ColorPicker')
 *
 *   const handlePick = async () => {
 *     logger.debug('Starting color pick', { gridSize: 11 })
 *     // Output: [23:22:25] DEBUG [window:main][ColorPicker] Starting color pick gridSize=11
 *
 *     try {
 *       const color = await pickColor()
 *       logger.info('Color picked', { color })
 *     } catch (err) {
 *       logger.error('Pick failed', { error: err })
 *     }
 *   }
 * }
 * ```
 */
export function useLogger(componentName: string) {
  return useMemo(() => createScopedLogger(componentName), [componentName])
}
