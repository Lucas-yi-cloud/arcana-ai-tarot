import { getAppEnv, type AppEnv } from "@/lib/env";
import type { Spread } from "@/lib/tarot-data";
import { lensFor } from "@/lib/tarot-lenses";

/**
 * Server-side AI tarot interpretation.
 *
 * Supports two providers (raw fetch, matching how the rest of this worker calls
 * Google / Stripe / Resend): Google Gemini (Generative Language API) and
 * Anthropic Claude. The provider is chosen by `AI_PROVIDER`, otherwise
 * auto-detected from whichever API key is configured (Gemini preferred). With
 * no key set the reading degrades to deterministic Rider-Waite text so the app
 * still runs end-to-end in local dev without any secrets.
 */

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_ANTHROPIC_MODEL = "claude-opus-4-8";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

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
  "Ground every card in its traditional upright or reversed meaning, its named spread position and that position's description, the seeker's question when given, and the pattern formed by the surrounding cards.",
  "Be specific, grounded, and non-repetitive; avoid vague platitudes such as 'trust your intuition' unless they are tied to a specific card and position.",
  "Do not claim certainty about the future, and do not claim to know another person's private thoughts.",
  "Do not give medical, legal, financial, or mental-health directives. For career and money readings give reflective guidance and gentle next steps, not professional advice; for relationship readings describe dynamics and choices, not guaranteed feelings or outcomes.",
  "Keep each card interpretation to 2-3 sentences, and the final synthesis to 3-5 sentences that tie the cards into one coherent message.",
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

// Gemini's responseSchema uses OpenAPI-style uppercase type names and does not
// accept `additionalProperties`; otherwise it mirrors RESPONSE_SCHEMA.
const GEMINI_SCHEMA = {
  type: "OBJECT",
  properties: {
    cards: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          position: { type: "STRING" },
          interpretation: { type: "STRING" },
        },
        required: ["position", "interpretation"],
      },
    },
    synthesis: { type: "STRING" },
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
    "Spread-specific reading lens:",
    lensFor(spread.id),
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

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
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

type ProviderResult = { text: string; model: string };

function selectProvider(env: AppEnv): "gemini" | "anthropic" | null {
  const explicit = env.AI_PROVIDER?.toLowerCase();
  if (explicit === "gemini") return env.GEMINI_API_KEY ? "gemini" : null;
  if (explicit === "anthropic") return env.ANTHROPIC_API_KEY ? "anthropic" : null;
  if (env.GEMINI_API_KEY) return "gemini";
  if (env.ANTHROPIC_API_KEY) return "anthropic";
  return null;
}

async function callAnthropic(env: AppEnv, userPrompt: string): Promise<ProviderResult | null> {
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  const model = env.AI_MODEL || DEFAULT_ANTHROPIC_MODEL;

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
      messages: [{ role: "user", content: userPrompt }],
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: RESPONSE_SCHEMA },
      },
    }),
  });

  if (!response.ok) return null;
  const payload = (await response.json()) as AnthropicResponse;
  if (payload.stop_reason === "refusal") return null;
  const text = payload.content?.find((block) => block.type === "text")?.text ?? "";
  if (!text) return null;
  return { text, model: payload.model || model };
}

async function callGemini(env: AppEnv, userPrompt: string): Promise<ProviderResult | null> {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const model = env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

  const response = await fetch(
    `${GEMINI_BASE}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: GEMINI_SCHEMA,
          temperature: 0.9,
          maxOutputTokens: 4096,
          // Disable "thinking" so the whole output budget goes to the JSON
          // answer (faster + cheaper for structured extraction).
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    }
  );

  if (!response.ok) return null;
  const payload = (await response.json()) as GeminiResponse;
  const text =
    payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
  if (!text) return null;
  return { text, model };
}

function isValidReading(parsed: ParsedReading | null, count: number): boolean {
  return (
    !!parsed &&
    Array.isArray(parsed.cards) &&
    parsed.cards.length === count &&
    typeof parsed.synthesis === "string" &&
    parsed.synthesis.trim().length > 0
  );
}

export async function interpretReading(
  spread: Spread,
  question: string,
  cards: DrawInput[]
): Promise<ReadingInterpretation> {
  const env = getAppEnv();
  const provider = selectProvider(env);
  if (!provider) {
    return deterministicInterpretation(spread, question, cards);
  }

  const call = (prompt: string) =>
    (provider === "gemini" ? callGemini(env, prompt) : callAnthropic(env, prompt)).catch(
      () => null
    );

  const userPrompt = buildUserPrompt(spread, question, cards);

  let result = await call(userPrompt);
  let parsed = result ? extractJson(result.text) : null;

  // One stricter repair attempt before falling back to deterministic text.
  if (!isValidReading(parsed, cards.length)) {
    const repairPrompt = [
      userPrompt,
      "",
      "The previous response was missing or not valid JSON. Return the same reading again as a single valid JSON object only — no markdown, no code fences, no commentary —",
      `shaped exactly like {"cards":[{"position":"<position label>","interpretation":"<2-3 sentences>"}],"synthesis":"<3-5 sentences>"} with exactly ${cards.length} card entries in position order.`,
    ].join("\n");
    const retry = await call(repairPrompt);
    const retryParsed = retry ? extractJson(retry.text) : null;
    if (isValidReading(retryParsed, cards.length)) {
      result = retry;
      parsed = retryParsed;
    }
  }

  if (!result || !parsed || !isValidReading(parsed, cards.length)) {
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

  return { cards: cardOut, synthesis: (parsed.synthesis ?? "").trim(), model: result.model };
}
