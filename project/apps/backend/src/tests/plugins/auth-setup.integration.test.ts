import fastifyJwt from '@fastify/jwt'
import Fastify from 'fastify'
import { authSetupPlugin } from '../../plugins/auth-setup.js'

jest.mock('@fastify/jwt', () => ({
  __esModule: true,
  default: jest.fn(async () => undefined),
}))

describe('authSetupPlugin integration', () => {
  it('registers fastify-jwt with configured secret and decorates authenticate', async () => {
    const fastifyJwtMock = fastifyJwt as unknown as jest.Mock

    const app = Fastify()
    app.decorate('config', { JWT_ACCESS_SECRET: 'secret-key' } as any)

    try {
      await app.register(authSetupPlugin)

      expect(fastifyJwtMock).toHaveBeenCalledTimes(1)
      expect(fastifyJwtMock.mock.calls[0][1]).toMatchObject({ secret: 'secret-key' })
      expect(typeof app.authenticate).toBe('function')
    } finally {
      await app.close()
      fastifyJwtMock.mockClear()
    }
  })
})
