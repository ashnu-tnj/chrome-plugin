# Starter Extension

A minimal Manifest V3 Chrome extension scaffold. Rename it and build your feature on top.

## What's included

| File | Purpose |
|------|---------|
| `manifest.json` | Extension configuration (MV3) |
| `popup.html` / `popup.css` / `popup.js` | Toolbar popup UI |
| `content.js` | Script injected into web pages |
| `background.js` | Background service worker |
| `icons/` | Placeholder solid-color icons (replace with real ones) |

The popup includes a "Ping current tab" button that messages the content script and shows the page title, so you can verify popup ↔ content-script messaging works before building your own feature.

## Load it in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** and select this `starter-extension/` folder

## Customizing

- Change `name`, `description`, and `version` in `manifest.json`
- Narrow `content_scripts.matches` from `<all_urls>` to the sites you actually need
- Remove `background.js` (and the `background` key in the manifest) if you don't need a service worker
