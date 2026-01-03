import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";

// ═══════════════════════════════════════════════════════════════════════════
// DATABASE CONNECTION - Production-Ready Configuration
// ═══════════════════════════════════════════════════════════════════════════

// Configure WebSocket for serverless Postgres
neonConfig.webSocketConstructor = ws;

// Database URL from environment
const databaseUrl = process.env.DATABASE_URL;

// Connection pool configuration
const poolConfig = databaseUrl ? {
  connectionString: databaseUrl,
  max: 10, // Maximum connections in pool
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 10000, // Connection timeout 10s
} : null;

// Create pool if database URL is provided
export const pool = poolConfig ? new Pool(poolConfig) : null;

// Initialize Drizzle ORM
export const db = pool ? drizzle({ client: pool }) : null;

// Database health check
export async function checkDatabaseHealth(): Promise<{ connected: boolean; latency?: number; error?: string }> {
  if (!pool) {
    return { connected: false, error: "No database configured (using MemStorage)" };
  }
  
  try {
    const start = Date.now();
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    return { connected: true, latency: Date.now() - start };
  } catch (error) {
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : "Unknown database error" 
    };
  }
}

// Log database status on startup
if (databaseUrl) {
  console.log("[Database] PostgreSQL configured");
  console.log("[Database] Pool size: 10, Idle timeout: 30s");
} else {
  console.log("[Database] No DATABASE_URL - using MemStorage (ephemeral)");
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  if (pool) {
    console.log("[Database] Closing connection pool...");
    await pool.end();
    console.log("[Database] Pool closed");
  }
});
