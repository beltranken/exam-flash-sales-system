import amqp from 'amqp-connection-manager'
import { msgBrokerPlugin } from './msg-broker.js'

jest.mock('amqp-connection-manager', () => ({
  __esModule: true,
  default: {
    connect: jest.fn(),
  },
}))

describe('msgBrokerPlugin', () => {
  const connectMock = (amqp as any).connect as jest.Mock

  const setup = (rabbitmqUrl = 'amqp://localhost') => {
    const sendToQueue = jest.fn().mockReturnValue(true)
    const assertQueue = jest.fn().mockResolvedValue(undefined)
    const once = jest.fn((_event: string, cb: () => void) => cb())
    const channelClose = jest.fn().mockResolvedValue(undefined)

    const channel = {
      assertQueue,
      sendToQueue,
      once,
      close: channelClose,
    }

    const connectionClose = jest.fn().mockResolvedValue(undefined)
    const createChannel = jest.fn().mockResolvedValue(channel)
    const connection = {
      createChannel,
      close: connectionClose,
    }

    connectMock.mockResolvedValue(connection)

    let onCloseHandler: (() => Promise<void>) | undefined

    const fastify = {
      config: { RABBITMQ_URL: rabbitmqUrl } as any,
      decorate: jest.fn((name: string, value: unknown) => {
        ;(fastify as any)[name] = value
      }),
      addHook: jest.fn((name: string, handler: () => Promise<void>) => {
        if (name === 'onClose') {
          onCloseHandler = handler
        }
      }),
    } as any

    return {
      fastify,
      sendToQueue,
      assertQueue,
      once,
      createChannel,
      channelClose,
      connectionClose,
      runOnClose: async () => onCloseHandler?.(),
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('publishes object payload as JSON buffer with default durable true', async () => {
    const ctx = setup()
    await msgBrokerPlugin(ctx.fastify, {} as any)

    await ctx.fastify.mq.publishToQueue({
      queue: 'otp.queue',
      message: { userId: 1 },
    })

    expect(connectMock).toHaveBeenCalledWith('amqp://localhost')
    expect(ctx.assertQueue).toHaveBeenCalledWith('otp.queue', { durable: true })

    const [queue, content, options] = ctx.sendToQueue.mock.calls[0]
    expect(queue).toBe('otp.queue')
    expect(Buffer.isBuffer(content)).toBe(true)
    expect(content.toString()).toBe(JSON.stringify({ userId: 1 }))
    expect(options).toMatchObject({ persistent: true, contentType: 'application/json' })
  })

  it('publishes buffer payload with undefined contentType', async () => {
    const ctx = setup()
    await msgBrokerPlugin(ctx.fastify, {} as any)

    const payload = Buffer.from('raw-binary')
    await ctx.fastify.mq.publishToQueue({
      queue: 'bin.queue',
      message: payload,
      durable: false,
    })

    expect(ctx.assertQueue).toHaveBeenCalledWith('bin.queue', { durable: false })

    const [, content, options] = ctx.sendToQueue.mock.calls[0]
    expect(content).toBe(payload)
    expect(options).toMatchObject({ persistent: true, contentType: undefined })
  })

  it('waits for drain when sendToQueue buffers', async () => {
    const ctx = setup()
    ctx.sendToQueue.mockReturnValue(false)

    await msgBrokerPlugin(ctx.fastify, {} as any)

    await ctx.fastify.mq.publishToQueue({
      queue: 'otp.queue',
      message: 'payload',
    })

    expect(ctx.once).toHaveBeenCalledWith('drain', expect.any(Function))
  })

  it('throws when rabbitmq url is missing', async () => {
    const ctx = setup('' as any)
    await msgBrokerPlugin(ctx.fastify, {} as any)

    await expect(ctx.fastify.mq.publishToQueue({ queue: 'otp.queue', message: 'payload' })).rejects.toThrow(
      'RABBITMQ_URL is required to publish messages.',
    )
  })

  it('closes channel and connection in onClose hook', async () => {
    const ctx = setup()
    await msgBrokerPlugin(ctx.fastify, {} as any)

    await ctx.fastify.mq.publishToQueue({ queue: 'otp.queue', message: 'payload' })
    await ctx.runOnClose()

    expect(ctx.channelClose).toHaveBeenCalledTimes(1)
    expect(ctx.connectionClose).toHaveBeenCalledTimes(1)
  })
})
