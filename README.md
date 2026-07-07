# YouTube Date Range Search — Chrome Extension

Search YouTube videos published within a specific date range, optionally scoped
to a specific channel. For example: find videos a channel published two years
ago between two exact dates.

## How it works

The extension builds a YouTube search using YouTube's own `after:` and
`before:` search operators — no API key, no quota, no data collection.

- **Popup** (click the toolbar icon): enter optional keywords, an optional
  channel (URL, `@handle`, or approximate name), and a From/To date, then hit
  **Search on YouTube**. If you're already on a channel page, the channel field
  is prefilled.
- **On YouTube pages**: a floating **📅 Date range** button (bottom-right)
  opens the same form inline. On a channel page it's prefilled with that
  channel.

Channel handling:
- Channel **URL or @handle** → the search runs inside that channel's own
  Search tab (exact scoping).
- Approximate **channel name** → the name is added as a quoted term to a
  site-wide search (best-effort match).

Dates are inclusive on both ends (`before:` is internally bumped by one day).

## Files

| File | Purpose |
|---|---|
| `manifest.json` | Manifest V3 configuration |
| `popup.html/css/js` | Toolbar popup UI |
| `content.js` / `content.css` | Floating button + panel injected on youtube.com |
| `search-builder.js` | Shared URL-building and validation logic |
| `icons/` | Extension icons (16/32/48/128) |

## Test locally

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right)
3. Click **Load unpacked** and select this folder
4. Visit youtube.com or click the extension icon

## Publish to the Chrome Web Store

1. Zip the extension (from the repo root):
   ```
   zip -r youtube-date-range-search.zip manifest.json popup.html popup.css popup.js content.js content.css search-builder.js icons/
   ```
2. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   and sign in with your developer account.
3. Click **New item** and upload the zip.
4. Fill in the store listing (description, at least one 1280×800 or 640×400
   screenshot, category: *Search Tools* fits well).
5. In the **Privacy** tab, declare:
   - Single purpose: "Search YouTube videos by publish-date range."
   - Permission justifications: `storage` (remember last-used form values),
     `activeTab` (prefill the channel from the current tab), content script on
     `youtube.com` (show the in-page date-range button).
   - No remote code, no user data collected.
6. Submit for review. Simple extensions like this typically clear review in a
   few days.

## Permissions

- `storage` — remembers your last-used keywords/channel/dates in the popup.
- `activeTab` — reads the current tab's URL (only when you open the popup) to
  prefill the channel field on channel pages.
- Content script on `https://www.youtube.com/*` — renders the floating button.

No analytics, no external requests, no data leaves the browser.
