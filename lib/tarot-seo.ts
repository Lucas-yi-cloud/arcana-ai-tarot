export type SpreadSeoScenario = {
  t: string;
  d: string;
};

export type SpreadSeoFaq = {
  q: string;
  a: string;
};

export type SpreadSeoMeta = {
  cardNum: string;
  cardName: string;
  h: string;
  p1: string;
  p2: string;
  scenarios: SpreadSeoScenario[];
  faq: SpreadSeoFaq[];
};

export const siteBaseUrl = "https://aitarotreading.app";
export const siteTitle = "AI Tarot Reading — Free Online Tarot Card Readings | Arcana AI";
export const siteDescription =
  "Get an AI tarot reading online in seconds. Ask a question, draw the cards, and let Arcana AI interpret the Rider-Waite deck — from a daily one-card draw to the full Celtic Cross. Free, private, and accurate.";
export const siteImage = `${siteBaseUrl}/og-image.jpg`;

export const spreadSeoMeta: Record<string, SpreadSeoMeta> = {
  daily: {
    cardNum: "19",
    cardName: "The Sun",
    h: "What is a daily tarot reading?",
    p1: "A daily tarot reading uses a single card to capture the energy of the day ahead. Instead of predicting fixed events, it offers a theme to carry with you — a quality to lean into, or a blind spot to watch. It is the simplest, fastest way to build a consistent tarot practice.",
    p2: "Because only one card is drawn, the meaning stays focused and easy to act on. Many readers pull a daily card with their morning coffee and revisit it at night to see how the day reflected the message.",
    scenarios: [
      { t: "Morning ritual", d: "Start the day grounded with one clear intention to hold." },
      { t: "Quick check-in", d: "Short on time but want guidance? One card is enough." },
      { t: "Building the habit", d: "A daily draw is the easiest way to learn the cards over time." },
    ],
    faq: [
      { q: "Is a one-card AI reading actually accurate?", a: "A daily card is a reflective prompt, not a forecast — and that is exactly what Arcana AI is accurate to. It applies the traditional Sun-to-Moon Rider-Waite meanings faithfully every time; the value comes from how honestly you carry the theme through your day." },
      { q: "Do I need to know tarot to pull a daily card?", a: "No. Arcana AI names the card, tells you its upright and reversed meaning in plain language, and a single daily draw is the easiest, lowest-pressure way to learn the deck over time." },
      { q: "How often should I pull a daily card?", a: "Once each morning is ideal. Re-drawing for the same day tends to muddy the message rather than clarify it, so Arcana AI is built around one clear card to hold, not endless re-rolls." },
      { q: "Can AI really give me something a human reader would?", a: "For a daily check-in, yes — it is consistent, private and available at any hour with no judgement. It will not improvise a flattering meaning; it reads the card you actually drew." },
      { q: "Are these real tarot cards?", a: "Yes — the original 1909 Rider-Waite-Smith artwork and meanings, including reversals. The deck is not AI-generated art; only your interpretation is written for you." },
    ],
  },
  yesno: {
    cardNum: "01",
    cardName: "The Magician",
    h: "How does a yes / no tarot reading work?",
    p1: "A yes / no tarot reading answers a direct question with a single card. The card is read for its overall tone — upright and bright cards lean yes, while reversed or heavy cards lean no, with the imagery adding nuance about why.",
    p2: "This spread is best for closed questions you can phrase as \"should I...\" or \"will this...\". The card not only answers but explains the reasoning behind the yes or no, so you understand the energy around your choice.",
    scenarios: [
      { t: "Fast decisions", d: "When you need a clear nudge one way or the other." },
      { t: "Sanity check", d: "Confirm a gut feeling you already half-trust." },
      { t: "Timing questions", d: "\"Is now the right moment?\" gets a direct response." },
    ],
    faq: [
      { q: "How should I phrase a question for a yes / no reading?", a: "Use a closed form — \"Should I...\" or \"Will this...\". Arcana AI reads the card for its overall tone and explains the reasoning behind the yes or no, so you understand the energy, not just the verdict. Open-ended questions belong in a larger spread." },
      { q: "Can I ask the same yes / no question again?", a: "Better not to. Re-drawing the same question rarely changes the answer and usually just erodes your trust in it. If the card felt ambiguous, ask a fresh, more specific question instead of re-rolling the same one." },
      { q: "Is an AI yes / no answer accurate enough to act on?", a: "Treat it as one honest input, not a fortune. Arcana AI applies the traditional meanings faithfully and never tells you what you want to hear — but for a major decision, pair it with a fuller spread for context." },
      { q: "Does a reversed card always mean no?", a: "Not automatically. A reversal softens or complicates the answer, and Arcana AI reads it alongside the card's imagery rather than as a flat yes/no switch." },
      { q: "Do I need to understand tarot first?", a: "No. The reading is written in plain language and explains why the card leans the way it does, so beginners can follow it without knowing the deck." },
    ],
  },
  "past-present-future": {
    cardNum: "10",
    cardName: "Wheel of Fortune",
    h: "Understanding the Past · Present · Future spread",
    p1: "The Past · Present · Future spread is the classic three-card tarot reading. It maps any situation across time: how it began, where it stands now, and the direction it is moving. It turns a vague worry into a clear narrative arc.",
    p2: "Reading the three cards together — not in isolation — reveals the story. The past card shows roots and influences, the present card shows the current energy, and the future card shows the likely trajectory if nothing changes.",
    scenarios: [
      { t: "Making sense of a situation", d: "See how you got here and where it is heading." },
      { t: "Relationship arcs", d: "Track how a connection has evolved over time." },
      { t: "Decision context", d: "Understand the backstory before you choose a path." },
    ],
    faq: [
      { q: "Did AI tarot predictions actually come true for people?", a: "The future card is not a fixed prediction — it shows the most likely trajectory given current momentum, which your choices can still shift. Arcana AI is honest about this rather than promising events; it reads the arc so you can change it." },
      { q: "Is three cards from an AI enough for a real reading?", a: "Yes. Past · Present · Future is a complete, century-old spread used by professional readers. Arcana AI reads the three cards in relation to each other — not in isolation — so a genuine story emerges." },
      { q: "Can I use this for any topic?", a: "Yes — it is the most versatile spread and works for love, work, money or personal growth. Every Arcana spread tells you what it is best for before you begin." },
      { q: "Do I need to interpret the cards myself?", a: "No. Arcana AI writes an interpretation for each position and then a synthesis tying past, present and future to your question — though comparing it to your own read is a great way to learn." },
      { q: "Can I ask a follow-up after the reading?", a: "The most useful follow-up is a fresh, more specific question rather than re-drawing the same one — re-rolling the same question tends to cloud the message." },
    ],
  },
  "love-connection": {
    cardNum: "06",
    cardName: "The Lovers",
    h: "How a love tarot reading reveals connection",
    p1: "A love tarot reading looks at the space between two people: how each person feels, what is drawing them together, and what stands in the way. Rather than naming a soulmate, it illuminates the dynamics already at play so you can act with clarity.",
    p2: "This five-card spread reads both hearts, the bond between them, the challenge, and the likely direction. It works whether you are dating, deepening a relationship, or trying to understand a connection that confuses you.",
    scenarios: [
      { t: "New romance", d: "Understand where an early connection might be heading." },
      { t: "Long-term relationship", d: "See what needs attention to keep growing together." },
      { t: "Reconnecting", d: "Read the energy before reaching out to someone again." },
    ],
    faq: [
      { q: "Can tarot tell me if someone loves me?", a: "It reveals the emotional energy around a connection and your own role in it — not a guaranteed verdict on another person. Arcana AI reads the dynamics already in play rather than claiming to read a third party's private mind." },
      { q: "Do I need their name, birthday or a photo?", a: "No. There is nothing to upload — simply hold the relationship in mind as you shuffle and draw, and the five positions do the rest. Your question stays private; there is no reader on the other end." },
      { q: "Is an AI love reading as good as a human reader?", a: "It is a different thing. You lose a human's live intuition but gain consistency, privacy and a reading available at any hour that never improvises a flattering answer. Many people use it between sessions with a human reader." },
      { q: "What if the cards show a challenge?", a: "A challenge card names what needs attention, not a doomed ending. Arcana AI explains what the obstacle is asking of you so it becomes guidance for growing closer." },
      { q: "Can I read for a relationship that has ended?", a: "Yes. It can offer closure and clarity about what the connection meant and what to carry forward — a reflective use that AI handles well and privately." },
    ],
  },
  "career-path": {
    cardNum: "08",
    cardName: "Strength",
    h: "Using tarot for career and work questions",
    p1: "A career tarot reading maps the road ahead in work and purpose. It looks at where you stand, the obstacle in your path, the hidden strength you can draw on, and the most promising direction forward.",
    p2: "Tarot will not name your next job title, but it surfaces the patterns shaping your work life — the fears holding you back, the skills you undervalue, and the opportunities you may be overlooking.",
    scenarios: [
      { t: "At a crossroads", d: "Weighing a new role, a move, or a career pivot." },
      { t: "Feeling stuck", d: "Understand what is really blocking your progress." },
      { t: "Planning growth", d: "Find where to focus your energy to advance." },
    ],
    faq: [
      { q: "Can tarot predict if I will get the job?", a: "No — and Arcana AI will not pretend otherwise. It reflects the energy and your readiness rather than a fixed outcome, which makes it genuinely useful for preparing rather than fortune-telling." },
      { q: "How should I word a career question?", a: "Open, reflective questions work best — \"what is blocking my progress?\" or \"where should I focus to grow?\" — rather than yes/no fishing. The obstacle and strength positions are built to answer exactly those." },
      { q: "Is an AI reading useful if I already know tarot?", a: "Yes — it works as a fast, consistent second opinion you can compare against your own interpretation, and it applies the traditional meanings without an off day." },
      { q: "Can it help with a career change or being stuck?", a: "That is its sweet spot. The spread surfaces the fears and opportunities around a pivot, and the obstacle position names what is really keeping you stuck." },
      { q: "Does it cover money and work together?", a: "It focuses on work and purpose; for finances specifically, the Money Flow spread goes deeper. Every Arcana spread tells you what it is best for up front." },
    ],
  },
  "celtic-cross": {
    cardNum: "02",
    cardName: "The High Priestess",
    h: "The Celtic Cross: tarot's deepest reading",
    p1: "The Celtic Cross is the most comprehensive traditional tarot spread. Across ten positions it examines a question from every angle — the heart of the matter, what crosses it, the past and future, hopes, fears, outside influences, and the final outcome.",
    p2: "Because it is so detailed, the Celtic Cross rewards a focused question and a little patience. Each position builds on the last, weaving a full picture of a complex situation that smaller spreads cannot capture.",
    scenarios: [
      { t: "Complex situations", d: "When a question has many moving parts and deserves depth." },
      { t: "Major life choices", d: "Big crossroads that affect several areas of life." },
      { t: "Recurring patterns", d: "Understand a theme that keeps returning to you." },
    ],
    faq: [
      { q: "Is the Celtic Cross too advanced for an AI or a beginner?", a: "No. Arcana AI names and explains each of the ten positions as you draw, so a newcomer can follow a complex reading step by step — and it reads the cards in relation to each other, which is exactly where a ten-card spread gets hard by hand." },
      { q: "Is a ten-card AI reading actually accurate?", a: "It is accurate to the deck: every position applies traditional Rider-Waite meanings faithfully, then Arcana AI synthesises them against your question. It will not invent meanings to fit what you hope to hear." },
      { q: "What question suits the Celtic Cross?", a: "A specific, meaningful one — the depth is wasted on a vague or trivial question. Honest, focused questions give the richest reflection; Arcana AI rewards detail." },
      { q: "Can it replace a professional reader for something this deep?", a: "It is a different experience. You miss a human's live intuition but gain a consistent, private, unhurried reading you can return to. Many use it to prepare for, or reflect after, a human session." },
      { q: "Should I ask the same big question again later?", a: "Let a Celtic Cross breathe before re-asking. If new questions surface, ask those specifically rather than re-drawing the same one, which tends to cloud the message." },
    ],
  },
  "situation-action-outcome": {
    cardNum: "07",
    cardName: "The Chariot",
    h: "Turning worry into action with three cards",
    p1: "The Situation · Action · Outcome spread is built for practical decisions. The first card names where you stand, the second suggests the wisest action, and the third shows where that action likely leads.",
    p2: "It is the spread to reach for when a problem feels stuck. By separating the current reality from the recommended move, it converts an open-ended worry into a concrete next step you can actually take.",
    scenarios: [
      { t: "Stuck on a problem", d: "Get an actionable next move instead of more analysis." },
      { t: "Everyday dilemmas", d: "From conversations to commitments, find the wise action." },
      { t: "Planning a response", d: "See the likely result before you commit to it." },
    ],
    faq: [
      { q: "How is this different from Past · Present · Future?", a: "It focuses on what to do next rather than how a situation unfolds over time. Arcana AI reads the middle card as a recommended action, then shows where that action likely leads — turning an open worry into a concrete step." },
      { q: "What if I do not like the outcome card?", a: "It shows the result of the suggested action — change the action and the outcome can change too. The spread is a decision tool, not a fixed prophecy, and Arcana AI frames it that way." },
      { q: "How should I phrase the question?", a: "Bring one specific, stuck situation rather than a vague mood. The clearer and more honest the question, the more actionable the action card Arcana AI returns." },
      { q: "Can AI really tell me the wise action?", a: "It surfaces the action the cards point to and explains the reasoning — read it as a quality to embody (patience, boldness, honesty) rather than a literal command. You stay the decision-maker." },
      { q: "Should I re-draw if I am unsure?", a: "No. Re-rolling the same dilemma muddies it. If the action feels unclear, ask a more specific follow-up question instead of repeating the same draw." },
    ],
  },
  "mind-body-spirit": {
    cardNum: "14",
    cardName: "Temperance",
    h: "A holistic check-in: Mind · Body · Spirit",
    p1: "The Mind · Body · Spirit spread is a wellbeing check-in across three layers of yourself. The mind card reflects your thoughts and mental state, the body card your physical energy and needs, and the spirit card your deeper sense of meaning.",
    p2: "Read together, the three cards reveal where you are in balance and where you are stretched thin. It is a gentle, restorative reading rather than a predictive one.",
    scenarios: [
      { t: "Feeling out of sync", d: "Pinpoint which part of you needs care right now." },
      { t: "Self-care planning", d: "Decide where to direct your energy this week." },
      { t: "Stressful seasons", d: "Reconnect with yourself when life feels scattered." },
    ],
    faq: [
      { q: "Is this a health prediction or medical advice?", a: "No. It is a reflective wellbeing check-in and never a substitute for professional medical care. Arcana AI keeps it to mind, body and spirit as themes to notice — it will not diagnose or forecast your health." },
      { q: "Can an AI reading really support mindfulness?", a: "Yes — this is where AI tarot is at its strongest. A consistent, private, judgement-free reflection prompts you to check in with yourself honestly, which is the core of a mindfulness practice." },
      { q: "How often should I do this reading?", a: "Weekly or monthly works well as a recurring ritual. It is a restorative check-in rather than a daily draw, so there is no need to re-read anxiously." },
      { q: "What if all three cards feel heavy?", a: "It is a sign to slow down and care for yourself across the board, not a prediction of misfortune. Arcana AI reads it as where you are stretched thin, not as bad luck." },
      { q: "Do I need to know tarot for this one?", a: "No. Each card and position is explained in plain language, making it one of the gentlest spreads to start with." },
    ],
  },
  "decision-crossroads": {
    cardNum: "11",
    cardName: "Justice",
    h: "Comparing two paths with a crossroads spread",
    p1: "The Decision Crossroads spread lays two possible paths side by side so you can compare them clearly. It shows the energy of each option, what each one asks of you, and where each is likely to lead.",
    p2: "Rather than declaring one choice \"right\", it surfaces the trade-offs of both so you decide with open eyes. It is ideal when you feel torn between two real, viable options.",
    scenarios: [
      { t: "Two job offers", d: "Compare the energy and direction of each path." },
      { t: "Stay or go", d: "Weigh a relationship, a city, or a commitment." },
      { t: "Big purchases", d: "See the likely outcome of each option before committing." },
    ],
    faq: [
      { q: "Does it tell me which path is correct?", a: "No single \"right\" answer — and Arcana AI will not pretend to choose for you. It lays out where each path leads and what each asks of you, so you decide with open eyes rather than handing the decision to a bot." },
      { q: "What if both paths look positive?", a: "That is genuinely useful information — it tells you there is no wrong choice, only different journeys. Arcana AI reads the trade-offs of each so you can pick by what matters most to you." },
      { q: "How should I frame a crossroads question?", a: "Name two real, viable options clearly — \"stay or go\", \"offer A or offer B\". The more concrete the two paths, the sharper the comparison Arcana AI can draw." },
      { q: "What if I have already secretly decided?", a: "The spread often confirms a leaning while revealing the trade-offs you were not fully facing — a useful honesty check rather than a rubber stamp." },
      { q: "Can I trust an AI reading for a big life decision?", a: "Use it as one clear input among many. It applies the cards faithfully and never tells you what you want to hear, but the choice — and the responsibility — stays yours." },
    ],
  },
  "shadow-and-light": {
    cardNum: "18",
    cardName: "The Moon",
    h: "Inner work with the Shadow & Light spread",
    p1: "The Shadow & Light spread is a tool for self-understanding and healing. It reveals what is quietly blocking you, what is ready to grow, and what part of you is asking to be healed or released.",
    p2: "This reading invites honesty. The \"shadow\" cards point to patterns you may avoid looking at, while the \"light\" cards show strengths and resources you can lean into as you do the work.",
    scenarios: [
      { t: "Personal growth", d: "See the patterns holding you back from the next step." },
      { t: "Healing seasons", d: "Identify what is ready to be acknowledged and released." },
      { t: "Self-reflection", d: "A mirror for honest, compassionate inner work." },
    ],
    faq: [
      { q: "Will the shadow cards be negative?", a: "They name what is hidden, not what is bad. Seeing a pattern clearly is the first step to changing it, and Arcana AI frames each shadow card as something to understand rather than something to fear." },
      { q: "Can an AI really support inner work and self-discovery?", a: "It can prompt honest reflection — a private, judgement-free mirror you can return to at any hour. What it lacks is a human's presence and care, so treat it as a companion to inner work, never a replacement for a therapist." },
      { q: "Is this like therapy?", a: "No. It is a reflective practice that can support, but never replace, professional mental-health care. If difficult feelings surface, please reach out to a qualified professional." },
      { q: "How should I approach the question?", a: "Come with honesty rather than a yes/no ask. The reading rewards a sincere \"what am I not seeing in myself?\" — Arcana AI reads the shadow and light cards together as one story of where you are growing." },
      { q: "How often should I do inner-work readings?", a: "Occasionally and intentionally. This is a deep reading, not a daily one — re-drawing it frequently tends to reflect anxiety rather than new insight." },
    ],
  },
  "relationship-mirror": {
    cardNum: "03",
    cardName: "The Empress",
    h: "Seeing both sides with the Relationship Mirror",
    p1: "The Relationship Mirror spread reads a connection from both perspectives. It shows how you experience the relationship, how the other person does, the bridge between you, and the most constructive next move.",
    p2: "By giving each person their own cards, it reveals where you are aligned and where you misunderstand each other. It is a spread for empathy as much as insight.",
    scenarios: [
      { t: "Resolving tension", d: "Understand both sides before an important conversation." },
      { t: "Deepening a bond", d: "See what brings you closer and what creates distance." },
      { t: "Any relationship", d: "Works for partners, friends, family, or colleagues." },
    ],
    faq: [
      { q: "Do I read the other person's mind?", a: "No — and Arcana AI is clear about that. It reflects the relationship energy and your perception of it, encouraging empathy rather than claiming to know a third party's private thoughts." },
      { q: "Does the other person need to be present or share details?", a: "No. There is nothing to upload and no one else to involve — you read it alone to understand the dynamic and your own part in it, and your reading stays private." },
      { q: "Can it help before a hard conversation?", a: "Yes. Seeing both perspectives first often makes the conversation more compassionate and productive. Arcana AI reads each side plus the bridge between you and a constructive next move." },
      { q: "Is an AI reading trustworthy for relationship stuff?", a: "Treat it as a reflective mirror, not a verdict on another person. It applies the cards honestly and never tells you only what you want to hear — but the empathy and action are yours to bring." },
      { q: "Is this only for romance?", a: "No. Any two-person relationship fits — partners, friends, family or colleagues. Every Arcana spread tells you what it is best for before you begin." },
    ],
  },
  "money-flow": {
    cardNum: "10",
    cardName: "Wheel of Fortune",
    h: "Reading your finances with the Money Flow spread",
    p1: "The Money Flow spread examines your relationship with money across five positions: how you earn, how you spend, what blocks the flow, where opportunity sits, and the next practical action to take.",
    p2: "It reframes money as energy that moves. By naming the blocks and the openings, it helps you shift from anxiety to a concrete, grounded plan for your finances.",
    scenarios: [
      { t: "Money worries", d: "Turn financial anxiety into a clear next step." },
      { t: "New income", d: "Spot where opportunity is waiting to be acted on." },
      { t: "Spending habits", d: "See which patterns are quietly draining your flow." },
    ],
    faq: [
      { q: "Can tarot tell me when I will be rich?", a: "No, and Arcana AI will not pretend to. It highlights habits, blocks and opportunities — reflective financial guidance, not a forecast of windfalls or dates." },
      { q: "Is this real financial advice?", a: "It is reflective insight, not professional financial advice. Arcana AI reads your mindset around money; for major decisions, debt or investing, pair it with a qualified expert." },
      { q: "What does the \"block\" card actually reveal?", a: "A habit, fear or pattern quietly restricting your money. Naming it is the first step to changing it — Arcana AI explains the block and points to the next practical action." },
      { q: "How should I word a money question?", a: "Ask reflectively — \"what is blocking my flow?\" or \"where am I overlooking opportunity?\" — rather than \"will I get rich?\". Honest, specific questions get the most useful reading." },
      { q: "How often should I read on money?", a: "Monthly is plenty. Frequent re-readings tend to reflect anxiety rather than new insight, so Arcana AI is built for a clear periodic check-in, not daily worry." },
    ],
  },
  "new-moon-intention": {
    cardNum: "17",
    cardName: "The Star",
    h: "Setting intentions with the New Moon spread",
    p1: "The New Moon Intention spread is a ritual for fresh starts. It helps you name what to invite into a new cycle, what to release from the last one, and what to nurture as your intention takes root.",
    p2: "Aligned with the lunar new-moon tradition of planting seeds, this gentle four-card reading turns a vague hope into a clear, supported intention you can return to throughout the month.",
    scenarios: [
      { t: "Fresh starts", d: "Begin a new month, project, or chapter with clarity." },
      { t: "Goal setting", d: "Anchor an intention you actually want to follow." },
      { t: "Lunar rituals", d: "A natural companion to new-moon practices." },
    ],
    faq: [
      { q: "Does it have to be a new moon?", a: "No. Any moment you want a fresh start works — the new moon is simply a meaningful anchor. Arcana AI is available whenever you are, so the ritual fits your calendar, not the other way round." },
      { q: "How do I use the intention afterward?", a: "Write down what Arcana AI surfaces and revisit it through the cycle to track how it unfolds. The reading turns a vague hope into a clear intention you can actually return to." },
      { q: "Can an AI reading make a ritual feel real?", a: "Yes — you still shuffle and draw the cards yourself, and the private, unhurried reflection is the ritual. AI handles the interpretation so you can stay present with the intention." },
      { q: "Can I set more than one intention?", a: "You can, but a single clear intention is easier to follow and far more powerful. Arcana AI reads what to invite, release and nurture around that one focus." },
      { q: "Do I need to know tarot for this?", a: "No. Each of the four positions is named and explained in plain language, making it a gentle, beginner-friendly place to start." },
    ],
  },
  "year-ahead": {
    cardNum: "21",
    cardName: "The World",
    h: "Mapping the months with a Year Ahead reading",
    p1: "The Year Ahead spread draws twelve cards — one for each month — to map the themes of the year to come. It offers a big-picture view of where growth, challenge, and opportunity are likely to cluster.",
    p2: "Rather than predicting fixed events, it gives each month a guiding theme you can prepare for. Many readers run it at the new year or on their birthday as an annual ritual.",
    scenarios: [
      { t: "New year planning", d: "Set the tone and priorities for the year ahead." },
      { t: "Birthday reading", d: "A personal annual ritual to look forward." },
      { t: "Big-picture view", d: "See where the year asks for focus and care." },
    ],
    faq: [
      { q: "Are the monthly cards set in stone?", a: "No. Each card is a theme to work with, not a fixed prediction of events — your choices shape how the year actually unfolds. Arcana AI reads them as guidance to prepare for, not a calendar of fate." },
      { q: "Is a twelve-card AI reading accurate?", a: "It is accurate to the deck: each month applies traditional Rider-Waite meanings faithfully, and Arcana AI ties them into a big-picture arc. It forecasts themes to work with, not specific events." },
      { q: "When is the best time to do it, and from which month?", a: "The new year or your birthday are natural starting points, but any month works — begin from the current month for a rolling year, or January for a calendar year." },
      { q: "What if a month looks difficult?", a: "It flags where to prepare and stay grounded — forewarned is genuinely forearmed. Arcana AI reads a heavy month as a theme to navigate, not a sentence." },
      { q: "Can I revisit the reading mid-year?", a: "Yes. Many readers check back each month to see how the theme is unfolding — a better practice than re-drawing the whole year, which just clouds the original reading." },
    ],
  },
};

export function clampSeoDescription(value: string) {
  return value.length > 300 ? `${value.slice(0, 297)}...` : value;
}
