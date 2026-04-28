import env from '@fastify/env'
import { FastifyPluginAsync } from 'fastify'
import pino, { Level } from 'pino'

export type { Level }

type CreateLoggerArgs = {
  level: Level
  isDev: boolean
}

export const createLogger = ({ level, isDev }: CreateLoggerArgs) =>
  pino({
    level,
    redact: ['req.headers.authorization'],
    formatters: {
      level: (label) => {
        return { level: label.toUpperCase() }
      },
    },
    ...(isDev && { transport: { target: 'pino-pretty' } }),
  })

const schema = {
  type: 'object',
  required: ['PORT', 'DATABASE_URL', 'CACHE_URL', 'RABBITMQ_URL', 'JWT_ACCESS_SECRET'],
  properties: {
    PORT: {
      type: 'string',
      default: '8000',
    },
    NODE_ENV: {
      type: 'string',
      default: 'development',
    },
    PINO_LOG_LEVEL: {
      type: 'string',
      default: 'error',
    },
    DATABASE_URL: {
      type: 'string',
    },
    CACHE_URL: {
      type: 'string',
    },
    RABBITMQ_URL: {
      type: 'string',
    },
    JWT_ACCESS_SECRET: {
      type: 'string',
    },
    AWS_REGION: {
      type: 'string',
      default: 'auto',
    },
    AWS_ACCESS_KEY_ID: {
      type: 'string',
    },
    AWS_SECRET_ACCESS_KEY: {
      type: 'string',
    },
    S3_ENDPOINT: {
      type: 'string',
    },
    S3_BUCKET_NAME: {
      type: 'string',
    },
    COOKIE_SECRET: {
      type: 'string',
      default: 'secret',
    },
  },
}

export const envStepupPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(env, {
    schema,
    dotenv: true,
  })
}
