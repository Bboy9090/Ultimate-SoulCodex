import "dotenv/config";
import { createRequire } from "node:module";

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.log("[schema-preflight] skipped: DATABASE_URL is not configured; server will use MemStorage");
  process.exit(0);
}

const rootRequire = createRequire(import.meta.url);
const connectPgRequire = createRequire(rootRequire.resolve("connect-pg-simple"));
const { Client } = connectPgRequire("pg");

const client = new Client({ connectionString: databaseUrl });

const statements = [
  `CREATE TABLE IF NOT EXISTS "public_profile_shares" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "token" varchar(96) NOT NULL UNIQUE,
    "profile_id" varchar NOT NULL,
    "snapshot" jsonb NOT NULL,
    "created_at" timestamp DEFAULT now(),
    "revoked_at" timestamp
  )`,
  `CREATE INDEX IF NOT EXISTS "public_profile_shares_profile_idx"
    ON "public_profile_shares" ("profile_id")`,
];

try {
  await client.connect();
  await client.query("BEGIN");
  for (const statement of statements) await client.query(statement);
  await client.query("COMMIT");

  const result = await client.query(
    `SELECT column_name
       FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'public_profile_shares'`,
  );
  const required = new Set(["id", "token", "profile_id", "snapshot", "created_at", "revoked_at"]);
  const present = new Set(result.rows.map((row) => row.column_name));
  const missing = [...required].filter((column) => !present.has(column));
  if (missing.length) {
    throw new Error(`public_profile_shares is missing required columns: ${missing.join(", ")}`);
  }

  console.log("[schema-preflight] public_profile_shares ready");
} catch (error) {
  try { await client.query("ROLLBACK"); } catch {}
  console.error("[schema-preflight] failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => undefined);
}
