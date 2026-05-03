import 'dotenv/config'

import amqp, { type Channel, type ChannelModel, type ConsumeMessage } from 'amqplib'

import { logger } from '@logger'
import {
  OrderFailedMessage,
  orderFailedMessageSchema,
  orderFailureReasons,
  orderReservedMessageSchema,
  orderSubmittedMessageSchema,
} from '@shared/order-contracts'
import { ZodError } from 'zod'
import { env } from '../config/env.js'
import { handleOrderFailed, handleOrderReserved, handleOrderSubmitted } from '../handlers/index.js'
import { OrderQueueConfig, RunnableOrderQueueConfig } from '../types/order-config.js'
import { OrderError } from '../types/order-error.js'
import { assertOrderQueues } from './assert-order-queues.js'
import { orderQueueNames } from './order-queue-names.js'

const defineOrderQueue = <T>(config: OrderQueueConfig<T>): RunnableOrderQueueConfig => ({
  name: config.name,
  process: async (rawMessage) => {
    let message: T
    try {
      message = config.validate(rawMessage)
      await config.handler(message)
    } catch (e) {
      if (e instanceof ZodError && config.prepareValidationError) {
        throw config.prepareValidationError(e, rawMessage)
      }

      throw e
    }
  },
})

const prepareOrderValidationError = (error: ZodError, message: unknown) => {
  return new OrderError({
    message: 'Invalid order.reserved message format',
    code: orderFailureReasons.unknownMessageFormat,
    cause: error,
    orderId:
      typeof message === 'object' && message && 'orderId' in message && typeof message.orderId === 'string'
        ? message.orderId
        : undefined,
  })
}

export class OrderEventConsumer {
  private connection?: ChannelModel
  private channel?: Channel

  private readonly queues = [
    defineOrderQueue({
      name: orderQueueNames.reserved,
      prepareValidationError: prepareOrderValidationError,
      validate: (message) => orderReservedMessageSchema.parse(message),
      handler: (message) => handleOrderReserved(message),
    }),
    defineOrderQueue({
      name: orderQueueNames.submitted,
      prepareValidationError: prepareOrderValidationError,
      validate: (message) => orderSubmittedMessageSchema.parse(message),
      handler: (message) => handleOrderSubmitted(message),
    }),
    defineOrderQueue({
      name: orderQueueNames.failed,
      prepareValidationError: prepareOrderValidationError,
      validate: (message) => orderFailedMessageSchema.parse(message),
      handler: (message) => handleOrderFailed(message),
    }),
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

  private async handleMessage(queue: RunnableOrderQueueConfig, message: ConsumeMessage | null): Promise<void> {
    if (!message || !this.channel) {
      return
    }

    try {
      const payload = JSON.parse(message.content.toString())
      await queue.process(payload)
      this.channel.ack(message)
    } catch (error) {
      logger.error(
        {
          error,
          queue: queue.name,
        },
        'Failed to process order event message',
      )
      let didPublishFailed = false

      if (error instanceof OrderError) {
        didPublishFailed = this.publishFailed({
          orderId: error.orderId,
          reason: error.code,
        })
      }

      if (didPublishFailed) {
        this.channel.ack(message)
      } else {
        logger.info('Unknown error handling message, sending to dead letter queue')
        this.channel.nack(message, false, false)
      }
    }
  }

  private publishFailed(message: OrderFailedMessage): boolean {
    if (!this.channel) {
      throw new Error('RabbitMQ channel is not available.')
    }

    return this.channel.sendToQueue(orderQueueNames.failed, Buffer.from(JSON.stringify(message)), {
      persistent: true,
      contentType: 'application/json',
    })
  }
}
