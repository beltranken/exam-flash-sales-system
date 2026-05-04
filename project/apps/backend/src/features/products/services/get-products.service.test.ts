import { getProductsService } from './get-products.service.js'

describe('getProductsService', () => {
  it('loads products, truncates long descriptions, signs images, and caches non-empty results', async () => {
    const longDescription = 'x'.repeat(60)
    const findMany = jest.fn().mockResolvedValue([
      {
        id: 10,
        name: 'Exam Voucher',
        description: longDescription,
        image: 'images/product.jpg',
        productStock: { availableQuantity: 4 },
        activePromos: [],
      },
    ])
    const fastify = {
      log: { info: jest.fn(), error: jest.fn() },
      redis: { get: jest.fn().mockResolvedValue(null), set: jest.fn(), del: jest.fn() },
      s3: { signUrl: jest.fn().mockResolvedValue('signed-url') },
      db: { query: { productsTable: { findMany } } },
    } as any

    const result = await getProductsService(fastify, { page: 2, pageSize: 5 })

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        offset: 5,
        limit: 5,
      }),
    )
    expect(result[0]).toMatchObject({
      id: 10,
      description: `${'x'.repeat(50)}...`,
      availableQuantity: 4,
      image: 'signed-url',
    })
    expect(fastify.redis.set).toHaveBeenCalledWith('products:2:5', expect.any(String), 'EX', 10)
  })
})
