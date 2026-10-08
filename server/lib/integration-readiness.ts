import {
  resolveIntegrationConfig,
  type IntegrationConfig,
  type IntegrationProvider,
} from "./integration-config";

export type IntegrationReadinessStatus = "disabled" | "ready" | "blocked";

export type ProviderIntegrationReadiness = {
  provider: IntegrationProvider;
  enabled: boolean;
  configured: boolean;
  mode: IntegrationConfig["mode"];
  status: IntegrationReadinessStatus;
  configurationReady: boolean;
  missingRequirements: string[];
  policyBlockers: string[];
};

export type IntegrationReadinessReport = {
  environment: "production" | "non-production";
  configurationGatePassed: boolean;
  claimsProductionActivationReady: false;
  providers: Record<IntegrationProvider, ProviderIntegrationReadiness>;
  blockers: string[];
  activationEvidenceRequired: readonly string[];
};

export const INTEGRATION_ACTIVATION_EVIDENCE_REQUIRED = Object.freeze([
  "Google/Firebase project ownership confirmed",
  "privacy and persisted-consent behavior tested",
  "test identifiers verified outside production",
  "provider-failure and offline fallbacks verified",
  "premium entitlement confirms complete ad suppression",
  "cost alerts and budget limits configured",
] as const);

function valuePresent(env: Record<string, string | undefined>, key: string): boolean {
  return Boolean(env[key]?.trim());
}

function oneOfPresent(env: Record<string, string | undefined>, keys: readonly string[]): boolean {
  return keys.some((key) => valuePresent(env, key));
}

function missingRequirementsFor(
  provider: IntegrationProvider,
  env: Record<string, string | undefined>,
): string[] {
  const missing: string[] = [];
  const requireKey = (key: string) => {
    if (!valuePresent(env, key)) missing.push(key);
  };

  switch (provider) {
    case "firebase":
      requireKey("FIREBASE_PROJECT_ID");
      requireKey("FIREBASE_ANDROID_PACKAGE");
      requireKey("FIREBASE_IOS_BUNDLE_ID");
      requireKey("FIREBASE_WEB_APP_ORIGIN");
      break;
    case "admob":
      requireKey("ADMOB_ANDROID_APP_ID");
      requireKey("ADMOB_IOS_APP_ID");
      requireKey("ADMOB_ANDROID_BANNER_UNIT_ID");
      requireKey("ADMOB_IOS_BANNER_UNIT_ID");
      requireKey("ADMOB_ANDROID_REWARDED_UNIT_ID");
      requireKey("ADMOB_IOS_REWARDED_UNIT_ID");
      break;
    case "googleAnalytics":
      requireKey("GOOGLE_ANALYTICS_MEASUREMENT_ID");
      break;
    case "aws":
      requireKey("AWS_REGION");
      break;
    case "gemini":
      requireKey("GEMINI_MODEL");
      if (!oneOfPresent(env, ["AI_INTEGRATIONS_GEMINI_API_KEY", "GEMINI_API_KEY"])) {
        missing.push("GEMINI_API_KEY or AI_INTEGRATIONS_GEMINI_API_KEY");
      }
      break;
    case "tensorFlow":
      requireKey("TENSORFLOW_MODEL_ENDPOINT");
      break;
  }

  return missing;
}

function policyBlockersFor(provider: IntegrationProvider, enabled: boolean): string[] {
  if (!enabled) return [];
  if (provider === "aws") {
    return ["AWS activation is paused by the portfolio resource-utilization policy"];
  }
  return [];
}

export function resolveIntegrationReadiness(
  env: Record<string, string | undefined> = process.env,
): IntegrationReadinessReport {
  const config = resolveIntegrationConfig(env);
  const providerNames = Object.keys(config) as IntegrationProvider[];
  const providers = {} as Record<IntegrationProvider, ProviderIntegrationReadiness>;
  const blockers: string[] = [];

  for (const provider of providerNames) {
    const providerConfig = config[provider];
    const missingRequirements = providerConfig.enabled ? missingRequirementsFor(provider, env) : [];
    const policyBlockers = policyBlockersFor(provider, providerConfig.enabled);
    const providerBlockers = [
      ...missingRequirements.map((requirement) => "missing " + requirement),
      ...policyBlockers,
    ];
    const configurationReady =
      providerConfig.enabled && providerConfig.configured && providerBlockers.length === 0;

    const status: IntegrationReadinessStatus = !providerConfig.enabled
      ? "disabled"
      : configurationReady
        ? "ready"
        : "blocked";

    providers[provider] = {
      provider,
      enabled: providerConfig.enabled,
      configured: providerConfig.configured,
      mode: providerConfig.mode,
      status,
      configurationReady,
      missingRequirements,
      policyBlockers,
    };

    for (const blocker of providerBlockers) {
      blockers.push(provider + ": " + blocker);
    }
    if (providerConfig.enabled && !providerConfig.configured && missingRequirements.length === 0) {
      blockers.push(provider + ": provider configuration is incomplete");
    }
  }

  return {
    environment: env.NODE_ENV === "production" ? "production" : "non-production",
    configurationGatePassed: blockers.length === 0,
    claimsProductionActivationReady: false,
    providers,
    blockers,
    activationEvidenceRequired: INTEGRATION_ACTIVATION_EVIDENCE_REQUIRED,
  };
}

export function assertEnabledIntegrationsConfigured(
  env: Record<string, string | undefined> = process.env,
): IntegrationReadinessReport {
  const report = resolveIntegrationReadiness(env);
  if (!report.configurationGatePassed) {
    throw new Error("Integration configuration readiness failed: " + report.blockers.join("; "));
  }
  return report;
}
