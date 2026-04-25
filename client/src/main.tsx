import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import "./index.css";
import { SplashScreen } from '@capacitor/splash-screen';

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
  
  // Hide splash screen after app renders
  SplashScreen.hide();
}
