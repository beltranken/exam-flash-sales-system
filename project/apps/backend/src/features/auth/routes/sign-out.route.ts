import { FastifyReply, FastifyRequest } from 'fastify'

export function signOutRoute(_req: FastifyRequest, reply: FastifyReply) {
  reply.clearCookie('refresh_token', {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  })

  reply.status(204).send()
}
