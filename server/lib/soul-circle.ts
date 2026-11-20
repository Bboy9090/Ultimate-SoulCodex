import { createHash, randomBytes } from "crypto";
import { z } from "zod";
import type { Profile, SoulCircleShare } from "@shared/schema";
import {
  buildPublicProfileProjection,
  publicShareSelectionSchema,
  type PublicProfileProjection,
  type PublicShareSelection,
} from "./public-profile-projection";

/**
 * Soul Circle policy. A friend's chart is never stored: it is recomputed on every
 * read from the sharer's own profile, filtered to the fields the sharer consented
 * to for that one friend, and only ever contains independently verified data
 * (the same projection used for public share links).
 */
export const SOUL_CIRCLE_INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const SOUL_CIRCLE_SHARE_TTL_MS = 180 * 24 * 60 * 60 * 1000;
export const SOUL_CIRCLE_MAX_ACTIVE_INVITES = 10;
export const SOUL_CIRCLE_MAX_FRIENDS = 100;

export const soulCircleShareSelectionSchema = publicShareSelectionSchema;
export type SoulCircleShareSelection = PublicShareSelection;

export const soulCircleInviteTokenSchema = z.string().min(32).max(96).regex(/^[A-Za-z0-9_-]+$/);

export function newSoulCircleInviteToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Only the hash is stored, so a database read never reveals a usable invite. */
export function hashSoulCircleInviteToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function soulCircleShareIsActive(share: Pick<SoulCircleShare, "revokedAt" | "expiresAt"> | undefined | null, now: Date): share is SoulCircleShare {
  return Boolean(share && !share.revokedAt && share.expiresAt.getTime() > now.getTime());
}

export function parseStoredSelection(value: unknown): SoulCircleShareSelection | null {
  const parsed = soulCircleShareSelectionSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

/** What a friend may see right now: the consented fields that are currently verified. */
export function projectSharedChart(ownerProfile: Profile | undefined, selection: SoulCircleShareSelection | null): PublicProfileProjection["fields"] | null {
  if (!ownerProfile || !selection) return null;
  const projection = buildPublicProfileProjection(ownerProfile, selection);
  return Object.keys(projection.fields).length > 0 ? projection.fields : null;
}
