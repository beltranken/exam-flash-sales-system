import { type Channel } from 'amqplib'

import { OrderQueueNames, orderTimeoutTtlMs } from '@shared/order-events'

export async function assertOrderQueues(channel: Channel): Promise<void> {
  await channel.assertQueue(OrderQueueNames.reserved, { durable: true })
  await channel.assertQueue(OrderQueueNames.submitted, { durable: true })
  await channel.assertQueue(OrderQueueNames.failed, { durable: true })

  await channel.assertQueue(OrderQueueNames.timeoutDelay, {
    durable: true,
    arguments: {
      'x-message-ttl': orderTimeoutTtlMs,
      'x-dead-letter-exchange': '',
      'x-dead-letter-routing-key': OrderQueueNames.failed,
    },
  })
}
