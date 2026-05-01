import 'dotenv/config'

import cookie from '@fastify/cookie'
import { authPlugin, checkoutPlugin, ordersPlugin, productsPlugin, promosPlugin } from '@features'
import {
  authSetupPlugin,
  cacheSetupPlugin,
  createLogger,
  dbSetupPlugin,
  envSetupPlugin,
  Level,
  msgBrokerPlugin,
  s3Plugin,
  swaggerSetupPlugin,
} from '@plugins'
import Fastify from 'fastify'
import { corsSetupPlugin } from './plugins/cors-setup.js'
import { errorHandlerPlugin } from './plugins/error-handler.js'

const level = process.env.PINO_LOG_LEVEL as Level
const isDev = process.env.NODE_ENV !== 'production'
const logger = createLogger({ level, isDev })

export const createApp = async () => {
  const fastify = Fastify({
    loggerInstance: logger,
  })

  await fastify.register(envSetupPlugin)

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
  await fastify.register(s3Plugin)

  await fastify.register(corsSetupPlugin)
  await fastify.register(authSetupPlugin)

  await fastify.register(authPlugin, { prefix: '/api/auth' })
  await fastify.register(productsPlugin, { prefix: '/api/products' })
  await fastify.register(ordersPlugin, { prefix: '/api/orders' })
  await fastify.register(promosPlugin, { prefix: '/api/promos' })
  await fastify.register(checkoutPlugin, { prefix: '/api' })

  await fastify.ready()

  return fastify
}
