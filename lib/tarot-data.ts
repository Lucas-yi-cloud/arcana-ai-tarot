export type SpreadPosition = {
  label: string;
  desc: string;
  x: number;
  y: number;
  rot?: number;
};

export type Spread = {
  id: string;
  name: string;
  count: number;
  tag?: string;
  blurb: string;
  good: string;
  positions: SpreadPosition[];
  scale?: number;
};

export type TarotCard = {
  num: string;
  name: string;
  glyph: string;
  up: string[];
  rev: string[];
};

export const spreads: Spread[] = [
  {
    id: "daily",
    name: "Daily Draw",
    count: 1,
    tag: "POPULAR",
    blurb: "One card to set the tone of your day.",
    good: "Daily guidance, mood checks, simple reflection.",
    scale: 1.7,
    positions: [{ label: "Message", desc: "The central energy asking for your attention.", x: 50, y: 50 }],
  },
  {
    id: "yesno",
    name: "Yes / No",
    count: 1,
    blurb: "A direct answer to a direct question.",
    good: "Clear binary choices, timing checks, quick decisions.",
    scale: 1.7,
    positions: [{ label: "Answer", desc: "The leaning of the situation and the condition attached to it.", x: 50, y: 50 }],
  },
  {
    id: "past-present-future",
    name: "Past · Present · Future",
    count: 3,
    tag: "CLASSIC",
    blurb: "See how your story moves through time.",
    good: "Understanding momentum, patterns, and where things may be heading.",
    scale: 1.25,
    positions: [
      { label: "Past", desc: "What shaped this situation.", x: 28, y: 50 },
      { label: "Present", desc: "What is active right now.", x: 50, y: 50 },
      { label: "Future", desc: "The likely direction if the current energy continues.", x: 72, y: 50 },
    ],
  },
  {
    id: "love-connection",
    name: "Love & Connection",
    count: 5,
    blurb: "Read the space between two hearts.",
    good: "Romance, friendship, attraction, repair, and emotional clarity.",
    scale: 1.05,
    positions: [
      { label: "You", desc: "Your current emotional posture.", x: 24, y: 50 },
      { label: "Them", desc: "The other person's current emotional posture.", x: 76, y: 50 },
      { label: "Bond", desc: "The energy between you.", x: 50, y: 50 },
      { label: "Challenge", desc: "What complicates the connection.", x: 50, y: 28 },
      { label: "Advice", desc: "The next honest move.", x: 50, y: 72 },
    ],
  },
  {
    id: "career-path",
    name: "Career & Path",
    count: 4,
    blurb: "Map the road ahead in work and purpose.",
    good: "Career choices, creative work, money direction, and purpose.",
    scale: 1.1,
    positions: [
      { label: "Now", desc: "Where your work energy stands.", x: 20, y: 50 },
      { label: "Gift", desc: "What you can rely on.", x: 40, y: 50 },
      { label: "Obstacle", desc: "What needs to be handled.", x: 60, y: 50 },
      { label: "Next", desc: "The practical step forward.", x: 80, y: 50 },
    ],
  },
  {
    id: "celtic-cross",
    name: "Celtic Cross",
    count: 10,
    tag: "DEEP",
    blurb: "The full reading — every angle examined.",
    good: "Complex questions, long-running situations, and layered decisions.",
    scale: 0.72,
    positions: [
      { label: "Present", desc: "The heart of the matter.", x: 40, y: 50 },
      { label: "Cross", desc: "The crossing challenge.", x: 50, y: 50, rot: 90 },
      { label: "Below", desc: "The root cause.", x: 50, y: 74 },
      { label: "Above", desc: "The conscious aim.", x: 50, y: 26 },
      { label: "Past", desc: "What is leaving.", x: 30, y: 50 },
      { label: "Near Future", desc: "What is approaching.", x: 70, y: 50 },
      { label: "Self", desc: "Your stance.", x: 88, y: 78 },
      { label: "Environment", desc: "Outside influences.", x: 88, y: 60 },
      { label: "Hopes", desc: "Hope and fear.", x: 88, y: 42 },
      { label: "Outcome", desc: "Probable resolution.", x: 88, y: 24 },
    ],
  },
  {
    id: "situation-action-outcome",
    name: "Situation · Action · Outcome",
    count: 3,
    tag: "PRACTICAL",
    blurb: "Turn a current concern into a clear next step.",
    good: "Questions that need practical movement and grounded advice.",
    scale: 1.25,
    positions: [
      { label: "Situation", desc: "What is really happening.", x: 28, y: 50 },
      { label: "Action", desc: "The move you can make now.", x: 50, y: 50 },
      { label: "Outcome", desc: "What the action may open.", x: 72, y: 50 },
    ],
  },
  {
    id: "mind-body-spirit",
    name: "Mind · Body · Spirit",
    count: 3,
    tag: "BALANCE",
    blurb: "Check in with your thoughts, energy, and inner truth.",
    good: "Self-care, emotional check-ins, and restoring balance.",
    scale: 1.2,
    positions: [
      { label: "Mind", desc: "The thought pattern shaping the moment.", x: 50, y: 30 },
      { label: "Body", desc: "What your energy and nervous system are carrying.", x: 34, y: 64 },
      { label: "Spirit", desc: "The deeper truth beneath the noise.", x: 66, y: 64 },
    ],
  },
  {
    id: "decision-crossroads",
    name: "Decision Crossroads",
    count: 5,
    tag: "CHOICE",
    blurb: "Compare two paths before making a meaningful choice.",
    good: "Two-way decisions, offers, relationships, moves, and commitments.",
    scale: 1,
    positions: [
      { label: "Current energy", desc: "The crossroads itself.", x: 50, y: 50 },
      { label: "Path A", desc: "What opens if you choose the first path.", x: 28, y: 50 },
      { label: "Path B", desc: "What opens if you choose the second path.", x: 72, y: 50 },
      { label: "Hidden factor", desc: "What is not obvious yet.", x: 50, y: 26 },
      { label: "Advice", desc: "The wisdom that helps you choose.", x: 50, y: 74 },
    ],
  },
  {
    id: "shadow-and-light",
    name: "Shadow & Light",
    count: 5,
    tag: "INSIGHT",
    blurb: "Reveal what is blocked, what is ready, and what wants healing.",
    good: "Inner work, repeating patterns, healing, and self-honesty.",
    scale: 1,
    positions: [
      { label: "Shadow", desc: "What is avoided or hidden.", x: 30, y: 50 },
      { label: "Light", desc: "What is already strong and available.", x: 70, y: 50 },
      { label: "Root", desc: "Where this pattern began.", x: 50, y: 72 },
      { label: "Gift", desc: "The wisdom inside the challenge.", x: 50, y: 28 },
      { label: "Integration", desc: "How to bring the lesson home.", x: 50, y: 50 },
    ],
  },
  {
    id: "relationship-mirror",
    name: "Relationship Mirror",
    count: 6,
    tag: "LOVE",
    blurb: "Understand both hearts, the bridge between them, and the next move.",
    good: "Partnership dynamics, emotional needs, and mutual understanding.",
    scale: 0.92,
    positions: [
      { label: "You", desc: "What you are bringing.", x: 34, y: 30 },
      { label: "Them", desc: "What they are bringing.", x: 66, y: 30 },
      { label: "Your need", desc: "What your heart needs.", x: 34, y: 54 },
      { label: "Their need", desc: "What their heart needs.", x: 66, y: 54 },
      { label: "Connection", desc: "The bridge between you.", x: 50, y: 42 },
      { label: "Next step", desc: "The healthiest next move.", x: 50, y: 74 },
    ],
  },
  {
    id: "money-flow",
    name: "Money Flow",
    count: 5,
    tag: "FOCUS",
    blurb: "Read your earning, spending, blocks, opportunities, and next action.",
    good: "Financial choices, business energy, work value, and practical action.",
    scale: 1,
    positions: [
      { label: "Income", desc: "How money is arriving.", x: 22, y: 60 },
      { label: "Spending", desc: "Where energy or money leaks.", x: 36, y: 42 },
      { label: "Block", desc: "The limiting belief or obstacle.", x: 50, y: 34 },
      { label: "Opportunity", desc: "Where growth can enter.", x: 64, y: 42 },
      { label: "Action", desc: "The practical money move.", x: 78, y: 60 },
    ],
  },
  {
    id: "new-moon-intention",
    name: "New Moon Intention",
    count: 4,
    tag: "RITUAL",
    blurb: "Set an intention and see what to invite, release, and nurture.",
    good: "New beginnings, rituals, creative starts, and personal renewal.",
    scale: 1.1,
    positions: [
      { label: "Seed intention", desc: "What wants to begin.", x: 50, y: 24 },
      { label: "Release", desc: "What must be loosened.", x: 30, y: 52 },
      { label: "Invite", desc: "What to welcome in.", x: 70, y: 52 },
      { label: "Nurture", desc: "How to keep it alive.", x: 50, y: 76 },
    ],
  },
  {
    id: "year-ahead",
    name: "Year Ahead",
    count: 12,
    tag: "DEEP",
    blurb: "A twelve-card map for the themes of each month ahead.",
    good: "Annual planning, birthdays, new cycles, and long-range reflection.",
    scale: 0.62,
    positions: [
      { label: "Month 1", desc: "Theme for month 1.", x: 50, y: 18 },
      { label: "Month 2", desc: "Theme for month 2.", x: 64, y: 22 },
      { label: "Month 3", desc: "Theme for month 3.", x: 76, y: 36 },
      { label: "Month 4", desc: "Theme for month 4.", x: 82, y: 50 },
      { label: "Month 5", desc: "Theme for month 5.", x: 76, y: 64 },
      { label: "Month 6", desc: "Theme for month 6.", x: 64, y: 78 },
      { label: "Month 7", desc: "Theme for month 7.", x: 50, y: 82 },
      { label: "Month 8", desc: "Theme for month 8.", x: 36, y: 78 },
      { label: "Month 9", desc: "Theme for month 9.", x: 24, y: 64 },
      { label: "Month 10", desc: "Theme for month 10.", x: 18, y: 50 },
      { label: "Month 11", desc: "Theme for month 11.", x: 24, y: 36 },
      { label: "Month 12", desc: "Theme for month 12.", x: 36, y: 22 },
    ],
  },
];

