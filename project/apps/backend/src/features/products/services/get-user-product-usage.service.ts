import {
  and,
  cacheKeys,
  eq,
  gte,
  not,
  orderItemsTable,
  ordersTable,
  OrderStatus,
  productsTable,
  sql,
  sum,
} from '@shared/db'
import { PromoUsage } from '@types'
import { getOrSetNumberCache } from '@utils'
import { FastifyInstance } from 'fastify/types/instance.js'

export function getUserProductUsageService(
  fastify: FastifyInstance,
  param: Omit<PromoUsage, 'promoId'>,
): Promise<number> {
  const cacheKey = cacheKeys.userProductUsage(param)

  const usage = getOrSetNumberCache(fastify, cacheKey, async () => {
    const result = await fastify.db
      .select({ usage: sum(orderItemsTable.quantity) })
      .from(ordersTable)
      .innerJoin(orderItemsTable, eq(ordersTable.id, orderItemsTable.orderId))
      .innerJoin(productsTable, eq(orderItemsTable.productId, productsTable.id))
      .where(
        and(
          not(eq(ordersTable.status, OrderStatus.CANCELLED)),
          eq(ordersTable.userId, param.userId),
          eq(orderItemsTable.productId, param.productId),
          gte(
            orderItemsTable.createdAt,
            sql<Date>`now() - (${productsTable.limitResetIntervalDays} * interval '1 day')`,
          ),
        ),
      )

    const usage = Number(result.at(0)?.usage)

    return Number.isFinite(usage) ? usage : 0
  })

  return usage
}
