import { getProductStockService } from './get-product-stock.service.js'

describe('getProductStockService', () => {
  it('returns cached stock when available', async () => {
    const findFirst = jest.fn()
    const fastify = {
      redis: { get: jest.fn().mockResolvedValue('8'), set: jest.fn(), del: jest.fn() },
      db: { query: { productStocksTable: { findFirst } } },
    } as any

    await expect(getProductStockService(fastify, 10)).resolves.toBe(8)
    expect(findFirst).not.toHaveBeenCalled()
  })

  it('loads stock from database and caches it when cache is empty', async () => {
    const findFirst = jest.fn().mockResolvedValue({ availableQuantity: 6 })
    const fastify = {
      redis: { get: jest.fn().mockResolvedValue(null), set: jest.fn(), del: jest.fn() },
      db: { query: { productStocksTable: { findFirst } } },
    } as any

    await expect(getProductStockService(fastify, 10)).resolves.toBe(6)
    expect(fastify.redis.set).toHaveBeenCalledWith('stocksByProduct:10', '6')
  })
})
