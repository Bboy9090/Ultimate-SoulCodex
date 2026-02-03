import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

// Bootstrap mode: DATABASE_URL is optional when using MemStorage
// Set DATABASE_URL to enable persistence with Drizzle ORM
const databaseUrl = process.env.DATABASE_URL;

export const pool = databaseUrl 
  ? new Pool({ connectionString: databaseUrl })
  : null;

// Stubbed out for bootstrap; no schema tables initialized
export const db = pool ? drizzle({ client: pool }) : null;
