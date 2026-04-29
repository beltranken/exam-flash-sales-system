import { productSchema } from '@shared/db'
import { errorResponses } from '@types'
import { numberParamSchema } from '@utils'
import { FastifyPluginAsync } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { getProductRoute, getProductStockRoute, getProductsRoute } from './routes/index.js'

export const productsPlugin: FastifyPluginAsync = async (fastify) => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>()

  typedFastify.get(
    '/',
    {
      schema: {
        operationId: 'getProducts',
        response: {
          200: productSchema.array(),
          ...errorResponses,
        },
      },
    },
    getProductsRoute(fastify),
  )

  typedFastify.get(
    '/:productId',
    {
      schema: {
        operationId: 'getProductById',
        params: numberParamSchema('productId'),
        response: {
          200: productSchema,
          ...errorResponses,
        },
      },
    },
    getProductRoute(fastify),
  )

  typedFastify.get(
    '/:productId/stock',
    {
      schema: {
        operationId: 'getProductStockById',
        params: numberParamSchema('productId'),
        response: {
          200: z.number().int(),
          ...errorResponses,
        },
      },
    },
    getProductStockRoute(fastify),
  )
}
