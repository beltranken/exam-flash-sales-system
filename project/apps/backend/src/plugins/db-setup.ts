import { createDbClient } from '@shared/db'
import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

const dbPluginImpl: FastifyPluginAsync = async (fastify) => {
  const { db, pool } = createDbClient(fastify.config.DATABASE_URL)

  fastify.decorate('db', db)

  fastify.addHook('onClose', async () => {
    console.log('Closing database pool...')
    await pool.end()
  })
}

export const dbSetupPlugin = fp(dbPluginImpl, {
  name: 'db',
})
