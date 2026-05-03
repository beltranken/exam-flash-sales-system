import { createLogger, type Level, type Logger } from '@shared/logger'

const level = process.env.PINO_LOG_LEVEL as Level | undefined
const isDev = process.env.NODE_ENV !== 'production'

export const logger: Logger = createLogger({ level, isDev }).child({ service: 'order-worker' })
