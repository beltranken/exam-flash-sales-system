import { FastifyJwtNamespace } from "@fastify/jwt";
import { Db } from "@shared/db";
import "fastify";

declare module "fastify" {
  interface FastifyInstance extends FastifyJwtNamespace<{
    namespace: "refresh";
  }> {
    config: {
      PORT: string;
      DATABASE_URL: string;
      CACHE_URL: string;
      PINO_LOG_LEVEL?: string;
      NODE_ENV?: string;
      EMAIL_ENABLED: boolean;
      EMAIL_FROM: string;
      JWT_ACCESS_SECRET: string;
      JWT_ACCESS_EXPIRY: string;
      AWS_REGION?: string;
      AWS_ACCESS_KEY_ID?: string;
      AWS_SECRET_ACCESS_KEY?: string;
      S3_ENDPOINT?: string;
      S3_BUCKET_NAME?: string;
    };
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
    db: Db;
    s3?: {
      signUrl: (key: string) => Promise<string>;
    };
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      userId: number;
    };
    user: {
      userId: number;
    };
  }
}
