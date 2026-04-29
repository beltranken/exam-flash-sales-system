import { orderSchema } from '@shared/db'
import { errorResponses } from '@types'
import { FastifyPluginAsync } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { getMyOrderByIdRoute, getMyOrdersRoute } from './routes/index.js'

export const ordersPlugin: FastifyPluginAsync = async (fastify) => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>()

  typedFastify.get(
    '/my',
    {
      schema: {
        operationId: 'getMyOrders',
        response: {
          200: orderSchema.array(),
          ...errorResponses,
        },
      },
      preHandler: fastify.authenticate,
    },
    getMyOrdersRoute(fastify),
  )

  typedFastify.get(
    '/my/:orderId',
    {
      schema: {
        operationId: 'getMyOrderById',
        params: orderSchema.pick({ id: true }).transform((order) => ({ orderId: order.id })),
        response: {
          200: orderSchema,
          ...errorResponses,
        },
      },
      preHandler: fastify.authenticate,
    },
    getMyOrderByIdRoute(fastify),
  )
}
