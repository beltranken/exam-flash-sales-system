import { createDbClient, type Db } from '@shared/db'

const client = createDbClient()

export const db: Db = client.db
export const pool: ReturnType<typeof createDbClient>['pool'] = client.pool
