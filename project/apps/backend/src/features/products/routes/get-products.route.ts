import { PagingRequest, Product } from '@shared/db'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { getProductsService } from '../services/index.js'

export type GetProductsRoute = {
  Querystring: PagingRequest
  Reply: Product[]
}

export function getProductsRoute(fastify: FastifyInstance) {
  return async function (req: FastifyRequest<GetProductsRoute>, reply: FastifyReply<GetProductsRoute>) {
    const products = await getProductsService(fastify, {
      page: req.query.page,
      pageSize: req.query.pageSize,
    })
    reply.status(200).send(products)
  }
}
