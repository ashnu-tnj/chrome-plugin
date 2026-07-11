// Popup script: runs each time the toolbar popup is opened.

const statusEl = document.getElementById("status");

document.getElementById("ping-btn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    statusEl.textContent = "No active tab found.";
    return;
  }
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { type: "ping" });
    statusEl.textContent = `Content script replied: ${response?.title ?? "(no title)"}`;
  } catch {
    statusEl.textContent = "No content script on this page (try a regular website).";
  }
});
