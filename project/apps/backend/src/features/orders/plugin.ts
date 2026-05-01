import { orderSchema } from '@shared/db'
import { errorResponses } from '@types'
import { FastifyPluginAsync } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import createHttpError from 'http-errors'
import { GetMyOrderByIdRoute, GetMyOrdersRoute, getMyOrderByIdRoute, getMyOrdersRoute } from './routes/index.js'

export const ordersPlugin: FastifyPluginAsync = async (fastify) => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>()

  typedFastify.get<GetMyOrdersRoute>(
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
    '/my/:orderId/status',
    {
      schema: {
        operationId: 'getMyOrderStatus',
        response: {
          ...errorResponses,
        },
      },
    },
    () => {
      throw new createHttpError.NotImplemented()
    },
  )

  typedFastify.get<GetMyOrderByIdRoute>(
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
