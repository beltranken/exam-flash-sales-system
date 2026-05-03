import { and, cacheKeys, eq, not, orderItemsTable, ordersTable, OrderStatus, sum } from '@shared/db'
import { PromoUsage } from '@types'
import { getOrSetNumberCache } from '@utils'
import { FastifyInstance } from 'fastify/types/instance.js'

export async function getUserPromoUsageService(fastify: FastifyInstance, param: PromoUsage): Promise<number> {
  const cacheKey = cacheKeys.userPromoUsage(param)

  const usage = await getOrSetNumberCache(fastify, cacheKey, async () => {
    const result = await fastify.db
      .select({ usage: sum(orderItemsTable.quantity) })
      .from(ordersTable)
      .innerJoin(orderItemsTable, eq(ordersTable.id, orderItemsTable.orderId))
      .where(
        and(
          not(eq(ordersTable.status, OrderStatus.CANCELLED)),
          eq(ordersTable.userId, param.userId),
          eq(orderItemsTable.productId, param.productId),
          eq(orderItemsTable.appliedPromoId, param.promoId),
        ),
      )

    const usage = Number(result.at(0)?.usage)

    return Number.isFinite(usage) ? usage : 0
  })

  return usage
}
