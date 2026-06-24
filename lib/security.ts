const encoder = new TextEncoder();

export const SESSION_COOKIE = "arcana_session";
export const SESSION_DAYS = 30;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Public origin of the request. On Cloudflare Workers `request.url` is already
 * the public URL, but behind a proxy (e.g. Cloud Run / Next standalone)
 * `request.url` is the internal bind address (0.0.0.0:8080), so prefer the
 * forwarded host headers. Used to build OAuth redirect URIs and Stripe
 * success/cancel URLs that must point back at the real host the user is on.
 */
export function requestOrigin(request: Request): string {
  const forwardedProto = (request.headers.get("x-forwarded-proto") ?? "").split(",")[0].trim();
  const host = (
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    ""
  )
    .split(",")[0]
    .trim();
  if (host) {
    const proto = forwardedProto || (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
    return `${proto}://${host}`;
  }
  try {
    return new URL(request.url).origin;
  } catch {
    return "";
  }
}

export function randomId(prefix = "") {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  const id = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${prefix}${id}`;
}

export function loginCode() {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  return n.toString().padStart(6, "0");
}

export async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

export async function codeHash(email: string, code: string, secret: string) {
  return sha256(`login:${normalizeEmail(email)}:${code}:${secret}`);
}

export async function tokenHash(token: string, secret: string) {
  return sha256(`session:${token}:${secret}`);
}

export async function ipHash(request: Request, secret: string) {
  const raw =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  return sha256(`ip:${raw}:${secret}`);
}

export function parseSessionCookie(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const part = cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${SESSION_COOKIE}=`));
  if (!part) return null;

  const value = decodeURIComponent(part.slice(SESSION_COOKIE.length + 1));
  const [sessionId, token] = value.split(".");
  if (!sessionId || !token) return null;
  return { sessionId, token };
}

export function sessionCookie(sessionId: string, token: string, request: Request) {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  const secure = new URL(request.url).protocol === "https:" ? " Secure;" : "";
  return `${SESSION_COOKIE}=${encodeURIComponent(
    `${sessionId}.${token}`
  )}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge};${secure}`;
}

export function clearSessionCookie(request: Request) {
  const secure = new URL(request.url).protocol === "https:" ? " Secure;" : "";
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0;${secure}`;
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
