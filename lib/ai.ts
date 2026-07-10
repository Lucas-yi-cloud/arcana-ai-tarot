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
const CARD_LABELS = [
  "The Fool",
  "The Magician",
  "The High Priestess",
  "The Empress",
  "The Emperor",
  "The Hierophant",
  "The Lovers",
  "The Chariot",
  "Strength",
  "The Hermit",
  "Wheel of Fortune",
  "The Wheel of Fortune",
  "Justice",
  "The Hanged Man",
  "Death",
  "Temperance",
  "The Devil",
  "The Tower",
  "The Star",
  "The Moon",
  "The Sun",
  "Judgement",
  "Judgment",
  "The World",
] as const;

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

type QuestionIntent = "when" | "where" | "why" | "what" | "how" | "which" | "yesno" | "open";

const SYSTEM_PROMPT = [
  "You are Arcana AI, a thoughtful tarot reader working with the Rider-Waite-Smith Major Arcana.",
  "Treat tarot as a mirror for reflection, not fixed prediction or fortune-telling.",
  "Write warmly and directly to the seeker in the second person ('you').",
  "Before writing, silently identify the seeker's exact question focus: topic, time horizon, decision point, fear or hope, and what a useful answer must clarify.",
  "Also silently classify the user's question type: when, where, why, what, how, which path, yes/no, or open reflection.",
  "Use that question focus as the anchor for every paragraph. Reuse concrete nouns, dates, domains, choices, or risks from the question where natural.",
  "Ground every card in its traditional upright or reversed meaning, its named spread position and that position's description, the seeker's exact question when given, and the pattern formed by the surrounding cards.",
  "Do not write generic card meanings. Translate each card into what it says about this specific question in this specific position.",
  "Be specific, grounded, and non-repetitive; avoid vague platitudes such as 'trust your intuition' unless they are tied to a specific card, position, and detail from the question.",
  "Write nuanced, readable prose with a calm human rhythm: concrete, emotionally precise, and easy to sit with.",
  "Do not claim certainty about the future, guarantee safety, or claim to know another person's private thoughts.",
  "Do not give medical, legal, financial, or mental-health directives. For career and money readings give reflective guidance and gentle next steps, not professional advice; for relationship readings describe dynamics and choices, not guaranteed feelings or outcomes.",
  "For yes/no readings, give a clear but non-absolute verdict: yes, no, likely, not yet, or unclear — plus the condition that changes or supports that answer.",
  "Each card interpretation must be 2 short paragraphs separated by a blank line. The first paragraph should explain the card through its position; the second should connect that position directly to the seeker's question with one reflective cue.",
  "The final synthesis is the product's most important answer. It must not sound like a tarot essay, a horoscope, a therapy note, or a recap of the cards.",
  "The final synthesis must be exactly 3 short paragraphs separated by blank lines, using these labels exactly: ANSWER:, WHY:, NEXT MOVE:.",
  "Paragraph 1 must be ANSWER: followed by a direct verdict or position in 8-18 words. For yes/no questions, start with Yes, No, Likely, Not yet, or Unclear. For choice questions, name the better path or say what condition must decide it. For open questions, name the clearest theme or direction.",
  "For WH questions, answer the WH word directly before adding nuance: when = a concrete time window plus trigger; where = a concrete place, channel, setting, or context; why = the main cause; what = the specific object, option, risk, or next focus; how = the ordered method.",
  "Do not answer a WHEN question with only 'when you...' or 'as you...'. If no exact date is responsible, give a reading-based relative window such as 'within 2-6 weeks' plus the condition that could move it earlier or later.",
  "Paragraph 2 must be WHY: followed by 1-2 sentences that explain the main reason in plain language tied to the user's actual question. Name the tradeoff, bottleneck, risk, timing issue, or relationship dynamic. Do not explain card meanings.",
  "Paragraph 3 must be NEXT MOVE: followed by 1-2 sentences with one concrete action, test, conversation, boundary, or timing rule. Make it practical enough that the seeker could do it today or before making the decision.",
  "The final synthesis must stay between 60 and 105 words total. Do not explain individual card meanings there; that belongs only in the card interpretations.",
  "In the final synthesis, do not name tarot cards, do not put card names in parentheses, and do not write evidence lists such as '(The Devil)' or '(The Sun reversed)'.",
  "In the final synthesis, avoid spiritual filler and vague comfort phrases such as 'inner voice', 'deepest calling', 'honor your worth', 'trust the universe', 'quiet contemplation', 'align with your purpose', 'embrace optimism', or 'everything happens for a reason'.",
  "In the final synthesis, avoid evasive phrasing such as 'it depends', 'may emerge when', 'could happen as you', 'seek clarity', or 'assert your value' unless followed by a concrete time, place, cause, fact, or action.",
  "In the final synthesis, be precise and useful: answer the question, state the main condition or risk, and give one next action. If the question lacks enough context, say exactly what must be clarified instead of pretending certainty.",
  "Inside JSON string values, represent paragraph breaks as escaped newlines: \\n\\n. Never compress the reading into one long paragraph.",
  "Respond with a single minified JSON object only — no code fences, no commentary outside the JSON.",
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

function inferQuestionIntent(question: string): QuestionIntent {
  const text = question.trim().toLowerCase();
  if (!text) return "open";
  if (/\b(?:when|how soon|how long|by when|what time|which month|what month|timeframe|timeline)\b/.test(text)) {
    return "when";
  }
  if (/\b(?:where|which place|what place|what location|which channel)\b/.test(text)) {
    return "where";
  }
  if (/\bwhy\b/.test(text)) return "why";
  if (/\bhow\b/.test(text)) return "how";
  if (/\b(?:which|path a|path b|option a|option b|choose|choice|better option)\b/.test(text)) {
    return "which";
  }
  if (/^\s*(?:what|what's|what is|what are|what should|what will|what do|what can)\b/.test(text)) {
    return "what";
  }
  if (/^\s*(?:should|will|would|can|could|is|are|am|do|does|did|have|has)\b/.test(text)) {
    return "yesno";
  }
  return "open";
}

function questionPrecisionProtocol(trimmedQuestion: string) {
  if (!trimmedQuestion) {
    return [
      "Question precision protocol:",
      "- No specific question was provided, so do not invent a precise answer.",
      "- The synthesis should ask for one concrete question before a deeper reading.",
    ].join("\n");
  }

  const intent = inferQuestionIntent(trimmedQuestion);
  const shared = [
    "Question precision protocol:",
    `- Detected question type: ${intent}.`,
    "- The ANSWER paragraph must directly answer that type in its first sentence, not drift into general advice.",
    "- Use at most one soft qualifier such as 'likely' or 'not yet', then give the concrete answer unit.",
    "- Never make an absolute guarantee; frame exactness as the reading's strongest signal.",
  ];

  if (intent === "when") {
    return [
      ...shared,
      "- WHEN answer format: give a concrete relative or calendar window plus a trigger/condition.",
      "- Good: 'ANSWER: Watch the next 2-6 weeks; movement depends on one direct follow-up.'",
      "- Bad: 'ANSWER: Your offer emerges when you seek clarity and assert your value.'",
      "- If the question is about a job, offer, reply, or interview, use practical hiring language: this week, next 2-4 weeks, after a follow-up, after scope is clarified, before/after the next conversation.",
    ].join("\n");
  }

  if (intent === "where") {
    return [
      ...shared,
      "- WHERE answer format: name the most likely place, channel, setting, or context, then the sign that confirms it.",
      "- Use concrete nouns such as current workplace, referral, recruiter, online channel, private conversation, social circle, home/family setting, or a specific type of room/event when the spread supports it.",
      "- Do not answer with 'where you feel aligned' or another internal state only.",
    ].join("\n");
  }

  if (intent === "why") {
    return [
      ...shared,
      "- WHY answer format: state the main cause first, then the supporting dynamic.",
      "- Use direct cause language: because, the main reason, the blocker, the pattern, the mismatch, the hidden cost, the missing information.",
      "- Do not answer with consolation or a lesson before naming the cause.",
    ].join("\n");
  }

  if (intent === "what") {
    return [
      ...shared,
      "- WHAT answer format: name the specific thing the user asked for: best move, risk, opportunity, problem, answer, choice, or focus.",
      "- The answer must include a concrete noun from the user's domain, such as offer, role, conversation, person, boundary, budget, deadline, or next step.",
      "- Do not answer only with an abstract theme like clarity, growth, harmony, or self-worth.",
    ].join("\n");
  }

  if (intent === "how") {
    return [
      ...shared,
      "- HOW answer format: give a short method in order, ideally 2-3 steps.",
      "- Use action verbs such as ask, compare, delay, confirm, send, set, choose, review, or test.",
      "- Do not answer with mindset alone.",
    ].join("\n");
  }

  if (intent === "which") {
    return [
      ...shared,
      "- WHICH/choice answer format: name the stronger option or the exact deciding condition.",
      "- If the options are not named, define the deciding test: lower risk, clearer terms, stronger reciprocity, or more concrete evidence.",
    ].join("\n");
  }

  if (intent === "yesno") {
    return [
      ...shared,
      "- YES/NO answer format: start with Yes, No, Likely, Not yet, or Unclear, then one concrete condition.",
      "- Do not answer with a soft maybe unless the answer is genuinely unclear; even then, state what would make it clear.",
    ].join("\n");
  }

  return [
    ...shared,
    "- OPEN answer format: name the clearest bottleneck, direction, or focus in concrete terms.",
  ].join("\n");
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
          "- Because this is a Yes / No spread, the synthesis ANSWER paragraph must begin with a verdict for the exact question: 'ANSWER: [Yes/No/Likely/Not yet/Unclear] — [condition].'",
          "- Keep the condition plain and practical. Do not turn the answer into a broad horoscope or a card-meaning lesson.",
        ]
      : [
          "- The synthesis ANSWER paragraph must answer the exact question in plain language before widening into nuance.",
          "- In the synthesis, do not mention card names at all. Convert the spread into a direct conclusion about the question.",
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

function finalAnswerContract(spread: Spread, trimmedQuestion: string) {
  const shared = [
    "Final synthesis contract:",
    "- Use exactly three paragraphs and these exact labels: ANSWER:, WHY:, NEXT MOVE:.",
    "- Do not mention card names, positions, upright/reversed status, or tarot terminology in the synthesis.",
    "- Do not write a moral lesson. Write the useful answer the user came for.",
    "- If the question is underspecified, say the exact missing condition instead of becoming vague.",
  ];

  if (!trimmedQuestion) {
    return [
      ...shared,
      "- No specific question was provided. ANSWER should name the most actionable focus of the reading, not pretend to answer a hidden question.",
      "- WHY should describe the pattern without inventing private facts.",
      "- NEXT MOVE should ask the user to choose one concrete question before doing a deeper reading.",
    ].join("\n");
  }

  if (spread.id === "yesno") {
    return [
      ...shared,
      "- This is a Yes / No reading. ANSWER must start with exactly one of: Yes, No, Likely, Not yet, Unclear.",
      "- The answer cannot be pure reassurance. It must include the condition that makes the verdict stronger or weaker.",
      "- WHY must explain the main practical reason, not summarize the single card.",
      "- NEXT MOVE must tell the user what to verify, ask, wait for, or avoid before acting.",
    ].join("\n");
  }

  if (spread.id === "decision-crossroads") {
    return [
      ...shared,
      "- This is a choice reading. ANSWER must name which path currently looks stronger, or state the deciding condition if the paths are too close.",
      "- WHY must compare the real tradeoff between the options, not list abstract pros and cons.",
      "- NEXT MOVE must give a decision test: one question to ask, fact to confirm, or deadline to set.",
    ].join("\n");
  }

  if (spread.id === "love-connection" || spread.id === "relationship-mirror" || spread.id === "ex-closure") {
    return [
      ...shared,
      "- This is a relationship reading. ANSWER must name the current relational pattern or likely direction without claiming to know the other person's private thoughts.",
      "- WHY must connect to behavior, communication, availability, boundaries, or mismatch rather than romantic destiny.",
      "- NEXT MOVE must suggest a specific conversation, boundary, pacing choice, or closure action.",
    ].join("\n");
  }

  if (spread.id === "career-path" || spread.id === "interview-offer") {
    return [
      ...shared,
      "- This is a career reading. ANSWER must clarify the work decision, role fit, opportunity quality, or next professional move.",
      "- WHY must mention concrete work factors such as preparation, leverage, communication, scope, timing, or fit.",
      "- NEXT MOVE must be a practical career action, not a motivational sentence.",
    ].join("\n");
  }

  if (spread.id === "money-flow") {
    return [
      ...shared,
      "- This is a money reading. ANSWER must clarify the financial behavior, pressure point, or decision signal without giving professional financial advice.",
      "- WHY must name the money pattern in plain terms: income, spending, risk, delay, hidden cost, or opportunity.",
      "- NEXT MOVE must be a low-risk practical check such as reviewing a number, delaying a commitment, setting a limit, or asking for terms.",
    ].join("\n");
  }

  if (spread.id === "mind-body-spirit") {
    return [
      ...shared,
      "- This is a wellbeing reflection. ANSWER must name what appears out of balance without diagnosing health or mental health conditions.",
      "- WHY must stay with workload, pace, tension, rest, meaning, or support.",
      "- NEXT MOVE must be a gentle self-care or support action, and should suggest professional help only when the user's question indicates risk or distress.",
    ].join("\n");
  }

  if (spread.id === "year-ahead" || spread.id === "week-ahead") {
    return [
      ...shared,
      "- This is a time-period reading. ANSWER must name the strongest planning theme for the period, not predict fixed events.",
      "- WHY must identify the momentum, risk, or recurring pattern that matters most.",
      "- NEXT MOVE must suggest how to plan, review, or track the period.",
    ].join("\n");
  }

  return [
    ...shared,
    "- ANSWER must state the clearest direction or bottleneck for the exact question.",
    "- WHY must explain the main tradeoff or pressure point in ordinary language.",
    "- NEXT MOVE must give one concrete action or test, not a broad affirmation.",
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
    questionPrecisionProtocol(trimmed),
    "",
    finalAnswerContract(spread, trimmed),
    "",
    "Answer quality checklist:",
    "- The card interpretations may explain card meanings through positions; the synthesis must not repeat those meanings.",
    "- The synthesis must answer the seeker's actual question first, then name what remains conditional and what the seeker can do next.",
    "- The synthesis should feel like a decision note or reflection note, not a horoscope, essay, card recap, or inspirational quote.",
    "- The synthesis must not include parenthetical tarot labels, card-name citations, or comma-heavy abstract lists.",
    "- Prefer concrete words tied to the question: timing, cost, effort, boundary, evidence, conversation, risk, offer, pattern, deadline, or next test.",
    "- For when/where/why/what/how questions, the synthesis ANSWER must contain the corresponding concrete answer unit, not only a personal-development condition.",
    "- Avoid absolute promises, fatalistic predictions, and unsupported certainty.",
    "",
    'Return JSON shaped exactly like {"cards":[{"position":"<position label>","interpretation":"<paragraph 1>\\n\\n<paragraph 2>"}],"synthesis":"ANSWER: <direct answer>\\n\\nWHY: <specific reason>\\n\\nNEXT MOVE: <practical next step>"}.',
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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const parentheticalCardLabelPattern = new RegExp(
  `\\s*\\((?:${CARD_LABELS.map(escapeRegExp).join("|")})(?:\\s+(?:upright|reversed))?\\.?\\)`,
  "gi"
);

function cleanSynthesisText(text: string) {
  return normalizeParagraphBreaks(text)
    .replace(/\*\*(\s*KEY TAKEAWAY:[^*\n]+?)\*\*/gi, "$1")
    .replace(/\*\*(\s*(?:ANSWER|WHY|NEXT MOVE):[^*\n]+?)\*\*/gi, "$1")
    .replace(/^\*\*(.+?)\*\*$/gm, "$1")
    .replace(/\*\*/g, "")
    .replace(parentheticalCardLabelPattern, "")
    .replace(/[ \t]+([,.;:!?])/g, "$1")
    .split("\n")
    .map((line) => line.replace(/[ \t]{2,}/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const obviousCardReferencePattern = new RegExp(
  `\\b(?:${CARD_LABELS.filter((label) => label.startsWith("The ")).map(escapeRegExp).join("|")})(?:\\s+(?:upright|reversed))?\\b`,
  "i"
);

const fillerPhrasePattern =
  /\b(?:trust your intuition|inner voice|deepest calling|honou?r your worth|trust the universe|quiet contemplation|align with your purpose|embrace optimism|everything happens for a reason|follow your heart|journey of self-discovery)\b/i;

const evasiveAnswerPattern =
  /\b(?:it depends|may emerge when|might emerge when|could happen as you|likely to emerge when|proactively seek clarity|assert your (?:unique )?value|seek clarity|honou?r your worth|listen to your inner)\b/i;

const timingAnswerPattern =
  /\b(?:today|tomorrow|tonight|this\s+(?:week|month|quarter|season|year|weekend)|next\s+(?:week|month|quarter|season|year|few\s+days|few\s+weeks|few\s+months)|within\s+(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|a)\s+(?:days?|weeks?|months?|years?)|in\s+(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|a)\s+(?:days?|weeks?|months?|years?)|(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*[-–]\s*(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:days?|weeks?|months?|years?)|by\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december|early|mid|late)|(?:early|mid|late)\s+(?:january|february|march|april|may|june|july|august|september|october|november|december|spring|summer|fall|autumn|winter)|q[1-4]|january|february|march|april|may|june|july|august|september|october|november|december)\b/i;

const whereAnswerPattern =
  /\b(?:at|in|inside|through|via|from|with|near|around|within|online|workplace|office|recruiter|referral|network|platform|channel|conversation|event|home|family|friend|team)\b/i;

const whyAnswerPattern =
  /\b(?:because|due to|main reason|root cause|blocker|blocked by|comes from|caused by|the pattern is|the mismatch is|missing information|hidden cost)\b/i;

const howAnswerPattern =
  /\b(?:first|then|next|start by|begin by|step|ask|compare|confirm|send|set|choose|review|test|delay|wait|avoid)\b/i;

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function firstAnswerBody(paragraphs: string[]) {
  return (paragraphs[0] ?? "").replace(/^ANSWER:\s*/i, "").trim();
}

function synthesisPrecisionIssues(text: string, question: string) {
  const intent = inferQuestionIntent(question);
  if (intent === "open") return [];

  const cleaned = cleanSynthesisText(text);
  const paragraphs = cleaned.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
  const answer = firstAnswerBody(paragraphs);
  const issues: string[] = [];

  if (evasiveAnswerPattern.test(answer)) {
    issues.push("The ANSWER paragraph is evasive; replace it with a concrete answer to the user's question type.");
  }

  if (intent === "when" && !timingAnswerPattern.test(answer)) {
    issues.push("The user asked WHEN, so ANSWER must include a concrete time window such as 'within 2-6 weeks', 'next month', or 'late August', plus a condition.");
  }
  if (intent === "where" && !whereAnswerPattern.test(answer)) {
    issues.push("The user asked WHERE, so ANSWER must name a concrete place, channel, setting, or context.");
  }
  if (intent === "why" && !whyAnswerPattern.test(`${answer} ${paragraphs[1] ?? ""}`)) {
    issues.push("The user asked WHY, so ANSWER/WHY must state the primary cause in direct cause language.");
  }
  if (intent === "what" && /\b(?:clarity|growth|harmony|balance|alignment|self-worth)\b/i.test(answer) && !/\b(?:offer|role|choice|risk|problem|move|conversation|deadline|budget|boundary|decision|opportunity|step|person|pattern)\b/i.test(answer)) {
    issues.push("The user asked WHAT, so ANSWER must name a concrete object, choice, risk, opportunity, or next focus, not only an abstract theme.");
  }
  if (intent === "how" && !howAnswerPattern.test(answer)) {
    issues.push("The user asked HOW, so ANSWER must include an ordered method or practical action verbs.");
  }

  return issues;
}

function synthesisQualityIssues(text: string, question = "") {
  const cleaned = cleanSynthesisText(text);
  const paragraphs = cleaned.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
  const issues: string[] = [];

  if (paragraphs.length !== 3) {
    issues.push("The synthesis must have exactly three paragraphs.");
  }
  if (!/^ANSWER:\s+\S/i.test(paragraphs[0] ?? "")) {
    issues.push("Paragraph 1 must start with ANSWER:.");
  }
  if (!/^WHY:\s+\S/i.test(paragraphs[1] ?? "")) {
    issues.push("Paragraph 2 must start with WHY:.");
  }
  if (!/^NEXT MOVE:\s+\S/i.test(paragraphs[2] ?? "")) {
    issues.push("Paragraph 3 must start with NEXT MOVE:.");
  }
  parentheticalCardLabelPattern.lastIndex = 0;
  if (parentheticalCardLabelPattern.test(cleaned) || obviousCardReferencePattern.test(cleaned)) {
    issues.push("The synthesis must not mention tarot card names or card-name citations.");
  }
  if (fillerPhrasePattern.test(cleaned)) {
    issues.push("The synthesis contains spiritual filler instead of a concrete answer.");
  }
  const words = wordCount(cleaned);
  if (words < 45 || words > 120) {
    issues.push("The synthesis must be concise, roughly 60-105 words.");
  }

  return [...issues, ...synthesisPrecisionIssues(cleaned, question)];
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
  const opener = trimmedQuestion
    ? name
      ? `${name}, on "${trimmedQuestion}", the deck answers in layers rather than with a guarantee.`
      : `On "${trimmedQuestion}", the deck answers in layers rather than with a guarantee.`
    : "Without a fixed question, the cards read the season you are in.";

  let synthesis: string;
  if (spread.id === "yesno") {
    const positive = !first.reversed && ["sun", "star", "wheel", "heart"].includes(first.glyph);
    const verdict = positive ? "Likely" : "Not yet";
    synthesis =
      `ANSWER: ${verdict} — verify the condition before you commit.\n\n` +
      `WHY: ${opener} The clearest signal is ${positive ? "yes, if practical support is already visible" : "not yet, because a missing condition still matters"}. Treat this as a decision that needs evidence, not reassurance.\n\n` +
      `NEXT MOVE: Name the one fact that would change your answer. If you cannot confirm it, pause or choose the lower-risk step.`;
  } else {
    const intent = inferQuestionIntent(trimmedQuestion);
    const delayed = first?.reversed;
    if (intent === "when") {
      synthesis =
        `ANSWER: Watch the next ${delayed ? "6-10" : "2-6"} weeks; movement needs one concrete follow-up or reply.\n\n` +
        `WHY: ${opener} The timing looks tied to information becoming explicit, not to waiting passively. A vague process is the main delay.\n\n` +
        "NEXT MOVE: Send one concise follow-up asking for timeline, scope, and decision criteria. If there is no concrete reply within a week, keep other options active.";
    } else if (intent === "where") {
      synthesis =
        `ANSWER: Look through an existing network, referral, or direct conversation first.\n\n` +
        `WHY: ${opener} The strongest signal is not a random new place; it is a context where trust or prior contact already exists. A cold route needs more evidence.\n\n` +
        "NEXT MOVE: List three warm channels you can contact today, then test the strongest one with a clear request.";
    } else if (intent === "why") {
      synthesis =
        `ANSWER: The main reason is missing information and unclear expectations.\n\n` +
        `WHY: ${opener} The situation is harder to read because an important term, motive, or boundary has not been stated plainly. Guessing fills the gap with anxiety.\n\n` +
        "NEXT MOVE: Ask one direct question that forces the hidden condition into the open, then decide from the answer rather than the silence.";
    } else if (intent === "what") {
      synthesis =
        `ANSWER: Focus on the option with clear terms, visible effort, and lower hidden cost.\n\n` +
        `WHY: ${opener} The useful signal is practical: the right object or move should reduce ambiguity, not ask you to supply all the certainty yourself.\n\n` +
        "NEXT MOVE: Compare the top two options by timeline, cost, responsibility, and risk. Choose the one that gives the clearest next commitment.";
    } else if (intent === "how") {
      synthesis =
        `ANSWER: Move in three steps: clarify the facts, test the response, then commit small.\n\n` +
        `WHY: ${opener} The situation needs proof before a larger move. Acting from pressure would make the outcome harder to steer.\n\n` +
        "NEXT MOVE: Ask the key question today, set a short deadline for the reply, and take only the next reversible step.";
    } else {
      synthesis =
        `ANSWER: Make the next move only after the facts are clearer.\n\n` +
        `WHY: ${opener} The useful answer is practical: do not decide from pressure alone. This choice needs cleaner information, firmer boundaries, or a more direct conversation before it becomes reliable.\n\n` +
        "NEXT MOVE: Write down the main risk, the evidence you still need, and the smallest step that tests the situation. Act on that test before making a bigger commitment.";
    }
  }

  return { cards: cardOut, synthesis: cleanSynthesisText(synthesis), model: FALLBACK_MODEL };
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
      temperature: 0.45,
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
          temperature: 0.45,
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

function isValidReading(parsed: ParsedReading | null, count: number, question = ""): boolean {
  return (
    !!parsed &&
    Array.isArray(parsed.cards) &&
    parsed.cards.length === count &&
    typeof parsed.synthesis === "string" &&
    parsed.synthesis.trim().length > 0 &&
    synthesisQualityIssues(parsed.synthesis, question).length === 0
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
  if (!isValidReading(parsed, cards.length, question)) {
    const synthesisIssues =
      parsed && typeof parsed.synthesis === "string"
        ? synthesisQualityIssues(parsed.synthesis, question)
        : ["The response was missing or not valid JSON."];
    const repairPrompt = [
      userPrompt,
      "",
      "The previous response failed the answer-quality check:",
      ...synthesisIssues.map((issue) => `- ${issue}`),
      "",
      "Return the same reading again as a single valid JSON object only — no code fences, no commentary outside the JSON —",
      `shaped exactly like {"cards":[{"position":"<position label>","interpretation":"<paragraph 1>\\n\\n<paragraph 2>"}],"synthesis":"ANSWER: <direct answer>\\n\\nWHY: <specific reason>\\n\\nNEXT MOVE: <practical next step>"} with exactly ${cards.length} card entries in position order.`,
      "The synthesis must be concise, question-specific, and must not mention tarot card names.",
      "For when/where/why/what/how questions, the synthesis ANSWER must directly answer that question type with a concrete time, place, cause, object, or method.",
      "Every interpretation and synthesis string must contain paragraph breaks using \\n\\n.",
    ].join("\n");
    const retry = await call(repairPrompt);
    const retryParsed = retry ? extractJson(retry.text) : null;
    if (isValidReading(retryParsed, cards.length, question)) {
      result = retry;
      parsed = retryParsed;
    }
  }

  if (!result || !parsed || !isValidReading(parsed, cards.length, question)) {
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
    synthesis: ensureParagraphs(cleanSynthesisText(parsed.synthesis ?? ""), 3),
    model: result.model,
  };
}
