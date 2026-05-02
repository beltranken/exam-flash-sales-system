import { promoSchema } from '@shared/db'
import { errorResponses } from '@types'
import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { getPromosRoute } from './routes/get-promos.route.js'

export const promosPluginKey = 'promos'

export const promosPluginImpl: FastifyPluginAsync = async (fastify) => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>()

  typedFastify.get(
    '/',
    {
      schema: {
        operationId: 'getPromos',
        response: {
          200: promoSchema.array(),
          ...errorResponses,
        },
      },
    },
    getPromosRoute(fastify),
  )
}

export const promosPlugin = fp(promosPluginImpl, { name: promosPluginKey })
