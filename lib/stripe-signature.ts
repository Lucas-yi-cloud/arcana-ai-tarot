/**
 * Stripe webhook signature verification — pure, dependency-free so it can be
 * unit-tested without Cloudflare bindings. Implements the same scheme as
 * Stripe's `constructEvent`, using Web Crypto (available on Workers and Node).
 *
 * The `Stripe-Signature` header looks like: `t=1690000000,v1=hexhmac,v1=...`.
 * We recompute HMAC-SHA256 of `${t}.${rawBody}` with the endpoint secret and
 * compare (constant-time) against any provided `v1`. A timestamp tolerance
 * rejects replayed deliveries.
 */

const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let out = "";
  for (let i = 0; i < bytes.length; i += 1) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}

/** Constant-time comparison of two equal-length hex strings. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function parseSignatureHeader(header: string): { t: number | null; v1: string[] } {
  let t: number | null = null;
  const v1: string[] = [];
  for (const part of header.split(",")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key === "t") {
      const parsed = Number(value);
      t = Number.isFinite(parsed) ? parsed : null;
    } else if (key === "v1" && value) {
      v1.push(value);
    }
  }
  return { t, v1 };
}

export async function isValidStripeSignature(
  payload: string,
  header: string | null,
  secret: string,
  nowMs: number,
  toleranceSec = 300
): Promise<boolean> {
  if (!header || !secret) return false;

  const { t, v1 } = parseSignatureHeader(header);
  if (t === null || v1.length === 0) return false;

  // Reject deliveries whose timestamp is outside the tolerance window (replay
  // protection). nowMs is injected so this stays pure and testable.
  if (Math.abs(Math.floor(nowMs / 1000) - t) > toleranceSec) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(`${t}.${payload}`));
  const expected = toHex(signature);

  return v1.some((candidate) => timingSafeEqual(expected, candidate));
}
