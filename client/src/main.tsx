import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { registerSoulCodexServiceWorker } from "./lib/registerServiceWorker";
import App from "./App";
import "./index.css";
import "./theme/soulcodex-premium.css";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);

registerSoulCodexServiceWorker();
