import type { CapacitorConfig } from "@capacitor/cli";

const serverUrl = process.env.CAPACITOR_SERVER_URL?.trim();

const config: CapacitorConfig = {
  appId: "app.soulcodex.ios",
  appName: "Soul Codex",
  webDir: "dist/public",
  backgroundColor: "#08040F",
  ...(serverUrl
    ? {
        server: {
          url: serverUrl,
          cleartext: false,
        },
      }
    : {}),

  server: {
    iosScheme: "soulcodex",
    hostname: "localhost"
  },
  ios: {
    scheme: "soulcodex",
    backgroundColor: "#08040F",
    contentInset: "automatic",
    preferredContentMode: "mobile",
    allowsLinkPreview: false,
    scrollEnabled: true,
  },

  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      launchShowDuration: 2000,
      backgroundColor: "#050208",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      ios: {
        contentMode: "fit",
      },
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#08040F",
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true,
    },
  },
};

export default config;

