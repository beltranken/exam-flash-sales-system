import env, { type FastifyEnvOptions } from '@fastify/env'
import { type Level } from '@shared/logger'
import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

const logLevels: Level[] = ['fatal', 'error', 'warn', 'info', 'debug', 'trace']

const schema: FastifyEnvOptions['schema'] = {
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
      enum: logLevels,
      default: 'info',
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
    ORDER_RESERVED_QUEUE_NAME: {
      type: 'string',
      default: 'order.reserved',
    },
    ORDER_SUBMITTED_QUEUE_NAME: {
      type: 'string',
      default: 'order.submitted',
    },
    ORDER_FAILED_QUEUE_NAME: {
      type: 'string',
      default: 'order.failed',
    },
    ORDER_TIMEOUT_DELAY_QUEUE_NAME: {
      type: 'string',
      default: 'order.timeout.delay',
    },
    ORDER_TIMEOUT_TTL_MS: {
      type: 'string',
      default: String(15 * 60 * 1000),
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
    SKIP_LOGIN: {
      type: 'boolean',
      default: true,
    },
    PAYMENT_METHODS: {
      type: 'string',
      separator: ',',
      default: 'Skip Payment,Stripe',
    },
  },
}

const envSetupPluginImpl: FastifyPluginAsync = async (fastify) => {
  await fastify.register(env, {
    schema,
    dotenv: true,
  })
}

export const envSetupPlugin = fp(envSetupPluginImpl, {
  name: 'env-setup',
})
