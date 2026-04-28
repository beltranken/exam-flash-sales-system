import {
  emailLoginRequestSchema,
  emailLoginResponseSchema,
  errorResponses,
} from "@types";
import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { emailLoginRoute } from "./routes/email-login.route.js";

export const authPlugin: FastifyPluginAsync = async (fastify, _options) => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();

  typedFastify.post(
    "/email-login",
    {
      schema: {
        operationId: "signIn",
        body: emailLoginRequestSchema,
        response: {
          200: emailLoginResponseSchema,
          ...errorResponses,
        },
      },
    },
    emailLoginRoute(fastify),
  );
};
