import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);

// This is the most stable database connection you can have in Next.js
export const db = drizzle(sql, { schema });
