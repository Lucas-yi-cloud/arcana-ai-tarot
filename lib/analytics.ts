export type AnalyticsValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | AnalyticsValue[]
  | { [key: string]: AnalyticsValue };

export type AnalyticsPayload = Record<string, AnalyticsValue>;

const analyticsSessionKey = "arcana.analyticsSessionId";
const analyticsLandingKey = "arcana.analyticsLandingId";
const analyticsAttributionKey = "arcana.analyticsAttribution";

function hasWindow() {
  return typeof window !== "undefined";
}

function randomId(prefix: string) {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${random}`;
}

function sessionItem(key: string) {
  if (!hasWindow()) return "";
  try {
    return window.sessionStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

function setSessionItem(key: string, value: string) {
  if (!hasWindow()) return;
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Ignore storage failures. Analytics must never block product flows.
  }
}

export function getAnalyticsSessionId() {
  const existing = sessionItem(analyticsSessionKey);
  if (existing) return existing;
  const next = randomId("ses");
  setSessionItem(analyticsSessionKey, next);
  return next;
}

export function getAnalyticsLandingId() {
  const existing = sessionItem(analyticsLandingKey);
  if (existing) return existing;
  const next = randomId("land");
  setSessionItem(analyticsLandingKey, next);
  return next;
}

export function updateAnalyticsAttribution() {
  if (!hasWindow()) return {};
  const params = new URLSearchParams(window.location.search);
  const existing = readAnalyticsAttribution();
  const hasCampaignParams =
    params.has("utm_source") ||
    params.has("utm_medium") ||
    params.has("utm_campaign") ||
    params.has("utm_term") ||
    params.has("utm_content") ||
    params.has("gclid") ||
    params.has("gbraid") ||
    params.has("wbraid");

  const next = {
    landing_page: existing.landing_page || window.location.href,
    referrer: existing.referrer || document.referrer || "",
    utm_source: params.get("utm_source") || existing.utm_source || "",
    utm_medium: params.get("utm_medium") || existing.utm_medium || "",
    utm_campaign: params.get("utm_campaign") || existing.utm_campaign || "",
    utm_term: params.get("utm_term") || existing.utm_term || "",
    utm_content: params.get("utm_content") || existing.utm_content || "",
    gclid: params.get("gclid") || existing.gclid || "",
    gbraid: params.get("gbraid") || existing.gbraid || "",
    wbraid: params.get("wbraid") || existing.wbraid || "",
  };

  if (hasCampaignParams || !sessionItem(analyticsAttributionKey)) {
    setSessionItem(analyticsAttributionKey, JSON.stringify(next));
  }

  return next;
}

export function readAnalyticsAttribution() {
  const raw = sessionItem(analyticsAttributionKey);
  if (!raw) {
    return {
      landing_page: "",
      referrer: "",
      utm_source: "",
      utm_medium: "",
      utm_campaign: "",
      utm_term: "",
      utm_content: "",
      gclid: "",
      gbraid: "",
      wbraid: "",
    };
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      landing_page: typeof parsed.landing_page === "string" ? parsed.landing_page : "",
      referrer: typeof parsed.referrer === "string" ? parsed.referrer : "",
      utm_source: typeof parsed.utm_source === "string" ? parsed.utm_source : "",
      utm_medium: typeof parsed.utm_medium === "string" ? parsed.utm_medium : "",
      utm_campaign: typeof parsed.utm_campaign === "string" ? parsed.utm_campaign : "",
      utm_term: typeof parsed.utm_term === "string" ? parsed.utm_term : "",
      utm_content: typeof parsed.utm_content === "string" ? parsed.utm_content : "",
      gclid: typeof parsed.gclid === "string" ? parsed.gclid : "",
      gbraid: typeof parsed.gbraid === "string" ? parsed.gbraid : "",
      wbraid: typeof parsed.wbraid === "string" ? parsed.wbraid : "",
    };
  } catch {
    return {
      landing_page: "",
      referrer: "",
      utm_source: "",
      utm_medium: "",
      utm_campaign: "",
      utm_term: "",
      utm_content: "",
      gclid: "",
      gbraid: "",
      wbraid: "",
    };
  }
}

function removeUndefined(payload: AnalyticsPayload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  ) as Record<string, Exclude<AnalyticsValue, undefined>>;
}

export function sendAnalyticsEvent(eventName: string, params: AnalyticsPayload = {}) {
  if (!hasWindow()) return;
  const attribution = updateAnalyticsAttribution();
  const payload = removeUndefined({
    analytics_session_id: getAnalyticsSessionId(),
    analytics_landing_id: getAnalyticsLandingId(),
    ...attribution,
    ...params,
  });
  const win = window as typeof window & {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (command: "event", eventName: string, params: Record<string, unknown>) => void;
  };

  if (typeof win.gtag === "function") {
    win.gtag("event", eventName, payload);
    return;
  }

  win.dataLayer = win.dataLayer || [];
  win.dataLayer.push({ event: eventName, ...payload });
}
