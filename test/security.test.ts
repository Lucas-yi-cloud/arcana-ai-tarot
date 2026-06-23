import assert from "node:assert/strict";
import { test } from "node:test";
import {
  clearSessionCookie,
  codeHash,
  isEmail,
  loginCode,
  normalizeEmail,
  parseSessionCookie,
  randomId,
  sessionCookie,
  sha256,
  tokenHash,
} from "../lib/security.ts";

function req(cookie?: string, url = "https://arcana.example") {
  return new Request(url, cookie ? { headers: { cookie } } : undefined);
}

test("isEmail accepts valid and rejects invalid", () => {
  assert.ok(isEmail("a@b.co"));
  assert.ok(isEmail("user.name@example.com"));
  assert.ok(!isEmail("nope"));
  assert.ok(!isEmail("a@b"));
  assert.ok(!isEmail("a @b.co"));
});

test("normalizeEmail trims and lowercases", () => {
  assert.equal(normalizeEmail("  USER@Example.COM "), "user@example.com");
});

test("randomId has prefix and 36 hex chars", () => {
  const id = randomId("usr_");
  assert.ok(id.startsWith("usr_"));
  assert.match(id.slice(4), /^[0-9a-f]{36}$/);
  assert.notEqual(randomId(), randomId());
});

test("loginCode is six digits", () => {
  for (let i = 0; i < 50; i += 1) {
    assert.match(loginCode(), /^\d{6}$/);
  }
});

test("sha256 is deterministic 64-char hex", async () => {
  const a = await sha256("hello");
  const b = await sha256("hello");
  assert.equal(a, b);
  assert.match(a, /^[0-9a-f]{64}$/);
  assert.notEqual(a, await sha256("world"));
});

test("codeHash depends on email, code, and secret", async () => {
  const base = await codeHash("a@b.co", "123456", "secret");
  assert.equal(base, await codeHash("A@B.CO", "123456", "secret"));
  assert.notEqual(base, await codeHash("a@b.co", "000000", "secret"));
  assert.notEqual(base, await codeHash("a@b.co", "123456", "other"));
});

test("tokenHash is deterministic and secret-bound", async () => {
  assert.equal(await tokenHash("tok", "s"), await tokenHash("tok", "s"));
  assert.notEqual(await tokenHash("tok", "s"), await tokenHash("tok", "s2"));
});

test("session cookie round-trips through parseSessionCookie", () => {
  const cookie = sessionCookie("ses_1", "tok_2", req(undefined));
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Lax/);
  assert.match(cookie, /Secure/); // https request
  const value = cookie.split(";")[0].split("=").slice(1).join("=");
  const parsed = parseSessionCookie(req(`arcana_session=${value}`));
  assert.deepEqual(parsed, { sessionId: "ses_1", token: "tok_2" });
});

test("parseSessionCookie returns null for malformed cookie", () => {
  assert.equal(parseSessionCookie(req("arcana_session=onlyonepart")), null);
  assert.equal(parseSessionCookie(req("other=value")), null);
  assert.equal(parseSessionCookie(req(undefined)), null);
});

test("clearSessionCookie expires the cookie", () => {
  assert.match(clearSessionCookie(req(undefined)), /Max-Age=0/);
});

test("http request does not mark cookie Secure", () => {
  const cookie = sessionCookie("s", "t", req(undefined, "http://localhost:3000"));
  assert.ok(!/Secure/.test(cookie));
});
