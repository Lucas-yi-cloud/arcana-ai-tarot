import { getAppEnv } from "@/lib/env";
import type { Spread } from "@/lib/tarot-data";

/**
 * Server-side AI tarot interpretation.
 *
 * Uses the Anthropic Messages API (raw fetch, matching how the rest of this
 * worker calls Google / Stripe / Resend). When no `ANTHROPIC_API_KEY` is set
 * the reading degrades to deterministic Rider-Waite text so the app still runs
 * end-to-end in local dev without any secrets.
 */

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MODEL = "claude-opus-4-8";
const FALLBACK_MODEL = "deterministic";

export type DrawInput = {
  num: string;
  name: string;
  reversed: boolean;
  glyph: string;
  up: string[];
  rev: string[];
  posLabel: string;
  posDesc: string;
};

export type CardInterpretation = {
  num: string;
  name: string;
  posLabel: string;
  reversed: boolean;
  text: string;
};

export type ReadingInterpretation = {
  cards: CardInterpretation[];
  synthesis: string;
  model: string;
};

const SYSTEM_PROMPT = [
  "You are Arcana AI, a thoughtful tarot reader working with the Rider-Waite-Smith Major Arcana.",
  "Treat tarot as a mirror for reflection, not fixed prediction or fortune-telling.",
  "Write warmly and directly to the seeker in the second person ('you').",
  "Ground every card reading in its traditional upright or reversed meaning AND its named position in the spread, then connect it to the seeker's question when one is given.",
  "Be specific and grounded; avoid vague platitudes, hedging, and repetition across cards.",
  "Never give medical, legal, or financial directives, and never claim certainty about the future. Encourage reflection and agency.",
  "Keep each card interpretation to 2-3 sentences. Keep the final synthesis to 3-5 sentences that tie the cards together into one coherent message.",
  "Respond with a single minified JSON object only — no markdown, no code fences, no commentary.",
].join(" ");

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    cards: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          position: { type: "string" },
          interpretation: { type: "string" },
        },
        required: ["position", "interpretation"],
      },
    },
    synthesis: { type: "string" },
  },
  required: ["cards", "synthesis"],
} as const;

function orientation(card: DrawInput) {
  return card.reversed ? "reversed" : "upright";
}

function keywords(card: DrawInput) {
  return card.reversed ? card.rev : card.up;
}

function buildUserPrompt(spread: Spread, question: string, cards: DrawInput[]) {
  const trimmed = question.trim();
  const cardLines = cards
    .map((card, index) => {
      const words = keywords(card).join(", ");
      return [
        `Card ${index + 1} — position "${card.posLabel}" (${card.posDesc})`,
        `  Card: ${card.name} (${orientation(card)})`,
        `  Traditional ${orientation(card)} themes: ${words}`,
      ].join("\n");
    })
    .join("\n");

  return [
    `Spread: ${spread.name} — ${spread.blurb}`,
    trimmed ? `Seeker's question: "${trimmed}"` : "The seeker did not provide a specific question; read for the season they are in.",
    "",
    "Cards drawn (in position order):",
    cardLines,
    "",
    'Return JSON shaped exactly like {"cards":[{"position":"<position label>","interpretation":"<2-3 sentences>"}],"synthesis":"<3-5 sentences>"}.',
    "There must be exactly one cards entry per drawn card, in the same order.",
  ].join("\n");
}

/** Deterministic Rider-Waite reading used when the LLM is unavailable. */
export function deterministicInterpretation(
  spread: Spread,
  question: string,
  cards: DrawInput[]
): ReadingInterpretation {
  const cardOut: CardInterpretation[] = cards.map((card) => {
    const words = keywords(card);
    const orient = orientation(card);
    const text =
      `In the ${card.posLabel.toLowerCase()} position, ${card.name} ${orient} speaks to ${words[0]} and ${words[1]}. ` +
      `Here it points toward ${words[2]} — let that color how you read this part of your situation.`;
    return {
      num: card.num,
      name: card.name,
      posLabel: card.posLabel,
      reversed: card.reversed,
      text,
    };
  });

  const first = cards[0];
  const last = cards[cards.length - 1];
  const firstWord = keywords(first)[0];
  const lastWord = keywords(last)[0];
  const opener = question.trim()
    ? `On "${question.trim()}", the deck answers in layers.`
    : "Without a fixed question, the cards read the season you are in.";

  let synthesis: string;
  if (spread.id === "yesno") {
    const positive = !first.reversed && ["sun", "star", "wheel", "heart"].includes(first.glyph);
    synthesis = `${opener} The answer leans ${positive ? "yes" : "not yet"}. ${first.name} points to ${firstWord}, so the real message is less about force and more about timing.`;
  } else {
    synthesis = `${opener} The reading begins with ${firstWord} and resolves toward ${lastWord}. ${spread.name} is asking you to notice how the first impulse can mature into the final card's lesson.`;
  }

  return { cards: cardOut, synthesis, model: FALLBACK_MODEL };
}

type AnthropicResponse = {
  stop_reason?: string;
  model?: string;
  content?: Array<{ type: string; text?: string }>;
};

type ParsedReading = {
  cards?: Array<{ position?: string; interpretation?: string }>;
  synthesis?: string;
};

function extractJson(text: string): ParsedReading | null {
  const direct = text.trim();
  try {
    return JSON.parse(direct) as ParsedReading;
  } catch {
    // Fall through to brace extraction in case the model wrapped the JSON.
  }
  const start = direct.indexOf("{");
  const end = direct.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(direct.slice(start, end + 1)) as ParsedReading;
  } catch {
    return null;
  }
}

export async function interpretReading(
  spread: Spread,
  question: string,
  cards: DrawInput[]
): Promise<ReadingInterpretation> {
  const env = getAppEnv();
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return deterministicInterpretation(spread, question, cards);
  }

  const model = env.AI_MODEL || DEFAULT_MODEL;

  try {
    const response = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 3000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildUserPrompt(spread, question, cards) }],
        output_config: {
          effort: "low",
          format: { type: "json_schema", schema: RESPONSE_SCHEMA },
        },
      }),
    });

    if (!response.ok) {
      return deterministicInterpretation(spread, question, cards);
    }

    const payload = (await response.json()) as AnthropicResponse;
    if (payload.stop_reason === "refusal") {
      return deterministicInterpretation(spread, question, cards);
    }

    const text = payload.content?.find((block) => block.type === "text")?.text ?? "";
    const parsed = extractJson(text);
    if (
      !parsed ||
      !Array.isArray(parsed.cards) ||
      parsed.cards.length !== cards.length ||
      typeof parsed.synthesis !== "string" ||
      !parsed.synthesis.trim()
    ) {
      return deterministicInterpretation(spread, question, cards);
    }

    const cardOut: CardInterpretation[] = cards.map((card, index) => {
      const text = parsed.cards?.[index]?.interpretation;
      const safe =
        typeof text === "string" && text.trim()
          ? text.trim()
          : deterministicInterpretation(spread, question, [card]).cards[0].text;
      return {
        num: card.num,
        name: card.name,
        posLabel: card.posLabel,
        reversed: card.reversed,
        text: safe,
      };
    });

    return { cards: cardOut, synthesis: parsed.synthesis.trim(), model: payload.model || model };
  } catch {
    return deterministicInterpretation(spread, question, cards);
  }
}
