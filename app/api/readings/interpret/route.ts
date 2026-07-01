import { and, eq, lt, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { interpretReading, type DrawInput } from "@/lib/ai";
import { FREE_READING_LIMIT } from "@/lib/readings";
import { jsonError } from "@/lib/security";
import { deck, spreads } from "@/lib/tarot-data";

type DrawnCardInput = { num?: string; reversed?: boolean };

/**
 * Generates the real AI reading for a completed draw and consumes a free read
 * on success. The draw is rebuilt from the canonical deck + spread server-side,
 * so card meanings and positions cannot be tampered with by the client.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser(request);

  let payload: { spreadId?: string; question?: string; cards?: DrawnCardInput[] };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return jsonError("Invalid request body");
  }

  const spread = spreads.find((item) => item.id === payload.spreadId);
  if (!spread) return jsonError("Unknown spread");

  const cardsInput = payload.cards;
  if (!Array.isArray(cardsInput) || cardsInput.length !== spread.count) {
    return jsonError("Reading payload does not match the chosen spread");
  }

  const cards: DrawInput[] = [];
  for (let index = 0; index < cardsInput.length; index += 1) {
    const raw = cardsInput[index];
    const card = deck.find((item) => item.num === raw?.num);
    const position = spread.positions[index];
    if (!card || !position) {
      return jsonError("Reading payload is incomplete");
    }
    cards.push({
      num: card.num,
      name: card.name,
      reversed: Boolean(raw?.reversed),
      glyph: card.glyph,
      up: card.up,
      rev: card.rev,
      posLabel: position.label,
      posDesc: position.desc,
    });
  }

  const question = typeof payload.question === "string" ? payload.question.slice(0, 800) : "";

  // Reserve a free read ATOMICALLY before generating, so concurrent requests
  // can't each pass an eligibility check against a stale count and bypass the
  // limit. The conditional UPDATE only succeeds while free_used < limit; if it
  // affects zero rows the paywall has been hit. Subscribers skip the gate.
  let freeUsed = user?.freeUsed ?? 0;
  let reserved = false;
  if (user && !user.subscribed) {
    const db = getDb();
    const rows = await db
      .update(users)
      .set({ freeUsed: sql`${users.freeUsed} + 1` })
      .where(and(eq(users.id, user.id), lt(users.freeUsed, FREE_READING_LIMIT)))
      .returning({ freeUsed: users.freeUsed });

    if (rows.length === 0) {
      return Response.json(
        { error: "Free trial used", freeUsed: user.freeUsed, freeLimit: FREE_READING_LIMIT },
        { status: 402 }
      );
    }
    freeUsed = rows[0].freeUsed;
    reserved = true;
  }

  let interpretation;
  try {
    interpretation = await interpretReading(spread, question, cards);
  } catch {
    // Refund the reserved read if generation throws unexpectedly.
    if (user && reserved) {
      await getDb()
        .update(users)
        .set({ freeUsed: sql`max(${users.freeUsed} - 1, 0)` })
        .where(eq(users.id, user.id));
    }
    return jsonError("Could not generate the reading. Please try again.", 502);
  }

  return Response.json({
    ok: true,
    subscribed: user?.subscribed ?? false,
    freeUsed,
    freeLimit: FREE_READING_LIMIT,
    interpretation,
  });
}
