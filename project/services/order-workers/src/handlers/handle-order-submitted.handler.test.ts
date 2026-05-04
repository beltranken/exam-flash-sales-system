import { redis } from '@cache'
import { db } from '@db'
import { logger } from '@logger'
import { OrderStatus } from '@shared/db'
import { handleOrderSubmitted } from './handle-order-submitted.handler.js'

jest.mock('@cache', () => ({
  redis: {
    del: jest.fn(),
  },
}))

jest.mock('@db', () => ({
  db: {
    query: {
      ordersTable: {
        findFirst: jest.fn(),
      },
    },
  },
}))

jest.mock('@logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}))

const orderId = '11111111-1111-4111-8111-111111111111'

describe('handleOrderSubmitted', () => {
  it('clears order reservation cache when order is submitted', async () => {
    ;(db.query.ordersTable.findFirst as jest.Mock).mockResolvedValue({
      id: orderId,
      status: OrderStatus.SUBMITTED,
      orderItems: [],
    })

    await handleOrderSubmitted({ orderId })

    expect(redis.del).toHaveBeenCalledWith(`order:${orderId}`)
    expect(logger.info).toHaveBeenCalledWith({ orderId }, 'Order is already submitted, cleared reservation cache')
  })

  it('warns and skips cache cleanup when order is missing', async () => {
    ;(db.query.ordersTable.findFirst as jest.Mock).mockResolvedValue(undefined)

    await handleOrderSubmitted({ orderId })

    expect(redis.del).not.toHaveBeenCalled()
    expect(logger.warn).toHaveBeenCalledWith({ orderId }, 'Order not found for order.submitted message')
  })

  it('warns when order is not submitted', async () => {
    ;(db.query.ordersTable.findFirst as jest.Mock).mockResolvedValue({
      id: orderId,
      status: OrderStatus.CANCELLED,
      orderItems: [],
    })

    await handleOrderSubmitted({ orderId })

    expect(redis.del).not.toHaveBeenCalled()
    expect(logger.warn).toHaveBeenCalledWith(
      { orderId },
      'This should not happen: order.submitted message received but order is not in SUBMITTED status',
    )
  })
})
