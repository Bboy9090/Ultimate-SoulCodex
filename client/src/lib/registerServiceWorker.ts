import { Capacitor } from "@capacitor/core";

function serviceWorkerUrls(): { script: URL; scope: string } {
  const moduleUrl = import.meta.url;
  const script = new URL("../sw.js", moduleUrl);
  const scope = new URL("../", moduleUrl).pathname;
  return { script, scope };
}

async function clearNativePwaResidue(): Promise<void> {
  // Capacitor ships a bundled web app. A browser/PWA service worker must never
  // control the native WebView after an App Store update.
  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
  } catch (error) {
    console.warn("[native] Service worker cleanup failed", error);
  }

  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("soulcodex-shell-"))
          .map((key) => caches.delete(key)),
      );
    }
  } catch (error) {
    console.warn("[native] PWA cache cleanup failed", error);
  }
}

export function registerSoulCodexServiceWorker(): void {
  if (import.meta.env.DEV) return;

  if (Capacitor.isNativePlatform()) {
    window.addEventListener("load", () => {
      void clearNativePwaResidue();
    });
    return;
  }

  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    const { script, scope } = serviceWorkerUrls();

    navigator.serviceWorker
      .register(script, { scope, updateViaCache: "none" })
      .then((registration) => {
        const requestUpdate = () => {
          void registration.update().catch((error) => {
            console.warn("[pwa] Service worker update check failed", error);
          });
        };

        window.addEventListener("online", requestUpdate);
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") requestUpdate();
        });
      })
      .catch((error) => {
        console.warn("[pwa] Service worker registration failed", error);
      });
  });
}
