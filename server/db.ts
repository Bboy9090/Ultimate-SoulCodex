import { createRequire } from "node:module";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// connect-pg-simple is a direct runtime dependency and owns a compatible `pg`
// dependency. Resolve `pg` from that dependency context so the active server
// uses ordinary PostgreSQL transport instead of the Neon WebSocket adapter.
// This supports Railway/local PostgreSQL DATABASE_URL values directly.
const rootRequire = createRequire(import.meta.url);
const connectPgRequire = createRequire(rootRequire.resolve("connect-pg-simple"));
const { Pool } = connectPgRequire("pg") as {
  Pool: new (options: { connectionString: string }) => any;
};

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
