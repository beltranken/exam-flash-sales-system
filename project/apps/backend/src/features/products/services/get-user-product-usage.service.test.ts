import { getUserProductUsageService } from './get-user-product-usage.service.js'

const createDb = (result: unknown[]) => {
  const where = jest.fn().mockResolvedValue(result)
  const innerJoin = jest.fn().mockReturnThis()
  const from = jest.fn().mockReturnValue({ innerJoin, where })
  const select = jest.fn().mockReturnValue({ from })

  return { select, from, innerJoin, where }
}

describe('getUserProductUsageService', () => {
  it('returns cached usage when available', async () => {
    const db = createDb([{ usage: '3' }])
    const fastify = {
      redis: { get: jest.fn().mockResolvedValue('5'), set: jest.fn(), del: jest.fn() },
      db,
    } as any

    await expect(getUserProductUsageService(fastify, { userId: 42, productId: 10 })).resolves.toBe(5)
    expect(db.select).not.toHaveBeenCalled()
  })

  it('loads usage from database and caches it with product reset ttl', async () => {
    const db = createDb([{ usage: '3' }])
    const fastify = {
      redis: { get: jest.fn().mockResolvedValue(null), set: jest.fn(), del: jest.fn() },
      db,
    } as any

    await expect(
      getUserProductUsageService(fastify, { userId: 42, productId: 10, limitResetIntervalDays: 7 }),
    ).resolves.toBe(3)
    expect(fastify.redis.set).toHaveBeenCalledWith('userProductUsage:42:10', '3', 'EX', 604800)
  })
})
