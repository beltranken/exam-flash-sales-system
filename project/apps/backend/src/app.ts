import 'dotenv/config'

import cookie from '@fastify/cookie'
import { authPlugin } from '@features'
import Fastify from 'fastify'
import { corsSetupPlugin } from './plugins/cors-setup.js'
import { errorHandlerPlugin } from './plugins/error-handler.js'
import {
  createLogger,
  dbSetupPlugin,
  envStepupPlugin,
  Level,
  msgBrokerPlugin,
  swaggerSetupPlugin,
} from './plugins/index.js'

const level = process.env.PINO_LOG_LEVEL as Level
const isDev = process.env.NODE_ENV === 'development'
const logger = createLogger({ level, isDev })

export const createApp = async () => {
  const fastify = Fastify({
    loggerInstance: logger,
  })

  await fastify.register(envStepupPlugin)

  // Error handler
  await fastify.register(errorHandlerPlugin)

  fastify.get('/ping', (_request, reply) => {
    reply.send({ message: 'pong' })
  })

  await fastify.register(cookie, {
    secret: fastify.config.COOKIE_SECRET,
  })
  await fastify.register(swaggerSetupPlugin)
  await fastify.register(dbSetupPlugin)
  await fastify.register(msgBrokerPlugin)
  await fastify.register(corsSetupPlugin)

  await fastify.register(authPlugin, { prefix: '/auth' })

  await fastify.ready()

  return fastify
}
