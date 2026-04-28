import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import fp from "fastify-plugin";
import { isHttpError } from "http-errors";
import { ZodError } from "zod/v4";

export const errorHandlerPluginImpl: FastifyPluginAsync = async (
  fastify: FastifyInstance,
) => {
  fastify.setErrorHandler(
    (error: unknown, _request: FastifyRequest, reply: FastifyReply) => {
      if (isHttpError(error)) {
        fastify.log.info(error);
        return reply.status(error.statusCode).send({
          message: error.message,
        });
      }

      if (error instanceof ZodError) {
        fastify.log.info(error);
        return reply.status(400).send({
          message: "Invalid request data",
        });
      }

      // TODO: unhandle error should notify administrator

      if (error instanceof Error) {
        fastify.log.error(error);
        let message = "An unknown error occurred";

        if (fastify.config.NODE_ENV === "development") {
          message = error.message;
        }

        return reply.status(500).send({
          message,
        });
      }

      fastify.log.error(error);
      return reply.status(500).send({
        message: "An unknown error occurred",
      });
    },
  );
};

export const errorHandlerPlugin = fp(errorHandlerPluginImpl, {
  name: "error-handler",
});
