# Chrome Extensions

This repository hosts multiple Chrome extensions, each in its own folder:

| Folder | Extension |
|--------|-----------|
| [`youtube-date-range-search/`](youtube-date-range-search/) | Search YouTube videos published within a specific date range |
| [`claude-usage-monitor/`](claude-usage-monitor/) | Live view of remaining Claude usage limits (session, weekly, per-model) in the toolbar |
| [`starter-extension/`](starter-extension/) | Minimal Manifest V3 scaffold for building a new extension |

## Loading an extension

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** and select the folder of the extension you want to load

Each folder is a self-contained extension — load them independently; they don't share any files.
