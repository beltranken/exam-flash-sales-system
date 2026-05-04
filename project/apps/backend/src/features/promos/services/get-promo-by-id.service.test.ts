import { getPromoByIdService } from './get-promo-by-id.service.js'

describe('getPromoByIdService', () => {
  it('returns active promo by id with promo items', async () => {
    const promo = { id: 20, promoItems: [{ productId: 10 }] }
    const findFirst = jest.fn().mockResolvedValue(promo)
    const fastify = { db: { query: { promosTable: { findFirst } } } } as any

    await expect(getPromoByIdService(fastify, 20)).resolves.toBe(promo)
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 20 }),
        with: { promoItems: true },
      }),
    )
  })

  it('throws not found when active promo is missing', async () => {
    const fastify = {
      db: { query: { promosTable: { findFirst: jest.fn().mockResolvedValue(undefined) } } },
    } as any

    await expect(getPromoByIdService(fastify, 99)).rejects.toThrow('Promo with id 99 not found')
  })
})
