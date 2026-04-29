import { FastifyPluginAsync } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

export const ordersPlugin: FastifyPluginAsync = async (fastify) => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>()

  typedFastify.get(
    '/my',
    {
      schema: {
        operationId: 'getOrders',
      },
    },
    () => {},
  )

  typedFastify.get(
    '/:orderId',
    {
      schema: {
        operationId: 'getOrderById',
      },
    },
    () => {},
  )
}
