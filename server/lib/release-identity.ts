export const FOUNDATION_API_CONTRACT = "foundation-v4";
export const FOUNDATION_RELEASE_VERSION =
  process.env.SOUL_CODEX_RELEASE_VERSION || "4.0.0-rc.3";

export function releaseIdentity() {
  return {
    status: "ok" as const,
    appVersion: FOUNDATION_RELEASE_VERSION,
    releaseSha:
      process.env.SOUL_CODEX_RELEASE_SHA ||
      process.env.RAILWAY_GIT_COMMIT_SHA ||
      process.env.GIT_COMMIT_SHA ||
      process.env.SOURCE_COMMIT ||
      "unknown",
    apiContract: FOUNDATION_API_CONTRACT,
  };
}
