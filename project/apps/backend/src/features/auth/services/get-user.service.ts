import { FastifyInstance } from 'fastify'
import createHttpError from 'http-errors'

export async function getUser(fastify: FastifyInstance, userId: number) {
  const user = await fastify.db.query.usersTable.findFirst({
    where: {
      id: userId,
    },
  })

  if (!user) {
    throw new createHttpError.Unauthorized('User not found')
  }

  return user
}
