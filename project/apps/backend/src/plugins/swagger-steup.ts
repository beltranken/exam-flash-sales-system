import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { jsonSchemaTransform, jsonSchemaTransformObject, validatorCompiler } from 'fastify-type-provider-zod'

const swaggerSetupPluginImpl: FastifyPluginAsync = async (fastify) => {
  fastify.setValidatorCompiler(validatorCompiler)
  fastify.setSerializerCompiler(() => {
    return (data) => JSON.stringify(data)
  })

  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'My API',
        description: 'API documentation',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          apiKey: {
            type: 'apiKey',
            name: 'apiKey',
            in: 'header',
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
