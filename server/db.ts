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


export async function assertDatabaseSchemaCompatible(): Promise<void> {
  const result = await pool.query(
    `SELECT table_name, column_name, data_type
       FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'soul_profiles'
        AND column_name = 'birth_date'`,
  );

  const row = result?.rows?.[0] as
    | { table_name?: string; column_name?: string; data_type?: string }
    | undefined;

  if (
    row?.table_name !== "soul_profiles" ||
    row?.column_name !== "birth_date" ||
    row?.data_type !== "timestamp without time zone"
  ) {
    throw new Error(
      "database_schema_incompatible: expected public.soul_profiles.birth_date as timestamp without time zone; run an explicit reviewed schema migration before enabling DATABASE_URL",
    );
  }
}
