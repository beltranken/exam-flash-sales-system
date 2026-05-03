import { ConfirmPaymentRequest } from '@shared/db'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

export interface ConfirmSkipPaymentRoute {
  Body: ConfirmPaymentRequest
}

export function confirmSkipPaymentRoute(fastify: FastifyInstance) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    fastify.log.info('Processing confirm skip payment request for order %s', req)
    fastify.log.info('Skipping payment for order %s', reply)
  }
}
