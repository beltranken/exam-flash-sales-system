import { FastifyInstance } from 'fastify'
import z from 'zod/v4'

export async function getCacheData<TSchema extends z.ZodTypeAny>(
  fastify: FastifyInstance,
  cacheKey: string,
  schema: TSchema,
): Promise<z.infer<TSchema> | null> {
  const cachedValue = await fastify.redis.get(cacheKey)

  if (!cachedValue) {
    return null
  }

  try {
    return schema.parse(JSON.parse(cachedValue))
  } catch (error) {
    fastify.log.error({ error, cacheKey }, 'Failed to parse cached data')
    await fastify.redis.del(cacheKey)
    return null
  }
}
