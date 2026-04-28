import { EmailLoginRequest, EmailLoginResponse } from "@types";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { resolveUserService } from "../services/index.js";

type EmailLoginRoute = {
  Body: EmailLoginRequest;
  Reply: EmailLoginResponse;
};

export function emailLoginRoute(fastify: FastifyInstance) {
  return async function (
    req: FastifyRequest<EmailLoginRoute>,
    reply: FastifyReply<EmailLoginRoute>,
  ) {
    const { email } = req.body;
    const user = await resolveUserService(fastify, email);

    reply.send({ token: email });
  };
}
