GoKart Dodge Pro — Microsoft Store (MSIX/PWA) packaging guide

Goal
- Produce a Microsoft Store package (MSIX) from the web PWA so the game can be published to the Microsoft Store (and be available for Windows 10/11 users).
- Keep the game free (no in-app purchases) and avoid any forced upgrades.

Options (recommended)
1) PWABuilder (web): Easiest — use https://www.pwabuilder.com to generate an MSIX package from your live site (or local files packaged as a zip).
2) PWABuilder CLI (automation): Use the PWABuilder CLI on a Windows runner or locally to automate packaging (useful for CI).
3) Manual MSIX with Visual Studio / MakeAppx: For full control, create an AppxManifest and produce MSIX using the Windows SDK tools.

Before you start
- Ensure your site is served over HTTPS to fully comply with store requirements. If you cannot serve it publicly, PWABuilder can take a ZIP of your web files.
- Create a Microsoft Partner Center account and reserve an app name before uploading a package: https://partner.microsoft.com/
- Prepare store assets (icons, images, privacy policy URL). See ../STORE_ASSETS.md for the checklist.

Quick steps (PWABuilder web, easiest)
1. Open https://www.pwabuilder.com
2. Enter your live URL (if you published to GitHub Pages later) or upload a ZIP of this repo (index.html + assets).
3. PWABuilder will analyze your manifest and suggest fixes. Update manifest.json if needed (name, icons, scope, start_url).
4. Click "Generate" and choose "Microsoft Store (.msix)".
5. PWABuilder will create an MSIX and a package that you can download. It will also generate a suggested AppxManifest if needed.
6. Sign in to Partner Center, create a new app, and upload the package to the submission.

Local packaging (Windows SDK / MakeAppx)
- This is useful when you want to package from local files and sign the package yourself.
- Requirements: Windows SDK (MakeAppx.exe and SignTool.exe), a code signing certificate (.pfx). Visual Studio installs these tools.

Example (PowerShell):
1) Create a working folder with your web content, for example c:\build\gokart
2) Prepare an AppxManifest.xml (PWABuilder or Visual Studio can generate one). Ensure the Identity, DisplayName, and Visual elements are correct.
3) Run MakeAppx to create the package:
   & "C:\\Program Files (x86)\\Windows Kits\\10\\bin\\x64\\makeappx.exe" pack /d "C:\\build\\gokart" /p "C:\\build\\GoKartDodgePro.msix"
4) Sign the package (replace paths and passwords):
   & "C:\\Program Files (x86)\\Windows Kits\\10\\bin\\x64\\signtool.exe" sign /fd SHA256 /a /f "C:\\certs\\mycert.pfx" /p "PFX_PASSWORD" "C:\\build\\GoKartDodgePro.msix"
5) Upload the signed MSIX to Microsoft Partner Center.

Automating with GitHub Actions (example)
- Use a windows-latest runner and PWABuilder CLI or MakeAppx tools in the runner to create and sign the MSIX. You will need to store the code signing certificate (.pfx) as a GitHub secret (base64) and the password as secret.
- If you want I can add a sample workflow file that runs on push and produces a signed MSIX artifact (you will need to add the PFX and password as secrets).

Partner Center submission checklist
- App name reserved in Partner Center
- App package (MSIX) signed and tested
- Store listing: descriptions, screenshots, icons, privacy policy URL, support URL
- Pricing: set to Free (no in-app purchases) if you want the game accessible to everyone
- Age rating and content descriptors
- Privacy policy and contact/support email

What I can do now
- A) Add a GitHub Actions workflow that attempts to create an MSIX using PWABuilder CLI on a windows-latest runner and uploads the artifact (you'll add signing secrets). (Recommended for automation.)
- B) Add a PowerShell script (generate-msix.ps1) that you can run locally on Windows (requires Windows SDK and a PFX certificate).
- C) Walk through the PWABuilder web flow interactively and prepare the ZIP and store listing text for you.

Which would you like? (Reply with A, B, or C)