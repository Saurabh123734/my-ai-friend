# GoKart Dodge Pro

A browser gokart dodge game built with HTML, CSS, and JavaScript.

## What’s new

- Career progression with levels, XP, credits, and reputation
- Driver and gokart selection with unlocks tied to rank
- Multiple locations to choose from, including City Loop, Coast Curve, Night Maze, and Mountain Drift
- Multiple abilities such as shield drift, turbo boost, echo slip, and moonline flash
- Powerups that add shields, speed bursts, and hidden dodge eggs
- Championship progress, quick races, a news feed, achievements, and daily challenges
- Dodge-based gameplay with visible dodge levels, gentle difficulty, and kart-style visuals that are easy for younger players to enjoy

## How to play

- Open [index.html](index.html) in a browser.
- Pick a driver and gokart, then press Start Race.
- Use the left and right arrow keys or tap the left/right side of the game to dodge traffic.
- Press A to activate your selected ability during a run.

## Install on your device

- Apple iPhone/iPad: open the game in Safari, tap Share, then Add to Home Screen.
- Android: open the game in Chrome, tap Install or Add to Home Screen.
- Google/Chrome: use the install icon in the address bar or browser menu.
- Windows 10/11 and other Windows versions: open the game in Edge or Chrome and choose Install.

## Live demo

The game is prepared for GitHub Pages publishing from the main branch. Once the workflow runs, the live site will be available at:

https://saurabh123734.github.io/my-ai-friend/

If you want a public link immediately, use the ZIP in the artifacts (see the itch-zip workflow) and upload it to any static host (Netlify, Vercel, itch.io web). See below for quick publish methods.

## Publish the game (overview for all devices)

This repository now includes CI workflows and packaging scaffolds to produce artifacts for every major platform:

- Web/PWA: `itch-zip.yml` produces out/gokart-dodge-pro-web.zip for quick hosting (Netlify, itch.io). 
- Android: `android-build.yml` produces an AAB with Bubblewrap (use a keystore to sign before uploading to Google Play).
- iOS: `ios-build.yml` attempts to create an Xcode archive (.xcarchive) via Capacitor on macOS runners; signing/provisioning needed for App Store Connect.
- Windows: `windows-msix.yml` produces an MSIX (can be signed with PFX secret) for Microsoft Store.
- Desktop: `electron-build.yml` builds Electron packages for Windows/macOS/Linux (unsigned — sign per platform).

Each workflow uploads unsigned artifacts you can download, sign, and upload to stores.

## Quick publish options (fastest -> slower)
1) Netlify / Vercel: Upload the ZIP from the `itch-zip` workflow or drag-and-drop the `out/gokart-dodge-pro-web.zip` into Netlify Deploys to get a public URL immediately.
2) itch.io: Upload the ZIP under your project (supports web HTML upload) for discoverability and a public page.
3) GitHub Pages: Fix the pages.yml workflow and enable Pages in repository settings; then the site will be available at the GitHub Pages URL.
4) App Stores (Android / iOS / Microsoft / Steam): Use produced artifacts, sign them with your keys, and submit via each store's developer portals.

## Next steps (recommended)
- Run the `itch-zip` workflow (Actions → Build web ZIP) and download the ZIP artifact.
- Upload the ZIP to Netlify (drag-and-drop) to get a public link immediately.
- After you confirm the public link works, produce platform packages (Android AAB, MSIX, Electron builds) and I will guide signing and store submission.

---
