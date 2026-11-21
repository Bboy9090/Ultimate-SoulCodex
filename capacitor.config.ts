import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.soulcodex.main",
  appName: "Soul Codex",
  webDir: "dist/public",

  backgroundColor: "#07060B",

  server: {
    androidScheme: "https",
  },

  ios: {
    scheme: "Soul Codex",
    backgroundColor: "#07060B",
    contentInset: "automatic",
    preferredContentMode: "mobile",
    allowsLinkPreview: false,
    scrollEnabled: true,
    // Explicit list so a newly installed plugin is NOT pulled into the iOS Swift package graph by
    // `cap sync` (Xcode Cloud runs it, and ios/App/CapApp-SPM is vendored and patched by hand).
    // @capacitor-firebase/messaging is intentionally absent until iOS push is integrated and
    // built on a Mac; see docs/PUSH_NOTIFICATIONS.md.
    includePlugins: [
      "@capacitor/contacts",
      "@capacitor/keyboard",
      "@capacitor/splash-screen",
      "@capacitor/status-bar",
      "@capawesome/capacitor-apple-sign-in",
    ],
  },

  plugins: {
    SystemBars: {
      insetsHandling: "css",
      style: "DARK",
      hidden: false,
      animation: "FADE",
    },
  },
};

export default config;
