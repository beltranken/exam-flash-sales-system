import { cacheKeys, Paging, Product, productSchema, PromoStatus } from '@shared/db'
import { getCacheData } from '@utils'
import { FastifyInstance } from 'fastify'

type GetProductsServiceParam = Partial<Paging>

export async function getProductsService(
  fastify: FastifyInstance,
  { page = 1, pageSize }: GetProductsServiceParam = {},
): Promise<Product[]> {
  // For simplicity, this service just returns all products without pagination or filtering.

  fastify.log.info('Fetching products')

  const cacheKey = cacheKeys.products({ page, pageSize })

  const cachedProducts = await getCacheData(fastify, cacheKey, productSchema.array())
  let products: Product[]

  const now = new Date()

  if (cachedProducts) {
    products = cachedProducts.map((product) => ({
      ...product,
      activePromos:
        product.activePromos?.filter((promo) => {
          const startDate = new Date(promo.startDate)
          const endDate = new Date(promo.endDate)
          return startDate <= now && endDate >= now
        }) || [],
    }))
  } else {
    const _products = await fastify.db.query.productsTable.findMany({
      with: {
        productStock: true,
        activePromos: {
          where: {
            status: PromoStatus.ACTIVE,
            startDate: { lte: now },
            endDate: { gte: now },
          },
        },
      },
    })

    products = _products.map(({ productStock, ...product }) => {
      let description = null

      if (product.description) {
        description = product.description.length > 50 ? product.description.slice(0, 50) + '...' : product.description
      }

      const availableQuantity = productStock?.availableQuantity ?? 0

      return { ...product, description, availableQuantity }
    })

    await fastify.redis.set(cacheKey, JSON.stringify(products), 'EX', 10) // Cache for 10 seconds
  }

  const promises = products.map(async (product) => {
    const signedImage = await fastify.s3.signUrl(product.image ?? '')

    return { ...product, image: signedImage }
  })

  const finalProducts = await Promise.all(promises)

  return finalProducts
}
