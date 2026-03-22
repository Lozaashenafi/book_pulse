import "server-only";
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// This keeps the connection alive between page refreshes
neonConfig.fetchConnectionCache = true;

const connectionString = process.env.DATABASE_URL!;

// We create a custom fetcher that waits 60 seconds
const sql = neon(connectionString, {
  fetchOptions: {
    signal: AbortSignal.timeout(60000), 
  },
});

export const db = drizzle(sql, { schema });