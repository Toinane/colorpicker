/**
 * Unified logging system that seamlessly flows from frontend to backend terminal.
 *
 * Philosophy: Every log is a breadcrumb in the application's story.
 * Use it to trace the journey of data, understand user actions, and debug with clarity.
 */

import { trace, debug, info, warn, error } from '@tauri-apps/plugin-log'
import { getCurrentWindow } from '@tauri-apps/api/window'

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error'
export type LogContext = Record<string, unknown>

// Cache the window label to avoid repeated calls
let windowLabel: string | null = null

/**
 * Get the current window label for logging context
 */
async function getWindowLabel(): Promise<string> {
  if (windowLabel) return windowLabel

  try {
    const window = getCurrentWindow()
    windowLabel = window.label
    return windowLabel
  } catch {
    return 'unknown'
  }
}

/**
 * Get window label synchronously (uses cached value)
 */
function getWindowLabelSync(): string {
  return windowLabel || 'main'
}

/**
 * Format a log message with optional context and scope.
 * Context is serialized as JSON for structured logging.
 * Automatically includes window label for better traceability.
 */
function formatMessage(message: string, context?: LogContext, scope?: string): string {
  // Build the full message with scope prefix if provided
  let fullMessage = message
  if (scope) {
    fullMessage = `[${scope}] ${message}`
  }

  // Add window label to context
  const fullContext = {
    window: getWindowLabelSync(),
    ...context,
  }

  // Filter out empty context
  const filteredContext = Object.entries(fullContext).filter(
    ([_, value]) => value !== undefined && value !== null,
  )

  if (filteredContext.length === 0) {
    return fullMessage
  }

  try {
    const contextStr = filteredContext
      .map(([key, value]) => {
        if (typeof value === 'object') {
          return ` ${key}=${JSON.stringify(value)}`
        }
        return ` ${key}=${value}`
      })
      .join(' ')

    return `${fullMessage} ${contextStr}`
  } catch {
    // If serialization fails, just return the message
    return fullMessage
  }
}

// Initialize window label on module load
getWindowLabel().catch(() => {
  // Ignore errors, will use default
})

/**
 * Logger interface - the single source of truth for all application logging.
 *
 * @example
 * ```ts
 * import { logger } from '@/common/logger'
 *
 * logger.debug('Starting color pick', { gridSize: 11 })
 * logger.info('Color picked successfully', { color: '#8E44AD' })
 * logger.error('Pick failed', { error: err.message })
 * ```
 */
export const logger = {
  /**
   * Trace - Most granular logging, typically for tracking program flow.
   * Only visible in development mode.
   */
  trace: (message: string, context?: LogContext) => {
    trace(formatMessage(message, context))
  },

  /**
   * Debug - Diagnostic information useful for debugging.
   * Visible in development, hidden in production.
   */
  debug: (message: string, context?: LogContext) => {
    debug(formatMessage(message, context))
  },

  /**
   * Info - General informational messages about application state.
   * The default log level for production.
   */
  info: (message: string, context?: LogContext) => {
    info(formatMessage(message, context))
  },

  /**
   * Warn - Warning messages for potentially harmful situations.
   * Requires attention but doesn't stop execution.
   */
  warn: (message: string, context?: LogContext) => {
    warn(formatMessage(message, context))
  },

  /**
   * Error - Error messages for failure scenarios.
   * Should be logged for all exceptions and error paths.
   */
  error: (message: string, context?: LogContext) => {
    error(formatMessage(message, context))
  },
} as const

/**
 * Create a scoped logger with automatic scope tagging.
 * The scope name appears as a tag in the log output.
 *
 * @param scopeName - Name of the scope (e.g., "SettingsStore", "ColorPicker")
 *
 * @example
 * ```ts
 * const log = createScopedLogger('SettingsStore')
 * log.info('Settings saved')
 * // Output: [23:22:25] DEBUG [window:main][SettingsStore] Settings saved
 * ```
 */
export function createScopedLogger(scopeName: string) {
  return {
    trace: (message: string, context?: LogContext) => {
      trace(formatMessage(message, context, scopeName))
    },
    debug: (message: string, context?: LogContext) => {
      debug(formatMessage(message, context, scopeName))
    },
    info: (message: string, context?: LogContext) => {
      info(formatMessage(message, context, scopeName))
    },
    warn: (message: string, context?: LogContext) => {
      warn(formatMessage(message, context, scopeName))
    },
    error: (message: string, context?: LogContext) => {
      error(formatMessage(message, context, scopeName))
    },
  }
}
