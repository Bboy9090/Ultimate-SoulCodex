export {};

declare global {
  interface Window {
    __SOULCODEX_BOOT_READY__?: boolean;
    __SOULCODEX_SHOW_BOOT_FAILURE__?: (reason?: string) => void;
  }
}

document.documentElement.dataset.soulcodexModule = "bootstrap";

const bootStartedAt = performance.now();

void import("./appEntry")
  .then(() => {
    document.documentElement.dataset.soulcodexModule = "loaded";
    document.documentElement.dataset.soulcodexModuleMs = String(
      Math.round(performance.now() - bootStartedAt),
    );
  })
  .catch((error) => {
    console.error("[boot] React application module failed to load", error);
    document.documentElement.dataset.soulcodexModule = "failed";
    window.__SOULCODEX_SHOW_BOOT_FAILURE__?.("app-module-load");
  });
