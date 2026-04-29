import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import Fastify from 'fastify'
import { disabledSerializerCompiler, swaggerSetupPlugin } from '../../plugins/swagger-setup.js'

jest.mock('@fastify/swagger', () => ({
  __esModule: true,
  default: jest.fn(async () => undefined),
}))

jest.mock('@fastify/swagger-ui', () => ({
  __esModule: true,
  default: jest.fn(async () => undefined),
}))

describe('swaggerSetupPlugin integration', () => {
  it('registers swagger and swagger-ui plugins', async () => {
    const swaggerMock = swagger as unknown as jest.Mock
    const swaggerUIMock = swaggerUI as unknown as jest.Mock

    const app = Fastify()
    app.decorate('config', { NODE_ENV: 'development' } as any)

    try {
      await app.register(swaggerSetupPlugin)

      expect(swaggerMock).toHaveBeenCalledTimes(1)
      expect(swaggerUIMock).toHaveBeenCalledTimes(1)

      const swaggerOptions = swaggerMock.mock.calls[0][1]
      const swaggerUIOptions = swaggerUIMock.mock.calls[0][1]

      expect(swaggerOptions.openapi.info.title).toBe('My API')
      expect(swaggerUIOptions).toEqual({ routePrefix: '/docs' })
    } finally {
      await app.close()
      swaggerMock.mockClear()
      swaggerUIMock.mockClear()
    }
  })

  it('disabledSerializerCompiler serializes payload to JSON string', () => {
    const serializer = disabledSerializerCompiler()
    expect(serializer({ ok: true })).toBe('{"ok":true}')
  })
})
