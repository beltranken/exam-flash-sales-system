import { Cart, CartRequest } from '@types'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { validateCartService } from '../services/validate-cart.service.js'

export interface ValidateCartRoute {
  Body: CartRequest & { findActivePromo?: boolean }
  Reply: Cart
}

export function validateCartRoute(fastify: FastifyInstance) {
  return async function (req: FastifyRequest<ValidateCartRoute>, reply: FastifyReply<ValidateCartRoute>) {
    const cart = await validateCartService(fastify, req.body, req.user?.userId, req.body.findActivePromo)
    return reply.send(cart)
  }
}
