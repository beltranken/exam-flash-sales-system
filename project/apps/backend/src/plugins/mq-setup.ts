import { MakePaymentRequest } from '@shared/db'
import {
  OrderId,
  OrderQueueNames,
  orderTimeoutTtlMs,
  PaymentQueueNames,
  paymentTimeoutTtlMs,
  type OrderFailedMessage,
  type OrderReservedMessage,
  type OrderSubmittedMessage,
} from '@shared/order-contracts'
import type { AmqpConnectionManager, ChannelWrapper, Options } from 'amqp-connection-manager'
import amqp from 'amqp-connection-manager'
import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

type BrokerMessage = Buffer | Record<string, unknown> | string

export type PublishToQueueArgs = {
  queue: string
  message: BrokerMessage
  queueOptions?: Options.AssertQueue
  options?: Options.Publish
  durable?: boolean
}

type PublishOrderEventOptions = {
  options?: Options.Publish
  durable?: boolean
}

const toBuffer = (message: BrokerMessage) => {
  if (Buffer.isBuffer(message)) {
    return message
  }

  if (typeof message === 'string') {
    return Buffer.from(message)
  }

  return Buffer.from(JSON.stringify(message))
}

export const mqPluginName = 'mq-plugin'

const mqPluginImpl: FastifyPluginAsync = async (fastify) => {
  let connection: AmqpConnectionManager | undefined
  let channel: ChannelWrapper | undefined

  const publishToQueue = async ({ queue, message, queueOptions, options, durable = true }: PublishToQueueArgs) => {
    if (!fastify.config.RABBITMQ_URL) {
      throw new Error('RABBITMQ_URL is required to publish messages.')
    }

    if (!connection) {
      connection = await amqp.connect(fastify.config.RABBITMQ_URL)
      channel = await connection.createChannel()
    }

    if (!channel) {
      throw new Error('RabbitMQ channel is not available.')
    }

    await channel.assertQueue(queue, queueOptions ?? { durable })

    const content = toBuffer(message)
    const didBuffer = await channel.sendToQueue(queue, content, {
      persistent: true,
      contentType: Buffer.isBuffer(message) ? undefined : 'application/json',
      ...options,
    })

    if (!didBuffer) {
      await new Promise<void>((resolve) => {
        channel?.once('drain', () => resolve())
      })
    }
  }

  const publishOrderReserved = (message: OrderReservedMessage, options?: PublishOrderEventOptions) =>
    publishToQueue({
      queue: OrderQueueNames.reserved,
      message,
      ...options,
    })

  const publishOrderSubmitted = (message: OrderSubmittedMessage, options?: PublishOrderEventOptions) =>
    publishToQueue({
      queue: OrderQueueNames.submitted,
      message,
      ...options,
    })

  const publishOrderFailed = (message: OrderFailedMessage, options?: PublishOrderEventOptions) =>
    publishToQueue({
      queue: OrderQueueNames.failed,
      message,
      ...options,
    })

  const publishOrderTimeout = (orderId: OrderId, options?: PublishOrderEventOptions) =>
    publishToQueue({
      queue: OrderQueueNames.timeoutDelay,
      message: {
        orderId,
      },
      queueOptions: {
        durable: true,
        arguments: {
          'x-message-ttl': orderTimeoutTtlMs,
          'x-dead-letter-exchange': '',
          'x-dead-letter-routing-key': OrderQueueNames.failed,
        },
      },
      ...options,
    })

  const publishPaymentMade = (message: MakePaymentRequest, options?: PublishOrderEventOptions) =>
    publishToQueue({
      queue: PaymentQueueNames.made,
      message,
      ...options,
    })

  const publishPaymentFailed = (message: MakePaymentRequest, options?: PublishOrderEventOptions) =>
    publishToQueue({
      queue: PaymentQueueNames.failed,
      message,
      ...options,
    })

  const publishPaymentConfirmed = (message: MakePaymentRequest, options?: PublishOrderEventOptions) =>
    publishToQueue({
      queue: PaymentQueueNames.confirmed,
      message,
      ...options,
    })

  const publishPaymentTimeout = (orderId: OrderId, options?: PublishOrderEventOptions) =>
    publishToQueue({
      queue: PaymentQueueNames.timeoutDelay,
      message: {
        orderId,
      },
      queueOptions: {
        durable: true,
        arguments: {
          'x-message-ttl': paymentTimeoutTtlMs,
          'x-dead-letter-exchange': '',
          'x-dead-letter-routing-key': PaymentQueueNames.failed,
        },
      },
      ...options,
    })

  fastify.decorate('mq', {
    publishToQueue,
    publishOrderReserved,
    publishOrderSubmitted,
    publishOrderFailed,
    publishOrderTimeout,

    publishPaymentMade,
    publishPaymentFailed,
    publishPaymentConfirmed,
    publishPaymentTimeout,
  })

  fastify.addHook('onClose', async () => {
    if (channel) {
      await channel.close()
      channel = undefined
    }

    if (connection) {
      await connection.close()
      connection = undefined
    }
  })
}

export const mqPlugin = fp(mqPluginImpl, {
  name: mqPluginName,
})
