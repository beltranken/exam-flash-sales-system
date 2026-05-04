import { getProductService } from './get-product.service.js'

const product = {
  id: 10,
  name: 'Exam Voucher',
  description: 'A voucher',
  image: 'images/product.jpg',
  priceInCents: 1000,
  limitPerUser: 2,
  limitResetIntervalDays: 7,
  createdAt: new Date(),
  updatedAt: new Date(),
} as any

describe('getProductService', () => {
  it('returns product with signed image and skips stock lookup when requested', async () => {
    const fastify = {
      log: { info: jest.fn(), error: jest.fn() },
      redis: { get: jest.fn().mockResolvedValue(null), set: jest.fn(), del: jest.fn() },
      s3: { signUrl: jest.fn().mockResolvedValue('signed-url') },
      db: { query: { productsTable: { findFirst: jest.fn().mockResolvedValue(product) } } },
    } as any

    await expect(getProductService(fastify, 10, { includeStock: false })).resolves.toMatchObject({
      id: 10,
      image: 'signed-url',
      availableQuantity: Number.MAX_SAFE_INTEGER,
    })
    expect(fastify.redis.set).toHaveBeenCalledWith('product:10', JSON.stringify(product), 'EX', 10)
  })

  it('throws not found when product is missing', async () => {
    const fastify = {
      log: { info: jest.fn(), error: jest.fn() },
      redis: { get: jest.fn().mockResolvedValue(null), set: jest.fn(), del: jest.fn() },
      db: { query: { productsTable: { findFirst: jest.fn().mockResolvedValue(undefined) } } },
    } as any

    await expect(getProductService(fastify, 404, { includeStock: false })).rejects.toThrow('Product not found')
  })
})
