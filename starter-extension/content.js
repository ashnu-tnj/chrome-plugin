// Content script: injected into pages matched by manifest.json.

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "ping") {
    sendResponse({ title: document.title });
  }
});
