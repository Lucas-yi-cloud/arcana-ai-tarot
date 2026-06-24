import { test } from "node:test";
import assert from "node:assert/strict";
import { spreads } from "../lib/tarot-data.ts";
import { spreadLenses, lensFor } from "../lib/tarot-lenses.ts";

test("every spread has a substantive lens", () => {
  for (const spread of spreads) {
    const lens = spreadLenses[spread.id];
    assert.ok(
      typeof lens === "string" && lens.trim().length > 80,
      `missing or too-short lens for spread "${spread.id}"`
    );
  }
});

test("lensFor returns the spread's own lens", () => {
  assert.equal(lensFor("love-connection"), spreadLenses["love-connection"]);
  assert.equal(lensFor("money-flow"), spreadLenses["money-flow"]);
});

test("lensFor falls back to a safe generic lens for unknown spreads", () => {
  const fallback = lensFor("not-a-real-spread");
  assert.ok(typeof fallback === "string" && fallback.length > 0);
});

test("no orphan lenses — every lens maps to a real spread id", () => {
  const ids = new Set(spreads.map((s) => s.id));
  for (const id of Object.keys(spreadLenses)) {
    assert.ok(ids.has(id), `lens defined for unknown spread id "${id}"`);
  }
});

test("safety-critical lenses carry their guardrails", () => {
  assert.match(spreadLenses["love-connection"], /mind|may show|agency/i);
  assert.match(spreadLenses["money-flow"], /not.*(financial advice|invest)/i);
  assert.match(spreadLenses["mind-body-spirit"], /diagnos/i);
  assert.match(spreadLenses["yesno"], /verdict|yes|no/i);
});
