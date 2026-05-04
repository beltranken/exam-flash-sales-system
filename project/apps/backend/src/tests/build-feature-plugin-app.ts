import cookie from '@fastify/cookie'
import Fastify from 'fastify'
import createHttpError from 'http-errors'
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'

type BuildFeaturePluginAppOptions = {
  authenticate?: 'pass' | 'fail'
}

export async function buildFeaturePluginApp({ authenticate = 'pass' }: BuildFeaturePluginAppOptions = {}) {
  const app = Fastify()

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)
  app.decorate('config', { NODE_ENV: 'test', COOKIE_SECRET: 'test-secret' } as any)
  app.decorate('redis', { set: jest.fn() } as any)
  app.decorate('jwt', {
    verify: jest.fn(),
  } as any)
  app.decorate('authenticate', async (request: any) => {
    if (authenticate === 'fail') {
      throw new createHttpError.Unauthorized('User is not authenticated')
    }

    request.user = { userId: 42, email: 'user@example.com' }
  })

  await app.register(cookie, { secret: 'test-secret' })

  return app
}
