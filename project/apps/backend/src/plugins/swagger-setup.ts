import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import {
  jsonSchemaTransform,
  jsonSchemaTransformObject,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

export const disabledSerializerCompiler = () => {
  return (data: unknown) => JSON.stringify(data)
}

const swaggerSetupPluginImpl: FastifyPluginAsync = async (fastify) => {
  fastify.setValidatorCompiler(validatorCompiler)
  fastify.setSerializerCompiler(
    fastify.config.NODE_ENV === 'production' ? disabledSerializerCompiler : serializerCompiler,
  )

  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'My API',
        description: 'API documentation',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    transform: jsonSchemaTransform,
    transformObject: jsonSchemaTransformObject,
  })

  await fastify.register(swaggerUI, {
    routePrefix: '/docs',
  })
}

export const swaggerSetupPlugin = fp(swaggerSetupPluginImpl, {
  name: 'swagger-setup',
})
