export type FirebaseWebConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

export type FirebaseWebConfigResolution = {
  configured: boolean;
  config: FirebaseWebConfig | null;
};

/**
 * Resolves only the browser-safe Firebase web configuration.
 * Service-account credentials and server secrets are intentionally unsupported.
 */
export function resolveFirebaseWebConfig(
  env: Record<string, string | undefined>,
): FirebaseWebConfigResolution {
  const config: FirebaseWebConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY?.trim() ?? "",
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN?.trim() ?? "",
    projectId: env.VITE_FIREBASE_PROJECT_ID?.trim() ?? "",
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET?.trim() ?? "",
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() ?? "",
    appId: env.VITE_FIREBASE_APP_ID?.trim() ?? "",
    measurementId: env.VITE_FIREBASE_MEASUREMENT_ID?.trim() || undefined,
  };

  const required = [
    config.apiKey,
    config.authDomain,
    config.projectId,
    config.storageBucket,
    config.messagingSenderId,
    config.appId,
  ];

  return {
    configured: required.every(Boolean),
    config: required.every(Boolean) ? config : null,
  };
}
