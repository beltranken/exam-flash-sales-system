import {
  emailSignInRequestSchema,
  errorResponses,
  noContentResponse,
  signInChallengeResponseSchema,
  signInConfirmRequestSchema,
  signInConfirmResponseSchema,
} from '@types'
import { FastifyPluginAsync } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { refreshTokenRoute, signInConfirmRoute, signInRoute, signOutRoute } from './routes/index.js'

export const authPlugin: FastifyPluginAsync = async (fastify, _options) => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>()

  typedFastify.post(
    '/sign-in',
    {
      schema: {
        operationId: 'signIn',
        body: emailSignInRequestSchema,
        response: {
          200: signInChallengeResponseSchema,
          ...errorResponses,
        },
      },
    },
    signInRoute(fastify),
  )

  typedFastify.post(
    '/sign-in/confirm',
    {
      schema: {
        operationId: 'signInConfirm',
        body: signInConfirmRequestSchema,
        response: {
          200: signInConfirmResponseSchema,
          ...errorResponses,
        },
      },
    },
    signInConfirmRoute(fastify),
  )

  typedFastify.post(
    '/sign-out',
    {
      schema: {
        operationId: 'signOut',
        response: {
          ...noContentResponse,
          ...errorResponses,
        },
      },
    },
    signOutRoute,
  )

  typedFastify.post(
    '/refresh',
    {
      schema: {
        operationId: 'refreshToken',
        response: {
          200: signInConfirmResponseSchema,
          ...errorResponses,
        },
      },
    },
    refreshTokenRoute(fastify),
  )
}
