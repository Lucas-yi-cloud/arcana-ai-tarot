import assert from "node:assert/strict";
import { test } from "node:test";
import { canUseFreeReading, FREE_READING_LIMIT } from "../lib/readings.ts";

test("free reading limit is two", () => {
  assert.equal(FREE_READING_LIMIT, 2);
});

test("canUseFreeReading gates at the limit", () => {
  assert.ok(canUseFreeReading(0));
  assert.ok(canUseFreeReading(1));
  assert.ok(!canUseFreeReading(2));
  assert.ok(!canUseFreeReading(3));
});
