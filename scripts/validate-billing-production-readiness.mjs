const truthy = (value) => String(value ?? "").trim().toLowerCase() === "true";
const present = (value) => Boolean(String(value ?? "").trim());

function providerReadiness(env = process.env) {
  const persistent = present(env.DATABASE_URL);
  const publicAppUrl = present(env.PUBLIC_APP_URL);

  const webAuth = {
    configured: present(env.APPLE_WEB_CLIENT_ID) && publicAppUrl,
    missing: ["APPLE_WEB_CLIENT_ID"].filter((key) => !present(env[key])),
  };

  const stripe = {
    configured: [
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET",
      "STRIPE_PLUS_MONTHLY_PRICE_ID",
      "STRIPE_PLUS_ANNUAL_PRICE_ID",
    ].every((key) => present(env[key])) && persistent && publicAppUrl,
    missing: [
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET",
      "STRIPE_PLUS_MONTHLY_PRICE_ID",
      "STRIPE_PLUS_ANNUAL_PRICE_ID",
    ].filter((key) => !present(env[key])),
    enabled: truthy(env.SOUL_CODEX_PLUS_WEB_CHECKOUT_ENABLED),
  };

  const apple = {
    configured: [
      "APPLE_CLIENT_ID",
      "APPLE_APP_ID",
      "APPLE_IAP_ROOT_CERTS_BASE64",
      "APPLE_PLUS_MONTHLY_PRODUCT_ID",
      "APPLE_PLUS_ANNUAL_PRODUCT_ID",
    ].every((key) => present(env[key])) && persistent,
    missing: [
      "APPLE_CLIENT_ID",
      "APPLE_APP_ID",
      "APPLE_IAP_ROOT_CERTS_BASE64",
      "APPLE_PLUS_MONTHLY_PRODUCT_ID",
      "APPLE_PLUS_ANNUAL_PRODUCT_ID",
    ].filter((key) => !present(env[key])),
    productionOnly:
      String(env.APPLE_IAP_ALLOWED_ENVIRONMENTS ?? "").trim().toLowerCase() === "production",
  };

  const google = {
    configured: [
      "GOOGLE_PLAY_SERVICE_ACCOUNT_JSON",
      "GOOGLE_PLAY_PACKAGE_NAME",
      "GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID",
      "GOOGLE_PLAY_PLUS_ANNUAL_PRODUCT_ID",
      "GOOGLE_PLAY_RTDN_VERIFICATION_TOKEN",
    ].every((key) => present(env[key])) && persistent,
    missing: [
      "GOOGLE_PLAY_SERVICE_ACCOUNT_JSON",
      "GOOGLE_PLAY_PACKAGE_NAME",
      "GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID",
      "GOOGLE_PLAY_PLUS_ANNUAL_PRODUCT_ID",
      "GOOGLE_PLAY_RTDN_VERIFICATION_TOKEN",
    ].filter((key) => !present(env[key])),
  };

  const nativeEnabled = truthy(env.SOUL_CODEX_PLUS_NATIVE_BILLING_ENABLED);
  const nativeConfigured = apple.configured && google.configured && apple.productionOnly;

  return {
    persistenceConfigured: persistent,
    publicAppUrlConfigured: publicAppUrl,
    stripe,
    apple,
    google,
    webAuth,
    webActivationSafe: !stripe.enabled || (stripe.configured && webAuth.configured),
    nativeActivationSafe: !nativeEnabled || nativeConfigured,
    fullyConfigured: stripe.configured && webAuth.configured && nativeConfigured,
    flags: {
      webCheckoutEnabled: stripe.enabled,
      nativeBillingEnabled: nativeEnabled,
    },
  };
}

const readiness = providerReadiness();
console.log(JSON.stringify(readiness, null, 2));

if (!readiness.webActivationSafe || !readiness.nativeActivationSafe) {
  console.error("Soul Codex+ billing activation is unsafe: an enabled purchase surface is missing required production configuration.");
  process.exit(2);
}

if (process.argv.includes("--require-all") && !readiness.fullyConfigured) {
  console.error("Soul Codex+ production billing is not fully configured.");
  process.exit(3);
}
