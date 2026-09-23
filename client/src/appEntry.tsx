import { createRoot } from "react-dom/client";
import { useEffect } from "react";
import { registerSoulCodexServiceWorker } from "./lib/registerServiceWorker";
import App from "./App";
import "./index.css";
import "./theme/soulcodex-premium.css";

declare global {
  interface Window {
    __SOULCODEX_BOOT_READY__?: boolean;
    __SOULCODEX_NATIVE_DIALOGS__?: {
      alert: typeof window.alert;
      confirm: typeof window.confirm;
      prompt: typeof window.prompt;
    } | null;
  }
}

function BootReadyMarker() {
  useEffect(() => {
    window.__SOULCODEX_BOOT_READY__ = true;
    document.documentElement.dataset.soulcodexBoot = "ready";

    const nativeDialogs = window.__SOULCODEX_NATIVE_DIALOGS__;
    if (nativeDialogs) {
      window.alert = nativeDialogs.alert;
      window.confirm = nativeDialogs.confirm;
      window.prompt = nativeDialogs.prompt;
      window.__SOULCODEX_NATIVE_DIALOGS__ = null;
    }
  }, []);
  return null;
}

createRoot(document.getElementById("root")!).render(
  <>
    <BootReadyMarker />
    <App />
  </>,
);

registerSoulCodexServiceWorker();
