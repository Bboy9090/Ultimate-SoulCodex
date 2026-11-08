import { useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import {
  completeGoogleSignIn,
  loadGoogleAuthConfig,
  nativeGoogleSignIn,
} from "@/lib/googleAuth";

type Props = {
  onSuccess?: (user: any) => void;
};

type GoogleCredentialResponse = {
  credential?: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }): void;
          renderButton(
            parent: HTMLElement,
            options: {
              type: "standard";
              theme: "outline";
              size: "large";
              shape: "rectangular";
              text: "signin_with";
              width: number;
            },
          ): void;
        };
      };
    };
  }
}

let googleScriptPromise: Promise<void> | null = null;

function loadGoogleIdentityServices(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (googleScriptPromise) return googleScriptPromise;
  googleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-soulcodex-google-auth="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Google Identity Services failed to load")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.soulcodexGoogleAuth = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Identity Services failed to load"));
    document.head.appendChild(script);
  });
  return googleScriptPromise;
}

export default function GoogleSignInButton({ onSuccess }: Props) {
  const platform = Capacitor.getPlatform();
  const webButtonRef = useRef<HTMLDivElement>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void loadGoogleAuthConfig()
      .then((config) => {
        if (!active) return;
        setClientId(config.enabled ? config.clientId : null);
      })
      .catch(() => {
        if (active) setClientId(null);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (platform !== "web" || !clientId || !webButtonRef.current) return;
    let active = true;
    void loadGoogleIdentityServices()
      .then(() => {
        if (!active || !window.google?.accounts?.id || !webButtonRef.current) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          auto_select: false,
          cancel_on_tap_outside: true,
          callback: (response) => {
            if (!response.credential) {
              setStatus("Google Sign-In did not return a credential.");
              return;
            }
            setBusy(true);
            setStatus("");
            void completeGoogleSignIn(response.credential)
              .then((user) => onSuccess?.(user))
              .catch((error) => setStatus(error instanceof Error ? error.message : "Google Sign-In failed."))
              .finally(() => setBusy(false));
          },
        });
        webButtonRef.current.replaceChildren();
        window.google.accounts.id.renderButton(webButtonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "rectangular",
          text: "signin_with",
          width: 320,
        });
      })
      .catch(() => setStatus("Google Sign-In is unavailable right now."));
    return () => { active = false; };
  }, [clientId, onSuccess, platform]);

  if (platform === "ios" || !clientId) return null;

  if (platform === "android") {
    return (
      <div className="mt-4">
        <button
          type="button"
          className="sc-button-secondary w-full"
          disabled={busy}
          data-testid="button-google-signin"
          onClick={() => {
            setBusy(true);
            setStatus("");
            void nativeGoogleSignIn(clientId)
              .then((user) => onSuccess?.(user))
              .catch((error) => {
                const message = error instanceof Error ? error.message : "Google Sign-In failed.";
                if (!message.toLowerCase().includes("cancel")) setStatus(message);
              })
              .finally(() => setBusy(false));
          }}
        >
          {busy ? "Connecting Google…" : "Continue with Google"}
        </button>
        {status && <p className="mb-0 mt-2 text-xs leading-5 text-[var(--sc-stone)]" role="status">{status}</p>}
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div ref={webButtonRef} className={busy ? "pointer-events-none opacity-60" : ""} data-testid="google-web-signin" />
      {status && <p className="mb-0 mt-2 text-xs leading-5 text-[var(--sc-stone)]" role="status">{status}</p>}
    </div>
  );
}
