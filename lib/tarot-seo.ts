export type SpreadSeoMeta = {
  cardNum: string;
  cardName: string;
  p1: string;
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
    p1: "A daily tarot reading uses a single card to capture the energy of the day ahead. Instead of predicting fixed events, it offers a theme to carry with you, a quality to lean into, or a blind spot to watch.",
  },
  yesno: {
    cardNum: "01",
    cardName: "The Magician",
    p1: "A yes / no tarot reading answers a direct question with a single card. The card is read for its overall tone, with the imagery adding nuance about why the answer leans yes, no, or not yet.",
  },
  "past-present-future": {
    cardNum: "10",
    cardName: "Wheel of Fortune",
    p1: "The Past · Present · Future spread is the classic three-card tarot reading. It maps any situation across time: how it began, where it stands now, and the direction it is moving.",
  },
  "love-connection": {
    cardNum: "06",
    cardName: "The Lovers",
    p1: "A love tarot reading looks at the space between two people: how each person feels, what is drawing them together, and what stands in the way so you can act with clarity.",
  },
  "career-path": {
    cardNum: "08",
    cardName: "Strength",
    p1: "A career tarot reading maps the road ahead in work and purpose. It looks at where you stand, the obstacle in your path, the hidden strength you can draw on, and the most promising direction forward.",
  },
  "celtic-cross": {
    cardNum: "02",
    cardName: "The High Priestess",
    p1: "The Celtic Cross is the most comprehensive traditional tarot spread. Across ten positions it examines a question from every angle, including the heart of the matter, outside influences, hopes, fears, and the final outcome.",
  },
  "situation-action-outcome": {
    cardNum: "07",
    cardName: "The Chariot",
    p1: "The Situation · Action · Outcome spread is built for practical decisions. It names where you stand, suggests the wisest action, and shows where that action likely leads.",
  },
  "mind-body-spirit": {
    cardNum: "14",
    cardName: "Temperance",
    p1: "The Mind · Body · Spirit spread is a wellbeing check-in across three layers of yourself: your thoughts, your physical energy, and your deeper sense of meaning.",
  },
  "decision-crossroads": {
    cardNum: "11",
    cardName: "Justice",
    p1: "The Decision Crossroads spread lays two possible paths side by side so you can compare them clearly. It surfaces the trade-offs of both options so you can choose with open eyes.",
  },
  "shadow-and-light": {
    cardNum: "18",
    cardName: "The Moon",
    p1: "The Shadow & Light spread is a tool for self-understanding and healing. It reveals what is quietly blocking you, what is ready to grow, and what part of you is asking to be released.",
  },
  "relationship-mirror": {
    cardNum: "03",
    cardName: "The Empress",
    p1: "The Relationship Mirror spread reads a connection from both perspectives. It shows how you experience the relationship, how the other person does, the bridge between you, and the most constructive next move.",
  },
  "money-flow": {
    cardNum: "10",
    cardName: "Wheel of Fortune",
    p1: "The Money Flow spread examines your relationship with money across earning, spending, blocks, opportunity, and the next practical action to take.",
  },
  "new-moon-intention": {
    cardNum: "17",
    cardName: "The Star",
    p1: "The New Moon Intention spread is a ritual for fresh starts. It helps you name what to invite into a new cycle, what to release from the last one, and what to nurture as your intention takes root.",
  },
  "year-ahead": {
    cardNum: "21",
    cardName: "The World",
    p1: "The Year Ahead spread draws twelve cards, one for each month, to map the themes of the year to come and show where growth, challenge, and opportunity are likely to cluster.",
  },
};

export function clampSeoDescription(value: string) {
  return value.length > 300 ? `${value.slice(0, 297)}...` : value;
}
