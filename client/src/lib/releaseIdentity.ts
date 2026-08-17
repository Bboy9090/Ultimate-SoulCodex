import { resolveApiUrl } from "./queryClient";

export const CLIENT_API_CONTRACT = "foundation-v4";
export const DEFAULT_CLIENT_RELEASE_VERSION = "4.0.0-rc.3";

export type ClientReleaseIdentity = {
  appVersion: string;
  releaseSha: string;
  expectedApiContract: string;
  apiBase: string;
};

export function getClientReleaseIdentity(): ClientReleaseIdentity {
  const healthUrl = new URL(resolveApiUrl("/health"), window.location.href);
  return {
    appVersion: import.meta.env.VITE_RELEASE_VERSION || DEFAULT_CLIENT_RELEASE_VERSION,
    releaseSha: import.meta.env.VITE_RELEASE_SHA || "unknown",
    expectedApiContract: import.meta.env.VITE_API_CONTRACT || CLIENT_API_CONTRACT,
    apiBase: healthUrl.origin,
  };
}
