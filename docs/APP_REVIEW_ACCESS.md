# App Review access gate

Observed in App Store Connect on October29: Sign-in required is unchecked; contact details and Notes are populated. Build346 was rejected for a native launch crash, not an authentication failure. Guest access does not by itself qualify account/subscription review.

The Free local-profile journey is available without login. Account-backed and subscription flows must have working reviewer access matching the actual submitted binary/backend. The email/password route in PR607 is not in main or the current native candidate. Do not enter invented credentials in App Store Connect or mark a review account tested before it works in the submitted app.

Before resubmission:
1. Qualify and deploy the real account path, preserving Apple sign-in and local-first storage.
2. Create a dedicated ordinary reviewer account containing only synthetic review data. Never provide the owner's personal Apple/Google password, grant admin access, or use the owner complimentary allowlist as a reviewer bypass.
3. Verify sign-in, sign-out, profile ownership, account deletion and access from the actual native candidate. Keep its credentials outside GitHub, build logs and public artifacts.
4. For subscription review, qualify the actual sandbox purchase/restore/expiry paths. Do not invent an expired purchase record or claim that a Free account had a real subscription.
5. Set the App Review sign-in fields to those verified reviewer credentials and provide exact navigation and subscription test instructions. Preserve the existing contact information and relevant Notes. Store metadata must not promise email login if the selected binary only supports Apple.

The current email password minimum remains the existing server policy of6 characters; the form must accept every server-valid password. Dedicated reviewer credentials should still use a strong generated password. The current repair moves duplicate-user lookup into the guarded signup block so transient storage errors return a bounded500 instead of escaping Express4. Focused tests cover storage failure/server survival and six/seven-character signup/login compatibility.

Reference: https://developer.apple.com/help/app-review/before-submitting-for-review/complete-review/
