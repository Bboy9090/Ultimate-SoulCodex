export const FOUNDATION_API_CONTRACT = "foundation-v4";
export const DEFAULT_FOUNDATION_RELEASE_VERSION = "4.0.1";

import { resolvePersistenceCapabilities } from "./persistence-capabilities";

export type ReleaseIdentity = {
  status: "ok";
  appVersion: string;
  releaseSha: string;
  apiContract: string;
  persistence: {
    mode: "postgres" | "memory";
    durable: boolean;
    durableFeaturesAvailable: boolean;
  };
};

/**
 * Non-secret runtime identity used to prove that a client is talking to the
 * backend contract it was qualified against. Railway provides
 * RAILWAY_GIT_COMMIT_SHA for GitHub-triggered deployments; other deployers may
 * supply SOUL_CODEX_RELEASE_SHA explicitly.
 */
export function resolveReleaseIdentity(
  env: Record<string, string | undefined> = process.env,
): ReleaseIdentity {
  const persistence = resolvePersistenceCapabilities(env);
  return {
    status: "ok",
    appVersion: env.SOUL_CODEX_RELEASE_VERSION || DEFAULT_FOUNDATION_RELEASE_VERSION,
    releaseSha:
      env.SOUL_CODEX_RELEASE_SHA ||
      env.RAILWAY_GIT_COMMIT_SHA ||
      env.GIT_COMMIT_SHA ||
      env.SOURCE_COMMIT ||
      "unknown",
    apiContract: FOUNDATION_API_CONTRACT,
    persistence: {
      mode: persistence.mode,
      durable: persistence.durable,
      durableFeaturesAvailable: persistence.durableFeaturesAvailable,
    },
  };
}
