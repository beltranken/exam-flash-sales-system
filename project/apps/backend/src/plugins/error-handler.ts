import { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import { isHttpError } from 'http-errors'
import { z, ZodError } from 'zod/v4'

export const errorHandlerPluginImpl: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.setErrorHandler((error: unknown, _request: FastifyRequest, reply: FastifyReply) => {
    if (isHttpError(error)) {
      fastify.log.info(error.message)
      return reply.status(error.statusCode).send({
        message: error.message,
      })
    }

    if (error instanceof ZodError) {
      fastify.log.info(z.treeifyError(error))
      return reply.status(400).send({
        message: 'Invalid request data',
      })
    }

    if (error instanceof Error) {
      fastify.log.error(error, 'An unexpected error occurred')
      let message = 'An unknown error occurred'

      if (fastify.config.NODE_ENV === 'development') {
        message = error.message
      }

      return reply.status(500).send({
        message,
      })
    }

    fastify.log.error(error, 'An unknown non-error object was thrown')
    return reply.status(500).send({
      message: 'An unknown error occurred',
    })
  })
}

export const errorHandlerPlugin = fp(errorHandlerPluginImpl, {
  name: 'error-handler',
})
