// import { defineConfig } from "drizzle-kit";

// export default defineConfig({
//   // 1. Tell Drizzle where your schema is
//   schema: "./lib/db/schema.ts",
//   // 2. Where to store migration files (optional but good)
//   out: "./drizzle",
//   // 3. Use PostgreSQL
//   dialect: "postgresql",
//   dbCredentials: {
//     // 4. This points to your Neon connection string in .env
//     url: process.env.DATABASE_URL!,
//   },
// });
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  dialect: "postgresql",
  out: "./drizzle",
  dbCredentials: {
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "postgres",   // 👈 important
    database: "bookpulse",
    ssl: false,
  },
});