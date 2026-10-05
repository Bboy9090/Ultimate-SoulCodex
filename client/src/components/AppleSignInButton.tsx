import { useState } from "react";
import { Capacitor } from "@capacitor/core";
import { AppleSignIn, SignInScope } from "@capawesome/capacitor-apple-sign-in";
import { apiRequest, queryClient } from "../lib/queryClient";

interface Props {
  onSuccess?: (user: any) => void;
  text?: string;
  className?: string;
}

function randomState(): string {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

type AppleWebConfig = {
  enabled: boolean;
  clientId: string | null;
  redirectURI: string | null;
  reason: string;
};

type AppleWebResponse = {
  authorization?: {
    id_token?: string;
    state?: string;
  };
};

declare global {
  interface Window {
    AppleID?: {
      auth: {
        init(config: {
          clientId: string;
          scope: string;
          redirectURI: string;
          state: string;
          nonce: string;
          usePopup: boolean;
        }): void;
        signIn(): Promise<AppleWebResponse>;
      };
    };
  }
}

let appleWebScriptPromise: Promise<void> | null = null;

function loadAppleWebScript(): Promise<void> {
  if (window.AppleID?.auth) return Promise.resolve();
  if (appleWebScriptPromise) return appleWebScriptPromise;
  appleWebScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-soulcodex-apple-auth="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Apple Sign-In JS failed to load")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    script.async = true;
    script.dataset.soulcodexAppleAuth = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Apple Sign-In JS failed to load"));
    document.head.appendChild(script);
  });
  return appleWebScriptPromise;
}

async function finishSoulCodexAppleLogin(identityToken: string): Promise<any> {
  const response = await apiRequest("POST", "/api/auth/apple", { identityToken });
  const loginData = await response.json() as { user: any };
  queryClient.setQueryData(["/api/user"], loginData.user);
  queryClient.setQueryData(["/api/auth/user"], loginData.user);
  return loginData.user;
}

export default function AppleSignInButton({ onSuccess, text = "Sign in with Apple", className = "" }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const native = Capacitor.isNativePlatform();

  const handleAppleSignIn = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const state = randomState();
      let identityToken = "";

      if (native) {
        const result = await AppleSignIn.signIn({
          state,
          scopes: [SignInScope.Email, SignInScope.FullName],
        });
        if (result.state && result.state !== state) {
          throw new Error("Apple Sign-In state validation failed");
        }
        identityToken = result.idToken ?? "";
      } else {
        const configResponse = await fetch("/api/auth/apple/config", {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (!configResponse.ok) throw new Error("Apple web sign-in configuration unavailable");
        const config = await configResponse.json() as AppleWebConfig;
        if (!config.enabled || !config.clientId || !config.redirectURI) {
          setMessage("Web Sign in with Apple is not configured yet. Your local profile still works without signing in.");
          return;
        }
        await loadAppleWebScript();
        if (!window.AppleID?.auth) throw new Error("Apple Sign-In JS unavailable");
        const nonce = randomState();
        window.AppleID.auth.init({
          clientId: config.clientId,
          scope: "name email",
          redirectURI: config.redirectURI,
          state,
          nonce,
          usePopup: true,
        });
        const result = await window.AppleID.auth.signIn();
        if (result.authorization?.state !== state) {
          throw new Error("Apple Sign-In state validation failed");
        }
        identityToken = result.authorization?.id_token ?? "";
      }

      if (!identityToken) {
        throw new Error("Apple did not return an ID token");
      }

      const user = await finishSoulCodexAppleLogin(identityToken);
      setMessage("Apple account connected.");
      onSuccess?.(user);
    } catch (err: any) {
      console.error("[AppleAuth] Sign-in failed:", err);
      if (!err?.message || !String(err.message).toLowerCase().includes("cancel")) {
        setMessage("Apple Sign-In could not be completed. Nothing was changed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        data-testid="button-sign-in-with-apple"
        onClick={handleAppleSignIn}
        disabled={loading}
        className={`apple-signin-btn ${className}`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.6rem",
          width: "100%",
          minHeight: 48,
          padding: "0.85rem 1.5rem",
          background: "#ffffff",
          color: "#050505",
          border: "1px solid rgba(255,255,255,.9)",
          borderRadius: 13,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          fontSize: "0.95rem",
          fontWeight: 650,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.66 : 1,
          transition: "transform 0.18s ease, opacity 0.18s ease, box-shadow 0.18s ease",
          boxShadow: "0 10px 30px rgba(0,0,0,.24)",
        }}
        aria-describedby={message ? "apple-signin-message" : undefined}
      >
        <svg width="17" height="21" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M15.4243 11.458C15.4086 8.52841 17.8486 7.10659 17.9621 7.03295C16.5925 5.03409 14.4754 4.7571 13.7275 4.72443C11.9547 4.54489 10.2311 5.76989 9.32932 5.76989C8.42318 5.76989 7.03159 4.77344 5.54523 4.80284C3.60159 4.83139 1.82114 5.93736 0.822501 7.67457C-1.20932 11.1896 0.301592 16.3774 2.27091 19.2237C3.23864 20.6135 4.3725 22.1803 5.86796 22.124C7.31023 22.0676 7.85409 21.1963 9.61068 21.1963C11.3632 21.1963 11.8673 22.124 13.3857 22.0963C14.9407 22.0676 15.9309 20.669 16.8905 19.2793C17.9941 17.671 18.4552 16.1132 18.4773 16.0355C18.4418 16.0216 15.4416 14.8727 15.4243 11.458ZM12.7566 3.1206C13.5516 2.15582 14.1032 0.824858 13.9536 -0.5C12.8091 -0.450994 11.4116 0.272159 10.5891 1.23366C9.85182 2.08835 9.20659 3.44759 9.37841 4.74489C10.6552 4.84375 11.9702 4.07685 12.7566 3.1206Z" fill="currentColor"/>
        </svg>
        <span>{loading ? "Connecting…" : text}</span>
      </button>

      {message && (
        <p
          id="apple-signin-message"
          role="status"
          style={{ margin: "10px 2px 0", color: "rgba(247,240,228,.56)", fontSize: 12, lineHeight: 1.55 }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
