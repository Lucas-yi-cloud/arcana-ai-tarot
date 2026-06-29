import assert from "node:assert/strict";
import { test } from "node:test";
import { cardImage, deck, spreads } from "../lib/tarot-data.ts";

test("deck is the 22 Major Arcana with unique numbers", () => {
  assert.equal(deck.length, 22);
  const nums = new Set(deck.map((card) => card.num));
  assert.equal(nums.size, 22);
  for (let i = 0; i <= 21; i += 1) {
    assert.ok(nums.has(String(i).padStart(2, "0")), `missing card ${i}`);
  }
});

test("every card has at least three upright and reversed keywords", () => {
  // The deterministic interpretation indexes keywords[0..2], so this is a
  // load-bearing invariant.
  for (const card of deck) {
    assert.ok(card.up.length >= 3, `${card.name} upright keywords`);
    assert.ok(card.rev.length >= 3, `${card.name} reversed keywords`);
  }
});

test("each spread declares as many positions as its card count", () => {
  assert.ok(spreads.length > 0);
  const ids = new Set(spreads.map((spread) => spread.id));
  assert.equal(ids.size, spreads.length, "spread ids are unique");
  for (const spread of spreads) {
    assert.equal(
      spread.positions.length,
      spread.count,
      `${spread.id} has ${spread.positions.length} positions for count ${spread.count}`
    );
    for (const position of spread.positions) {
      assert.ok(position.label.length > 0);
      assert.ok(position.desc.length > 0);
    }
  }
});

test("cardImage builds the local Rider-Waite asset URL", () => {
  assert.equal(
    cardImage("00", "The Fool"),
    "/assets/tarot/RWS_Tarot_00_Fool.jpg"
  );
  assert.equal(
    cardImage("10", "Wheel of Fortune"),
    "/assets/tarot/RWS_Tarot_10_Wheel_of_Fortune.jpg"
  );
});
