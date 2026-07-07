// Injects a small "Date range" button on YouTube that opens an inline panel
// for searching by publish date, scoped to the current channel when on a
// channel page.

(function () {
  const BTN_ID = "ytdrs-toggle";
  const PANEL_ID = "ytdrs-panel";

  function currentChannelPath() {
    const m = location.pathname.match(/^\/(@[\w.-]+|channel\/[\w-]+|c\/[\w.-]+|user\/[\w.-]+)/);
    return m ? m[1] : null;
  }

  function buildPanel() {
    const panel = document.createElement("div");
    panel.id = PANEL_ID;
    panel.innerHTML = `
      <div class="ytdrs-title">Search by date range</div>
      <input type="text" id="ytdrs-keywords" placeholder="Keywords (optional)">
      <input type="text" id="ytdrs-channel" placeholder="Channel URL, @handle or name (optional)">
      <div class="ytdrs-dates">
        <label>From <input type="date" id="ytdrs-from"></label>
        <label>To <input type="date" id="ytdrs-to"></label>
      </div>
      <div id="ytdrs-error" class="ytdrs-error" hidden></div>
      <button id="ytdrs-go">Search</button>
    `;

    const channelPath = currentChannelPath();
    if (channelPath) {
      panel.querySelector("#ytdrs-channel").value = "https://www.youtube.com/" + channelPath;
    }

    panel.querySelector("#ytdrs-go").addEventListener("click", () => {
      const values = {
        keywords: panel.querySelector("#ytdrs-keywords").value,
        channel: panel.querySelector("#ytdrs-channel").value,
        from: panel.querySelector("#ytdrs-from").value,
        to: panel.querySelector("#ytdrs-to").value,
      };
      const error = YTDRS.validateInputs(values);
      const errorEl = panel.querySelector("#ytdrs-error");
      if (error) {
        errorEl.textContent = error;
        errorEl.hidden = false;
        return;
      }
      errorEl.hidden = true;
      location.href = YTDRS.buildSearchUrl(values);
    });

    return panel;
  }

  function togglePanel() {
    const existing = document.getElementById(PANEL_ID);
    if (existing) {
      existing.remove();
      return;
    }
    document.body.appendChild(buildPanel());
  }

  function ensureButton() {
    if (document.getElementById(BTN_ID)) return;
    const btn = document.createElement("button");
    btn.id = BTN_ID;
    btn.textContent = "📅 Date range";
    btn.title = "Search YouTube videos by publish date range";
    btn.addEventListener("click", togglePanel);
    document.body.appendChild(btn);
  }

  ensureButton();
  // YouTube is a SPA; re-check after navigations in case the DOM was replaced.
  document.addEventListener("yt-navigate-finish", () => {
    ensureButton();
    // Refresh the prefilled channel if the panel is open on a new page.
    const panel = document.getElementById(PANEL_ID);
    if (panel) {
      const channelPath = currentChannelPath();
      if (channelPath) {
        panel.querySelector("#ytdrs-channel").value =
          "https://www.youtube.com/" + channelPath;
      }
    }
  });
})();
