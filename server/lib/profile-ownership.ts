export type ProfileOwnership = {
  userId?: string | null;
  sessionId?: string | null;
};

export type ProfileActor = {
  userId?: string | null;
  sessionId?: string | null;
};

/**
 * Server-backed Soul Profiles are private capabilities owned either by the
 * authenticated user that created them or by the anonymous session that
 * created them before sign-in. Ownerless legacy rows fail closed.
 */
export function profileBelongsToActor(
  profile: ProfileOwnership | null | undefined,
  actor: ProfileActor,
): boolean {
  if (!profile) return false;
  if (profile.userId) {
    return Boolean(actor.userId && actor.userId === profile.userId);
  }
  if (profile.sessionId) {
    return Boolean(actor.sessionId && actor.sessionId === profile.sessionId);
  }
  return false;
}
