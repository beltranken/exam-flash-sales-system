import { usersTable } from '@shared/db'
import { FastifyInstance } from 'fastify'
import createHttpError from 'http-errors'

export async function resolveUserService(fastify: FastifyInstance, email: string) {
  const existingUser = await fastify.db.query.usersTable.findFirst({
    where: {
      email,
    },
  })

  if (existingUser) {
    return existingUser
  }

  const [newUser] = await fastify.db
    .insert(usersTable)
    .values({
      email,
    })
    .returning()

  if (!newUser) {
    throw new createHttpError.Conflict('Unable to create new user')
  }

  return newUser
}
