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
    good: "A quick morning check-in or daily ritual.",
    scale: 1.7,
    positions: [{ label: "Your Card", desc: "The energy of your day.", x: 50, y: 50 }],
  },
  {
    id: "yesno",
    name: "Yes / No",
    count: 1,
    blurb: "A direct answer to a direct question.",
    good: "Fast decisions and moments you need clarity.",
    scale: 1.7,
    positions: [{ label: "The Answer", desc: "Yes, no, or the nuance between.", x: 50, y: 50 }],
  },
  {
    id: "past-present-future",
    name: "Past · Present · Future",
    count: 3,
    tag: "CLASSIC",
    blurb: "See how your story moves through time.",
    good: "Understanding the arc of any situation.",
    scale: 1.25,
    positions: [
      { label: "Past", desc: "What shaped this.", x: 24, y: 50 },
      { label: "Present", desc: "Where you are now.", x: 50, y: 50 },
      { label: "Future", desc: "Where it leads.", x: 76, y: 50 },
    ],
  },
  {
    id: "love-connection",
    name: "Love & Connection",
    count: 5,
    blurb: "Read the space between two hearts.",
    good: "Relationships, dating, and reconnection.",
    scale: 1.05,
    positions: [
      { label: "You", desc: "Your heart in this.", x: 22, y: 52 },
      { label: "Connection", desc: "What binds you.", x: 50, y: 52 },
      { label: "Them", desc: "Their heart in this.", x: 78, y: 52 },
      { label: "Challenge", desc: "What tests the bond.", x: 50, y: 20 },
      { label: "Outcome", desc: "Where it is heading.", x: 50, y: 84 },
    ],
  },
  {
    id: "career-path",
    name: "Career & Path",
    count: 4,
    blurb: "Map the road ahead in work and purpose.",
    good: "Jobs, money, and big crossroads.",
    scale: 1.1,
    positions: [
      { label: "Situation", desc: "Where you stand.", x: 14, y: 50 },
      { label: "Obstacle", desc: "What is in the way.", x: 38, y: 50 },
      { label: "Action", desc: "What to do.", x: 62, y: 50 },
      { label: "Outcome", desc: "Where it leads.", x: 86, y: 50 },
    ],
  },
  {
    id: "celtic-cross",
    name: "Celtic Cross",
    count: 10,
    tag: "DEEP",
    blurb: "The full reading — every angle examined.",
    good: "Complex questions that deserve real depth.",
    scale: 0.72,
    positions: [
      { label: "The Heart", desc: "The core of the matter.", x: 38, y: 50 },
      { label: "The Cross", desc: "What crosses you.", x: 38, y: 50, rot: 90 },
      { label: "Foundation", desc: "The root beneath it.", x: 38, y: 83 },
      { label: "The Past", desc: "Passing away.", x: 19, y: 50 },
      { label: "The Crown", desc: "What could be.", x: 38, y: 17 },
      { label: "The Future", desc: "Approaching now.", x: 57, y: 50 },
      { label: "Yourself", desc: "Your stance.", x: 83, y: 84 },
      { label: "Environment", desc: "Outside forces.", x: 83, y: 62 },
      { label: "Hopes & Fears", desc: "What you hold.", x: 83, y: 40 },
      { label: "Outcome", desc: "The culmination.", x: 83, y: 18 },
    ],
  },
  {
    id: "situation-action-outcome",
    name: "Situation · Action · Outcome",
    count: 3,
    tag: "PRACTICAL",
    blurb: "Turn a current concern into a clear next step.",
    good: "Turning any worry into a concrete next step.",
    scale: 1.25,
    positions: [
      { label: "Situation", desc: "Where things stand now.", x: 28, y: 50 },
      { label: "Action", desc: "The move to make.", x: 50, y: 50 },
      { label: "Outcome", desc: "Where it leads.", x: 72, y: 50 },
    ],
  },
  {
    id: "mind-body-spirit",
    name: "Mind · Body · Spirit",
    count: 3,
    tag: "BALANCE",
    blurb: "Check in with your thoughts, energy, and inner truth.",
    good: "A holistic check-in on your wellbeing.",
    scale: 1.2,
    positions: [
      { label: "Mind", desc: "Your thoughts and clarity.", x: 50, y: 30 },
      { label: "Body", desc: "Your energy and health.", x: 34, y: 64 },
      { label: "Spirit", desc: "Your inner truth.", x: 66, y: 64 },
    ],
  },
  {
    id: "decision-crossroads",
    name: "Decision Crossroads",
    count: 5,
    tag: "CHOICE",
    blurb: "Compare two paths before making a meaningful choice.",
    good: "Weighing two options before you commit.",
    scale: 1,
    positions: [
      { label: "Current energy", desc: "Where you stand now.", x: 50, y: 50 },
      { label: "Path A", desc: "The first option.", x: 28, y: 50 },
      { label: "Path B", desc: "The second option.", x: 72, y: 50 },
      { label: "Hidden factor", desc: "What you are not seeing.", x: 50, y: 26 },
      { label: "Advice", desc: "Guidance for the choice.", x: 50, y: 74 },
    ],
  },
  {
    id: "shadow-and-light",
    name: "Shadow & Light",
    count: 5,
    tag: "INSIGHT",
    blurb: "Reveal what is blocked, what is ready, and what wants healing.",
    good: "Inner work, healing, and self-understanding.",
    scale: 1,
    positions: [
      { label: "Shadow", desc: "What is blocking you.", x: 30, y: 50 },
      { label: "Light", desc: "What is ready to emerge.", x: 70, y: 50 },
      { label: "Root", desc: "The source beneath it.", x: 50, y: 72 },
      { label: "Gift", desc: "The hidden blessing.", x: 50, y: 28 },
      { label: "Integration", desc: "How to make peace.", x: 50, y: 50 },
    ],
  },
  {
    id: "relationship-mirror",
    name: "Relationship Mirror",
    count: 6,
    tag: "LOVE",
    blurb: "Understand both hearts, the bridge between them, and the next move.",
    good: "Seeing a relationship from both sides.",
    scale: 0.92,
    positions: [
      { label: "You", desc: "Your heart in this.", x: 34, y: 30 },
      { label: "Them", desc: "Their heart in this.", x: 66, y: 30 },
      { label: "Your need", desc: "What you long for.", x: 34, y: 54 },
      { label: "Their need", desc: "What they long for.", x: 66, y: 54 },
      { label: "Connection", desc: "What binds you.", x: 50, y: 42 },
      { label: "Next step", desc: "Where to go from here.", x: 50, y: 74 },
    ],
  },
  {
    id: "money-flow",
    name: "Money Flow",
    count: 5,
    tag: "FOCUS",
    blurb: "Read your earning, spending, blocks, opportunities, and next action.",
    good: "Finances, income, and money decisions.",
    scale: 1,
    positions: [
      { label: "Income", desc: "What flows in.", x: 22, y: 60 },
      { label: "Spending", desc: "What flows out.", x: 36, y: 42 },
      { label: "Block", desc: "What holds you back.", x: 50, y: 34 },
      { label: "Opportunity", desc: "What is opening up.", x: 64, y: 42 },
      { label: "Action", desc: "Your next money move.", x: 78, y: 60 },
    ],
  },
  {
    id: "new-moon-intention",
    name: "New Moon Intention",
    count: 4,
    tag: "RITUAL",
    blurb: "Set an intention and see what to invite, release, and nurture.",
    good: "Ritual intention-setting and fresh starts.",
    scale: 1.1,
    positions: [
      { label: "Seed intention", desc: "What you are planting.", x: 50, y: 24 },
      { label: "Release", desc: "What to let go.", x: 30, y: 52 },
      { label: "Invite", desc: "What to call in.", x: 70, y: 52 },
      { label: "Nurture", desc: "What to tend.", x: 50, y: 76 },
    ],
  },
  {
    id: "year-ahead",
    name: "Year Ahead",
    count: 12,
    tag: "DEEP",
    blurb: "A twelve-card map for the themes of each month ahead.",
    good: "A big-picture map of the months ahead.",
    scale: 0.62,
    positions: [
      { label: "Month 1", desc: "The month's theme.", x: 50, y: 18 },
      { label: "Month 2", desc: "The month's theme.", x: 64, y: 22 },
      { label: "Month 3", desc: "The month's theme.", x: 76, y: 36 },
      { label: "Month 4", desc: "The month's theme.", x: 82, y: 50 },
      { label: "Month 5", desc: "The month's theme.", x: 76, y: 64 },
      { label: "Month 6", desc: "The month's theme.", x: 64, y: 78 },
      { label: "Month 7", desc: "The month's theme.", x: 50, y: 82 },
      { label: "Month 8", desc: "The month's theme.", x: 36, y: 78 },
      { label: "Month 9", desc: "The month's theme.", x: 24, y: 64 },
      { label: "Month 10", desc: "The month's theme.", x: 18, y: 50 },
      { label: "Month 11", desc: "The month's theme.", x: 24, y: 36 },
      { label: "Month 12", desc: "The month's theme.", x: 36, y: 22 },
    ],
  },
  {
    id: "week-ahead",
    name: "Week Ahead",
    count: 7,
    tag: "WEEKLY",
    blurb: "A seven-card map for the days and choices ahead.",
    good: "Weekly planning, pacing, and emotional preparation.",
    scale: 0.82,
    positions: [
      { label: "Day 1", desc: "The opening tone.", x: 22, y: 62 },
      { label: "Day 2", desc: "What begins to move.", x: 31, y: 38 },
      { label: "Day 3", desc: "The early challenge.", x: 44, y: 24 },
      { label: "Day 4", desc: "The turning point.", x: 56, y: 24 },
      { label: "Day 5", desc: "What needs focus.", x: 69, y: 38 },
      { label: "Day 6", desc: "What supports you.", x: 78, y: 62 },
      { label: "Day 7", desc: "The integration.", x: 50, y: 76 },
    ],
  },
  {
    id: "ex-closure",
    name: "Ex & Closure",
    count: 5,
    tag: "LOVE",
    blurb: "Understand what remains, what healed, and what to release.",
    good: "Breakups, old connections, and emotional closure.",
    scale: 1,
    positions: [
      { label: "You now", desc: "Where your heart stands.", x: 18, y: 54 },
      { label: "The echo", desc: "What still lingers.", x: 36, y: 36 },
      { label: "Unfinished lesson", desc: "What the bond taught.", x: 50, y: 62 },
      { label: "What to keep", desc: "The wisdom worth carrying.", x: 64, y: 36 },
      { label: "What to release", desc: "The tie ready to loosen.", x: 82, y: 54 },
    ],
  },
  {
    id: "interview-offer",
    name: "Interview & Offer",
    count: 4,
    tag: "WORK",
    blurb: "Prepare for an interview, offer, or next career gate.",
    good: "Job interviews, hiring loops, and offer decisions.",
    scale: 1.1,
    positions: [
      { label: "Your strength", desc: "What to lead with.", x: 18, y: 50 },
      { label: "Their need", desc: "What the opportunity asks for.", x: 40, y: 50 },
      { label: "Prep focus", desc: "Where to sharpen attention.", x: 62, y: 50 },
      { label: "Likely fit", desc: "How the path may align.", x: 84, y: 50 },
    ],
  },
  {
    id: "family-dynamics",
    name: "Family Dynamics",
    count: 6,
    tag: "HEALING",
    blurb: "Read patterns, boundaries, and repair inside family ties.",
    good: "Family tension, caregiving, and old household patterns.",
    scale: 0.92,
    positions: [
      { label: "You", desc: "Your role in the pattern.", x: 32, y: 28 },
      { label: "The pattern", desc: "What keeps repeating.", x: 68, y: 28 },
      { label: "Unspoken need", desc: "What is asking to be heard.", x: 24, y: 56 },
      { label: "Boundary", desc: "What needs protection.", x: 50, y: 68 },
      { label: "Repair", desc: "What could soften.", x: 76, y: 56 },
      { label: "Next step", desc: "The healthiest move now.", x: 50, y: 42 },
    ],
  },
  {
    id: "life-purpose",
    name: "Life Purpose",
    count: 7,
    tag: "CALLING",
    blurb: "Explore your gifts, fears, direction, and next meaningful step.",
    good: "Meaning, vocation, and long-term personal growth.",
    scale: 0.82,
    positions: [
      { label: "Calling", desc: "What is quietly calling you.", x: 50, y: 18 },
      { label: "Gift", desc: "A strength to trust.", x: 30, y: 34 },
      { label: "Fear", desc: "What makes the path shrink.", x: 70, y: 34 },
      { label: "Teacher", desc: "What life is showing you.", x: 22, y: 62 },
      { label: "Path", desc: "Where energy wants to move.", x: 50, y: 58 },
      { label: "Service", desc: "How your gift meets the world.", x: 78, y: 62 },
      { label: "Next step", desc: "The grounded step to take.", x: 50, y: 82 },
    ],
  },
  {
    id: "block-breakthrough",
    name: "Block Breakthrough",
    count: 5,
    tag: "SHIFT",
    blurb: "Name what is stuck and find the move that opens it.",
    good: "Creative blocks, avoidance, and stalled decisions.",
    scale: 1,
    positions: [
      { label: "The block", desc: "What is stopping flow.", x: 50, y: 30 },
      { label: "Root", desc: "Where it comes from.", x: 30, y: 52 },
      { label: "Resource", desc: "What can help.", x: 70, y: 52 },
      { label: "Shift", desc: "What needs to change.", x: 40, y: 76 },
      { label: "Breakthrough", desc: "What opens next.", x: 60, y: 76 },
    ],
  },
];

