import fastifyJwt from '@fastify/jwt'
import { FastifyPluginAsync, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import createHttpError from 'http-errors'

export function handleJwtVerifyError(err: unknown) {
  const isError = err instanceof Error
  if (!isError) {
    // Unknown error
    throw err
  }

  if (err.name === 'JsonWebTokenError') {
    throw new createHttpError.Unauthorized('Unable to decode jwt')
  } else if (err.name === 'TokenExpiredError') {
    throw new createHttpError.Unauthorized('Access token is expired')
  } else {
    // Unknown error
    throw err
  }
}

export async function authenticate(request: FastifyRequest) {
  try {
    await request.jwtVerify()
  } catch (err) {
    handleJwtVerifyError(err)
  }
}

const authSetupPluginImpl: FastifyPluginAsync = async (fastify) => {
  fastify.log.info('Registering auth setup plugin')

  await fastify.register(fastifyJwt, {
    secret: fastify.config.JWT_ACCESS_SECRET,
  })

  fastify.decorate('authenticate', authenticate)
}

export const authSetupPlugin = fp(authSetupPluginImpl, {
  name: 'auth-setup',
})
