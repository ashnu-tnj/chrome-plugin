# Claude Usage Monitor

A Chrome extension that shows how much of your Claude usage limits you have left — session (5-hour), weekly, and per-model limits — right from the toolbar, so you don't have to keep opening claude.ai's settings page.

## How it works

The extension calls claude.ai's own usage API using your existing browser sign-in (no API key, no password — it only works while you're signed in to claude.ai in this browser profile). It renders **every** limit the API reports, so model-specific limits (Opus, Fable, etc.) appear automatically as Anthropic adds them.

- **Toolbar badge** — shows the session limit's used percentage at a glance, color-coded (green → orange → red). Auto-refreshes every 5 minutes.
- **Popup** — one bar per limit with % remaining, and when each limit resets. Includes a manual refresh button and a link to the full usage page.

## Load it in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** and select this `claude-usage-monitor/` folder
4. Make sure you're signed in at [claude.ai](https://claude.ai), then click the extension icon

## Files

| File | Purpose |
|------|---------|
| `manifest.json` | MV3 config; requests access to `claude.ai` only |
| `background.js` | Service worker: polls the usage API, updates the badge |
| `usage-model.js` | Parses the usage response (shared by popup + worker) |
| `popup.html` / `popup.css` / `popup.js` | The popup UI |

## Notes & limitations

- Uses claude.ai's **internal** API (`/api/organizations/{id}/usage`), which is undocumented and could change; the parser is written defensively and shows whatever limits the response contains.
- If you sign out of claude.ai the badge shows `!` and the popup explains how to fix it.
- Percentages are what claude.ai reports; Anthropic doesn't expose exact token counts for consumer plans.
