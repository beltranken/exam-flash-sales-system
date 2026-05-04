import { db } from '@db'
import { logger } from '@logger'
import { OrderReservedMessage } from '@shared/order-contracts'
import { handleOrderReserved } from './handle-order-reserved.handler.js'

jest.mock('@db', () => ({
  db: {
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

const message: OrderReservedMessage = {
  status: 'pending',
  orderId: '11111111-1111-4111-8111-111111111111',
  userId: 42,
  note: 'please hurry',
  items: [
    {
      productId: 10,
      quantity: 2,
      priceInCents: 1000,
      discountPercentage: 10,
      appliedPromoId: 20,
    },
  ],
}

function createReservedTx({ insertedOrder = true, updatedStocks = true } = {}) {
  const orderReturning = jest.fn().mockResolvedValue(insertedOrder ? [{ id: message.orderId }] : [])
  const onConflictDoNothing = jest.fn().mockReturnValue({ returning: orderReturning })
  const orderValues = jest.fn().mockReturnValue({ onConflictDoNothing })

  const itemValues = jest.fn().mockResolvedValue(undefined)

  const stockReturning = jest.fn().mockResolvedValue(updatedStocks ? [{ productId: 10 }] : [])
  const stockWhere = jest.fn().mockReturnValue({ returning: stockReturning })
  const stockSet = jest.fn().mockReturnValue({ where: stockWhere })

  const tx = {
    insert: jest
      .fn()
      .mockImplementationOnce(() => ({ values: orderValues }))
      .mockImplementationOnce(() => ({
        values: itemValues,
      })),
    update: jest.fn().mockReturnValue({ set: stockSet }),
  }

  return {
    tx,
    orderValues,
    itemValues,
    stockSet,
  }
}

describe('handleOrderReserved', () => {
  it('creates submitted order, order items, stock reservations, and publishes order.submitted', async () => {
    const { tx, orderValues, itemValues, stockSet } = createReservedTx()
    const publishOrderSubmitted = jest.fn().mockResolvedValue(undefined)
    ;(db.transaction as jest.Mock).mockImplementation(async (callback) => callback(tx))

    await handleOrderReserved(message, { publishOrderSubmitted })

    expect(orderValues).toHaveBeenCalledWith({
      id: message.orderId,
      userId: 42,
      status: 'submitted',
      note: 'please hurry',
    })
    expect(itemValues).toHaveBeenCalledWith([
      {
        orderId: message.orderId,
        productId: 10,
        quantity: 2,
        priceInCents: 1000,
        discountPercentage: 10,
        appliedPromoId: 20,
      },
    ])
    expect(stockSet).toHaveBeenCalled()
    expect(publishOrderSubmitted).toHaveBeenCalledWith({ orderId: message.orderId })
    expect(logger.info).toHaveBeenCalledWith({ orderId: message.orderId }, 'Order reserved successfully')
  })

  it('skips duplicate reserved messages without publishing submitted', async () => {
    const { tx, itemValues } = createReservedTx({ insertedOrder: false })
    const publishOrderSubmitted = jest.fn()
    ;(db.transaction as jest.Mock).mockImplementation(async (callback) => callback(tx))

    await handleOrderReserved(message, { publishOrderSubmitted })

    expect(itemValues).not.toHaveBeenCalled()
    expect(publishOrderSubmitted).not.toHaveBeenCalled()
    expect(logger.info).toHaveBeenCalledWith(
      { orderId: message.orderId },
      'Order already exists, skipping order.reserved message',
    )
  })

  it('throws when a product stock row cannot be reserved', async () => {
    const { tx } = createReservedTx({ updatedStocks: false })
    ;(db.transaction as jest.Mock).mockImplementation(async (callback) => callback(tx))

    await expect(handleOrderReserved(message, { publishOrderSubmitted: jest.fn() })).rejects.toThrow(
      'Product stock row not found for product 10',
    )
  })
})
