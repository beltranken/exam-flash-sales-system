import { Product } from '@shared/db'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { getProductsService } from '../services/index.js'

type GetProductsRoute = {
  Reply: Product[]
}

export function getProductsRoute(fastify: FastifyInstance) {
  return async function (_req: FastifyRequest<GetProductsRoute>, reply: FastifyReply<GetProductsRoute>) {
    const products = await getProductsService(fastify)
    reply.status(200).send(products)
  }
}
