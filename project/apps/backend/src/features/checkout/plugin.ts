import { errorResponses, paymentMethodSchema } from '@types'
import { FastifyPluginAsync } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { GetPaymentMethodsRoute, getPaymentMethodsRoute } from './routes/get-payment-methods.route.js'

export const checkoutPlugin: FastifyPluginAsync = async (fastify) => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>()

  typedFastify.get<GetPaymentMethodsRoute>(
    '/payment-methods',
    {
      schema: {
        operationId: 'getPaymentMethods',
        response: {
          200: paymentMethodSchema.array(),
          ...errorResponses,
        },
      },
    },
    getPaymentMethodsRoute(fastify),
  )
}
