import { redis } from '@cache'
import { db } from '@db'
import { logger } from '@logger'
import { OrderStatus } from '@shared/db'
import { handleOrderFailed } from './handle-order-failed.handler.js'

jest.mock('@cache', () => ({
  redis: {
    eval: jest.fn(),
  },
}))

jest.mock('@db', () => ({
  db: {
    query: {
      ordersTable: {
        findFirst: jest.fn(),
      },
    },
    transaction: jest.fn(),
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
const item = {
  productId: 10,
  quantity: 2,
  priceInCents: 1000,
  discountPercentage: 0,
}

function createFailedTx({ cancelledOrder = true, stockTransaction = true } = {}) {
  const updateOrderReturning = jest.fn().mockResolvedValue(cancelledOrder ? [{ id: orderId }] : [])
  const updateOrderWhere = jest.fn().mockReturnValue({ returning: updateOrderReturning })
  const updateOrderSet = jest.fn().mockReturnValue({ where: updateOrderWhere })

  const insertTransactionReturning = jest.fn().mockResolvedValue(stockTransaction ? [{ id: 99 }] : [])
  const insertTransactionValues = jest.fn().mockReturnValue({ returning: insertTransactionReturning })

  const updateStockWhere = jest.fn().mockResolvedValue(undefined)
  const updateStockSet = jest.fn().mockReturnValue({ where: updateStockWhere })

  const tx = {
    update: jest
      .fn()
      .mockImplementationOnce(() => ({ set: updateOrderSet }))
      .mockImplementationOnce(() => ({
        set: updateStockSet,
      })),
    insert: jest.fn().mockReturnValue({ values: insertTransactionValues }),
  }

  return {
    tx,
    updateOrderSet,
    insertTransactionValues,
    updateStockSet,
  }
}

describe('handleOrderFailed', () => {
  it('restores Redis reservation, cancels pending order, and restores stock', async () => {
    const { tx, updateOrderSet, insertTransactionValues, updateStockSet } = createFailedTx()
    ;(db.query.ordersTable.findFirst as jest.Mock).mockResolvedValue({
      id: orderId,
      userId: 42,
      status: OrderStatus.PENDING,
      orderItems: [item],
    })
    ;(db.transaction as jest.Mock).mockImplementation(async (callback) => callback(tx))

    await handleOrderFailed({ orderId, reason: 'payment failed' })

    expect(redis.eval).toHaveBeenCalledWith(
      'rollback-cart-reservations-script',
      0,
      '1',
      'stocksByProduct:10',
      'userProductUsage:42:10',
      '',
      '2',
      '0',
      '0',
      '0',
    )
    expect(updateOrderSet).toHaveBeenCalledWith({ status: OrderStatus.CANCELLED })
    expect(insertTransactionValues).toHaveBeenCalledWith({
      referenceId: orderId,
      type: 'reserve_cancel',
      note: 'payment failed',
    })
    expect(updateStockSet).toHaveBeenCalled()
    expect(logger.info).toHaveBeenCalledWith({ orderId }, 'Order failure compensation completed')
  })

  it('restores Redis only when order is missing but message has items and user id', async () => {
    ;(db.query.ordersTable.findFirst as jest.Mock).mockResolvedValue(undefined)

    await handleOrderFailed({ orderId, reason: 'timeout', userId: 42, items: [item] })

    expect(redis.eval).toHaveBeenCalled()
    expect(db.transaction).not.toHaveBeenCalled()
    expect(logger.warn).toHaveBeenCalledWith({ orderId }, 'Order not found; restored Redis reservation only')
  })

  it('skips compensation for non-pending orders', async () => {
    ;(db.query.ordersTable.findFirst as jest.Mock).mockResolvedValue({
      id: orderId,
      userId: 42,
      status: OrderStatus.SUBMITTED,
      orderItems: [item],
    })

    await handleOrderFailed({ orderId, reason: 'late failure' })

    expect(redis.eval).not.toHaveBeenCalled()
    expect(db.transaction).not.toHaveBeenCalled()
    expect(logger.info).toHaveBeenCalledWith(
      { orderId, status: OrderStatus.SUBMITTED },
      'Order is not pending; skipping order failure compensation',
    )
  })

  it('warns when there are no items to compensate', async () => {
    ;(db.query.ordersTable.findFirst as jest.Mock).mockResolvedValue({
      id: orderId,
      userId: 42,
      status: OrderStatus.PENDING,
      orderItems: [],
    })

    await handleOrderFailed({ orderId, reason: 'empty order' })

    expect(redis.eval).not.toHaveBeenCalled()
    expect(logger.warn).toHaveBeenCalledWith({ orderId }, 'No order items found for order.failed message')
  })

  it('throws when stock transaction creation fails', async () => {
    const { tx } = createFailedTx({ stockTransaction: false })
    ;(db.query.ordersTable.findFirst as jest.Mock).mockResolvedValue({
      id: orderId,
      userId: 42,
      status: OrderStatus.PENDING,
      orderItems: [item],
    })
    ;(db.transaction as jest.Mock).mockImplementation(async (callback) => callback(tx))

    await expect(handleOrderFailed({ orderId, reason: 'failed transaction' })).rejects.toThrow(
      'Failed to create stock reservation cancellation transaction',
    )
  })
})
