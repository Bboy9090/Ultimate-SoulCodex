import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.soulcodex.main",
  appName: "Soul Codex",
  webDir: "dist/public",

  backgroundColor: "#0B0720",

  server: {
    androidScheme: "https",
  },

  ios: {
    scheme: "Soul Codex",
    backgroundColor: "#0B0720",
    contentInset: "automatic",
    preferredContentMode: "mobile",
    allowsLinkPreview: false,
    scrollEnabled: true,
  },

  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: "#0B0720",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true,
    },
    SystemBars: {
      insetsHandling: "css",
      style: "DARK",
      hidden: false,
      animation: "FADE",
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true,
    },
  },
};

export default config;
