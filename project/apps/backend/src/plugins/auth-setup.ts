import fastifyJwt from '@fastify/jwt'
import { FastifyPluginAsync, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import { Unauthorized } from 'http-errors'

export function handleJwtVerifyError(err: unknown) {
  const isError = err instanceof Error
  if (!isError) {
    // Unknown error
    throw err
  }

  if (err.name === 'JsonWebTokenError') {
    throw new Unauthorized('Unable to decode jwt')
  } else if (err.name === 'TokenExpiredError') {
    throw new Unauthorized('Access token is expired')
  } else {
    // Unknown error
    throw err
  }
}

const authSetupPluginImpl: FastifyPluginAsync = async (fastify, _options) => {
  fastify.log.info('Registering auth setup plugin')

  await fastify.register(fastifyJwt, {
    secret: fastify.config.JWT_ACCESS_SECRET,
  })

  fastify.decorate('authenticate', async (req: FastifyRequest) => {
    try {
      await req.jwtVerify()
    } catch (err) {
      handleJwtVerifyError(err)
    }
  })
}

export const authSetupPlugin = fp(authSetupPluginImpl, {
  name: 'auth-setup',
})
