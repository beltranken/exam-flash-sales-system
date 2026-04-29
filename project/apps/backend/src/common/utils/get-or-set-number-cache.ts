import { FastifyInstance } from 'fastify'

type NumberLoader = () => Promise<number>

export async function getOrSetNumberCache(
  fastify: FastifyInstance,
  cacheKey: string,
  loadValue: NumberLoader,
): Promise<number> {
  const cachedValue = await fastify.redis.get(cacheKey)

  if (cachedValue !== null) {
    const parsedValue = Number(cachedValue)

    if (Number.isFinite(parsedValue)) {
      return parsedValue
    }

    await fastify.redis.del(cacheKey)
  }

  const value = await loadValue()
  await fastify.redis.set(cacheKey, String(value))

  return value
}
