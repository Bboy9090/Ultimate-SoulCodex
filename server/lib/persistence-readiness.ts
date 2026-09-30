import { resolvePersistenceCapabilities } from "./persistence-capabilities";

export type PersistenceReadiness = {
  mode: "postgres" | "memory";
  durable: boolean;
  connected: boolean | null;
  ready: boolean;
};

type ReadinessProbe = () => Promise<void>;

async function defaultPostgresProbe(): Promise<void> {
  const { pool } = await import("../db");
  await pool.query("SELECT 1");
}

async function runWithTimeout(
  probe: ReadinessProbe,
  timeoutMs: number,
): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      probe(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("persistence_readiness_timeout")),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function checkPersistenceReadiness(
  env: Record<string, string | undefined> = process.env,
  probe: ReadinessProbe = defaultPostgresProbe,
  timeoutMs = 1_500,
): Promise<PersistenceReadiness> {
  const capabilities = resolvePersistenceCapabilities(env);

  if (capabilities.mode === "memory") {
    return {
      mode: "memory",
      durable: false,
      connected: null,
      ready: !capabilities.production,
    };
  }

  try {
    await runWithTimeout(probe, timeoutMs);
    return {
      mode: "postgres",
      durable: true,
      connected: true,
      ready: true,
    };
  } catch {
    return {
      mode: "postgres",
      durable: true,
      connected: false,
      ready: false,
    };
  }
}
