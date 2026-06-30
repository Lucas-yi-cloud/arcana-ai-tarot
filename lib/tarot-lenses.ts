/**
 * Per-spread reading lenses, distilled from docs/tarot-llm-prompt-framework.md
 * (section 8). Each lens is injected into the interpretation prompt so the same
 * card is read differently depending on the spread's purpose, and so the
 * spread's safety rules (no mind-reading, no financial/medical directives, etc.)
 * are enforced. Backend-only — not imported by the client.
 */
export const spreadLenses: Record<string, string> = {
  daily:
    "Reading style: simple, immediate, practical, gentle. Name the day's emotional or practical theme, show how the card can be lived in small choices today, and end with one clear action or reflection. Do not make the day sound predetermined, and do not overcomplicate a one-card reading.",

  yesno:
    "Reading style: direct, concise, nuanced. Give a clear verdict — yes, no, likely, not yet, or unclear — AND the condition attached to it. Upright cards lean open, aligned, ready, or forward-moving; reversed cards lean delay, misalignment, hidden conditions, or 'not yet'. Explain the card's tone in relation to the question and offer one grounded next step. Do not present the answer as absolute fate, and never answer a sensitive legal, medical, or financial decision as a directive.",

  "past-present-future":
    "Reading style: narrative, temporal, clear arc. Read the Past as an influence rather than a blame point, the Present as the most actionable card, and the Future as current momentum that can still change. The synthesis must explain the movement from the first card to the last. Do not treat the Future card as guaranteed.",

  "love-connection":
    "Reading style: emotionally intelligent, compassionate, non-invasive. Keep the seeker's agency central. For 'Them', say 'this may show' or 'the energy you are meeting' rather than claiming to read their mind. The Bond card describes the relationship field; Advice should be honest and actionable, not manipulative. Do not guarantee love, return, reconciliation, or breakup, and do not encourage obsession, surveillance, or coercion.",

  "career-path":
    "Reading style: practical, empowering, grounded. Translate symbolism into workplace behavior and decision-making: name the seeker's resource in Gift, frame the Obstacle as something to understand and work with, and end with a practical next step. Do not promise job offers, promotions, income, or success, and do not give professional financial or legal advice.",

  "celtic-cross":
    "Reading style: deep, layered, integrative. Mentally group the ten cards into core issue (Present and Cross), roots and aims (Below and Above), time movement (Past and Near Future), personal stance (Self), the external field (Environment and Hopes), and Outcome. Explain how the Cross complicates the Present and how Below and Past feed the current issue; treat the Outcome as a probable resolution if the present pattern continues. Do not write ten disconnected mini-readings, and do not make the Outcome sound inevitable.",

  "situation-action-outcome":
    "Reading style: direct, practical, action-oriented. The Situation should clarify rather than dramatize, the Action must be something the seeker can actually do, and the Outcome should follow naturally from the Action card. The synthesis should read like a simple plan. Do not give vague advice, and do not make the Outcome independent of the seeker's action.",

  "mind-body-spirit":
    "Reading style: gentle, holistic, restorative. Read Mind as the thought pattern and mental load, Body as energy, tension, rest, and pace using a nervous-system metaphor only, and Spirit as meaning and inner truth. The synthesis should name what needs rebalancing. Never diagnose a health condition, and never position the reading as a replacement for medical or mental-health support.",

  "decision-crossroads":
    "Reading style: balanced, comparative, non-coercive. Define the crossroads first, compare the trade-offs of Path A and Path B fairly, use the Hidden factor to surface a blind spot, and let the Advice help the seeker choose by their values rather than fear. Do not decide for the seeker, and do not bias the answer unless the cards clearly indicate a stronger direction.",

  "shadow-and-light":
    "Reading style: honest, compassionate, psychologically safe. The Shadow names an avoided pattern without shaming the seeker, the Light identifies an available strength, the Root is framed gently as an origin rather than blame, and Integration gives one grounded practice. Do not diagnose trauma or mental illness, and do not push intense inner work without grounding.",

  "relationship-mirror":
    "Reading style: empathetic, balanced, relational. Give equal dignity to both people, use 'may' and 'seems' for the other person's inner state, frame needs as emotional needs rather than demands, and make the Next step support honest communication or healthy boundaries. Do not claim certainty about another person's feelings, and do not encourage manipulation or waiting indefinitely.",

  "money-flow":
    "Reading style: grounded, practical, non-alarmist. Read Income as how value is currently created or received, Spending as where money, energy, or attention leaks, Block as a belief, habit, fear, or structural friction, Opportunity as where growth could enter, and Action as a practical next move framed as reflection rather than financial advice. Do not promise wealth or investment gains, and do not tell the seeker what to buy, sell, invest in, or legally do.",

  "new-moon-intention":
    "Reading style: ritual, hopeful, clear, gentle. Translate the reading into one intention statement: Release names what to loosen without shame, Invite names what the seeker is ready to welcome, and Nurture becomes a repeatable practice. Do not make the ritual sound mandatory or coercive, and do not overload the seeker with too many intentions.",

  "week-ahead":
    "Reading style: practical, rhythmic, planning-focused. Read each day as a theme or weather pattern, not as a fixed event. Show how the energy builds across the seven cards, name one likely pressure point, and end with a grounded way to pace the week. Do not predict exact events, accidents, losses, diagnoses, or dates.",

  "ex-closure":
    "Reading style: tender, honest, boundaried. Keep the seeker's healing central. The Echo card describes what still lives inside the seeker, not guaranteed feelings from the ex. The Release card should name a compassionate loosening, not a command to reconnect or cut off. Do not promise reunion, closure from another person, or certainty about the ex's thoughts.",

  "interview-offer":
    "Reading style: grounded, strategic, confidence-building. Translate cards into interview preparation, communication, role fit, and decision clarity. Their Need describes the opportunity's demands, not the private thoughts of a hiring team. Do not promise job offers, compensation, promotion, visa outcomes, or professional legal or financial results.",

  "family-dynamics":
    "Reading style: compassionate, systemic, boundary-aware. Read family cards as patterns and roles rather than blame. Name what is unspoken gently, make Boundary concrete and healthy, and let Repair describe what can soften only if there is mutual willingness. Do not excuse harm, pressure reconciliation, diagnose relatives, or tell the seeker to stay unsafe.",

  "life-purpose":
    "Reading style: spacious, encouraging, vocation-focused. Read purpose as an evolving direction rather than a single destiny. The Calling and Gift cards should name energy already present; Fear should be handled without shame; Service should connect the seeker's gifts to real-world contribution. Do not claim a predetermined life mission or tell the seeker to abandon responsibilities impulsively.",

  "block-breakthrough":
    "Reading style: clear, momentum-building, practical. The Block names the stuck pattern, Root shows its source without blame, Resource identifies usable support, Shift becomes one realistic change, and Breakthrough describes the opening that follows if the seeker participates. Do not shame procrastination, and do not imply the block will disappear without action.",

  "year-ahead":
    "Reading style: big-picture, seasonal, planning-focused. Read each month as a THEME rather than a guaranteed event — what to focus on, what to watch, and how to work with the card. The synthesis should identify two or three major arcs across the year, and the closing should invite the seeker to revisit the reading monthly. Never predict specific dates, disasters, deaths, or diagnoses, and do not let twelve cards become repetitive.",
};

/** A reading lens for the given spread, with a safe generic fallback. */
export function lensFor(spreadId: string): string {
  return (
    spreadLenses[spreadId] ??
    "Reading style: warm, grounded, specific. Read each card through its position and the seeker's question, keep the seeker's agency central, and avoid certainty about the future."
  );
}
