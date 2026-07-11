// Service worker: polls the claude.ai usage API and keeps the toolbar badge
// showing how much of the current session limit is used.

importScripts("usage-model.js");

const API_BASE = "https://claude.ai/api";
const REFRESH_MINUTES = 5;

class UsageError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("refresh-usage", { periodInMinutes: REFRESH_MINUTES });
  refreshUsage();
});

chrome.runtime.onStartup.addListener(() => {
  refreshUsage();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "refresh-usage") refreshUsage();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "refresh-usage") {
    refreshUsage().then(sendResponse);
    return true; // keep the channel open for the async response
  }
});

async function apiGet(path) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new UsageError("network", "Could not reach claude.ai.");
  }
  if (response.status === 401 || response.status === 403) {
    throw new UsageError("signed_out", "Not signed in to claude.ai.");
  }
  if (!response.ok) {
    throw new UsageError(`http_${response.status}`, `claude.ai returned ${response.status}.`);
  }
  return response.json();
}

async function getOrgId({ forceRefresh = false } = {}) {
  if (!forceRefresh) {
    const { orgId } = await chrome.storage.local.get("orgId");
    if (orgId) return orgId;
  }
  const orgs = await apiGet("/organizations");
  if (!Array.isArray(orgs) || orgs.length === 0) {
    throw new UsageError("no_org", "No Claude account found — sign in to claude.ai.");
  }
  const org = orgs.find((o) => (o.capabilities || []).includes("chat")) || orgs[0];
  await chrome.storage.local.set({ orgId: org.uuid, orgName: org.name || "" });
  return org.uuid;
}

async function refreshUsage() {
  try {
    let usage;
    try {
      usage = await apiGet(`/organizations/${await getOrgId()}/usage`);
    } catch (err) {
      // A cached org id can go stale after an account switch; retry once fresh.
      if (typeof err.code === "string" && err.code.startsWith("http_4")) {
        usage = await apiGet(`/organizations/${await getOrgId({ forceRefresh: true })}/usage`);
      } else {
        throw err;
      }
    }
    await chrome.storage.local.set({
      lastUsage: { raw: usage, fetchedAt: Date.now() },
      lastError: null,
    });
    updateBadge(parseUsage(usage));
    return { ok: true };
  } catch (err) {
    const lastError = {
      code: err.code || "unknown",
      message: err.message || "Unknown error.",
      at: Date.now(),
    };
    await chrome.storage.local.set({ lastError });
    chrome.action.setBadgeText({ text: "!" });
    chrome.action.setBadgeBackgroundColor({ color: "#b91c1c" });
    return { ok: false, error: lastError };
  }
}

function updateBadge(limits) {
  const percent = badgePercent(limits);
  if (percent === null) {
    chrome.action.setBadgeText({ text: "" });
    return;
  }
  const rounded = Math.round(percent);
  chrome.action.setBadgeText({ text: `${rounded}%` });
  chrome.action.setBadgeBackgroundColor({
    color: rounded >= 90 ? "#b91c1c" : rounded >= 70 ? "#b45309" : "#3f6212",
  });
}
