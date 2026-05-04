import { getUserPromoUsageService } from './get-user-promo-usage.service.js'

const createDb = (result: unknown[]) => {
  const where = jest.fn().mockResolvedValue(result)
  const innerJoin = jest.fn().mockReturnThis()
  const from = jest.fn().mockReturnValue({ innerJoin, where })
  const select = jest.fn().mockReturnValue({ from })

  return { select, from, innerJoin, where }
}

describe('getUserPromoUsageService', () => {
  it('returns cached promo usage when available', async () => {
    const db = createDb([{ usage: '2' }])
    const fastify = {
      redis: { get: jest.fn().mockResolvedValue('4'), set: jest.fn(), del: jest.fn() },
      db,
    } as any

    await expect(getUserPromoUsageService(fastify, { userId: 42, productId: 10, promoId: 20 })).resolves.toBe(4)
    expect(db.select).not.toHaveBeenCalled()
  })

  it('loads promo usage from database and caches it', async () => {
    const db = createDb([{ usage: '2' }])
    const fastify = {
      redis: { get: jest.fn().mockResolvedValue(null), set: jest.fn(), del: jest.fn() },
      db,
    } as any

    await expect(getUserPromoUsageService(fastify, { userId: 42, productId: 10, promoId: 20 })).resolves.toBe(2)
    expect(fastify.redis.set).toHaveBeenCalledWith('userPromoUsage:20:42:10', '2')
  })
})
