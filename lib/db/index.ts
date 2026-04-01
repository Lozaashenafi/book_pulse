import "server-only";
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// This is mandatory for Next.js 15 stability
neonConfig.fetchConnectionCache = true;

const connectionString = process.env.DATABASE_URL!;


const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });


// import "server-only";
// import { drizzle } from 'drizzle-orm/postgres-js';
// import postgres from 'postgres';
// import * as schema from './schema';

// const connectionString = process.env.DATABASE_URL!;

// // This is the standard TCP client for local development
// // It connects to port 5432 instead of trying to use port 443
// const client = postgres(connectionString, { 
//   prepare: false 
// });

// export const db = drizzle(client, { schema });