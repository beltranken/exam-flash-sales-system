import cors from '@fastify/cors'
import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

const allowedLocalhostNames = new Set(['localhost', '127.0.0.1', '[::1]'])

const corsSetupPluginImpl: FastifyPluginAsync = async (fastify) => {
  await fastify.register(cors, {
    credentials: true,
    origin: (origin, cb) => {
      try {
        if (!origin) {
          cb(null, true)
          return
        }

        const hostname = new URL(origin).hostname
        if (allowedLocalhostNames.has(hostname)) {
          cb(null, true)
          return
        }

        cb(new Error('Not allowed'), false)
      } catch (err) {
        fastify.log.error(err)
        if (err instanceof Error) {
          cb(err, false)
        } else {
          cb(new Error('Invalid origin'), false)
        }
      }
    },
  })
}

export const corsSetupPlugin = fp(corsSetupPluginImpl, {
  name: 'cors-setup',
})
