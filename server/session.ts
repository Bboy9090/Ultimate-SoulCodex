import type { Express } from "express";
import session from "express-session";
import MemoryStoreFactory from "memorystore";
import connectPgSimple from "connect-pg-simple";

const MemoryStore = MemoryStoreFactory(session);
const PgSession = connectPgSimple(session);

export function setupSession(app: Express) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET must be set before starting the server");

  const usePostgres = Boolean(process.env.DATABASE_URL) && process.env.DEMO_MODE !== "true";
  const isProduction = process.env.NODE_ENV === "production";
  const store = usePostgres
    ? new PgSession({
        conString: process.env.DATABASE_URL,
        tableName: "sessions",
        createTableIfMissing: true,
      })
    : new MemoryStore({ checkPeriod: 86_400_000 });

  (store as any).on?.("error", (error: unknown) => {
    console.error("[Sessions] Store error:", error);
  });

  app.use(session({
    store,
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      // Native Capacitor shells call the HTTPS API from a different origin.
      // Store builds therefore require a Secure + SameSite=None session cookie.
      sameSite: isProduction ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }));

  console.log(`[Sessions] Using ${usePostgres ? "Postgres" : "memory"} session store`);
}
