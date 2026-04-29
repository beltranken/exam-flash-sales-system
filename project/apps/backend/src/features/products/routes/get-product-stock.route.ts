import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { getProductService } from '../services/index.js'

type GetProductStockRoute = {
  Params: {
    productId: number
  }
  Reply: number
}

export function getProductStockRoute(fastify: FastifyInstance) {
  return async function (req: FastifyRequest<GetProductStockRoute>, reply: FastifyReply<GetProductStockRoute>) {
    const cachedStock = await fastify.redis.get(`product-stocks:${req.params.productId}`) // Invalidate cache for the product

    if (cachedStock && Number.isFinite(Number(cachedStock))) {
      return reply.status(200).send(Number(cachedStock))
    }

    const product = await getProductService(fastify, req.params.productId)
    const availableStock = product.productStock?.availableQuantity ?? 0
    await fastify.redis.set(`product-stocks:${req.params.productId}`, availableStock)

    reply.status(200).send(availableStock)
  }
}
