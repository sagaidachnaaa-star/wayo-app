import * as amplitude from "@amplitude/analytics-browser";

const apiKey = import.meta.env.VITE_AMPLITUDE_API_KEY;
// Amplitude projects live in either the US (default) or EU data region —
// sending events to the wrong one silently fails. Not guessable from inside
// this project, so it's opt-in via env var rather than hardcoded either way.
const serverZone = import.meta.env.VITE_AMPLITUDE_SERVER_ZONE === "EU" ? "EU" : undefined;
const isDev = import.meta.env.DEV;

function devLog(...args) {
  if (isDev) console.log("[Amplitude]", ...args);
}

if (isDev) {
  // Never logs the key itself — only whether one is present.
  console.log("[Amplitude] API key available:", Boolean(apiKey));
  console.log("[Amplitude] Server zone:", serverZone ?? "US (default)");
}

// Before values are sent to Amplitude — drops anything Amplitude can't
// store cleanly (undefined, NaN/Infinity, functions, nested objects) so a
// stray bad value can't silently corrupt or reject an entire event.
function sanitizeProperties(properties = {}) {
  const clean = {};
  for (const [key, value] of Object.entries(properties)) {
    if (value === undefined) continue;
    if (typeof value === "function") continue;
    if (typeof value === "number" && !Number.isFinite(value)) continue;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) continue;
    clean[key] = value;
  }
  return clean;
}

// Amplitude's own init() is itself async (it resolves once the SDK has
// actually connected), so a plain boolean flag isn't enough to know when
// it's safe to send events — a call fired right after initAnalytics() could
// still race ahead of it. This promise is the single source of truth for
// "is Amplitude ready", and is cached so init only ever runs once.
let initializationPromise = null;

export function initAnalytics() {
  if (initializationPromise) {
    return initializationPromise;
  }

  if (!apiKey) {
    console.warn("[Amplitude] Not initialised: VITE_AMPLITUDE_API_KEY is missing.");
    initializationPromise = Promise.resolve(false);
    return initializationPromise;
  }

  devLog("Initialisation started");

  initializationPromise = amplitude
    .init(apiKey, {
      ...(serverZone ? { serverZone } : {}),
      autocapture: {
        attribution: false,
        pageViews: true,
        sessions: true,
        formInteractions: false,
        fileDownloads: false,
        elementInteractions: false,
        pageUrlEnrichment: true,
        webVitals: false,
      },
      logLevel: isDev ? amplitude.Types.LogLevel.Debug : amplitude.Types.LogLevel.Warn,
    })
    .promise.then(() => {
      devLog("Initialisation successful");
      return true;
    })
    .catch((error) => {
      console.error("[Amplitude] Initialisation failed:", error);
      return false;
    });

  return initializationPromise;
}

export async function trackEvent(eventName, properties = {}) {
  // Lazily triggers init if a caller ever forgets to — initAnalytics() is
  // idempotent (returns the same cached promise), so this is never a second
  // real initialisation, just a safety net.
  const ready = await initAnalytics();

  if (!ready) {
    console.warn(`[Amplitude] Event not sent (Amplitude not initialised): ${eventName}`);
    return;
  }

  devLog("Event attempted:", eventName);

  try {
    const result = await amplitude.track(eventName, sanitizeProperties(properties)).promise;
    if (result?.code === 200) {
      devLog(`Event successful: ${eventName} — status ${result.code}`);
    } else {
      console.warn(`[Amplitude] Event failed: ${eventName} — status ${result?.code}, message: ${result?.message}`);
    }
  } catch (error) {
    console.error(`[Amplitude] Event error: ${eventName}`, error);
  }
}

export function setUserProperties(properties) {
  const identifyEvent = new amplitude.Identify();

  Object.entries(properties).forEach(([property, value]) => {
    identifyEvent.set(property, value);
  });

  amplitude.identify(identifyEvent);
}

export function resetAnalyticsUser() {
  amplitude.reset();
}
