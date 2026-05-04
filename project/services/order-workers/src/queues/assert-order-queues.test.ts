import { OrderQueueNames, orderTimeoutTtlMs } from '@shared/order-contracts'
import { assertOrderQueues } from './assert-order-queues.js'

describe('assertOrderQueues', () => {
  it('asserts order queues with durable settings and timeout dead-letter configuration', async () => {
    const assertQueue = jest.fn().mockResolvedValue(undefined)
    const channel = { assertQueue } as any

    await assertOrderQueues(channel)

    expect(assertQueue).toHaveBeenCalledTimes(4)
    expect(assertQueue).toHaveBeenNthCalledWith(1, OrderQueueNames.reserved, { durable: true })
    expect(assertQueue).toHaveBeenNthCalledWith(2, OrderQueueNames.submitted, { durable: true })
    expect(assertQueue).toHaveBeenNthCalledWith(3, OrderQueueNames.failed, { durable: true })
    expect(assertQueue).toHaveBeenNthCalledWith(4, OrderQueueNames.timeoutDelay, {
      durable: true,
      arguments: {
        'x-message-ttl': orderTimeoutTtlMs,
        'x-dead-letter-exchange': '',
        'x-dead-letter-routing-key': OrderQueueNames.failed,
      },
    })
  })
})
