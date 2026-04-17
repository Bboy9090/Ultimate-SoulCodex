import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.soulcodex.android",
  appName: "Soul Codex",
  webDir: "../dist/public",
  backgroundColor: "#1A0E07",

  server: {
    url: "https://soul-codex-engine-of-eternal-now.replit.app",
    cleartext: false,
    androidScheme: "https",
  },

  android: {
    backgroundColor: "#1A0E07",
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    minWebViewVersion: 80,
    loggingBehavior: "production",
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
