import amqp, { type Channel, type ChannelModel, type ConsumeMessage } from 'amqplib'

import { env } from '../config/env.js'
import { processOrder, type OrderMessage } from '../handlers/process-order.handler.js'
import { logger } from '../logger.js'

export class OrderConsumer {
  private connection?: ChannelModel
  private channel?: Channel

  async start(): Promise<void> {
    this.connection = await amqp.connect(env.rabbitMqUrl)
    this.channel = await this.connection.createChannel()

    await this.channel.assertQueue(env.orderQueueName, { durable: true })
    await this.channel.prefetch(env.orderQueuePrefetch)

    await this.channel.consume(env.orderQueueName, this.handleMessage.bind(this), {
      noAck: false,
    })

    logger.info(
      {
        queue: env.orderQueueName,
        prefetch: env.orderQueuePrefetch,
      },
      'Order consumer is listening',
    )
  }

  async stop(): Promise<void> {
    await this.channel?.close()
    await this.connection?.close()
    logger.info('Order consumer stopped')
  }

  private async handleMessage(message: ConsumeMessage | null): Promise<void> {
    if (!message || !this.channel) {
      return
    }

    try {
      const order = JSON.parse(message.content.toString()) as OrderMessage
      await processOrder(order)
      this.channel.ack(message)
    } catch (error) {
      logger.error({ error }, 'Failed to process order message')
      this.channel.nack(message, false, false)
    }
  }
}
