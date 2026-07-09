export function inferSpreadIdForQuestion(question: string) {
  const normalized = question.trim().toLowerCase();
  const text = ` ${normalized} `;
  const has = (...terms: string[]) => terms.some((term) => text.includes(term));

  if (/\bex\b/.test(normalized) || has("breakup", "break up", "closure", "move on", "miss them")) {
    return "ex-closure";
  }

  if (
    has(
      "love",
      "relationship",
      "partner",
      "crush",
      "dating",
      "date ",
      "marriage",
      "married",
      "romance",
      "romantic",
      "feel about me",
      "heart",
      "soulmate"
    )
  ) {
    return "love-connection";
  }

  if (has("interview", "offer", "hiring", "recruiter", "negotiation")) {
    return "interview-offer";
  }

  if (
    has(
      "job",
      "career",
      "work",
      "boss",
      "promotion",
      "business",
      "quit",
      "company",
      "coworker",
      "startup",
      "study",
      "school",
      "college",
      "degree"
    )
  ) {
    return "career-path";
  }

  if (
    has(
      "money",
      "finance",
      "financial",
      "debt",
      "salary",
      "income",
      "invest",
      "afford",
      "savings",
      "wealth",
      "rich",
      "budget",
      "loan",
      "rent"
    )
  ) {
    return "money-flow";
  }

  if (has("family", "parent", "mother", "father", "sibling", "relative", "household")) {
    return "family-dynamics";
  }

  if (has("blocked", "block", "stuck", "procrastinat", "avoid", "breakthrough")) {
    return "block-breakthrough";
  }

  if (has("purpose", "calling", "meaning", "mission", "direction in life", "life path")) {
    return "life-purpose";
  }

  if (
    has(
      " or ",
      "choice",
      "choose",
      "decide",
      "decision",
      "which ",
      "between",
      "option",
      "path a",
      "stay or",
      "go or"
    )
  ) {
    return "decision-crossroads";
  }

  if (
    has(
      "health",
      "anxiety",
      "anxious",
      "stress",
      "healing",
      "balance",
      "myself",
      "spirit",
      "soul",
      "peace",
      "burnout",
      "tired",
      "energy",
      "wellbeing",
      "mental"
    )
  ) {
    return "mind-body-spirit";
  }

  if (has("week", "next 7 days", "seven days")) return "week-ahead";
  if (has("year", "next year", "2026", "2027", "12 months", "twelve months")) return "year-ahead";

  if (
    /^(should|will|is|are|can|could|do|does|did)\b/.test(normalized) ||
    has("yes or no")
  ) {
    return "yesno";
  }

  if (has("future", "what happens", "where is this going", "ahead", "coming", "destiny")) {
    return "past-present-future";
  }

  return "past-present-future";
}
