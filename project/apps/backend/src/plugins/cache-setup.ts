import fastifyRedis from '@fastify/redis'
import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

const cachePluginImpl: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifyRedis, {
    url: fastify.config.CACHE_URL,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000)
      return delay
    },
  })
}

export const cacheSetupPlugin = fp(cachePluginImpl, {
  name: 'cache',
})
