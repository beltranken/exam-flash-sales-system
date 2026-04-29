import { Order } from '@shared/db'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import createHttpError from 'http-errors'
import { getMyOrderByIdService } from '../services/index.js'

type GetMyOrderByIdRoute = {
  Params: {
    orderId: Order['id']
  }
  Reply: Order
}

export function getMyOrderByIdRoute(fastify: FastifyInstance) {
  return async function (req: FastifyRequest<GetMyOrderByIdRoute>, reply: FastifyReply<GetMyOrderByIdRoute>) {
    const userId = req.user?.userId

    if (!userId) {
      throw new createHttpError.Unauthorized('User is not authenticated')
    }

    const order = await getMyOrderByIdService(fastify, userId, req.params.orderId)
    reply.status(200).send(order)
  }
}
