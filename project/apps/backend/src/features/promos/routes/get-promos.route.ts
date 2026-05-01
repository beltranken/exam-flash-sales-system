import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

export function getPromosRoute(fastify: FastifyInstance) {
  return async function (_req: FastifyRequest, reply: FastifyReply) {
    const promos = await fastify.db.query.promosTable.findMany()
    reply.status(200).send(promos)
  }
}
