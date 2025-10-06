import winston from 'winston'

import is from '@electron/utils/is'

const createLogger = (label: string) => {
  const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    // Foreground colors
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',
    // Background colors
    bgRed: '\x1b[41m',
    bgYellow: '\x1b[43m',
  }

  const consoleFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
    const levelMap: Record<string, { colorCode: string }> = {
      error: { colorCode: colors.red },
      warn: { colorCode: colors.yellow },
      info: { colorCode: colors.green },
      debug: { colorCode: colors.gray },
    }

    // Get the base level name (remove ANSI color codes if present)
    const cleanLevel = level.trim().toLowerCase()
    const levelInfo = levelMap[cleanLevel] || { icon: '●', colorCode: colors.white }

    const formattedTime = `${colors.dim}${timestamp}${colors.reset}`
    const formattedLabel = `${colors.cyan}${colors.bright}[${label}]${colors.reset}`

    const levelText = cleanLevel.toUpperCase().padEnd(5)
    const formattedLevel = `${levelInfo.colorCode}${levelText}${colors.reset}`

    const formattedMessage = `${levelInfo.colorCode}${message}${colors.reset}`

    // Format metadata if present with pretty printing
    let metaStr = ''
    if (Object.keys(meta).length) {
      // Pretty print metadata with indentation and subtle styling
      const metaJson = JSON.stringify(meta, null, 2)
      const indentedMeta = metaJson.replaceAll(/\n/g, '\n  ')
      metaStr = `\n${levelInfo.colorCode}  ${indentedMeta}${colors.reset}`
    }

    // Construct the final log line with improved spacing and visual separator
    return `${formattedTime} ${formattedLevel} ${formattedLabel} ${formattedMessage}${metaStr}`
  })

  const fileFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
    const cleanLevel = level.trim().toUpperCase()
    const metaStr = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : ''
    return `${timestamp} ${cleanLevel.padEnd(5)} [${label}] ${message}${metaStr}`
  })

  return winston.createLogger({
    level: is.dev ? 'debug' : 'info',
    transports: [
      // Console transport with colors and enhanced formatting
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
          consoleFormat,
        ),
      }),
      // File transport with structured format (no colors)
      new winston.transports.File({
        filename: 'error.log',
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          fileFormat,
        ),
      }),
    ],
  })
}

export default createLogger
