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
  `CREATE TABLE IF NOT EXISTS "users" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "username" text NOT NULL UNIQUE,
    "password" text NOT NULL,
    "email" text,
    "first_name" text,
    "last_name" text,
    "profile_image_url" text,
    "stripe_customer_id" text,
    "stripe_subscription_id" text,
    "subscription_status" text,
    "subscription_plan" text,
    "subscription_ends_at" timestamp,
    "is_premium" boolean DEFAULT false,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "local_users" (
    "id" varchar PRIMARY KEY NOT NULL,
    "email" text NOT NULL UNIQUE,
    "password_hash" text NOT NULL,
    "password_version" integer NOT NULL DEFAULT 1,
    "last_login_at" timestamp,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "access_code_redemptions" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "access_code_id" varchar NOT NULL,
    "user_id" varchar,
    "session_id" varchar,
    "redeemed_at" timestamp DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "soul_profiles" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" varchar,
    "session_id" varchar,
    "name" text NOT NULL,
    "birth_date" timestamp NOT NULL,
    "birth_time" text,
    "birth_location" text,
    "timezone" text,
    "latitude" text,
    "longitude" text,
    "is_premium" boolean DEFAULT false,
    "astrology_data" jsonb,
    "numerology_data" jsonb,
    "personality_data" jsonb,
    "archetype_data" jsonb,
    "human_design_data" jsonb,
    "vedic_astrology_data" jsonb,
    "gene_keys_data" jsonb,
    "i_ching_data" jsonb,
    "chinese_astrology_data" jsonb,
    "kabbalah_data" jsonb,
    "mayan_astrology_data" jsonb,
    "chakra_data" jsonb,
    "sacred_geometry_data" jsonb,
    "runes_data" jsonb,
    "sabian_symbols_data" jsonb,
    "ayurveda_data" jsonb,
    "biorhythms_data" jsonb,
    "asteroids_data" jsonb,
    "arabic_parts_data" jsonb,
    "fixed_stars_data" jsonb,
    "purpose_statement" text,
    "biography" text,
    "daily_guidance" text,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "assessment_responses" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "profile_id" varchar NOT NULL,
    "assessment_type" text NOT NULL,
    "responses" jsonb NOT NULL,
    "calculated_type" text,
    "created_at" timestamp DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "public_profile_shares" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "token" varchar(96) NOT NULL UNIQUE,
    "profile_id" varchar NOT NULL,
    "snapshot" jsonb NOT NULL,
    "created_at" timestamp DEFAULT now(),
    "revoked_at" timestamp
  )`,
  `CREATE INDEX IF NOT EXISTS "soul_profiles_user_idx"
    ON "soul_profiles" ("user_id")`,
  `CREATE INDEX IF NOT EXISTS "soul_profiles_session_idx"
    ON "soul_profiles" ("session_id")`,
  `CREATE INDEX IF NOT EXISTS "assessment_responses_profile_idx"
    ON "assessment_responses" ("profile_id")`,
  `CREATE INDEX IF NOT EXISTS "access_code_redemptions_user_idx"
    ON "access_code_redemptions" ("user_id")`,
  `CREATE INDEX IF NOT EXISTS "access_code_redemptions_session_idx"
    ON "access_code_redemptions" ("session_id")`,
  `CREATE INDEX IF NOT EXISTS "public_profile_shares_profile_idx"
    ON "public_profile_shares" ("profile_id")`,
];

const requiredSchema = {
  users: {
    id: "character varying",
    username: "text",
    password: "text",
  },
  local_users: {
    id: "character varying",
    email: "text",
    password_hash: "text",
    password_version: "integer",
  },
  access_code_redemptions: {
    id: "character varying",
    access_code_id: "character varying",
  },
  soul_profiles: {
    id: "character varying",
    name: "text",
    birth_date: "timestamp without time zone",
    astrology_data: "jsonb",
    numerology_data: "jsonb",
    personality_data: "jsonb",
    human_design_data: "jsonb",
  },
  assessment_responses: {
    id: "character varying",
    profile_id: "character varying",
    assessment_type: "text",
    responses: "jsonb",
  },
  public_profile_shares: {
    id: "character varying",
    token: "character varying",
    profile_id: "character varying",
    snapshot: "jsonb",
  },
};

async function verifySchema() {
  for (const [tableName, requiredColumns] of Object.entries(requiredSchema)) {
    const result = await client.query(
      `SELECT column_name, data_type
         FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = $1`,
      [tableName],
    );
    const present = new Map(result.rows.map((row) => [row.column_name, row.data_type]));
    const missing = Object.keys(requiredColumns).filter((column) => !present.has(column));
    if (missing.length) {
      throw new Error(`${tableName} is missing required columns: ${missing.join(", ")}`);
    }
    const mismatches = Object.entries(requiredColumns)
      .filter(([column, expectedType]) => present.get(column) !== expectedType)
      .map(([column, expectedType]) => `${column}: expected ${expectedType}, got ${present.get(column)}`);
    if (mismatches.length) {
      throw new Error(`${tableName} has incompatible column types: ${mismatches.join("; ")}`);
    }
  }
}

try {
  await client.connect();
  await client.query("BEGIN");
  for (const statement of statements) await client.query(statement);
  await verifySchema();
  await client.query("COMMIT");
  console.log("[schema-preflight] active Soul Codex storage schema ready");
} catch (error) {
  try { await client.query("ROLLBACK"); } catch {}
  console.error("[schema-preflight] failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => undefined);
}
