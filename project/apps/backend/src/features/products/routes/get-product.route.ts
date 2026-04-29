import { Product } from '@shared/db'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { getProductService } from '../services/index.js'

type GetProductRoute = {
  Params: {
    productId: Product['id']
  }
  Reply: Product
}

export function getProductRoute(fastify: FastifyInstance) {
  return async function (req: FastifyRequest<GetProductRoute>, reply: FastifyReply<GetProductRoute>) {
    const product = await getProductService(fastify, req.params.productId)
    reply.status(200).send(product)
  }
}
