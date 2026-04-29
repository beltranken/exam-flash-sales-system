import amqp from 'amqp-connection-manager'
import Fastify from 'fastify'
import { msgBrokerPlugin } from '../../plugins/msg-broker.js'

jest.mock('amqp-connection-manager', () => ({
  __esModule: true,
  default: {
    connect: jest.fn(),
  },
}))

describe('msgBrokerPlugin integration', () => {
  it('publishes messages and closes channel/connection on app close', async () => {
    const sendToQueue = jest.fn().mockReturnValue(true)
    const assertQueue = jest.fn().mockResolvedValue(undefined)
    const channelClose = jest.fn().mockResolvedValue(undefined)

    const channel = {
      assertQueue,
      sendToQueue,
      once: jest.fn(),
      close: channelClose,
    }

    const connectionClose = jest.fn().mockResolvedValue(undefined)
    const createChannel = jest.fn().mockResolvedValue(channel)
    const connection = {
      createChannel,
      close: connectionClose,
    }

    const connectMock = (amqp as any).connect as jest.Mock
    connectMock.mockResolvedValue(connection)

    const app = Fastify()
    app.decorate('config', { RABBITMQ_URL: 'amqp://localhost' } as any)

    try {
      await app.register(msgBrokerPlugin)

      await app.mq.publishToQueue({
        queue: 'otp.queue',
        message: { userId: 1 },
      })

      expect(connectMock).toHaveBeenCalledTimes(1)
      expect(connectMock).toHaveBeenCalledWith('amqp://localhost')
      expect(createChannel).toHaveBeenCalledTimes(1)
      expect(assertQueue).toHaveBeenCalledWith('otp.queue', { durable: true })
      expect(sendToQueue).toHaveBeenCalledTimes(1)

      await app.close()

      expect(channelClose).toHaveBeenCalledTimes(1)
      expect(connectionClose).toHaveBeenCalledTimes(1)
    } finally {
      connectMock.mockClear()
    }
  })

  it('throws when RABBITMQ_URL is missing', async () => {
    const app = Fastify()
    app.decorate('config', {} as any)

    try {
      await app.register(msgBrokerPlugin)

      await expect(app.mq.publishToQueue({ queue: 'otp.queue', message: 'payload' })).rejects.toThrow(
        'RABBITMQ_URL is required to publish messages.',
      )
    } finally {
      await app.close()
    }
  })
})
