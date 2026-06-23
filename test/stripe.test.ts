import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { isValidStripeSignature, parseSignatureHeader } from "../lib/stripe-signature.ts";

const secret = "whsec_test_secret_123";
const payload = JSON.stringify({ id: "evt_1", type: "checkout.session.completed" });

function sign(ts: number, body: string, key = secret) {
  return createHmac("sha256", key).update(`${ts}.${body}`).digest("hex");
}

const nowSec = 1_700_000_000;
const nowMs = nowSec * 1000;

test("parseSignatureHeader extracts t and all v1 values", () => {
  const parsed = parseSignatureHeader("t=123,v1=abc,v1=def");
  assert.equal(parsed.t, 123);
  assert.deepEqual(parsed.v1, ["abc", "def"]);
});

test("valid signature passes", async () => {
  const header = `t=${nowSec},v1=${sign(nowSec, payload)}`;
  assert.equal(await isValidStripeSignature(payload, header, secret, nowMs), true);
});

test("tampered payload fails", async () => {
  const header = `t=${nowSec},v1=${sign(nowSec, payload)}`;
  assert.equal(await isValidStripeSignature(`${payload}x`, header, secret, nowMs), false);
});

test("wrong secret fails", async () => {
  const header = `t=${nowSec},v1=${sign(nowSec, payload, "whsec_wrong")}`;
  assert.equal(await isValidStripeSignature(payload, header, secret, nowMs), false);
});

test("expired timestamp (replay) is rejected", async () => {
  const oldTs = nowSec - 10_000;
  const header = `t=${oldTs},v1=${sign(oldTs, payload)}`;
  assert.equal(await isValidStripeSignature(payload, header, secret, nowMs), false);
});

test("missing or malformed header fails", async () => {
  assert.equal(await isValidStripeSignature(payload, null, secret, nowMs), false);
  assert.equal(await isValidStripeSignature(payload, "t=123", secret, nowMs), false);
  assert.equal(await isValidStripeSignature(payload, "garbage", secret, nowMs), false);
});

test("empty secret fails closed", async () => {
  const header = `t=${nowSec},v1=${sign(nowSec, payload)}`;
  assert.equal(await isValidStripeSignature(payload, header, "", nowMs), false);
});

test("multiple v1 candidates with one valid passes", async () => {
  const header = `t=${nowSec},v1=deadbeef,v1=${sign(nowSec, payload)}`;
  assert.equal(await isValidStripeSignature(payload, header, secret, nowMs), true);
});
