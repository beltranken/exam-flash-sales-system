import 'fastify'

import { FastifyJwtNamespace } from '@fastify/jwt'
import { Db } from '@shared/db'
import { PublishToQueueArgs } from './plugins/msg-broker.ts'

declare module 'fastify' {
  interface FastifyInstance extends FastifyJwtNamespace<{
    namespace: 'refresh'
  }> {
    config: {
      PORT: string
      DATABASE_URL: string
      CACHE_URL: string
      RABBITMQ_URL: string
      PINO_LOG_LEVEL?: string
      NODE_ENV?: string
      JWT_ACCESS_SECRET: string
      AWS_REGION?: string
      AWS_ACCESS_KEY_ID?: string
      AWS_SECRET_ACCESS_KEY?: string
      S3_ENDPOINT?: string
      S3_BUCKET_NAME?: string
      COOKIE_SECRET: string
      SKIP_LOGIN: string
      PAYMENT_METHODS: string[]
    }
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    db: Db
    mq: {
      publishToQueue: (args: PublishToQueueArgs) => Promise<void>
    }
    s3: {
      signUrl: (key: string) => Promise<string | null>
    }
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      userId: number
      email: string
      isAdmin?: boolean
    }
    user?: {
      userId: number
      email: string
      isAdmin?: boolean
    }
  }
}
