import type { AmqpConnectionManager, ChannelWrapper, Options } from 'amqp-connection-manager'
import amqp from 'amqp-connection-manager'
import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

type BrokerMessage = Buffer | Record<string, unknown> | string

export type PublishToQueueArgs = {
  queue: string
  message: BrokerMessage
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

const msgBrokerPluginImpl: FastifyPluginAsync = async (fastify) => {
  let connection: AmqpConnectionManager | undefined
  let channel: ChannelWrapper | undefined

  const publishToQueue = async ({ queue, message, options, durable = true }: PublishToQueueArgs) => {
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

    await channel.assertQueue(queue, { durable })

    const content = toBuffer(message)
    const didBuffer = channel.sendToQueue(queue, content, {
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

  fastify.decorate('mq', {
    publishToQueue,
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

export const msgBrokerPlugin = fp(msgBrokerPluginImpl, {
  name: 'msg-broker',
})
