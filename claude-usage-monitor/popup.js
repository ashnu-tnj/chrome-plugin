// Popup: renders cached usage instantly, then asks the service worker for a
// fresh fetch and re-renders.

const limitsEl = document.getElementById("limits");
const errorEl = document.getElementById("error");
const updatedEl = document.getElementById("updated");
const refreshBtn = document.getElementById("refresh-btn");

refreshBtn.addEventListener("click", refresh);

init();

async function init() {
  await render();
  await refresh();
}

async function refresh() {
  refreshBtn.classList.add("spinning");
  try {
    await chrome.runtime.sendMessage({ type: "refresh-usage" });
  } catch {
    // Service worker unavailable; cached data still renders below.
  }
  refreshBtn.classList.remove("spinning");
  await render();
}

async function render() {
  const { lastUsage, lastError } = await chrome.storage.local.get(["lastUsage", "lastError"]);

  if (lastError) {
    errorEl.hidden = false;
    errorEl.innerHTML =
      lastError.code === "signed_out" || lastError.code === "no_org"
        ? 'Not signed in. <a href="https://claude.ai" target="_blank" rel="noopener">Open claude.ai</a> and sign in, then refresh.'
        : escapeHtml(lastError.message);
  } else {
    errorEl.hidden = true;
  }

  const limits = lastUsage ? parseUsage(lastUsage.raw) : [];
  limitsEl.replaceChildren();

  if (limits.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = lastUsage ? "No limit data reported." : "No data yet.";
    limitsEl.append(empty);
  } else {
    for (const limit of limits) limitsEl.append(renderLimit(limit));
  }

  updatedEl.textContent = lastUsage ? `Updated ${timeAgo(lastUsage.fetchedAt)}` : "";
}

function renderLimit({ label, percentUsed, resetsAt }) {
  const container = document.createElement("div");
  container.className = "limit";

  const row = document.createElement("div");
  row.className = "row";
  const labelEl = document.createElement("span");
  labelEl.className = "label";
  labelEl.textContent = label;
  const remainingEl = document.createElement("span");
  row.append(labelEl, remainingEl);
  container.append(row);

  if (percentUsed === null) {
    remainingEl.className = "remaining unknown";
    remainingEl.textContent = "n/a";
  } else {
    const severity = percentUsed >= 90 ? "crit" : percentUsed >= 70 ? "warn" : "ok";
    remainingEl.className = `remaining ${severity}`;
    remainingEl.textContent = `${Math.round(100 - percentUsed)}% left`;

    const bar = document.createElement("div");
    bar.className = "bar";
    const fill = document.createElement("div");
    fill.className = `fill ${severity}`;
    fill.style.width = `${percentUsed}%`;
    bar.append(fill);
    container.append(bar);
  }

  if (resetsAt) {
    const resets = document.createElement("div");
    resets.className = "resets";
    resets.textContent = `Resets ${formatReset(resetsAt)}`;
    container.append(resets);
  }

  return container;
}

function formatReset(timestampMs) {
  const deltaMs = timestampMs - Date.now();
  if (deltaMs <= 0) return "soon";
  const minutes = Math.round(deltaMs / 60000);
  if (minutes < 60) return `in ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `in ${hours}h ${minutes % 60}m`;
  return `on ${new Date(timestampMs).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}`;
}

function timeAgo(timestampMs) {
  const seconds = Math.round((Date.now() - timestampMs) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.round(minutes / 60)}h ago`;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
