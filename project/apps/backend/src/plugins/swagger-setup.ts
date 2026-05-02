import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import {
  createJsonSchemaTransform,
  createJsonSchemaTransformObject,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

const zodToJsonConfig = {
  target: 'openapi-3.0',
} as const

const swaggerSetupPluginImpl: FastifyPluginAsync = async (fastify) => {
  fastify.setValidatorCompiler(validatorCompiler)
  fastify.setSerializerCompiler(serializerCompiler)

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
    transform: createJsonSchemaTransform({ zodToJsonConfig }),
    transformObject: createJsonSchemaTransformObject({ zodToJsonConfig }),
  })

  await fastify.register(swaggerUI, {
    routePrefix: '/docs',
  })
}

export const swaggerSetupPlugin = fp(swaggerSetupPluginImpl, {
  name: 'swagger-setup',
})
