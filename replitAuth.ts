import type { Express } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStoreFactory from "memorystore";
import connectPgSimple from "connect-pg-simple";
import { storage } from "./storage";
import { verifyPassword } from "./auth/passwordUtils";

const MemoryStore = MemoryStoreFactory(session);
const PgSession = connectPgSimple(session);

export async function setupAuth(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    throw new Error(
      "SESSION_SECRET environment variable is not set. " +
      "Set it as a Replit Secret before starting the server."
    );
  }

  app.set("trust proxy", 1);

  // Persistent session store (Postgres) when DATABASE_URL is set.
  // Falls back to in-memory only for local dev without a DB.
  const sessionStore = process.env.DATABASE_URL
    ? new PgSession({
        conString: process.env.DATABASE_URL,
        tableName: "user_sessions",
        createTableIfMissing: false,
      })
    : new MemoryStore({ checkPeriod: 86400000 });

  if (process.env.DATABASE_URL) {
    console.log("[Sessions] Using Postgres-backed session store");
  } else {
    console.warn("[Sessions] Using in-memory session store (DATABASE_URL not set) — sessions will be lost on restart");
  }

  app.use(
    session({
      store: sessionStore,
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    })
  );

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const user = await storage.getLocalUserByEmail(email);
          if (!user) return done(null, false, { message: "Invalid email or password" });
          const ok = await verifyPassword(user.passwordHash, password);
          if (!ok) return done(null, false, { message: "Invalid email or password" });
          return done(null, { id: user.id, email: user.email, authProvider: "local" });
        } catch (err) {
          return done(err as any);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user ? { id: user.id, email: user.email } : false);
    } catch (e) {
      done(e as any);
    }
  });

  app.use(passport.initialize());
  app.use(passport.session());
}

export function isAuthenticated(req: any, _res: any, next: any) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return next(); // allow anonymous for now; tighten later if needed
}
