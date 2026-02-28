import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString =
  process.env.NEXT_PUBLIC_SUPABASE_URL_CONNECTION_STRING!;

const globalForDb = global as unknown as {
  pool: Pool | undefined;
};

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString,
    max: 1,
    ssl: {
      rejectUnauthorized: false,
    },
    // This helps resolve the "ENOTFOUND" on some local networks
    connectionTimeoutMillis: 30000,
  });

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
