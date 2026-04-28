import cookie from '@fastify/cookie'
import { authPlugin } from '@features'
import Fastify from 'fastify'
import { validatorCompiler } from 'fastify-type-provider-zod'

describe('authPlugin integration', () => {
  it('registers auth routes and handles sign-out', async () => {
    const app = Fastify()
    app.setValidatorCompiler(validatorCompiler)
    app.setSerializerCompiler(() => {
      return (data) => JSON.stringify(data)
    })

    await app.register(cookie, { secret: 'test-secret' })
    await app.register(authPlugin, { prefix: '/auth' })

    try {
      expect(app.hasRoute({ method: 'POST', url: '/auth/sign-in' })).toBe(true)
      expect(app.hasRoute({ method: 'POST', url: '/auth/sign-in/confirm' })).toBe(true)
      expect(app.hasRoute({ method: 'POST', url: '/auth/sign-out' })).toBe(true)
      expect(app.hasRoute({ method: 'POST', url: '/auth/refresh' })).toBe(true)

      const response = await app.inject({
        method: 'POST',
        url: '/auth/sign-out',
      })

      expect(response.statusCode).toBe(204)
      expect(response.headers['set-cookie']).toEqual(expect.any(String))
    } finally {
      await app.close()
    }
  })
})
