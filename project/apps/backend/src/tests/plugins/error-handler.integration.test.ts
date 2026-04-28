import Fastify from 'fastify'
import createHttpError from 'http-errors'
import { z } from 'zod'
import { errorHandlerPlugin } from '../../plugins/error-handler.js'

const buildApp = async (nodeEnv: 'development' | 'production') => {
  const app = Fastify()
  app.decorate('config', { NODE_ENV: nodeEnv } as any)
  await app.register(errorHandlerPlugin)
  return app
}

describe('errorHandlerPlugin integration', () => {
  it('maps http-errors to status/message', async () => {
    const app = await buildApp('production')

    app.get('/http-error', async () => {
      throw new createHttpError.Unauthorized('Unauthorized request')
    })

    try {
      const response = await app.inject({ method: 'GET', url: '/http-error' })

      expect(response.statusCode).toBe(401)
      expect(response.json()).toEqual({ message: 'Unauthorized request' })
    } finally {
      await app.close()
    }
  })

  it('maps zod validation errors to 400 response', async () => {
    const app = await buildApp('production')

    app.get('/zod-error', async () => {
      z.object({ id: z.number() }).parse({ id: 'not-a-number' })
    })

    try {
      const response = await app.inject({ method: 'GET', url: '/zod-error' })

      expect(response.statusCode).toBe(400)
      expect(response.json()).toEqual({ message: 'Invalid request data' })
    } finally {
      await app.close()
    }
  })

  it('returns detailed error message in development', async () => {
    const app = await buildApp('development')

    app.get('/runtime-error', async () => {
      throw new Error('boom')
    })

    try {
      const response = await app.inject({ method: 'GET', url: '/runtime-error' })

      expect(response.statusCode).toBe(500)
      expect(response.json()).toEqual({ message: 'boom' })
    } finally {
      await app.close()
    }
  })

  it('hides detailed error message in production', async () => {
    const app = await buildApp('production')

    app.get('/runtime-error', async () => {
      throw new Error('boom')
    })

    try {
      const response = await app.inject({ method: 'GET', url: '/runtime-error' })

      expect(response.statusCode).toBe(500)
      expect(response.json()).toEqual({ message: 'An unknown error occurred' })
    } finally {
      await app.close()
    }
  })
})
