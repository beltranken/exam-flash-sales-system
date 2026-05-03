import 'dotenv/config'

import amqp, { type Channel, type ChannelModel, type ConsumeMessage } from 'amqplib'

import { logger } from '@logger'
import {
  type OrderFailedMessage,
  orderFailedMessageSchema,
  OrderFailureReasons,
  OrderQueueNames,
  orderReservedMessageSchema,
  type OrderSubmittedMessage,
  orderSubmittedMessageSchema,
} from '@shared/order-contracts'
import { treeifyError, ZodError } from 'zod'
import { env } from '../config/env.js'
import { handleOrderFailed, handleOrderReserved, handleOrderSubmitted } from '../handlers/index.js'
import { OrderError } from '../types/order-error.js'
import { QueueConfig, RunnableQueueConfig } from '../types/queue-config.js'
import { assertOrderQueues } from './assert-order-queues.js'

const defineOrderQueue = <T>(config: QueueConfig<T>): RunnableQueueConfig => ({
  name: config.name,
  process: async (rawMessage) => {
    let message: T
    try {
      message = config.validate(rawMessage)
      await config.handler(message)
    } catch (e) {
      if (e instanceof ZodError && config.prepareValidationError) {
        logger.error(treeifyError(e))
        throw config.prepareValidationError(e, rawMessage)
      }

      throw e
    }
  },
})

const prepareOrderValidationError = (error: ZodError, message: unknown) => {
  return new OrderError({
    message: 'Invalid order.reserved message format',
    code: OrderFailureReasons.unknownMessageFormat,
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
      name: OrderQueueNames.reserved,
      prepareValidationError: prepareOrderValidationError,
      validate: (message) => orderReservedMessageSchema.parse(message),
      handler: (message) =>
        handleOrderReserved(message, {
          publishOrderSubmitted: (submittedMessage) => this.publishSubmitted(submittedMessage),
        }),
    }),
    defineOrderQueue({
      name: OrderQueueNames.submitted,
      prepareValidationError: prepareOrderValidationError,
      validate: (message) => orderSubmittedMessageSchema.parse(message),
      handler: (message) => handleOrderSubmitted(message),
    }),
    defineOrderQueue({
      name: OrderQueueNames.failed,
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

  private async handleMessage(queue: RunnableQueueConfig, message: ConsumeMessage | null): Promise<void> {
    if (!message || !this.channel) {
      return
    }

    let payload: unknown

    try {
      payload = JSON.parse(message.content.toString())
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
      } else if (queue.name === OrderQueueNames.reserved) {
        const reservedMessage = orderReservedMessageSchema.safeParse(payload)

        if (reservedMessage.success) {
          didPublishFailed = this.publishFailed({
            orderId: reservedMessage.data.orderId,
            userId: reservedMessage.data.userId,
            items: reservedMessage.data.items,
            reason: OrderFailureReasons.reservationFailed,
          })
        }
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

    return this.channel.sendToQueue(OrderQueueNames.failed, Buffer.from(JSON.stringify(message)), {
      persistent: true,
      contentType: 'application/json',
    })
  }

  private publishSubmitted(message: OrderSubmittedMessage): void {
    if (!this.channel) {
      throw new Error('RabbitMQ channel is not available.')
    }

    const didPublish = this.channel.sendToQueue(OrderQueueNames.submitted, Buffer.from(JSON.stringify(message)), {
      persistent: true,
      contentType: 'application/json',
    })

    if (!didPublish) {
      logger.warn({ orderId: message.orderId }, 'RabbitMQ write buffer is full after publishing order.submitted')
    }
  }
}
