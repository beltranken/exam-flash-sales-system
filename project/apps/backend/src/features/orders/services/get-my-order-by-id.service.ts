import { Order, User } from '@shared/db'
import { FastifyInstance } from 'fastify'
import createHttpError from 'http-errors'

export async function getMyOrderByIdService(
  fastify: FastifyInstance,
  userId: User['id'],
  orderId: Order['id'],
): Promise<Order> {
  const order = await fastify.db.query.ordersTable.findFirst({
    where: {
      userId,
      id: orderId,
    },
    with: {
      orderItems: true,
    },
  })

  if (!order) {
    throw new createHttpError.NotFound('Order not found')
  }

  return order
}
