import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { getProductStockService } from '../services/get-procuct-stock.service.js'

type GetProductStockRoute = {
  Params: {
    productId: number
  }
  Reply: number
}

export function getProductStockRoute(fastify: FastifyInstance) {
  return async function (req: FastifyRequest<GetProductStockRoute>, reply: FastifyReply<GetProductStockRoute>) {
    const availableStock = await getProductStockService(fastify, req.params.productId)
    reply.status(200).send(availableStock)
  }
}
