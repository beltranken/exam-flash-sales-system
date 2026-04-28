import { createDbClient } from '@shared/db'
import Fastify from 'fastify'
import { dbSetupPlugin } from '../../plugins/db-setup.js'

jest.mock('@shared/db', () => ({
  createDbClient: jest.fn(),
}))

describe('dbSetupPlugin integration', () => {
  it('calls createDbClient, decorates db, and closes the pool on app close', async () => {
    const databaseUrl = 'test-database-url'
    const db = { query: {} }
    const end = jest.fn().mockResolvedValue(undefined)
    const createDbClientMock = createDbClient as jest.MockedFunction<typeof createDbClient>

    createDbClientMock.mockReturnValue({ db, pool: { end } } as any)

    const fastify = Fastify()
    fastify.decorate('config', { DATABASE_URL: databaseUrl } as any)
    await fastify.register(dbSetupPlugin)

    try {
      expect(createDbClientMock).toHaveBeenCalledTimes(1)
      expect(createDbClientMock).toHaveBeenCalledWith(databaseUrl)
      expect(fastify.db).toBe(db)

      await fastify.close()

      expect(end).toHaveBeenCalledTimes(1)
    } finally {
      createDbClientMock.mockReset()
    }
  })
})
