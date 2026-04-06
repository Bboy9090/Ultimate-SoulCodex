import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStoreFactory from "memorystore";
import { storage } from "./storage";
import { verifyPassword } from "./passwordUtils";
const MemoryStore = MemoryStoreFactory(session);
export async function setupAuth(app) {
    app.set("trust proxy", 1);
    app.use(session({
        store: new MemoryStore({ checkPeriod: 86400000 }),
        secret: process.env.SESSION_SECRET || "dev-session-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax",
            maxAge: 1000 * 60 * 60 * 24 * 7,
        },
    }));
    passport.use(new LocalStrategy({ usernameField: "email", passwordField: "password" }, async (email, password, done) => {
        try {
            const user = await storage.getLocalUserByEmail(email);
            if (!user)
                return done(null, false, { message: "Invalid email or password" });
            const ok = await verifyPassword(user.passwordHash, password);
            if (!ok)
                return done(null, false, { message: "Invalid email or password" });
            return done(null, { id: user.id, email: user.email, authProvider: "local" });
        }
        catch (err) {
            return done(err);
        }
    }));
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await storage.getUser(id);
            done(null, user ? { id: user.id, email: user.email } : false);
        }
        catch (e) {
            done(e);
        }
    });
    app.use(passport.initialize());
    app.use(passport.session());
}
export function isAuthenticated(req, _res, next) {
    if (req.isAuthenticated && req.isAuthenticated())
        return next();
    return next(); // allow anonymous for now; tighten later if needed
}
