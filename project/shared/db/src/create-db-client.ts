import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { relations } from "./relations.js";
import * as schema from "./schemas/index.js";

export type Db = NodePgDatabase<typeof schema, typeof relations> & {
  $client: Pool;
};

export const createDbClient = (dbConnectionString?: string) => {
  const pool = new Pool({
    connectionString: dbConnectionString ?? process.env.DATABASE_URL,
    ssl: false,
    min: 1,
  });

  pool.on("error", (err) => {
    console.error("Unexpected Postgres pool error", err);
  });

  const db = drizzle({
    client: pool,
    schema,
    relations,
  });

  return { db, pool };
};
