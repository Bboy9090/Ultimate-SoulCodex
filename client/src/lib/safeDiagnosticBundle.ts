export type SafeDiagnosticBundleInput = {
  checkedAt: string | null;
  client: {
    appVersion: string;
    releaseSha: string;
    expectedApiContract: string;
    apiBase: string;
  };
  backend: {
    status?: string;
    appVersion?: string;
    releaseSha?: string;
    apiContract?: string;
  } | null;
  contractMatches: boolean;
  exactShaMatches: boolean;
  compatibilityOk: boolean | null;
  online: boolean;
};

function safe(value: string | undefined | null): string {
  if (!value) return "unknown";
  return value.replace(/[\r\n\t]+/g, " ").trim().slice(0, 180) || "unknown";
}

export function buildSafeDiagnosticBundle(input: SafeDiagnosticBundleInput): string {
  return [
    "Soul Codex safe diagnostic summary",
    `checkedAt=${safe(input.checkedAt)}`,
    `online=${input.online ? "yes" : "no"}`,
    `client.appVersion=${safe(input.client.appVersion)}`,
    `client.releaseSha=${safe(input.client.releaseSha)}`,
    `client.expectedApiContract=${safe(input.client.expectedApiContract)}`,
    `client.apiBase=${safe(input.client.apiBase)}`,
    `backend.status=${safe(input.backend?.status)}`,
    `backend.appVersion=${safe(input.backend?.appVersion)}`,
    `backend.releaseSha=${safe(input.backend?.releaseSha)}`,
    `backend.apiContract=${safe(input.backend?.apiContract)}`,
    `contractMatches=${input.contractMatches ? "yes" : "no"}`,
    `exactShaMatches=${input.exactShaMatches ? "yes" : "no"}`,
    `compatibilityRoute=${input.compatibilityOk === true ? "ok" : input.compatibilityOk === false ? "not-ok" : "unknown"}`,
    "",
    "Privacy: this summary intentionally excludes birth data, profile content, account identifiers, assessment answers, payment data, and share tokens.",
  ].join("\n");
}
