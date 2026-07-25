// Shared parsing of the claude.ai usage API response.
// Loaded by the popup via <script> and by the service worker via importScripts().

const KNOWN_LIMIT_LABELS = {
  five_hour: "Session (5-hour)",
  seven_day: "Weekly — all models",
  seven_day_opus: "Weekly — Opus",
  seven_day_sonnet: "Weekly — Sonnet",
  seven_day_haiku: "Weekly — Haiku",
  seven_day_fable: "Weekly — Fable",
  seven_day_oauth_apps: "Weekly — Claude Code",
  fable_credit_limit: "Fable 5 credit limit",
  fable_five_credit_limit: "Fable 5 credit limit",
  fable_5_credit_limit: "Fable 5 credit limit",
};

// Known keys render first, in this order; unknown keys follow alphabetically.
const KNOWN_LIMIT_ORDER = [
  "five_hour",
  "seven_day",
  "seven_day_opus",
  "seven_day_sonnet",
  "seven_day_haiku",
  "seven_day_fable",
  "seven_day_oauth_apps",
  "fable_credit_limit",
  "fable_five_credit_limit",
  "fable_5_credit_limit",
];

function prettifyLimitKey(key) {
  return key
    .replace(/^seven_day_?/, "weekly ")
    .replace(/^five_hour_?/, "session ")
    .replace(/_/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// The API reports utilization as a percentage (0-100). Be tolerant of a
// fractional 0-1 form in case the shape changes.
function normalizePercent(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const percent = value > 0 && value < 1 ? value * 100 : value;
  return Math.min(100, Math.max(0, percent));
}

function parseResetTime(value) {
  if (typeof value === "number") {
    // Epoch seconds or milliseconds.
    return value < 1e12 ? value * 1000 : value;
  }
  if (typeof value === "string") {
    const ms = Date.parse(value);
    return Number.isNaN(ms) ? null : ms;
  }
  return null;
}

// Returns [{ key, label, percentUsed, resetsAt }] for every limit-shaped
// entry in the response, so new limits (e.g. model-specific ones) show up
// without code changes.
function parseUsage(raw) {
  if (!raw || typeof raw !== "object") return [];
  const limits = [];
  for (const [key, value] of Object.entries(raw)) {
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    if (!("utilization" in value) && !("resets_at" in value)) continue;
    limits.push({
      key,
      label: KNOWN_LIMIT_LABELS[key] || prettifyLimitKey(key),
      percentUsed: normalizePercent(value.utilization),
      resetsAt: parseResetTime(value.resets_at),
    });
  }
  limits.sort((a, b) => {
    const ai = KNOWN_LIMIT_ORDER.indexOf(a.key);
    const bi = KNOWN_LIMIT_ORDER.indexOf(b.key);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.key.localeCompare(b.key);
  });
  return limits;
}

// The badge shows the session limit when present, otherwise the most-used limit.
function badgePercent(limits) {
  const session = limits.find((l) => l.key === "five_hour");
  if (session && session.percentUsed !== null) return session.percentUsed;
  const percents = limits.map((l) => l.percentUsed).filter((p) => p !== null);
  return percents.length ? Math.max(...percents) : null;
}
