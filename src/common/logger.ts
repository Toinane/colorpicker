import winston from 'winston'

import is from '@electron/utils/is'

const createLogger = (label: string) => {
  const customFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
    return `[${timestamp}][${label}] ${level}: ${message}${metaStr}`
  })

  return winston.createLogger({
    level: is.dev ? 'debug' : 'info',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.colorize({ all: true }),
      customFormat,
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
    ],
  })
}

export default createLogger
