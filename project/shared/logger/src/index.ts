import pino, { type Level, type Logger } from 'pino'

export type { Level, Logger }

type CreateLoggerArgs = {
  level?: Level
  isDev: boolean
  appName?: string
}

export const createLogger = ({ level = 'info', isDev, appName }: CreateLoggerArgs) =>
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
    ...(isDev
      ? { transport: { target: 'pino-pretty' } }
      : {
          transport: {
            target: 'pino-loki',
            options: {
              batching: true,
              interval: 5,
              host: process.env.LOKI_HOST,
              labels: appName ? { app: appName, group: 'flash-sales' } : {},
            },
          },
        }),
  })
