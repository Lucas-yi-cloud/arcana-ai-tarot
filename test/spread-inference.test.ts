import assert from "node:assert/strict";
import { test } from "node:test";
import { inferSpreadIdForQuestion } from "../lib/spread-inference.ts";

test("infers love questions", () => {
  assert.equal(inferSpreadIdForQuestion("Where is this relationship heading?"), "love-connection");
});

test("infers money questions", () => {
  assert.equal(inferSpreadIdForQuestion("How can I improve my financial situation?"), "money-flow");
});

test("infers direct yes or no questions", () => {
  assert.equal(inferSpreadIdForQuestion("Is now the right time to act?"), "yesno");
});

test("infers choice questions before yes or no", () => {
  assert.equal(inferSpreadIdForQuestion("Should I stay or take the new job?"), "career-path");
  assert.equal(inferSpreadIdForQuestion("Should I choose path A or path B?"), "decision-crossroads");
});

test("does not mistake next for an ex relationship", () => {
  assert.equal(inferSpreadIdForQuestion("What should I focus on next week?"), "week-ahead");
});

test("falls back to past present future", () => {
  assert.equal(inferSpreadIdForQuestion("What should I understand right now?"), "past-present-future");
});
