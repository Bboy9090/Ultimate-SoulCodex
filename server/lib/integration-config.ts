export type IntegrationProvider = "firebase" | "admob" | "googleAnalytics" | "aws" | "gemini" | "tensorFlow";

export type IntegrationConfig = {
  enabled: boolean;
  configured: boolean;
  mode: "disabled" | "test" | "production";
};

function flag(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "true";
}

function mode(enabled: boolean, configured: boolean, production: boolean): IntegrationConfig["mode"] {
  if (!enabled || !configured) return "disabled";
  return production ? "production" : "test";
}

/**
 * Centralizes provider activation without exposing secrets or silently enabling
 * third-party collection. Consent, entitlement, and deployment gates remain
 * separate checks.
 */
export function resolveIntegrationConfig(
  env: Record<string, string | undefined> = process.env,
): Record<IntegrationProvider, IntegrationConfig> {
  const production = env.NODE_ENV === "production";
  const firebaseConfigured = Boolean(env.FIREBASE_PROJECT_ID?.trim());
  const admobConfigured = Boolean(
    env.ADMOB_ANDROID_APP_ID?.trim() || env.ADMOB_IOS_APP_ID?.trim(),
  );
  const googleAnalyticsConfigured = Boolean(env.GOOGLE_ANALYTICS_MEASUREMENT_ID?.trim());
  const awsConfigured = Boolean(env.AWS_REGION?.trim());
  const geminiConfigured = Boolean(
    env.AI_INTEGRATIONS_GEMINI_API_KEY?.trim() || env.GEMINI_API_KEY?.trim(),
  );
  const tensorFlowConfigured = Boolean(env.TENSORFLOW_MODEL_ENDPOINT?.trim());

  return {
    firebase: {
      enabled: flag(env.FIREBASE_ENABLED),
      configured: firebaseConfigured,
      mode: mode(flag(env.FIREBASE_ENABLED), firebaseConfigured, production),
    },
    admob: {
      enabled: flag(env.ADMOB_ENABLED),
      configured: admobConfigured,
      mode: mode(flag(env.ADMOB_ENABLED), admobConfigured, production),
    },
    googleAnalytics: {
      enabled: flag(env.GOOGLE_ANALYTICS_ENABLED),
      configured: googleAnalyticsConfigured,
      mode: mode(flag(env.GOOGLE_ANALYTICS_ENABLED), googleAnalyticsConfigured, production),
    },
    aws: {
      enabled: flag(env.AWS_ENABLED),
      configured: awsConfigured,
      mode: mode(flag(env.AWS_ENABLED), awsConfigured, production),
    },
    gemini: {
      enabled: flag(env.GEMINI_ENABLED),
      configured: geminiConfigured,
      mode: mode(flag(env.GEMINI_ENABLED), geminiConfigured, production),
    },
    tensorFlow: {
      enabled: flag(env.TENSORFLOW_ENABLED),
      configured: tensorFlowConfigured,
      mode: mode(flag(env.TENSORFLOW_ENABLED), tensorFlowConfigured, production),
    },
  };
}
