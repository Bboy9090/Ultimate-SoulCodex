import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.soulcodex.ios",
  appName: "Soul Codex",
  webDir: "../dist/public",
  backgroundColor: "#1A0E07",

  server: {
    url: "https://soulcodex.app",
    cleartext: false,
  },

  ios: {
    scheme: "Soul Codex",
    backgroundColor: "#1A0E07",
    contentInset: "automatic",
    preferredContentMode: "mobile",
    allowsLinkPreview: false,
    scrollEnabled: true,
  },

  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: "#1A0E07",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#1A0E07",
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true,
    },
  },
};

export default config;
