import amqp, { type Channel, type ChannelModel, type ConsumeMessage } from 'amqplib'

import { env } from '../config/env.js'
import { handleOrderFailed, handleOrderReserved, handleOrderSubmitted } from '../handlers/index.js'
import { logger } from '../logger.js'
import { type OrderMessage } from '../types/order-message.js'
import { assertOrderQueues } from './assert-order-queues.js'
import { orderQueueNames } from './order-queue-names.js'

type OrderQueueConfig = {
  name: string
  handler: (message: OrderMessage) => Promise<void>
}

export class OrderEventConsumer {
  private connection?: ChannelModel
  private channel?: Channel

  private readonly queues: OrderQueueConfig[] = [
    {
      name: orderQueueNames.reserved,
      handler: handleOrderReserved,
    },
    {
      name: orderQueueNames.submitted,
      handler: handleOrderSubmitted,
    },
    {
      name: orderQueueNames.failed,
      handler: handleOrderFailed,
    },
  ]

  async start(): Promise<void> {
    this.connection = await amqp.connect(env.rabbitMqUrl)
    this.channel = await this.connection.createChannel()

    await this.channel.prefetch(env.orderQueuePrefetch)
    await assertOrderQueues(this.channel)

    for (const queue of this.queues) {
      await this.channel.consume(queue.name, (message) => this.handleMessage(queue, message), {
        noAck: false,
      })
    }

    logger.info(
      {
        queues: this.queues.map((queue) => queue.name),
        prefetch: env.orderQueuePrefetch,
      },
      'Order event consumer is listening',
    )
  }

  async stop(): Promise<void> {
    await this.channel?.close()
    await this.connection?.close()
    logger.info('Order event consumer stopped')
  }

  private async handleMessage(queue: OrderQueueConfig, message: ConsumeMessage | null): Promise<void> {
    if (!message || !this.channel) {
      return
    }

    try {
      const payload = JSON.parse(message.content.toString()) as OrderMessage
      await queue.handler(payload)
      this.channel.ack(message)
    } catch (error) {
      logger.error(
        {
          error,
          queue: queue.name,
        },
        'Failed to process order event message',
      )
      this.channel.nack(message, false, false)
    }
  }
}
