// import "server-only";
// import { neon, neonConfig } from '@neondatabase/serverless';
// import { drizzle } from 'drizzle-orm/neon-http';
// import * as schema from './schema';

// // This is mandatory for Next.js 15 stability
// neonConfig.fetchConnectionCache = true;

// const connectionString = process.env.DATABASE_URL!;

// // We create a custom fetcher that is extremely patient (90 seconds)
// const sql = neon(connectionString, {
//   fetchOptions: {
//     // This signal tells the computer: "Do not give up for 90 seconds"
//     signal: AbortSignal.timeout(90000), 
//   },
// });

// export const db = drizzle(sql, { schema });

import "server-only";
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// This is the standard TCP client for local development
// It connects to port 5432 instead of trying to use port 443
const client = postgres(connectionString, { 
  prepare: false 
});

export const db = drizzle(client, { schema });