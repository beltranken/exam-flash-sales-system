import { Order } from '@shared/db'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import createHttpError from 'http-errors'
import { getMyOrdersService } from '../services/index.js'

export type GetMyOrdersRoute = {
  Reply: Order[]
}

export function getMyOrdersRoute(fastify: FastifyInstance) {
  return async function (_req: FastifyRequest<GetMyOrdersRoute>, reply: FastifyReply<GetMyOrdersRoute>) {
    const userId = _req.user?.userId

    if (!userId) {
      throw new createHttpError.Unauthorized('User is not authenticated')
    }

    const orders = await getMyOrdersService(fastify, userId)
    reply.status(200).send(orders)
  }
}
