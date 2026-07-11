// Shared logic for building YouTube date-range search URLs.
// Used by both the popup and the content script.

/**
 * Normalise the channel input. Accepts:
 *  - a full channel URL:  https://www.youtube.com/@handle, /channel/UC..., /c/Name, /user/Name
 *  - a bare handle:       @handle
 *  - an approximate name: "veritasium"
 * Returns { channelPath, channelName } where channelPath is a site path we can
 * search inside directly, or null if we only have an approximate name.
 */
function parseChannelInput(raw) {
  const input = (raw || "").trim();
  if (!input) return { channelPath: null, channelName: null };

  // Full URL
  const urlMatch = input.match(
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/(@[\w.-]+|channel\/[\w-]+|c\/[\w.-]+|user\/[\w.-]+)/i
  );
  if (urlMatch) return { channelPath: urlMatch[1], channelName: null };

  // Bare handle
  if (/^@[\w.-]+$/.test(input)) return { channelPath: input, channelName: null };

  // Approximate channel name
  return { channelPath: null, channelName: input };
}

/**
 * Build the YouTube URL for a date-range search.
 * @param {Object} opts
 * @param {string} opts.keywords  free-text keywords (may be empty)
 * @param {string} opts.channel   channel URL / handle / approximate name (may be empty)
 * @param {string} opts.from      YYYY-MM-DD or "" (inclusive start)
 * @param {string} opts.to        YYYY-MM-DD or "" (inclusive end)
 * @returns {string} URL to open
 */
function buildSearchUrl({ keywords, channel, from, to }) {
  const parts = [];
  const kw = (keywords || "").trim();
  if (kw) parts.push(kw);

  // YouTube's after:/before: operators. "before" is exclusive, so bump the
  // end date by one day to make the user's range inclusive.
  if (from) parts.push(`after:${from}`);
  if (to) parts.push(`before:${addDays(to, 1)}`);

  const { channelPath, channelName } = parseChannelInput(channel);

  if (channelPath) {
    // Search inside the channel's own Search tab — operators work there too.
    const query = parts.join(" ");
    return `https://www.youtube.com/${channelPath}/search?query=${encodeURIComponent(query)}`;
  }

  if (channelName) {
    // Approximate name: include it as a quoted term in a site-wide search.
    parts.unshift(`"${channelName}"`);
  }

  const query = parts.join(" ");
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function addDays(isoDate, days) {
  const d = new Date(isoDate + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Validate the form. Returns an error message string or null if OK. */
function validateInputs({ keywords, channel, from, to }) {
  if (!(keywords || "").trim() && !(channel || "").trim()) {
    return "Enter keywords and/or a channel.";
  }
  if (!from && !to) {
    return "Pick at least one date (from and/or to).";
  }
  if (from && to && from > to) {
    return "“From” date must be on or before “To” date.";
  }
  return null;
}

// Export for the popup (loaded as a plain script, so attach to globalThis).
globalThis.YTDRS = { buildSearchUrl, validateInputs, parseChannelInput };
