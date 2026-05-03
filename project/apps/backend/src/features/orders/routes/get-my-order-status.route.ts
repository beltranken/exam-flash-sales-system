import { OrderIdParam, OrderStatus } from '@shared/db'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { getMyOrderStatusService } from '../services/get-my-order-status.service.js'

export type GetMyOrderStatusRoute = {
  Params: OrderIdParam
  Reply: OrderStatus
}

export function getMyOrderStatusRoute(fastify: FastifyInstance) {
  return async function (req: FastifyRequest<GetMyOrderStatusRoute>, reply: FastifyReply<GetMyOrderStatusRoute>) {
    const orderStatus = await getMyOrderStatusService(fastify, req.user.userId, req.params.orderId)
    reply.status(200).send(orderStatus)
  }
}
