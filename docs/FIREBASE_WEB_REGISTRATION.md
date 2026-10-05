# Firebase Web Registration

Target project: `soul-codex-platform`

Target web client:

- App nickname: Soul Codex Web
- Hosting/runtime: Railway production web app
- Repository: `Bboy9090/Ultimate-SoulCodex`
- Current production URL: `https://soulcodex.up.railway.app`
- Status: pending Firebase Console session availability

When registering the web app, download the Firebase web configuration and place public configuration values in deployment environment variables. Keep service-account credentials and private keys out of source control.

Required follow-up:

- Add the web app to the same Firebase project.
- Configure the web client with the existing consent boundary.
- Keep analytics events disabled until consent is recorded.
- Verify production and staging origins separately.
