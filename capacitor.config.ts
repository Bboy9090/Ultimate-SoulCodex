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
