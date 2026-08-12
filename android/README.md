Packaging GoKart Dodge Pro for Android — options and step-by-step

Overview
- Two common approaches to produce an Android App Bundle (AAB) from a web PWA:
  1) Trusted Web Activity (TWA) using Bubblewrap (recommended for PWAs hosted on GitHub Pages).
  2) Capacitor (Ionic Capacitor) which wraps web assets in a native WebView (useful if you need native plugins).

This guide focuses on Bubblewrap/TWA for minimal friction.

Prerequisites (local)
- Android Studio (for local builds) or GitHub Actions runner (for CI builds)
- Java JDK (11+ or 17 recommended)
- Android SDK (installed with Android Studio)
- Node.js (14+)
- Bubblewrap CLI: npm install -g @bubblewrap/cli

Quick local steps (Bubblewrap)
1) Install bubblewrap: npm install -g @bubblewrap/cli
2) Initialize project (non-interactive):
   bubblewrap init --manifestUrl "https://saurabh123734.github.io/my-ai-friend/manifest.json" --applicationId "com.yourcompany.gokartdodgepro" --name "GoKart Dodge Pro" --force
   - This will create a directory `twa/` with the Android project.
3) Build the Android app (debug unsigned):
   cd twa && ./gradlew bundleRelease
   - Output AAB will be in `twa/app/build/outputs/bundle/release/app-release.aab` (may require signing)

Signing (recommended before uploading to Play Console)
- Create a keystore locally with keytool, or use your Play App Signing key if enrolled.
- Example to create keystore:
  keytool -genkey -v -keystore release-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias release
- Provide keystore path and passwords to bubblewrap build:
  bubblewrap build --keystore ./release-keystore.jks --keystorePassword YOUR_PASS --keyAlias release --keyPassword YOUR_KEYPASS

CI notes (GitHub Actions)
- A sample workflow is created at `.github/workflows/android-build.yml` that:
  - Checks out the repo
  - Installs Java and Node
  - Installs Bubblewrap
  - Runs bubblewrap init and bubblewrap build
  - Optionally decodes a base64-encoded keystore from the secret `ANDROID_KEYSTORE_BASE64` and signs the build (if secrets are set)
  - Uploads the AAB as a workflow artifact

Play Console publishing
- Sign into Google Play Console and create an app record.
- Upload the AAB to an internal testing track first for verification.
- Provide store listing, screenshots, privacy policy, and content rating.
- When ready, roll out to production.

Secrets and repo settings (for automated signing)
- ANDROID_KEYSTORE_BASE64: base64 of the .jks file (store as GitHub secret)
- ANDROID_KEYSTORE_PASSWORD
- ANDROID_KEY_ALIAS
- ANDROID_KEY_PASSWORD

If you want, prepare the signing keystore and add the secrets to the repo; I can update the workflow to automatically sign and produce a Play-ready AAB.

Would you like me to:
- A) Generate the CI workflow (already added) and guide you through adding secrets and triggering a build, or
- B) Also add Capacitor instructions and files for an alternate workflow (Capacitor requires different setup)?

Which do you prefer (A or B)?
