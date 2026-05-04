import { OrderStatus } from '@shared/db'
import { getMyOrderStatusService } from './get-my-order-status.service.js'

describe('getMyOrderStatusService', () => {
  it('returns pending while the temporary order cache exists', async () => {
    const findFirst = jest.fn()
    const fastify = {
      redis: { exists: jest.fn().mockResolvedValue(1) },
      db: { query: { ordersTable: { findFirst } } },
    } as any

    await expect(getMyOrderStatusService(fastify, 42, 'order-7')).resolves.toBe(OrderStatus.PENDING)
    expect(findFirst).not.toHaveBeenCalled()
  })

  it('returns persisted order status when no pending cache exists', async () => {
    const fastify = {
      redis: { exists: jest.fn().mockResolvedValue(0) },
      db: {
        query: {
          ordersTable: {
            findFirst: jest.fn().mockResolvedValue({ status: OrderStatus.SUBMITTED }),
          },
        },
      },
    } as any

    await expect(getMyOrderStatusService(fastify, 42, 'order-7')).resolves.toBe(OrderStatus.SUBMITTED)
  })

  it('throws not found when neither cache nor order exists', async () => {
    const fastify = {
      redis: { exists: jest.fn().mockResolvedValue(0) },
      db: { query: { ordersTable: { findFirst: jest.fn().mockResolvedValue(undefined) } } },
    } as any

    await expect(getMyOrderStatusService(fastify, 42, 'order-99')).rejects.toThrow('Order not found')
  })
})
