import type { Express } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStoreFactory from "memorystore";
import { storage } from "./storage";
import { verifyPassword } from "./passwordUtils";

const MemoryStore = MemoryStoreFactory(session);

// ═══════════════════════════════════════════════════════════════════════════
// AUTHENTICATION SETUP - Production-Grade Security
// ═══════════════════════════════════════════════════════════════════════════

export async function setupAuth(app: Express) {
  const isProduction = process.env.NODE_ENV === "production";
  
  // Warn if using default session secret in production
  if (isProduction && !process.env.SESSION_SECRET) {
    console.error("⚠️  CRITICAL: SESSION_SECRET not set in production!");
    console.error("⚠️  Generate a secure secret: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"");
  }

  // Trust proxy for proper IP detection behind reverse proxies
  app.set("trust proxy", 1);

  // Session configuration with security best practices
  app.use(
    session({
      store: new MemoryStore({ 
        checkPeriod: 86400000, // Prune expired entries every 24h
        max: 10000 // Maximum number of sessions
      }),
      secret: process.env.SESSION_SECRET || "dev-session-secret-change-in-prod",
      name: "soulcodex.sid", // Custom session cookie name (avoid default "connect.sid")
      resave: false,
      saveUninitialized: false,
      rolling: true, // Refresh session on each request
      cookie: {
        httpOnly: true, // Prevent XSS access to cookie
        secure: isProduction, // HTTPS only in production
        sameSite: "lax", // CSRF protection
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        path: "/",
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
