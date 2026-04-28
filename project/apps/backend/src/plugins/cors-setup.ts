import cors from '@fastify/cors'
import { FastifyPluginAsync } from 'fastify'

export const corsSetupPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(cors, {
    credentials: true,
    origin: (origin, cb) => {
      try {
        if (!origin) {
          cb(null, true)
          return
        }

        const hostname = new URL(origin).hostname
        if (hostname === 'localhost') {
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
