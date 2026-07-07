const $ = (id) => document.getElementById(id);

// Restore last-used values for convenience.
chrome.storage?.local.get(["keywords", "channel", "from", "to"], (saved) => {
  if (saved.keywords) $("keywords").value = saved.keywords;
  if (saved.channel) $("channel").value = saved.channel;
  if (saved.from) $("from").value = saved.from;
  if (saved.to) $("to").value = saved.to;
});

// If the current tab is a YouTube channel page, prefill the channel field.
chrome.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
  const url = tabs?.[0]?.url || "";
  if (!$("channel").value && /youtube\.com\/(@|channel\/|c\/|user\/)/.test(url)) {
    $("channel").value = url;
  }
});

function run() {
  const values = {
    keywords: $("keywords").value,
    channel: $("channel").value,
    from: $("from").value,
    to: $("to").value,
  };

  const error = YTDRS.validateInputs(values);
  const errorEl = $("error");
  if (error) {
    errorEl.textContent = error;
    errorEl.hidden = false;
    return;
  }
  errorEl.hidden = true;

  chrome.storage?.local.set(values);
  chrome.tabs.create({ url: YTDRS.buildSearchUrl(values) });
}

$("search").addEventListener("click", run);
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") run();
});
