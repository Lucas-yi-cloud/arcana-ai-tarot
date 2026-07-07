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

export type ReadingProfile = {
  readerName?: string;
  birthDate?: string;
};

const SYSTEM_PROMPT = [
  "You are Arcana AI, a thoughtful tarot reader working with the Rider-Waite-Smith Major Arcana.",
  "Treat tarot as a mirror for reflection, not fixed prediction or fortune-telling.",
  "Write warmly and directly to the seeker in the second person ('you').",
  "Before writing, silently identify the seeker's exact question focus: topic, time horizon, decision point, fear or hope, and what a useful answer must clarify.",
  "Use that question focus as the anchor for every paragraph. Reuse concrete nouns, dates, domains, choices, or risks from the question where natural.",
  "Ground every card in its traditional upright or reversed meaning, its named spread position and that position's description, the seeker's exact question when given, and the pattern formed by the surrounding cards.",
  "Do not write generic card meanings. Translate each card into what it says about this specific question in this specific position.",
  "Be specific, grounded, and non-repetitive; avoid vague platitudes such as 'trust your intuition' unless they are tied to a specific card, position, and detail from the question.",
  "Write nuanced, readable prose with a calm human rhythm: concrete, emotionally precise, and easy to sit with.",
  "Do not claim certainty about the future, guarantee safety, or claim to know another person's private thoughts.",
  "Do not give medical, legal, financial, or mental-health directives. For career and money readings give reflective guidance and gentle next steps, not professional advice; for relationship readings describe dynamics and choices, not guaranteed feelings or outcomes.",
  "For yes/no readings, give a clear but non-absolute verdict: yes, no, likely, not yet, or unclear — plus the condition that changes or supports that answer.",
  "Each card interpretation must be 2 short paragraphs separated by a blank line. The first paragraph should explain the card through its position; the second should connect that position directly to the seeker's question with one reflective cue.",
  "The final synthesis must be 3 short paragraphs separated by blank lines. Paragraph 1 directly answers the exact question with nuance, paragraph 2 explains why the cards point that way, and paragraph 3 offers grounded encouragement or a next step.",
  "Inside JSON string values, represent paragraph breaks as escaped newlines: \\n\\n. Never compress the reading into one long paragraph.",
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

function questionBindingProtocol(spread: Spread, trimmedQuestion: string) {
  if (!trimmedQuestion) {
    return [
      "Question binding protocol:",
      "- The seeker did not write a specific question, so read for their current season without inventing a hidden question.",
      "- Keep each card tied to its spread position, and make the synthesis name the broad pattern instead of pretending to answer something private.",
    ].join("\n");
  }

  const yesNoRule =
    spread.id === "yesno"
      ? [
          "- Because this is a Yes / No spread, synthesis paragraph 1 must begin with a verdict for the exact question: 'This leans [yes/no/likely/not yet/unclear] — [condition].'",
          "- Explain the condition through the card's orientation and traditional theme; do not turn the answer into a broad horoscope.",
        ]
      : [
          "- Synthesis paragraph 1 must answer the exact question in plain language before widening into nuance.",
          "- Synthesis paragraph 2 must cite at least two concrete anchors from the spread: card names, positions, orientation, or position descriptions.",
        ];

  return [
    "Question binding protocol:",
    `- The reading must respond to this exact question: "${trimmedQuestion}".`,
    "- Silently infer the domain, time horizon, decision point, and emotional stake before writing.",
    "- Use the seeker's nouns and timeframe naturally; do not replace them with vague phrases like 'your situation' for the whole answer.",
    "- If the question asks about safety, health, money, legal matters, love guarantees, or future certainty, frame the answer as reflective signals, conditions, and practical care. Do not guarantee outcomes.",
    "- Every card paragraph must pass this test: could a reader see why this card matters to this exact question and this named position?",
    ...yesNoRule,
    "- Delete any sentence that could fit almost any tarot reading without changing.",
  ].join("\n");
}

function profileLines(profile?: ReadingProfile) {
  const name = profile?.readerName?.trim();
  const birthDate = profile?.birthDate?.trim();
  if (!name && !birthDate) {
    return "Personalisation context: none provided.";
  }

  return [
    "Personalisation context:",
    name ? `- The seeker gave their first/name field as "${name}". You may address them by name once, naturally, but do not overuse it.` : "- The seeker did not provide a name.",
    birthDate
      ? `- The seeker selected date of birth "${birthDate}". Use it only as a quiet personal anchor for tone; do not make astrology, numerology, medical, or fate claims from it.`
      : "- The seeker did not provide a date of birth.",
  ].join("\n");
}

function buildUserPrompt(
  spread: Spread,
  question: string,
  cards: DrawInput[],
  profile?: ReadingProfile
) {
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
    trimmed ? `Exact seeker question: "${trimmed}"` : "The seeker did not provide a specific question; read for the season they are in.",
    profileLines(profile),
    "",
    "Cards drawn (in position order):",
    cardLines,
    "",
    "Spread-specific reading lens:",
    lensFor(spread.id),
    "",
    questionBindingProtocol(spread, trimmed),
    "",
    "Answer quality checklist:",
    "- The synthesis should not merely summarize card meanings; it must answer the seeker's actual question.",
    "- The reading should name what the cards make more visible, what remains conditional, and what the seeker can do next.",
    "- Avoid absolute promises, fatalistic predictions, and unsupported certainty.",
    "",
    'Return JSON shaped exactly like {"cards":[{"position":"<position label>","interpretation":"<paragraph 1>\\n\\n<paragraph 2>"}],"synthesis":"<paragraph 1>\\n\\n<paragraph 2>\\n\\n<paragraph 3>"}.',
    "There must be exactly one cards entry per drawn card, in the same order.",
    "Every interpretation and synthesis string must contain visible paragraph breaks using \\n\\n.",
  ].join("\n");
}

