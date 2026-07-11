// Background service worker: runs independently of any page or popup.

chrome.runtime.onInstalled.addListener(() => {
  console.log("Starter Extension installed.");
});
