import type { Express } from "express";
import { storage, type IStorage } from "../storage";
import {
  AppleAuthConfigurationError,
  AppleAuthVerificationError,
  verifyAppleIdentityToken,
  type AppleIdentity,
} from "../auth/apple";

type AppleVerifier = (identityToken: string) => Promise<AppleIdentity>;

type ConsumerAuthDependencies = {
  storage: IStorage;
  verifyApple: AppleVerifier;
};

function publicUser(user: Awaited<ReturnType<IStorage["getUser"]>>) {
  if (!user) return null;
  const { password: _password, ...safe } = user;
  return safe;
}

function regenerateSession(req: any): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error: unknown) => error ? reject(error) : resolve());
  });
}

function saveSession(req: any): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.save((error: unknown) => error ? reject(error) : resolve());
  });
}

function destroySession(req: any): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!req.session) return resolve();
    req.session.destroy((error: unknown) => error ? reject(error) : resolve());
  });
}

export function registerConsumerAuthRoutes(
  app: Express,
  deps: ConsumerAuthDependencies = { storage, verifyApple: verifyAppleIdentityToken },
) {
  app.post("/api/auth/apple", async (req: any, res) => {
    try {
      const identityToken = typeof req.body?.identityToken === "string" ? req.body.identityToken : "";
      const identity = await deps.verifyApple(identityToken);
      const previousSessionId = req.sessionID;
      const user = await deps.storage.getOrCreateAppleUser(identity.subject, identity.email);

      if (previousSessionId) {
        await deps.storage.migrateSessionOwnershipToUser(previousSessionId, user.id);
      }

      await regenerateSession(req);
      req.session.userId = user.id;
      req.session.authProvider = "apple";
      await saveSession(req);

      return res.json({ user: publicUser(user), message: "Successfully authenticated with Apple" });
    } catch (error) {
      if (error instanceof AppleAuthConfigurationError) {
        return res.status(503).json({ message: "Apple Sign-In is not configured on the server" });
      }
      if (error instanceof AppleAuthVerificationError) {
        return res.status(401).json({ message: "Apple identity token could not be verified" });
      }
      console.error("[AppleAuth] Failed:", error);
      return res.status(500).json({ message: "Apple Sign-In failed" });
    }
  });

  const currentUser = async (req: any, res: any) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.json(null);
      const user = await deps.storage.getUser(userId);
      if (!user) {
        await destroySession(req).catch(() => undefined);
        res.clearCookie("connect.sid");
        return res.json(null);
      }
      return res.json({ ...publicUser(user), authProvider: req.session?.authProvider ?? "apple" });
    } catch (error) {
      console.error("[CurrentUser] Failed:", error);
      return res.status(500).json({ message: "Failed to fetch user" });
    }
  };

  app.get("/api/auth/user", currentUser);
  app.get("/api/user", currentUser);

  app.post("/api/auth/logout", async (req: any, res) => {
    try {
      await destroySession(req);
      res.clearCookie("connect.sid");
      return res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("[Logout] Failed:", error);
      return res.status(500).json({ message: "Failed to logout" });
    }
  });
}
