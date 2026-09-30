export type PersistenceMode = "postgres" | "memory";

export type PersistenceCapabilities = {
  mode: PersistenceMode;
  durable: boolean;
  production: boolean;
  durableFeaturesAvailable: boolean;
};

export function resolvePersistenceCapabilities(
  env: Record<string, string | undefined> = process.env,
): PersistenceCapabilities {
  const production = env.NODE_ENV === "production";
  const usePostgres = Boolean(env.DATABASE_URL) && env.DEMO_MODE !== "true";
  return {
    mode: usePostgres ? "postgres" : "memory",
    durable: usePostgres,
    production,
    durableFeaturesAvailable: usePostgres || !production,
  };
}

export function durableFeatureUnavailable(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return !resolvePersistenceCapabilities(env).durableFeaturesAvailable;
}

export const DURABLE_STORAGE_UNAVAILABLE_RESPONSE = {
  message:
    "This feature requires durable server storage, which is not configured for this deployment.",
  code: "durable_storage_unavailable",
} as const;
