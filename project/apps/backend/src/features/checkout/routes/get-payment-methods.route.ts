import { PaymentMethod } from '@types'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

export interface GetPaymentMethodsRoute {
  Reply: PaymentMethod[]
}

export function getPaymentMethodsRoute(fastify: FastifyInstance) {
  return async function (_req: FastifyRequest<GetPaymentMethodsRoute>, reply: FastifyReply<GetPaymentMethodsRoute>) {
    const paymentMethods = fastify.config.PAYMENT_METHODS.map((name) => {
      let description
      switch (name) {
        case 'Skip Payment':
          description = 'For testing purposes only. No actual payment will be processed.'
          break
        case 'Stripe':
          description = 'Pay securely using Stripe. Supports credit cards and other payment methods.'
          break
        default:
          description = ''
      }

      return { name, description }
    })

    reply.status(200).send(paymentMethods)
  }
}
