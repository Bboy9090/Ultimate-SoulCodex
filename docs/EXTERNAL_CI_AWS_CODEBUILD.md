# SoulCodex external CI: AWS CodeBuild

GitHub Actions is intentionally disabled for this repository by keeping historical workflows under `.ci/github-actions-archive/` instead of `.github/workflows/`.

## Core CI project

Use AWS CodeBuild with:

- Source provider: GitHub
- Repository: `https://github.com/Bboy9090/Ultimate-SoulCodex`
- Buildspec: `buildspec.yml`
- Managed Linux image: current AWS CodeBuild standard image
- Runtime: Node.js 22
- Artifacts: S3
- Webhook events: `PUSH`, `PULL_REQUEST_CREATED`, `PULL_REQUEST_UPDATED`, `PULL_REQUEST_REOPENED`
- Recommended branch filter: main for pushes, all trusted PR heads for PR validation

The core build preserves the existing trust, privacy, compatibility, dependency-security, TypeScript, workspace-test, release-invariant, and production-build gates.

## Android project

Create a second CodeBuild project using `buildspec-android.yml`.

Required build image capabilities:

- Node.js 22
- Java 21
- Android SDK matching the repository Gradle/Capacitor requirements

Set `BUILD_TYPE` to one of:

- `debug`
- `release-apk`
- `release-aab`

For release builds, map these environment variables from AWS Secrets Manager or SSM Parameter Store. Do not store them in GitHub or plaintext CodeBuild variables:

- `ANDROID_KEYSTORE` (base64 encoded)
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

Store build artifacts in S3.

## Webhook safety

Use CodeBuild webhook filter groups and restrict triggering actors where practical. AWS recommends actor filters for public-repository webhook builds. Do not also put the same CodeBuild project behind CodePipeline with an enabled CodeBuild webhook, because that can create duplicate builds.

## iOS

iOS is intentionally not faked on Linux. Keep iOS release validation on an external macOS-capable service such as AWS CodeBuild macOS or Xcode Cloud. The archived GitHub workflow is retained at `.ci/github-actions-archive/build-ios.yml` as migration reference.

## Re-enabling GitHub Actions

Do not move archived files back into `.github/workflows/` unless GitHub Actions billing is intentionally restored.
