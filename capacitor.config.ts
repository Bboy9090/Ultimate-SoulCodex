import type { CapacitorConfig } from "@capacitor/cli";

const serverUrl = process.env.CAPACITOR_SERVER_URL?.trim();

const config: CapacitorConfig = {
  appId: "app.soulcodex.ios",
  appName: "Soul Codex",
  webDir: "dist/public",
  backgroundColor: "#1A0E07",
  ...(serverUrl
    ? {
        server: {
          url: serverUrl,
          cleartext: false,
        },
      }
    : {}),

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
      launchAutoHide: false,
      launchShowDuration: 2000,
      backgroundColor: "#1A0E07",
      showSpinner: false,
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
