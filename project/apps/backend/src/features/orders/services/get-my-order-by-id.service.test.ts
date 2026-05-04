import { getMyOrderByIdService } from './get-my-order-by-id.service.js'

describe('getMyOrderByIdService', () => {
  it('returns a user order with computed total amount', async () => {
    const order = {
      id: 7,
      orderItems: [
        { priceInCents: 1000, quantity: 2, discountPercentage: 10 },
        { priceInCents: 500, quantity: 1, discountPercentage: 0 },
      ],
    }
    const findFirst = jest.fn().mockResolvedValue(order)
    const fastify = { db: { query: { ordersTable: { findFirst } } } } as any

    await expect(getMyOrderByIdService(fastify, 42, 'order-7')).resolves.toMatchObject({
      id: 7,
      totalAmountInCents: 2300,
    })
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 42, id: 'order-7' },
      }),
    )
  })

  it('throws not found when the order is missing', async () => {
    const fastify = {
      db: { query: { ordersTable: { findFirst: jest.fn().mockResolvedValue(undefined) } } },
    } as any

    await expect(getMyOrderByIdService(fastify, 42, 'order-99')).rejects.toThrow('Order not found')
  })
})
