import { makePaymentRequestSchema, paymentMethodResponseSchema } from '@shared/db'
import { cartRequestSchema, cartSchema, checkoutResponseSchema, errorResponses, noContentResponse } from '@types'
import { FastifyPluginAsync } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import createHttpError from 'http-errors'
import z from 'zod/v4'
import {
  CheckoutRoute,
  checkoutRoute,
  GetPaymentMethodsRoute,
  getPaymentMethodsRoute,
  MakeSkipPaymentRoute,
  makeSkipPaymentRoute,
  validateCartRoute,
  ValidateCartRoute,
} from './routes/index.js'

export const checkoutPlugin: FastifyPluginAsync = async (fastify) => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>()

  typedFastify.get<GetPaymentMethodsRoute>(
    '/payment-methods',
    {
      schema: {
        operationId: 'getPaymentMethods',
        response: {
          200: paymentMethodResponseSchema.array(),
          ...errorResponses,
        },
      },
    },
    getPaymentMethodsRoute,
  )

  const tempFn = () => {
    throw createHttpError(501)
  }

  typedFastify.post<ValidateCartRoute>(
    '/validate-cart',
    {
      schema: {
        operationId: 'validateCart',
        body: cartRequestSchema.extend({ findActivePromo: z.boolean().optional() }),
        response: {
          200: cartSchema,
          ...errorResponses,
        },
      },
    },
    validateCartRoute(fastify),
  )

  typedFastify.post<CheckoutRoute>(
    '/checkout',
    {
      schema: {
        operationId: 'checkout',
        body: cartRequestSchema,
        response: {
          200: checkoutResponseSchema,
          ...errorResponses,
          409: checkoutResponseSchema,
        },
      },
      onRequest: fastify.authenticate,
    },
    checkoutRoute(fastify),
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

  typedFastify.post<MakeSkipPaymentRoute>(
    '/payment/skip-payment',
    {
      schema: {
        operationId: 'makeSkipPayment',
        body: makePaymentRequestSchema,
        response: {
          ...noContentResponse,
          ...errorResponses,
        },
      },
      onRequest: fastify.authenticate,
    },
    makeSkipPaymentRoute(fastify),
  )
}
