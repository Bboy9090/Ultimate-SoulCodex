import { Capacitor, registerPlugin } from "@capacitor/core";
import { apiFetch, apiRequest, queryClient } from "./queryClient";

type GoogleAuthConfig = {
  enabled: boolean;
  clientId: string | null;
  reason: "ready" | "google_signin_not_configured";
};

type GoogleAuthUser = {
  id: string;
  username: string;
  email?: string | null;
};

interface SoulCodexGoogleAuthPlugin {
  signIn(options: { serverClientId: string }): Promise<{
    idToken: string;
    email?: string | null;
    displayName?: string | null;
  }>;
}

const NativeGoogleAuth = registerPlugin<SoulCodexGoogleAuthPlugin>("SoulCodexGoogleAuth");

export async function loadGoogleAuthConfig(): Promise<GoogleAuthConfig> {
  const response = await apiFetch("/api/auth/google/config", { cache: "no-store" });
  if (!response.ok) {
    return { enabled: false, clientId: null, reason: "google_signin_not_configured" };
  }
  return response.json();
}

export async function completeGoogleSignIn(idToken: string): Promise<GoogleAuthUser> {
  const response = await apiRequest("POST", "/api/auth/google", { idToken });
  const payload = await response.json() as { user?: GoogleAuthUser };
  if (!payload.user) throw new Error("Google Sign-In did not return an account");
  const user = { ...payload.user, authProvider: "google" };
  queryClient.setQueryData(["/api/auth/user"], user);
  queryClient.setQueryData(["/api/user"], user);
  return payload.user;
}

export async function nativeGoogleSignIn(clientId: string): Promise<GoogleAuthUser> {
  if (Capacitor.getPlatform() !== "android") {
    throw new Error("Native Google Sign-In is available only on Android");
  }
  const result = await NativeGoogleAuth.signIn({ serverClientId: clientId });
  return completeGoogleSignIn(result.idToken);
}
