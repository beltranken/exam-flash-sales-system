import { MakePaymentRequest } from '@shared/db'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { makeSkipPaymentSkipService } from '../services/make-skip-payment.service.js'

export interface ConfirmSkipPaymentRoute {
  Body: MakePaymentRequest
}

export function makeSkipPaymentRoute(fastify: FastifyInstance) {
  return async (req: FastifyRequest<ConfirmSkipPaymentRoute>, reply: FastifyReply<ConfirmSkipPaymentRoute>) => {
    await makeSkipPaymentSkipService(fastify, { ...req.body, userId: req.user.userId })
    reply.send()
  }
}
