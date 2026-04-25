import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import "./index.css";

const rootEl = document.getElementById("root");

if (rootEl) {
  setTimeout(() => {
    const root = createRoot(rootEl);
    root.render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
  }, 0);

  // Lazy-load the splash screen plugin
  setTimeout(() => {
    import('@capacitor/splash-screen').then(({ SplashScreen }) => {
      SplashScreen.hide().catch(() => {});
    }).catch(() => {});
  }, 1000);
}

// Global crash protection
window.onerror = function(msg, url, line, col, error) {
  console.log("CRITICAL_ERROR: " + msg + " at " + line + ":" + col);
  return false;
};
