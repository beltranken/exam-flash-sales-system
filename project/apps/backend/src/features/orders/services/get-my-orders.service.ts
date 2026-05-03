import { Order } from '@shared/db'
import { FastifyInstance } from 'fastify'

export async function getMyOrdersService(fastify: FastifyInstance, userId: number): Promise<Order[]> {
  const orders = await fastify.db.query.ordersTable.findMany({
    where: {
      userId,
    },
    with: {
      orderItems: true,
    },
  })

  return orders.map((order) => ({
    ...order,
    totalAmountInCents: Math.floor(
      order.orderItems.reduce(
        (sum, item) => sum + item.priceInCents * item.quantity * (1 - item.discountPercentage / 100),
        0,
      ),
    ),
  }))
}
