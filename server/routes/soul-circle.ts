import type { Express, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import type { IStorage } from "../storage";
import { SOUL_CIRCLE_MAX_EVENTS_PER_USER, soulCircleOtherUser } from "../storage";
import {
  SOUL_CIRCLE_INVITE_TTL_MS,
  SOUL_CIRCLE_MAX_ACTIVE_INVITES,
  SOUL_CIRCLE_MAX_FRIENDS,
  SOUL_CIRCLE_SHARE_TTL_MS,
  hashSoulCircleInviteToken,
  newSoulCircleInviteToken,
  parseStoredSelection,
  projectSharedChart,
  soulCircleInviteTokenSchema,
  soulCircleShareIsActive,
  soulCircleShareSelectionSchema,
} from "../lib/soul-circle";
import { hashPushToken, pushPlatformSchema, pushTokenSchema, type PushService } from "../lib/push-delivery";

type SoulCircleStorage = Pick<
  IStorage,
  | "getProfileByUserId"
  | "createSoulCircleInvite"
  | "listSoulCircleInvites"
  | "revokeSoulCircleInvite"
  | "getSoulCircleInviteByTokenHash"
  | "acceptSoulCircleInvite"
  | "getSoulCircleLinkById"
  | "listSoulCircleLinksForUser"
  | "listSoulCircleBlockedByUser"
  | "removeSoulCircleLink"
  | "blockSoulCircleLink"
  | "upsertSoulCircleShareForLink"
  | "getSoulCircleShare"
  | "revokeSoulCircleShare"
  | "createSoulCircleEvent"
  | "listSoulCircleEvents"
  | "markSoulCircleEventsRead"
  | "upsertPushDevice"
  | "listPushDevices"
  | "deletePushDevice"
  | "deleteAllPushDevices"
>;

export interface SoulCircleDependencies {
  storage: SoulCircleStorage;
  requireDurableFeature(res: Response): boolean;
  now?: () => Date;
  /** Phone push. Absent or unconfigured means no tokens are accepted and nothing is sent. */
  push?: PushService;
}

const ANONYMOUS_FRIEND_NAME = "Soul Circle friend";

// The only name an invitee sees is one the inviter typed for this invite.
const registerPushSchema = z.object({ platform: pushPlatformSchema, token: pushTokenSchema }).strict();
const unregisterPushSchema = z.union([
  z.object({ token: pushTokenSchema }).strict(),
  z.object({ all: z.literal(true) }).strict(),
]);

const markReadSchema = z.union([
  z.object({ all: z.literal(true) }).strict(),
  z.object({ ids: z.array(z.string().min(1).max(64)).min(1).max(100) }).strict(),
]);

const inviteOptionsSchema = z.object({ displayName: z.string().trim().min(1).max(80).optional() }).strict();

function noStore(res: Response) {
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
}

function signedInUserId(req: Request, res: Response): string | null {
  const userId = (req as any).session?.userId;
  if (typeof userId === "string" && userId) return userId;
  res.status(401).json({ message: "Sign in to use Soul Circle.", code: "sign_in_required" });
  return null;
}

// Never reveal whether a link, invite, or friend exists for someone who is not a member.
function notFound(res: Response) {
  return res.status(404).json({ message: "Not found", code: "soul_circle_not_found" });
}

export function createSoulCircleHandlers(dependencies: SoulCircleDependencies) {
  const { storage } = dependencies;
  const clock = () => (dependencies.now ?? (() => new Date()))();

  // Fire and forget: a slow or failing push provider must never delay or fail the request.
  function notifyInBackground(userId: string) {
    try { void Promise.resolve(dependencies.push?.notifyUpdate(userId)).catch(() => undefined); } catch { /* never blocks the request */ }
  }

  async function memberLink(userId: string, linkId: unknown) {
    if (typeof linkId !== "string" || !linkId) return null;
    const link = await storage.getSoulCircleLinkById(linkId);
    if (!link || link.status !== "active") return null;
    const friendUserId = soulCircleOtherUser(link, userId);
    return friendUserId ? { link, friendUserId } : null;
  }

  // A name is shown only if the person chose it for this friend. Account names
  // (which can be a full legal name from a sign-in provider) are never used.
  function friendName(theirSelection: ReturnType<typeof parseStoredSelection>) {
    if (theirSelection?.fields.includes("displayName") && theirSelection.displayName) return theirSelection.displayName;
    return ANONYMOUS_FRIEND_NAME;
  }

  // What this one friend may currently see of the signed-in user's chart.
  async function describeFriend(userId: string, link: { id: string; createdAt: Date }, friendUserId: string, now: Date) {
    const [mine, theirs, theirProfile] = await Promise.all([
      storage.getSoulCircleShare(userId, friendUserId),
      storage.getSoulCircleShare(friendUserId, userId),
      storage.getProfileByUserId(friendUserId),
    ]);
    const mineActive = soulCircleShareIsActive(mine, now) ? mine : null;
    const theirsActive = soulCircleShareIsActive(theirs, now) ? theirs : null;
    const theirSelection = theirsActive ? parseStoredSelection(theirsActive.selection) : null;
    const chart = theirsActive ? projectSharedChart(theirProfile, theirSelection) : null;
    const mySelection = mineActive ? parseStoredSelection(mineActive.selection) : null;
    return {
      id: link.id,
      displayName: friendName(theirSelection),
      since: link.createdAt,
      iShare: mineActive && mySelection
        ? { fields: mySelection.fields, expiresAt: mineActive.expiresAt }
        : null,
      theirChart: chart,
      theirChartStatus: !theirsActive ? "not_shared" : chart ? "shared" : "unavailable",
    } as const;
  }

  return {
    async createInvite(req: Request, res: Response) {
      noStore(res);
      if (!dependencies.requireDurableFeature(res)) return;
      const userId = signedInUserId(req, res);
      if (!userId) return;
      try {
        const now = clock();
        const invites = await storage.listSoulCircleInvites(userId);
        const open = invites.filter((invite) => !invite.revokedAt && !invite.acceptedAt && invite.expiresAt.getTime() > now.getTime());
        if (open.length >= SOUL_CIRCLE_MAX_ACTIVE_INVITES) {
          return res.status(409).json({
            message: `You already have ${SOUL_CIRCLE_MAX_ACTIVE_INVITES} open invites. Cancel one before creating another.`,
            code: "soul_circle_invite_limit",
          });
        }
        const friends = await storage.listSoulCircleLinksForUser(userId);
        if (friends.length >= SOUL_CIRCLE_MAX_FRIENDS) {
          return res.status(409).json({ message: "Your Soul Circle is full.", code: "soul_circle_full" });
        }
        const chosen = inviteOptionsSchema.safeParse(req.body ?? {});
        if (!chosen.success) {
          return res.status(400).json({ message: "Invalid invite options", code: "invalid_invite", issues: chosen.error.issues });
        }
        const token = newSoulCircleInviteToken();
        const expiresAt = new Date(now.getTime() + SOUL_CIRCLE_INVITE_TTL_MS);
        const invite = await storage.createSoulCircleInvite(userId, hashSoulCircleInviteToken(token), expiresAt, chosen.data.displayName ?? null);
        // The token is returned exactly once; only its hash is stored.
        res.status(201).json({ id: invite.id, token, path: `/circle/join/${token}`, expiresAt: invite.expiresAt });
      } catch (error) {
        console.error("[SoulCircle] createInvite failed:", error);
        res.status(500).json({ message: "Could not create the invite." });
      }
    },

    async listInvites(req: Request, res: Response) {
      noStore(res);
      if (!dependencies.requireDurableFeature(res)) return;
      const userId = signedInUserId(req, res);
      if (!userId) return;
      try {
        const now = clock();
        const invites = await storage.listSoulCircleInvites(userId);
        res.json(invites.map((invite) => ({
          id: invite.id,
          createdAt: invite.createdAt,
          expiresAt: invite.expiresAt,
          status: invite.revokedAt ? "cancelled" : invite.acceptedAt ? "accepted" : invite.expiresAt.getTime() <= now.getTime() ? "expired" : "open",
        })));
      } catch (error) {
        console.error("[SoulCircle] listInvites failed:", error);
        res.status(500).json({ message: "Could not load invites." });
      }
    },

    async revokeInvite(req: Request, res: Response) {
      noStore(res);
      if (!dependencies.requireDurableFeature(res)) return;
      const userId = signedInUserId(req, res);
      if (!userId) return;
      try {
        const revoked = await storage.revokeSoulCircleInvite(userId, String(req.params.id ?? ""), clock());
        if (!revoked) return notFound(res);
        res.status(204).end();
      } catch (error) {
        console.error("[SoulCircle] revokeInvite failed:", error);
        res.status(500).json({ message: "Could not cancel the invite." });
      }
    },

    async previewInvite(req: Request, res: Response) {
      noStore(res);
      if (!dependencies.requireDurableFeature(res)) return;
      const userId = signedInUserId(req, res);
      if (!userId) return;
      try {
        const token = soulCircleInviteTokenSchema.safeParse(req.params.token);
        const unavailable = () => res.status(410).json({ message: "This invite is no longer available.", code: "invite_unavailable" });
        if (!token.success) return unavailable();
        const invite = await storage.getSoulCircleInviteByTokenHash(hashSoulCircleInviteToken(token.data));
        const now = clock();
        if (!invite || invite.revokedAt || invite.acceptedAt || invite.expiresAt.getTime() <= now.getTime()) return unavailable();
        if (invite.inviterUserId === userId) return res.status(400).json({ message: "This is your own invite.", code: "own_invite" });
        res.json({ inviterName: invite.inviterDisplayName?.trim() || ANONYMOUS_FRIEND_NAME, expiresAt: invite.expiresAt });
      } catch (error) {
        console.error("[SoulCircle] previewInvite failed:", error);
        res.status(500).json({ message: "Could not read the invite." });
      }
    },

    async acceptInvite(req: Request, res: Response) {
      noStore(res);
      if (!dependencies.requireDurableFeature(res)) return;
      const userId = signedInUserId(req, res);
      if (!userId) return;
      try {
        const token = soulCircleInviteTokenSchema.safeParse((req.body as any)?.token);
        const unavailable = () => res.status(410).json({ message: "This invite is no longer available.", code: "invite_unavailable" });
        if (!token.success) return unavailable();
        const tokenHash = hashSoulCircleInviteToken(token.data);

        const invite = await storage.getSoulCircleInviteByTokenHash(tokenHash);
        if (invite) {
          const [mine, theirs] = await Promise.all([
            storage.listSoulCircleLinksForUser(userId),
            storage.listSoulCircleLinksForUser(invite.inviterUserId),
          ]);
          if (mine.length >= SOUL_CIRCLE_MAX_FRIENDS || theirs.length >= SOUL_CIRCLE_MAX_FRIENDS) {
            return res.status(409).json({ message: "A Soul Circle is full.", code: "soul_circle_full" });
          }
        }

        const result = await storage.acceptSoulCircleInvite(tokenHash, userId, clock());
        if (result.status === "linked") {
          // Tell the inviter's phone only when this accept actually created the friendship.
          if (result.created) notifyInBackground(result.inviterUserId);
          // Joining a circle shares nothing by itself: each person separately chooses what to share.
          return res.status(200).json({ id: result.link.id });
        }
        if (result.status === "self") return res.status(400).json({ message: "This is your own invite.", code: "own_invite" });
        // Expired, used, cancelled, unknown and blocked all look identical to the caller.
        return unavailable();
      } catch (error) {
        console.error("[SoulCircle] acceptInvite failed:", error);
        res.status(500).json({ message: "Could not join the circle." });
      }
    },

    async listFriends(req: Request, res: Response) {
      noStore(res);
      if (!dependencies.requireDurableFeature(res)) return;
      const userId = signedInUserId(req, res);
      if (!userId) return;
      try {
        const now = clock();
        const links = await storage.listSoulCircleLinksForUser(userId);
        const friends = await Promise.all(links.map(async (link) => {
          const friendUserId = soulCircleOtherUser(link, userId);
          return friendUserId ? describeFriend(userId, link, friendUserId, now) : null;
        }));
        res.json(friends.filter(Boolean));
      } catch (error) {
        console.error("[SoulCircle] listFriends failed:", error);
        res.status(500).json({ message: "Could not load your Soul Circle." });
      }
    },

    async getFriend(req: Request, res: Response) {
      noStore(res);
      if (!dependencies.requireDurableFeature(res)) return;
      const userId = signedInUserId(req, res);
      if (!userId) return;
      try {
        const member = await memberLink(userId, req.params.id);
        if (!member) return notFound(res);
        const now = clock();
        const friend = await describeFriend(userId, member.link, member.friendUserId, now);
        // Transparency: exactly what this friend can see of me right now, recomputed live.
        let myPreview: ReturnType<typeof projectSharedChart> = null;
        if (friend.iShare) {
          const mine = await storage.getSoulCircleShare(userId, member.friendUserId);
          if (soulCircleShareIsActive(mine, now)) {
            myPreview = projectSharedChart(await storage.getProfileByUserId(userId), parseStoredSelection(mine.selection));
          }
        }
        res.json({ ...friend, myPreview });
      } catch (error) {
        console.error("[SoulCircle] getFriend failed:", error);
        res.status(500).json({ message: "Could not load this friend." });
      }
    },

    async setShare(req: Request, res: Response) {
      noStore(res);
      if (!dependencies.requireDurableFeature(res)) return;
      const userId = signedInUserId(req, res);
      if (!userId) return;
      try {
        const member = await memberLink(userId, req.params.id);
        if (!member) return notFound(res);
        const selection = soulCircleShareSelectionSchema.safeParse(req.body);
        if (!selection.success) {
          return res.status(400).json({ message: "Invalid share selection", code: "invalid_selection", issues: selection.error.issues });
        }
        const profile = await storage.getProfileByUserId(userId);
        if (!profile) {
          return res.status(409).json({
            message: "Save and verify your chart online before sharing it. Nothing leaves your device until you do.",
            code: "verified_profile_required",
          });
        }
        const preview = projectSharedChart(profile, selection.data);
        if (!preview) {
          return res.status(422).json({
            message: "None of the fields you chose are independently verified yet, so there is nothing to share.",
            code: "no_verified_fields",
          });
        }
        const expiresAt = new Date(clock().getTime() + SOUL_CIRCLE_SHARE_TTL_MS);
        // The link is re-checked under a lock with the write, so a friendship removed or
        // blocked while we were verifying cannot be left with a consent behind.
        const now = clock();
        const before = await storage.getSoulCircleShare(userId, member.friendUserId);
        const saved = await storage.upsertSoulCircleShareForLink(member.link.id, userId, selection.data, expiresAt);
        if (!saved) return notFound(res);
        // Tell the friend only when sharing starts or resumes, never on later tweaks, and
        // never when sharing stops: the event carries no name or data.
        if (!soulCircleShareIsActive(before, now)) {
          const created = await storage.createSoulCircleEvent(member.friendUserId, "friend_shared", member.link.id, now);
          // A phone alert goes out only when a new update was actually created (not a duplicate).
          if (created) notifyInBackground(member.friendUserId);
        }
        // Echo exactly what the friend can see so consent is informed.
        res.status(200).json({ fields: selection.data.fields, expiresAt, preview });
      } catch (error) {
        console.error("[SoulCircle] setShare failed:", error);
        res.status(500).json({ message: "Could not update sharing." });
      }
    },

    async revokeShare(req: Request, res: Response) {
      noStore(res);
      if (!dependencies.requireDurableFeature(res)) return;
      const userId = signedInUserId(req, res);
      if (!userId) return;
      try {
        const member = await memberLink(userId, req.params.id);
        if (!member) return notFound(res);
        await storage.revokeSoulCircleShare(userId, member.friendUserId, clock());
        res.status(204).end();
      } catch (error) {
        console.error("[SoulCircle] revokeShare failed:", error);
        res.status(500).json({ message: "Could not stop sharing." });
      }
    },

    async removeFriend(req: Request, res: Response) {
      noStore(res);
      if (!dependencies.requireDurableFeature(res)) return;
      const userId = signedInUserId(req, res);
      if (!userId) return;
      try {
        const member = await memberLink(userId, req.params.id);
        if (!member) return notFound(res);
        await storage.removeSoulCircleLink(member.link.id);
        res.status(204).end();
      } catch (error) {
        console.error("[SoulCircle] removeFriend failed:", error);
        res.status(500).json({ message: "Could not remove this friend." });
      }
    },

    async blockFriend(req: Request, res: Response) {
      noStore(res);
      if (!dependencies.requireDurableFeature(res)) return;
      const userId = signedInUserId(req, res);
      if (!userId) return;
      try {
        const member = await memberLink(userId, req.params.id);
        if (!member) return notFound(res);
        await storage.blockSoulCircleLink(member.link.id, userId);
        res.status(204).end();
      } catch (error) {
        console.error("[SoulCircle] blockFriend failed:", error);
        res.status(500).json({ message: "Could not block this person." });
      }
    },

    async listNotifications(req: Request, res: Response) {
      noStore(res);
      if (!dependencies.requireDurableFeature(res)) return;
      const userId = signedInUserId(req, res);
      if (!userId) return;
      try {
        const now = clock();
        // Everything the store keeps (it caps at the same number), so no unread update is unreachable.
        const events = await storage.listSoulCircleEvents(userId, SOUL_CIRCLE_MAX_EVENTS_PER_USER);
        const items = (await Promise.all(events.map(async (event) => {
          // An update only exists while the friendship does; otherwise it is dropped.
          const member = await memberLink(userId, event.linkId);
          if (!member) return null;
          const theirs = await storage.getSoulCircleShare(member.friendUserId, userId);
          const selection = soulCircleShareIsActive(theirs, now) ? parseStoredSelection(theirs.selection) : null;
          return {
            id: event.id,
            kind: event.kind,
            linkId: event.linkId,
            createdAt: event.createdAt,
            read: Boolean(event.readAt),
            friendName: friendName(selection),
          };
        }))).filter((item): item is NonNullable<typeof item> => item !== null);
        res.json({ unread: items.filter((item) => !item.read).length, items });
      } catch (error) {
        console.error("[SoulCircle] listNotifications failed:", error);
        res.status(500).json({ message: "Could not load your updates." });
      }
    },

    async markNotificationsRead(req: Request, res: Response) {
      noStore(res);
      if (!dependencies.requireDurableFeature(res)) return;
      const userId = signedInUserId(req, res);
      if (!userId) return;
      try {
        const body = markReadSchema.safeParse(req.body ?? {});
        if (!body.success) return res.status(400).json({ message: "Invalid request", code: "invalid_request" });
        // Scoped to the caller: ids belonging to anyone else are simply not matched.
        const marked = await storage.markSoulCircleEventsRead(userId, "all" in body.data ? "all" : body.data.ids, clock());
        res.json({ marked });
      } catch (error) {
        console.error("[SoulCircle] markNotificationsRead failed:", error);
        res.status(500).json({ message: "Could not update your updates." });
      }
    },

    async pushStatus(req: Request, res: Response) {
      noStore(res);
      if (!dependencies.requireDurableFeature(res)) return;
      const userId = signedInUserId(req, res);
      if (!userId) return;
      try {
        const devices = await storage.listPushDevices(userId);
        res.json({ available: Boolean(dependencies.push?.isAvailable()), registered: devices.length > 0, deviceCount: devices.length });
      } catch (error) {
        console.error("[SoulCircle] pushStatus failed:", error);
        res.status(500).json({ message: "Could not load phone alert settings." });
      }
    },

    async registerPushDevice(req: Request, res: Response) {
      noStore(res);
      if (!dependencies.requireDurableFeature(res)) return;
      const userId = signedInUserId(req, res);
      if (!userId) return;
      try {
        const body = registerPushSchema.safeParse(req.body ?? {});
        if (!body.success) return res.status(400).json({ message: "Invalid device", code: "invalid_device" });
        // No tokens are collected until delivery really works.
        if (!dependencies.push?.isAvailable()) {
          return res.status(409).json({ message: "Phone alerts are not switched on for this app yet.", code: "push_unavailable" });
        }
        await storage.upsertPushDevice(userId, body.data.platform, body.data.token, hashPushToken(body.data.token), clock());
        res.json({ registered: true });
      } catch (error) {
        console.error("[SoulCircle] registerPushDevice failed:", error);
        res.status(500).json({ message: "Could not turn on phone alerts." });
      }
    },

    async unregisterPushDevice(req: Request, res: Response) {
      noStore(res);
      if (!dependencies.requireDurableFeature(res)) return;
      const userId = signedInUserId(req, res);
      if (!userId) return;
      try {
        const body = unregisterPushSchema.safeParse(req.body ?? {});
        if (!body.success) return res.status(400).json({ message: "Invalid request", code: "invalid_request" });
        const removed = "all" in body.data ? await storage.deleteAllPushDevices(userId) : await storage.deletePushDevice(userId, hashPushToken(body.data.token));
        res.json({ removed });
      } catch (error) {
        console.error("[SoulCircle] unregisterPushDevice failed:", error);
        res.status(500).json({ message: "Could not turn off phone alerts." });
      }
    },

    async listBlocks(req: Request, res: Response) {
      noStore(res);
      if (!dependencies.requireDurableFeature(res)) return;
      const userId = signedInUserId(req, res);
      if (!userId) return;
      try {
        const blocked = await storage.listSoulCircleBlockedByUser(userId);
        // Deliberately no names: the blocked person's consent was deleted with the link.
        res.json(blocked.map((link) => ({ id: link.id, displayName: ANONYMOUS_FRIEND_NAME, blockedAt: link.updatedAt })));
      } catch (error) {
        console.error("[SoulCircle] listBlocks failed:", error);
        res.status(500).json({ message: "Could not load blocked people." });
      }
    },

    // Only the person who blocked can lift the block, and lifting it deletes the link:
    // they must be invited again and nothing is restored automatically.
    async unblock(req: Request, res: Response) {
      noStore(res);
      if (!dependencies.requireDurableFeature(res)) return;
      const userId = signedInUserId(req, res);
      if (!userId) return;
      try {
        const link = await storage.getSoulCircleLinkById(String(req.params.id ?? ""));
        if (!link || link.status !== "blocked" || link.blockedByUserId !== userId) return notFound(res);
        await storage.removeSoulCircleLink(link.id);
        res.status(204).end();
      } catch (error) {
        console.error("[SoulCircle] unblock failed:", error);
        res.status(500).json({ message: "Could not unblock this person." });
      }
    },
  };
}

export function registerSoulCircleRoutes(app: Express, dependencies: SoulCircleDependencies) {
  const handlers = createSoulCircleHandlers(dependencies);
  const readLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 240,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many Soul Circle requests. Please try again later.", code: "soul_circle_rate_limited" },
  });
  const writeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many Soul Circle changes. Please try again later.", code: "soul_circle_rate_limited" },
  });
  // Invite acceptance is the only path that consumes a secret, so it is limited tightly.
  const acceptLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many attempts. Please try again later.", code: "soul_circle_rate_limited" },
  });

  app.post("/api/soul-circle/invites", writeLimiter, handlers.createInvite);
  app.get("/api/soul-circle/invites", readLimiter, handlers.listInvites);
  app.delete("/api/soul-circle/invites/:id", writeLimiter, handlers.revokeInvite);
  app.get("/api/soul-circle/invites/:token/preview", acceptLimiter, handlers.previewInvite);
  app.post("/api/soul-circle/invites/accept", acceptLimiter, handlers.acceptInvite);
  app.get("/api/soul-circle/friends", readLimiter, handlers.listFriends);
  app.get("/api/soul-circle/friends/:id", readLimiter, handlers.getFriend);
  app.put("/api/soul-circle/friends/:id/share", writeLimiter, handlers.setShare);
  app.delete("/api/soul-circle/friends/:id/share", writeLimiter, handlers.revokeShare);
  app.delete("/api/soul-circle/friends/:id", writeLimiter, handlers.removeFriend);
  app.post("/api/soul-circle/friends/:id/block", writeLimiter, handlers.blockFriend);
  app.get("/api/soul-circle/notifications", readLimiter, handlers.listNotifications);
  app.post("/api/soul-circle/notifications/read", writeLimiter, handlers.markNotificationsRead);
  app.get("/api/soul-circle/push/status", readLimiter, handlers.pushStatus);
  app.post("/api/soul-circle/push/register", writeLimiter, handlers.registerPushDevice);
  app.post("/api/soul-circle/push/unregister", writeLimiter, handlers.unregisterPushDevice);
  app.get("/api/soul-circle/blocks", readLimiter, handlers.listBlocks);
  app.delete("/api/soul-circle/blocks/:id", writeLimiter, handlers.unblock);
}
