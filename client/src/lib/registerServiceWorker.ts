function serviceWorkerUrls(): { script: URL; scope: string } {
  const moduleUrl = import.meta.url;
  const script = new URL("../sw.js", moduleUrl);
  const scope = new URL("../", moduleUrl).pathname;
  return { script, scope };
}

export function registerSoulCodexServiceWorker(): void {
  if (import.meta.env.DEV || !("serviceWorker" in navigator)) return;

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
