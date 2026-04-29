import 'dotenv/config'

import cookie from '@fastify/cookie'
import { authPlugin, ordersPlugin, productsPlugin } from '@features'
import {
  authSetupPlugin,
  cacheSetupPlugin,
  createLogger,
  dbSetupPlugin,
  envStepupPlugin,
  Level,
  msgBrokerPlugin,
  swaggerSetupPlugin,
} from '@plugins'
import Fastify from 'fastify'
import { corsSetupPlugin } from './plugins/cors-setup.js'
import { errorHandlerPlugin } from './plugins/error-handler.js'

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
  await fastify.register(cacheSetupPlugin)
  await fastify.register(msgBrokerPlugin)

  await fastify.register(corsSetupPlugin)
  await fastify.register(authSetupPlugin)

  await fastify.register(authPlugin, { prefix: '/auth' })
  await fastify.register(productsPlugin, { prefix: '/products' })
  await fastify.register(ordersPlugin, { prefix: '/orders' })

  await fastify.ready()

  return fastify
}
