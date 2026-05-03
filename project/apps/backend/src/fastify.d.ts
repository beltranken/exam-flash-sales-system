import 'fastify'

import { FastifyJwtNamespace } from '@fastify/jwt'
import { type Db } from '@shared/db'
import { type OrderFailedMessage, type OrderReservedMessage, type OrderSubmittedMessage } from '@shared/order-contracts'
import { type PublishToQueueArgs } from './plugins/mq-setup.ts'

declare module 'fastify' {
  interface FastifyInstance extends FastifyJwtNamespace<{
    namespace: 'refresh'
  }> {
    config: {
      PORT: string
      DATABASE_URL: string
      CACHE_URL: string
      RABBITMQ_URL: string
      ORDER_RESERVED_QUEUE_NAME: string
      ORDER_SUBMITTED_QUEUE_NAME: string
      ORDER_FAILED_QUEUE_NAME: string
      ORDER_TIMEOUT_DELAY_QUEUE_NAME: string
      ORDER_TIMEOUT_TTL_MS: string
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
      publishOrderReserved: (message: OrderReservedMessage) => Promise<void>
      publishOrderSubmitted: (message: OrderSubmittedMessage) => Promise<void>
      publishOrderFailed: (message: OrderFailedMessage) => Promise<void>
      publishOrderTimeout: (orderId: string) => Promise<void>
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
