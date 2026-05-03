import { orderIdParam, orderSchema } from '@shared/db'
import { errorResponses } from '@types'
import { FastifyPluginAsync } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import {
  GetMyOrderByIdRoute,
  GetMyOrderStatusRoute,
  GetMyOrdersRoute,
  getMyOrderByIdRoute,
  getMyOrderStatusRoute,
  getMyOrdersRoute,
} from './routes/index.js'

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
      onRequest: fastify.authenticate,
    },
    getMyOrdersRoute(fastify),
  )

  typedFastify.get<GetMyOrderStatusRoute>(
    '/my/:orderId/status',
    {
      schema: {
        operationId: 'getMyOrderStatus',
        params: orderIdParam,
        response: {
          200: orderSchema.shape.status,
          ...errorResponses,
        },
      },
      onRequest: fastify.authenticate,
    },
    getMyOrderStatusRoute(fastify),
  )

  typedFastify.get<GetMyOrderByIdRoute>(
    '/my/:orderId',
    {
      schema: {
        operationId: 'getMyOrderById',
        params: orderIdParam,
        // querystring: z.object({}),
        response: {
          200: orderSchema,
          ...errorResponses,
        },
      },
      onRequest: fastify.authenticate,
    },
    getMyOrderByIdRoute(fastify),
  )
}
