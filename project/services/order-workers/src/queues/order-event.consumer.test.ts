import { logger } from '@logger'
import { OrderFailureReasons, OrderQueueNames } from '@shared/order-contracts'
import amqp from 'amqplib'
import { handleOrderFailed, handleOrderReserved, handleOrderSubmitted } from '../handlers/index.js'
import { assertOrderQueues } from './assert-order-queues.js'
import { OrderEventConsumer } from './order-event.consumer.js'

jest.mock('amqplib', () => ({
  __esModule: true,
  default: {
    connect: jest.fn(),
  },
}))

jest.mock('@logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}))

jest.mock('../handlers/index.js', () => ({
  handleOrderFailed: jest.fn(),
  handleOrderReserved: jest.fn(),
  handleOrderSubmitted: jest.fn(),
}))

jest.mock('./assert-order-queues.js', () => ({
  assertOrderQueues: jest.fn(),
}))

const orderId = '11111111-1111-4111-8111-111111111111'
const reservedMessage = {
  status: 'pending',
  orderId,
  userId: 42,
  items: [
    {
      productId: 10,
      quantity: 1,
      priceInCents: 1000,
      discountPercentage: 0,
    },
  ],
}

const createConsumeMessage = (payload: unknown) =>
  ({
    content: Buffer.from(typeof payload === 'string' ? payload : JSON.stringify(payload)),
  }) as any

function createChannel() {
  return {
    prefetch: jest.fn().mockResolvedValue(undefined),
    consume: jest.fn().mockResolvedValue(undefined),
    ack: jest.fn(),
    nack: jest.fn(),
    sendToQueue: jest.fn().mockReturnValue(true),
    close: jest.fn().mockResolvedValue(undefined),
  }
}

function getQueue(consumer: any, name: string) {
  return consumer.queues.find((item: { name: string }) => item.name === name)
}

describe('OrderEventConsumer', () => {
  beforeEach(() => {
    process.env.RABBITMQ_URL = 'amqp://localhost:5672'
    process.env.ORDER_QUEUE_PREFETCH = '7'
  })

  it('connects, asserts queues, and starts consumers for order queues', async () => {
    const channel = createChannel()
    const connection = {
      createChannel: jest.fn().mockResolvedValue(channel),
      close: jest.fn().mockResolvedValue(undefined),
    }
    ;(amqp.connect as jest.Mock).mockResolvedValue(connection)

    const consumer = new OrderEventConsumer()
    await consumer.start()

    expect(amqp.connect).toHaveBeenCalledWith('amqp://localhost:5672')
    expect(channel.prefetch).toHaveBeenCalledWith(10)
    expect(assertOrderQueues).toHaveBeenCalledWith(channel)
    expect(channel.consume).toHaveBeenCalledTimes(3)
    expect(channel.consume.mock.calls.map((call) => call[0])).toEqual([
      OrderQueueNames.reserved,
      OrderQueueNames.submitted,
      OrderQueueNames.failed,
    ])
    expect(channel.consume.mock.calls.every((call) => call[2].noAck === false)).toBe(true)

    await consumer.stop()

    expect(channel.close).toHaveBeenCalled()
    expect(connection.close).toHaveBeenCalled()
    expect(logger.info).toHaveBeenCalledWith('Order event consumer stopped')
  })

  it('acks a successfully processed reserved message and publishes submitted messages through handler deps', async () => {
    const channel = createChannel()
    const consumer = new OrderEventConsumer() as any
    consumer.channel = channel
    ;(handleOrderReserved as jest.Mock).mockImplementation(async (_message, deps) => {
      await deps.publishOrderSubmitted({ orderId })
    })
    const queue = getQueue(consumer, OrderQueueNames.reserved)
    const rawMessage = createConsumeMessage(reservedMessage)

    await consumer.handleMessage(queue, rawMessage)

    expect(handleOrderReserved).toHaveBeenCalledWith(expect.objectContaining({ orderId }), {
      publishOrderSubmitted: expect.any(Function),
    })
    expect(channel.sendToQueue).toHaveBeenCalledWith(
      OrderQueueNames.submitted,
      Buffer.from(JSON.stringify({ orderId })),
      {
        persistent: true,
        contentType: 'application/json',
      },
    )
    expect(channel.ack).toHaveBeenCalledWith(rawMessage)
    expect(channel.nack).not.toHaveBeenCalled()
  })

  it('acks validation failures after publishing order.failed', async () => {
    const channel = createChannel()
    const consumer = new OrderEventConsumer() as any
    consumer.channel = channel
    const queue = getQueue(consumer, OrderQueueNames.reserved)
    const rawMessage = createConsumeMessage({ orderId, status: 'pending' })

    await consumer.handleMessage(queue, rawMessage)

    expect(channel.sendToQueue).toHaveBeenCalledWith(
      OrderQueueNames.failed,
      Buffer.from(JSON.stringify({ orderId, reason: OrderFailureReasons.unknownMessageFormat })),
      {
        persistent: true,
        contentType: 'application/json',
      },
    )
    expect(channel.ack).toHaveBeenCalledWith(rawMessage)
    expect(channel.nack).not.toHaveBeenCalled()
  })

  it('publishes order.failed and acks when reserved handler throws for a valid reserved payload', async () => {
    const channel = createChannel()
    const consumer = new OrderEventConsumer() as any
    consumer.channel = channel
    ;(handleOrderReserved as jest.Mock).mockRejectedValue(new Error('database unavailable'))
    const queue = getQueue(consumer, OrderQueueNames.reserved)
    const rawMessage = createConsumeMessage(reservedMessage)

    await consumer.handleMessage(queue, rawMessage)

    expect(channel.sendToQueue).toHaveBeenCalledWith(
      OrderQueueNames.failed,
      Buffer.from(
        JSON.stringify({
          orderId,
          userId: 42,
          items: reservedMessage.items,
          reason: OrderFailureReasons.reservationFailed,
        }),
      ),
      {
        persistent: true,
        contentType: 'application/json',
      },
    )
    expect(channel.ack).toHaveBeenCalledWith(rawMessage)
  })

  it('nacks unknown processing errors when it cannot publish order.failed', async () => {
    const channel = createChannel()
    const consumer = new OrderEventConsumer() as any
    consumer.channel = channel
    ;(handleOrderSubmitted as jest.Mock).mockRejectedValue(new Error('boom'))
    const queue = getQueue(consumer, OrderQueueNames.submitted)
    const rawMessage = createConsumeMessage({ orderId })

    await consumer.handleMessage(queue, rawMessage)

    expect(channel.sendToQueue).not.toHaveBeenCalled()
    expect(channel.ack).not.toHaveBeenCalled()
    expect(channel.nack).toHaveBeenCalledWith(rawMessage, false, false)
  })

  it('returns without processing null messages or when channel is unavailable', async () => {
    const consumer = new OrderEventConsumer() as any
    const queue = getQueue(consumer, OrderQueueNames.failed)

    await consumer.handleMessage(queue, null)
    await consumer.handleMessage(queue, createConsumeMessage({ reason: 'failed' }))

    expect(handleOrderFailed).not.toHaveBeenCalled()
  })

  it('throws when publishing without an available channel', () => {
    const consumer = new OrderEventConsumer() as any

    expect(() => consumer.publishFailed({ orderId, reason: 'failed' })).toThrow('RabbitMQ channel is not available.')
    expect(() => consumer.publishSubmitted({ orderId })).toThrow('RabbitMQ channel is not available.')
  })

  it('logs when submitted publish hits RabbitMQ backpressure', () => {
    const channel = createChannel()
    channel.sendToQueue.mockReturnValue(false)
    const consumer = new OrderEventConsumer() as any
    consumer.channel = channel

    consumer.publishSubmitted({ orderId })

    expect(logger.warn).toHaveBeenCalledWith(
      { orderId },
      'RabbitMQ write buffer is full after publishing order.submitted',
    )
  })

  it('nacks malformed JSON messages', async () => {
    const channel = createChannel()
    const consumer = new OrderEventConsumer() as any
    consumer.channel = channel
    const queue = getQueue(consumer, OrderQueueNames.failed)
    const rawMessage = createConsumeMessage('{not-json')

    await consumer.handleMessage(queue, rawMessage)

    expect(channel.ack).not.toHaveBeenCalled()
    expect(channel.nack).toHaveBeenCalledWith(rawMessage, false, false)
  })
})
