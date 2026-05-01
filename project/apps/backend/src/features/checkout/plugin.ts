import { cartRequestSchema, cartSchema, errorResponses, paymentMethodSchema } from '@types'
import { FastifyPluginAsync } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import createHttpError from 'http-errors'
import { GetPaymentMethodsRoute, getPaymentMethodsRoute, validateCartRoute, ValidateCartRoute } from './routes/index.js'

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

  const tempFn = () => {
    throw createHttpError(501)
  }

  typedFastify.post<ValidateCartRoute>(
    '/validate-cart',
    {
      schema: {
        operationId: 'validateCart',
        body: cartRequestSchema,
        response: {
          200: cartSchema,
          ...errorResponses,
        },
      },
    },
    validateCartRoute(fastify),
  )

  typedFastify.post(
    '/apply-promo',
    {
      schema: {
        operationId: 'applyPromo',
        response: {
          ...errorResponses,
        },
      },
    },
    tempFn,
  )

  typedFastify.post(
    '/checkout',
    {
      schema: {
        operationId: 'checkout',
        response: {
          ...errorResponses,
        },
      },
    },
    tempFn,
  )

  typedFastify.post(
    '/start-payment',
    {
      schema: {
        operationId: 'startPayment',
        response: {
          ...errorResponses,
        },
      },
    },
    tempFn,
  )
}