export const deck: TarotCard[] = [
  { num: "00", name: "The Fool", glyph: "mountain", up: ["new beginnings", "spontaneity", "a leap of faith"], rev: ["recklessness", "hesitation", "a missed step"] },
  { num: "01", name: "The Magician", glyph: "infinity", up: ["willpower", "manifestation", "resourcefulness"], rev: ["manipulation", "untapped talent", "self-doubt"] },
  { num: "02", name: "The High Priestess", glyph: "moon", up: ["intuition", "mystery", "the inner voice"], rev: ["secrets withheld", "noise over instinct", "disconnection"] },
  { num: "03", name: "The Empress", glyph: "tree", up: ["abundance", "nurturing", "creativity"], rev: ["blocked creativity", "dependence", "self-neglect"] },
  { num: "04", name: "The Emperor", glyph: "crown", up: ["structure", "authority", "stability"], rev: ["rigidity", "over-control", "a shaky base"] },
  { num: "05", name: "The Hierophant", glyph: "key", up: ["tradition", "guidance", "shared belief"], rev: ["rebellion", "your own path", "broken convention"] },
  { num: "06", name: "The Lovers", glyph: "heart", up: ["union", "alignment", "a meaningful choice"], rev: ["disharmony", "imbalance", "a values clash"] },
  { num: "07", name: "The Chariot", glyph: "tower", up: ["drive", "willpower", "victory through focus"], rev: ["scattered energy", "loss of control", "stalling"] },
  { num: "08", name: "Strength", glyph: "flame", up: ["courage", "gentle power", "patience"], rev: ["self-doubt", "raw emotion", "depletion"] },
  { num: "09", name: "The Hermit", glyph: "star", up: ["reflection", "solitude", "inner guidance"], rev: ["isolation", "withdrawal", "avoidance"] },
  { num: "10", name: "Wheel of Fortune", glyph: "wheel", up: ["change", "cycles", "a turning point"], rev: ["resistance", "bad timing", "a downturn"] },
  { num: "11", name: "Justice", glyph: "scales", up: ["fairness", "truth", "cause and effect"], rev: ["imbalance", "avoided accountability", "unfairness"] },
  { num: "12", name: "The Hanged Man", glyph: "tree", up: ["surrender", "a new angle", "a needed pause"], rev: ["stalling", "resistance", "wasted sacrifice"] },
  { num: "13", name: "Death", glyph: "skull", up: ["endings", "transformation", "release"], rev: ["clinging", "fear of change", "stagnation"] },
  { num: "14", name: "Temperance", glyph: "cup", up: ["balance", "patience", "blending"], rev: ["excess", "impatience", "discord"] },
  { num: "15", name: "The Devil", glyph: "eye", up: ["attachment", "temptation", "what binds you"], rev: ["reclaiming power", "release", "breaking free"] },
  { num: "16", name: "The Tower", glyph: "tower", up: ["sudden change", "upheaval", "revelation"], rev: ["delaying the inevitable", "fear of change", "a near miss"] },
  { num: "17", name: "The Star", glyph: "star", up: ["hope", "renewal", "faith"], rev: ["doubt", "disconnection", "dimmed faith"] },
  { num: "18", name: "The Moon", glyph: "moon", up: ["illusion", "intuition", "the unknown"], rev: ["confusion lifting", "released fear", "clarity"] },
  { num: "19", name: "The Sun", glyph: "sun", up: ["joy", "success", "vitality"], rev: ["temporary clouds", "delayed joy", "low energy"] },
  { num: "20", name: "Judgement", glyph: "flame", up: ["awakening", "reckoning", "a calling"], rev: ["self-doubt", "avoidance", "harsh self-judgment"] },
  { num: "21", name: "The World", glyph: "wheel", up: ["completion", "wholeness", "arrival"], rev: ["loose ends", "delay", "almost there"] },
];

export function cardImage(num: string, name: string) {
  const file = name.replace("The ", "").replaceAll(" ", "_");
  return `/assets/tarot/RWS_Tarot_${num}_${file}.jpg`;
}
