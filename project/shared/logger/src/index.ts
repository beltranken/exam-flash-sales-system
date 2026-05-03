import pino, { type Level, type Logger } from 'pino'

export type { Level, Logger }

type CreateLoggerArgs = {
  level?: Level
  isDev: boolean
}

export const createLogger = ({ level = 'info', isDev }: CreateLoggerArgs) =>
  pino({
    level,
    redact: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers.set-cookie',
      '*.accessToken',
      '*.refreshToken',
      '*.token',
      '*.password',
    ],
    formatters: {
      level: (label) => {
        return { level: label }
      },
    },
    ...(isDev && { transport: { target: 'pino-pretty' } }),
  })
