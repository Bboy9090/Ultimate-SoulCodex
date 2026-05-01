const { Client } = require('pg');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL not set in .env");
  process.exit(1);
}

async function fixSchema() {
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to database. Applying fixes...");

    // 1. Fix personality_data cast
    console.log("Casting personality_data to jsonb...");
    try {
      await client.query(`
        ALTER TABLE profiles 
        ALTER COLUMN personality_data TYPE jsonb 
        USING personality_data::jsonb
      `);
      console.log("personality_data casted to jsonb.");
    } catch (err) {
      if (err.code === '42703') {
        console.log("Column personality_data doesn't exist yet, skipping cast.");
      } else if (err.code === '42804' || err.message.includes('cannot be cast automatically')) {
        console.error("Cast failed:", err.message);
      } else {
        console.warn("Cast warning:", err.message);
      }
    }

    // 2. Create sessions table if it doesn't exist
    console.log("Ensuring sessions table exists...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "sessions" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
      ) WITH (OIDS=FALSE);
      
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'session_pkey') THEN
          ALTER TABLE "sessions" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
        END IF;
      EXCEPTION
        WHEN OTHERS THEN
          NULL;
      END $$;

      CREATE INDEX IF NOT EXISTS "IX_session_expire" ON "sessions" ("expire");
    `);

    console.log("Database fixes applied successfully.");
  } catch (err) {
    console.error("Error applying database fixes:", err);
  } finally {
    await client.end();
  }
}

fixSchema();
