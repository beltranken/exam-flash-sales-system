import { Product, productSchema } from '@shared/db'
import { FastifyInstance } from 'fastify'
import { getCacheData } from '../../../common/utils/index.js'

export async function getProductsService(fastify: FastifyInstance): Promise<Product[]> {
  // For simplicity, this service just returns all products without pagination or filtering.

  fastify.log.info('Fetching products')

  const cacheKey = 'products'

  const cachedProducts = await getCacheData(fastify, cacheKey, productSchema.array())
  let products: Product[]

  if (cachedProducts) {
    products = cachedProducts
  } else {
    const _products = await fastify.db.query.productsTable.findMany({
      with: {
        productStock: true,
      },
    })

    const promises = _products.map(async (product) => {
      const signedImage = await fastify.s3.signUrl(product.image ?? '')

      let description = null

      if (product.description) {
        description = product.description.length > 50 ? product.description.slice(0, 50) + '...' : product.description
      }

      return { ...product, description, image: signedImage }
    })

    products = await Promise.all(promises)

    await fastify.redis.set(cacheKey, JSON.stringify(products), 'EX', 10) // Cache for 10 seconds
  }

  return products
}
