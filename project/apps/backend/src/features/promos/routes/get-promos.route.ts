import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { getPromosService } from '../services/get-promos.service.js'

export function getPromosRoute(fastify: FastifyInstance) {
  return async function (_req: FastifyRequest, reply: FastifyReply) {
    const promos = await getPromosService(fastify)
    reply.status(200).send(promos)
  }
}