export const deck: TarotCard[] = [
  { num: "00", name: "The Fool", glyph: "star", up: ["beginnings", "trust", "leap"], rev: ["hesitation", "risk", "delay"] },
  { num: "01", name: "The Magician", glyph: "infinity", up: ["will", "skill", "manifestation"], rev: ["scattered power", "misdirection", "unused tools"] },
  { num: "02", name: "The High Priestess", glyph: "moon", up: ["intuition", "mystery", "inner knowing"], rev: ["secrets", "silence", "disconnection"] },
  { num: "03", name: "The Empress", glyph: "heart", up: ["growth", "care", "abundance"], rev: ["depletion", "overgiving", "blocked creativity"] },
  { num: "04", name: "The Emperor", glyph: "crown", up: ["structure", "authority", "stability"], rev: ["rigidity", "control", "weak boundaries"] },
  { num: "05", name: "The Hierophant", glyph: "key", up: ["teaching", "tradition", "guidance"], rev: ["rebellion", "questioning", "private truth"] },
  { num: "06", name: "The Lovers", glyph: "heart", up: ["choice", "union", "alignment"], rev: ["disharmony", "avoidance", "misalignment"] },
  { num: "07", name: "The Chariot", glyph: "star", up: ["direction", "discipline", "movement"], rev: ["stalling", "force", "divided will"] },
  { num: "08", name: "Strength", glyph: "infinity", up: ["courage", "patience", "soft power"], rev: ["doubt", "pressure", "tenderness needed"] },
  { num: "09", name: "The Hermit", glyph: "star", up: ["solitude", "wisdom", "inner light"], rev: ["isolation", "avoidance", "lost signal"] },
  { num: "10", name: "Wheel of Fortune", glyph: "wheel", up: ["turning point", "timing", "change"], rev: ["resistance", "delay", "old cycle"] },
  { num: "11", name: "Justice", glyph: "scales", up: ["truth", "balance", "accountability"], rev: ["imbalance", "avoidance", "unfairness"] },
  { num: "12", name: "The Hanged Man", glyph: "moon", up: ["pause", "surrender", "new angle"], rev: ["stagnation", "resistance", "martyrdom"] },
  { num: "13", name: "Death", glyph: "skull", up: ["ending", "release", "transformation"], rev: ["clinging", "fear", "unfinished grief"] },
  { num: "14", name: "Temperance", glyph: "cup", up: ["harmony", "healing", "moderation"], rev: ["excess", "friction", "recalibration"] },
  { num: "15", name: "The Devil", glyph: "flame", up: ["attachment", "desire", "pattern"], rev: ["release", "awareness", "breaking chains"] },
  { num: "16", name: "The Tower", glyph: "tower", up: ["revelation", "collapse", "truth"], rev: ["near miss", "fear of change", "slow rebuild"] },
  { num: "17", name: "The Star", glyph: "star", up: ["hope", "renewal", "guidance"], rev: ["discouragement", "distance", "faith returning"] },
  { num: "18", name: "The Moon", glyph: "moon", up: ["dreams", "uncertainty", "subconscious"], rev: ["clarity", "anxiety easing", "truth emerging"] },
  { num: "19", name: "The Sun", glyph: "sun", up: ["joy", "success", "vitality"], rev: ["clouded joy", "delay", "inner child"] },
  { num: "20", name: "Judgement", glyph: "eye", up: ["calling", "awakening", "reckoning"], rev: ["self-doubt", "avoidance", "unfinished lesson"] },
  { num: "21", name: "The World", glyph: "tree", up: ["completion", "wholeness", "arrival"], rev: ["loose ends", "almost there", "integration"] },
];

export function cardImage(num: string, name: string) {
  const file = name.replace("The ", "").replaceAll(" ", "_");
  return `https://commons.wikimedia.org/wiki/Special:FilePath/RWS_Tarot_${num}_${file}.jpg`;
}
