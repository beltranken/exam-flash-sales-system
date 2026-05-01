import { cacheKeys } from '@shared/db'
import { getOrSetNumberCache } from '@utils'
import { FastifyInstance } from 'fastify'

export async function getProductStockService(fastify: FastifyInstance, productId: number): Promise<number> {
  const key = cacheKeys.stocksByProduct({ productId })
  const availableStock = await getOrSetNumberCache(fastify, key, async () => {
    const stock = await fastify.db.query.productStocksTable.findFirst({
      where: {
        productId,
      },
    })

    return stock?.availableQuantity ?? 0
  })

  return availableStock
}
