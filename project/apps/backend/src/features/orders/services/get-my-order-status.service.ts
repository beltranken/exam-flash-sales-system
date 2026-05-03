import { cacheKeys } from '@shared/cache-contracts'
import { Order, OrderStatus, User } from '@shared/db'
import { FastifyInstance } from 'fastify'
import createHttpError from 'http-errors'

export async function getMyOrderStatusService(
  fastify: FastifyInstance,
  userId: User['id'],
  orderId: Order['id'],
): Promise<OrderStatus> {
  const cacheKey = cacheKeys.order({ orderId })
  const stillExists = await fastify.redis.exists(cacheKey)

  if (stillExists) {
    return OrderStatus.PENDING
  }

  const order = await fastify.db.query.ordersTable.findFirst({
    where: {
      userId,
      id: orderId,
    },
  })

  if (!order) {
    throw new createHttpError.NotFound('Order not found')
  }

  return order.status
}
