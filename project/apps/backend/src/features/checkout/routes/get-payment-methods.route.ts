import { PaymentMethod, PaymentMethodResponse } from '@shared/db'
import { FastifyReply, FastifyRequest } from 'fastify'

export interface GetPaymentMethodsRoute {
  Reply: PaymentMethodResponse[]
}

export async function getPaymentMethodsRoute(
  _req: FastifyRequest<GetPaymentMethodsRoute>,
  reply: FastifyReply<GetPaymentMethodsRoute>,
) {
  reply.status(200).send([
    {
      id: PaymentMethod.SKIP_PAYMENT,
      name: 'Skip Payment',
      description: 'For testing purposes only. No actual payment will be processed.',
    },
    {
      id: PaymentMethod.STRIPE,
      name: 'Stripe',
      description: 'Pay securely using Stripe. Supports credit cards and other payment methods.',
    },
  ])
}
