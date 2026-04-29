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

  return orders
}
