import { getMyOrdersService } from './get-my-orders.service.js'

describe('getMyOrdersService', () => {
  it('returns current user orders with computed totals', async () => {
    const orders = [
      {
        id: 1,
        orderItems: [{ priceInCents: 1000, quantity: 2, discountPercentage: 25 }],
      },
      {
        id: 2,
        orderItems: [{ priceInCents: 500, quantity: 3, discountPercentage: 0 }],
      },
    ]
    const findMany = jest.fn().mockResolvedValue(orders)
    const fastify = { db: { query: { ordersTable: { findMany } } } } as any

    await expect(getMyOrdersService(fastify, 42)).resolves.toEqual([
      expect.objectContaining({ id: 1, totalAmountInCents: 1500 }),
      expect.objectContaining({ id: 2, totalAmountInCents: 1500 }),
    ])
    expect(findMany).toHaveBeenCalledWith({
      where: { userId: 42 },
      with: { orderItems: true },
    })
  })
})