function normalizeParagraphBreaks(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function sentenceChunks(text: string) {
  return normalizeParagraphBreaks(text)
    .replace(/\s+/g, " ")
    .match(/[^.!?。！？]+[.!?。！？]+|[^.!?。！？]+$/g)
    ?.map((sentence) => sentence.trim())
    .filter(Boolean) ?? [];
}

function ensureParagraphs(text: string, preferredParagraphs: number) {
  const normalized = normalizeParagraphBreaks(text);
  if (!normalized) return "";
  if (/\n\s*\n/.test(normalized)) return normalized;

  const sentences = sentenceChunks(normalized);
  if (sentences.length <= 1) return normalized;

  const targetCount = Math.min(preferredParagraphs, sentences.length);
  const chunkSize = Math.ceil(sentences.length / targetCount);
  const paragraphs: string[] = [];
  for (let index = 0; index < sentences.length; index += chunkSize) {
    paragraphs.push(sentences.slice(index, index + chunkSize).join(" "));
  }
  return paragraphs.join("\n\n");
}

/** Deterministic Rider-Waite reading used when the LLM is unavailable. */
export function deterministicInterpretation(
  spread: Spread,
  question: string,
  cards: DrawInput[],
  profile?: ReadingProfile
): ReadingInterpretation {
  const trimmedQuestion = question.trim();
  const name = profile?.readerName?.trim().split(/\s+/)[0];
  const focus = trimmedQuestion ? `your question — "${trimmedQuestion}"` : "this open reading";
  const cardOut: CardInterpretation[] = cards.map((card) => {
    const words = keywords(card);
    const orient = orientation(card);
    const text =
      `In the ${card.posLabel.toLowerCase()} position, ${card.name} ${orient} speaks to ${words[0]} and ${words[1]} as they relate to ${focus}. ` +
      `This card is less a fixed prediction than a lens on what this part of the question is asking you to notice.\n\n` +
      `The useful cue is ${words[2]}: bring that into the question directly, and ask where it clarifies the next honest step instead of turning the card into a generic omen.`;
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
  const opener = trimmedQuestion
    ? name
      ? `${name}, on "${trimmedQuestion}", the deck answers in layers rather than with a guarantee.`
      : `On "${trimmedQuestion}", the deck answers in layers rather than with a guarantee.`
    : "Without a fixed question, the cards read the season you are in.";

  let synthesis: string;
  if (spread.id === "yesno") {
    const positive = !first.reversed && ["sun", "star", "wheel", "heart"].includes(first.glyph);
    synthesis =
      `${opener} This leans ${positive ? "yes" : "not yet"} — if you work with the condition the card is showing instead of treating it as fate.\n\n` +
      `${first.name} points to ${firstWord}, so the answer is shaped by that specific energy in relation to the question. Notice whether the card is describing support that is already present, or a missing piece that needs care first.\n\n` +
      "Use the reading as a checkpoint: name the real concern inside the question, then choose the next step that makes that concern more manageable.";
  } else {
    synthesis =
      `${opener} The reading begins with ${firstWord} and resolves toward ${lastWord}, which gives the spread a clear emotional movement.\n\n` +
      `${spread.name} is asking you to notice how the first impulse can mature into the final card's lesson in relation to ${focus}. The cards are less interested in a fixed outcome than in the pattern you can now see.\n\n` +
      "Take the next step from that pattern: name what is true, separate what is conditional from what is known, and let the reading become something practical rather than something to worry over.";
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
    `${GEMINI_BASE}/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      // Pass the key in the x-goog-api-key header, not the URL query string, so it never lands in
      // request logs / proxies — and it works for both AIza… and newer AQ.… key formats.
      headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
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
  cards: DrawInput[],
  profile?: ReadingProfile
): Promise<ReadingInterpretation> {
  const env = getAppEnv();
  const provider = selectProvider(env);
  if (!provider) {
    return deterministicInterpretation(spread, question, cards, profile);
  }

  const call = (prompt: string) =>
    (provider === "gemini" ? callGemini(env, prompt) : callAnthropic(env, prompt)).catch(
      () => null
    );

  const userPrompt = buildUserPrompt(spread, question, cards, profile);

  let result = await call(userPrompt);
  let parsed = result ? extractJson(result.text) : null;

  // One stricter repair attempt before falling back to deterministic text.
  if (!isValidReading(parsed, cards.length)) {
    const repairPrompt = [
      userPrompt,
      "",
      "The previous response was missing or not valid JSON. Return the same reading again as a single valid JSON object only — no markdown, no code fences, no commentary —",
      `shaped exactly like {"cards":[{"position":"<position label>","interpretation":"<paragraph 1>\\n\\n<paragraph 2>"}],"synthesis":"<paragraph 1>\\n\\n<paragraph 2>\\n\\n<paragraph 3>"} with exactly ${cards.length} card entries in position order.`,
      "Every interpretation and synthesis string must contain paragraph breaks using \\n\\n.",
    ].join("\n");
    const retry = await call(repairPrompt);
    const retryParsed = retry ? extractJson(retry.text) : null;
    if (isValidReading(retryParsed, cards.length)) {
      result = retry;
      parsed = retryParsed;
    }
  }

  if (!result || !parsed || !isValidReading(parsed, cards.length)) {
    return deterministicInterpretation(spread, question, cards, profile);
  }

  const cardOut: CardInterpretation[] = cards.map((card, index) => {
    const text = parsed.cards?.[index]?.interpretation;
    const safe =
      typeof text === "string" && text.trim()
        ? ensureParagraphs(text, 2)
        : deterministicInterpretation(spread, question, [card], profile).cards[0].text;
    return {
      num: card.num,
      name: card.name,
      posLabel: card.posLabel,
      reversed: card.reversed,
      text: safe,
    };
  });

  return {
    cards: cardOut,
    synthesis: ensureParagraphs(parsed.synthesis ?? "", 3),
    model: result.model,
  };
}
