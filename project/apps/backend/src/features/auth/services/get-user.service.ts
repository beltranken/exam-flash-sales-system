import { cacheKeys } from '@shared/cache-contracts'
import { userSchema } from '@shared/db'
import { getCacheData } from '@utils'
import { FastifyInstance } from 'fastify'
import createHttpError from 'http-errors'

export async function getUser(fastify: FastifyInstance, userId: number) {
  const cacheKey = cacheKeys.user({ userId })

  const cachedUser = await getCacheData(fastify, cacheKey, userSchema)
  if (cachedUser) {
    return cachedUser
  }

  const user = await fastify.db.query.usersTable.findFirst({
    where: {
      id: userId,
    },
  })

  if (!user) {
    throw new createHttpError.Unauthorized('User not found')
  }

  await fastify.redis.set(cacheKey, JSON.stringify(user), 'EX', 60)

  return user
}
