import { Product, productSchema } from '@shared/db'
import { FastifyInstance } from 'fastify'
import { getCacheData } from '../../../common/utils/index.js'

export async function getProductsService(fastify: FastifyInstance): Promise<Product[]> {
  // For simplicity, this service just returns all products without pagination or filtering.

  fastify.log.info('Fetching products with active promos')

  const cacheKey = 'products'

  const cachedProducts = await getCacheData(fastify, cacheKey, productSchema.array())

  if (cachedProducts) {
    return cachedProducts
  }

  const products = await fastify.db.query.productsTable.findMany({
    with: {
      productStock: true,
    },
  })

  await fastify.redis.set(cacheKey, JSON.stringify(products), 'EX', 10) // Cache for 10 seconds

  return products
}
