type SignalHandler = (signal: NodeJS.Signals) => void | Promise<void>

const flushPromises = () => new Promise<void>((resolve) => setImmediate(resolve))

describe('order worker entrypoint integration', () => {
  const originalExit = process.exit

  afterEach(() => {
    process.exit = originalExit
  })

  async function importEntrypoint({
    start = jest.fn().mockResolvedValue(undefined),
    stop = jest.fn().mockResolvedValue(undefined),
    poolEnd = jest.fn().mockResolvedValue(undefined),
  } = {}) {
    jest.resetModules()

    const signalHandlers = new Map<string, SignalHandler>()
    const disconnect = jest.fn()
    const logger = {
      info: jest.fn(),
      error: jest.fn(),
    }

    const processOn = jest.spyOn(process, 'on').mockImplementation((event, handler) => {
      if (event === 'SIGINT' || event === 'SIGTERM') {
        signalHandlers.set(event, handler as SignalHandler)
      }

      return process
    })

    const exit = jest.fn() as unknown as typeof process.exit
    process.exit = exit

    jest.doMock('./cache.js', () => ({
      redis: {
        disconnect,
      },
    }))

    jest.doMock('./db.js', () => ({
      pool: {
        end: poolEnd,
      },
    }))

    jest.doMock('./logger.js', () => ({
      logger,
    }))

    jest.doMock('./queues/order-event.consumer.js', () => ({
      OrderEventConsumer: jest.fn().mockImplementation(() => ({
        start,
        stop,
      })),
    }))

    await import('./index.js')
    await flushPromises()

    return {
      disconnect,
      exit: process.exit as unknown as jest.Mock,
      logger,
      poolEnd,
      processOn,
      signalHandlers,
      start,
      stop,
    }
  }

  it('starts the order event consumer and registers shutdown signal handlers', async () => {
    const { processOn, signalHandlers, start } = await importEntrypoint()

    expect(start).toHaveBeenCalledTimes(1)
    expect(processOn).toHaveBeenCalledWith('SIGINT', expect.any(Function))
    expect(processOn).toHaveBeenCalledWith('SIGTERM', expect.any(Function))
    expect(signalHandlers.has('SIGINT')).toBe(true)
    expect(signalHandlers.has('SIGTERM')).toBe(true)
  })

  it('stops consumer, disconnects Redis, closes DB pool, and exits successfully on shutdown signal', async () => {
    const { disconnect, exit, logger, poolEnd, signalHandlers, stop } = await importEntrypoint()
    const shutdown = signalHandlers.get('SIGTERM')

    await shutdown?.('SIGTERM')
    await shutdown?.('SIGTERM')

    expect(logger.info).toHaveBeenCalledWith({ signal: 'SIGTERM' }, 'Shutting down order worker')
    expect(stop).toHaveBeenCalledTimes(1)
    expect(disconnect).toHaveBeenCalledTimes(1)
    expect(poolEnd).toHaveBeenCalledTimes(1)
    expect(exit).toHaveBeenCalledWith(0)
  })

  it('logs and exits with failure when startup fails', async () => {
    const startupError = new Error('rabbitmq unavailable')
    const { exit, logger, start } = await importEntrypoint({
      start: jest.fn().mockRejectedValue(startupError),
    })

    await flushPromises()

    expect(start).toHaveBeenCalledTimes(1)
    expect(logger.error).toHaveBeenCalledWith({ error: startupError }, 'Order worker failed to start')
    expect(exit).toHaveBeenCalledWith(1)
  })

  it('logs and exits with failure when shutdown fails', async () => {
    const shutdownError = new Error('pool close failed')
    const { exit, logger, signalHandlers } = await importEntrypoint({
      stop: jest.fn().mockRejectedValue(shutdownError),
    })
    const shutdown = signalHandlers.get('SIGINT')

    await shutdown?.('SIGINT')

    expect(logger.error).toHaveBeenCalledWith({ error: shutdownError }, 'Order worker failed to shut down cleanly')
    expect(exit).toHaveBeenCalledWith(1)
  })
})
