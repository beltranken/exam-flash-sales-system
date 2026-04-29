import fastifyRedis from '@fastify/redis'
import Fastify from 'fastify'
import { cacheSetupPlugin } from '../../plugins/cache-setup.js'

jest.mock('@fastify/redis', () => ({
  __esModule: true,
  default: jest.fn(async () => undefined),
}))

describe('cacheSetupPlugin integration', () => {
  it('registers fastify-redis with cache url and retry strategy', async () => {
    const fastifyRedisMock = fastifyRedis as unknown as jest.Mock

    const app = Fastify()
    app.decorate('config', { CACHE_URL: 'redis://localhost:6379' } as any)

    try {
      await app.register(cacheSetupPlugin)

      expect(fastifyRedisMock).toHaveBeenCalledTimes(1)
      const options = fastifyRedisMock.mock.calls[0][1]
      expect(options.url).toBe('redis://localhost:6379')
      expect(options.retryStrategy(10)).toBe(500)
      expect(options.retryStrategy(1000)).toBe(2000)
    } finally {
      await app.close()
      fastifyRedisMock.mockClear()
    }
  })
})
