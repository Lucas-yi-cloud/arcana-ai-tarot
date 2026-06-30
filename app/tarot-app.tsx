"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import { cardImage, deck, spreads, type Spread, type TarotCard } from "@/lib/tarot-data";
import { siteTitle, spreadSeoMeta } from "@/lib/tarot-seo";

type Route =
  | "home"
  | "detail"
  | "question"
  | "draw"
  | "result"
  | "history"
  | "about"
  | "privacy"
  | "contact";
type DrawPhase = "idle" | "shuffling" | "dealt";
// Legacy Stripe metadata uses these keys:
// year = Quarterly Pass, quarter = Monthly Pass.
type Plan = "year" | "quarter";

type User = {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  freeUsed: number;
  subscribed: boolean;
  subscription: {
    plan: string;
    status: string;
    currentPeriodEnd: number | null;
  } | null;
  membership: {
    tier: "free" | "quarter" | "year";
    label: string;
    detail: string;
    currentPeriodEnd: number | null;
  };
};

type DrawnCard = TarotCard & {
  key: string;
  reversed: boolean;
  flipped: boolean;
  posLabel: string;
  posDesc: string;
  x: number;
  y: number;
  rot?: number;
  interpretation?: string;
};

type ReadingInterpretation = {
  cards: { num: string; posLabel: string; reversed: boolean; text: string }[];
  synthesis: string;
  model: string;
};

type SavedReading = {
  id: string;
  spreadId: string;
  spreadName: string;
  question: string;
  createdAt: number;
  payload: {
    cards: DrawnCard[];
    synthesis: string;
  };
};

type StripeConfig = {
  enabled: boolean;
  publishableKey: string;
  prices: Record<Plan, string>;
};

type TarotAppProps = {
  initialRoute?: Route;
  initialSpreadId?: string;
};

const defaultPrompts = [
  "Where is this relationship heading?",
  "What should I focus on this month?",
  "What am I not seeing?",
  "Is this the right move for my career?",
  "What is the smartest next step to take?",
];

const spreadPrompts: Record<string, string[]> = {
  daily: [
    "What energy should I carry into today?",
    "What should I give my attention to right now?",
    "What am I overlooking this morning?",
    "What lesson is today trying to teach me?",
    "How can I make the most of today?",
  ],
  yesno: [
    "Should I say yes to this opportunity?",
    "Is now the right time to act?",
    "Should I reach out to them?",
    "Is this worth pursuing?",
    "Should I let this go?",
  ],
  "past-present-future": [
    "How did I get to where I am now?",
    "Where is this situation heading?",
    "What from my past is still shaping this?",
    "What does the road ahead look like?",
    "How does this chapter resolve?",
  ],
  "love-connection": [
    "Where is this relationship heading?",
    "What does this person truly feel for me?",
    "What is blocking us from getting closer?",
    "How can I open my heart again?",
    "Is this connection worth fighting for?",
  ],
  "career-path": [
    "Is this the right move for my career?",
    "What should I focus on to grow at work?",
    "How do I navigate this crossroads in my job?",
    "What is holding my career back?",
    "Should I make a change in my work life?",
  ],
  "celtic-cross": [
    "What is really going on beneath this situation?",
    "What is the heart of the matter I am facing?",
    "What outcome am I moving toward?",
    "What hidden influence should I be aware of?",
    "How do all the pieces of this fit together?",
  ],
  "situation-action-outcome": [
    "What is the smartest next step to take?",
    "How should I handle this situation?",
    "What action will move things forward?",
    "What will happen if I act on this now?",
    "How do I turn this worry into a plan?",
  ],
  "mind-body-spirit": [
    "How can I find more balance right now?",
    "What is my body trying to tell me?",
    "What does my spirit need most?",
    "Where am I out of alignment?",
    "How do I reconnect with myself?",
  ],
  "decision-crossroads": [
    "Which path is right for me?",
    "What should I weigh before I choose?",
    "What am I not seeing about my options?",
    "Where does each choice lead?",
    "How do I make this decision with confidence?",
  ],
  "shadow-and-light": [
    "What am I not seeing in myself?",
    "What is ready to be healed?",
    "What is quietly holding me back?",
    "What strength am I underusing?",
    "What do I need to release?",
  ],
  "relationship-mirror": [
    "How do we each see this relationship?",
    "What bridges the distance between us?",
    "What is the next move for us?",
    "What does my partner need from me?",
    "How can we grow closer?",
  ],
  "money-flow": [
    "How can I improve my financial situation?",
    "What is blocking my money from flowing?",
    "Where is my next opportunity to earn?",
    "What should I focus on with money now?",
    "What money habit needs to change?",
  ],
  "new-moon-intention": [
    "What should I invite into this new cycle?",
    "What intention should I set right now?",
    "What do I need to release to begin again?",
    "What should I nurture this month?",
    "How do I make a fresh start?",
  ],
  "week-ahead": [
    "What should I prepare for this week?",
    "How can I pace myself over the next seven days?",
    "Where should I put my attention this week?",
    "What challenge might I meet this week?",
    "How can I make this week feel more aligned?",
  ],
  "ex-closure": [
    "What do I need to understand about this past connection?",
    "What am I still holding from my ex?",
    "How can I find closure without going backward?",
    "What lesson should I carry from this relationship?",
    "What am I ready to release now?",
  ],
  "interview-offer": [
    "How should I prepare for this interview?",
    "What strength should I lead with in this opportunity?",
    "Is this role aligned with where I am growing?",
    "What should I understand before accepting this offer?",
    "How can I show up clearly in this hiring process?",
  ],
  "family-dynamics": [
    "What pattern is shaping my family right now?",
    "How can I hold a healthier boundary with family?",
    "What is unspoken in this family situation?",
    "What would help repair this family tension?",
    "How can I respond without repeating the old pattern?",
  ],
  "life-purpose": [
    "What is quietly calling me forward?",
    "What gift am I meant to use more fully?",
    "What fear is keeping my purpose small?",
    "Where should I focus my long-term growth?",
    "What next step would make my life feel more meaningful?",
  ],
  "block-breakthrough": [
    "What is really blocking me right now?",
    "How do I move through this creative block?",
    "What is keeping this decision stuck?",
    "What resource can help me break through?",
    "What shift would open momentum again?",
  ],
  "year-ahead": [
    "What should I focus on this year?",
    "What theme runs through the months ahead?",
    "Where will I grow the most this year?",
    "What should I prepare for?",
    "What does this year want to teach me?",
  ],
};

const googleResumeKey = "arcana.googleLoginResume";
const checkoutResumeKey = "arcana.checkoutResume";

const faqs = [
  {
    q: "How does an AI tarot reading actually work?",
    a: "You pick a spread, ask a question, then shuffle and draw the cards yourself. Arcana AI reads the specific cards you pulled — each card's named position in the spread and whether it landed upright or reversed — then writes an interpretation for every card plus a final synthesis that ties the whole spread back to your question.",
  },
  {
    q: "Are AI tarot readings accurate?",
    a: "Tarot was never fortune-telling — it's a mirror for reflection, and that's exactly what Arcana AI is accurate to. It applies the traditional Rider-Waite-Smith meanings faithfully to your draw, every time. The cards don't predict a fixed future; they help you see your situation more clearly so you can decide what to do with it.",
  },
  {
    q: "Can AI really replace a human tarot reader? What does it lack?",
    a: "It's a different thing, not a replacement. A human reader brings presence, intuition, and a relationship you can't automate. Arcana AI offers consistency, privacy, and availability with no judgement, which makes it useful for practice, reflection, and readings between human sessions.",
  },
  {
    q: "Are these real tarot cards, or AI-generated art?",
    a: "Real cards. Arcana AI uses the Rider-Waite-Smith deck with the original 1909 Pamela Colman Smith artwork and the century-old meanings that go with it, reversals included. The deck is not AI-generated; only the interpretation is written for you.",
  },
  {
    q: "Do I need to know tarot before I start?",
    a: "Not at all. Every spread tells you what it's good for before you begin, each position is named and explained as you draw, and the reading is written in plain language. If you already read tarot, it works as a fast second opinion to compare against your own interpretation.",
  },
  {
    q: "What questions can I ask, and how do I ask better ones?",
    a: "Open, reflective questions work best — 'what should I understand about...' or 'what's blocking me from...' — rather than yes/no fishing, though the Yes / No spread is there when you want a direct nudge. The more honest and specific your question, the more useful the reflection.",
  },
  {
    q: "Can I ask the same question again, or follow up?",
    a: "You can, but re-drawing the same question repeatedly tends to muddy the message rather than clarify it. When a reading raises something new, the most useful move is to ask a fresh, more specific follow-up question instead of re-rolling the same one.",
  },
  {
    q: "Is Arcana AI free, and is my reading private?",
    a: "You can begin with free readings to experience a full AI tarot reading end to end. Arcana Pro unlocks unlimited readings across every spread, and your account keeps saved readings private to you.",
  },
];

function routePath(route: Route, spread: Spread) {
  if (route === "detail" || route === "question" || route === "draw" || route === "result") {
    return `/spread/${spread.id}`;
  }
  if (route === "about") return "/about";
  if (route === "privacy") return "/privacy";
  if (route === "contact") return "/contact";
  if (route === "history") return "/journals";
  return "/";
}

function documentTitleForRoute(route: Route, spread: Spread) {
  if (route === "detail" || route === "question" || route === "draw" || route === "result") {
    return `${spread.name} Tarot Reading — Free AI ${spread.name} Spread | Arcana AI`;
  }
  if (route === "about") {
    return "About Arcana AI — A Quieter Way to Ask the Cards";
  }
  if (route === "privacy") {
    return "Privacy — Arcana AI Tarot";
  }
  if (route === "contact") {
    return "Contact — Arcana AI Tarot";
  }
  if (route === "history") {
    return "Journals — Arcana AI Tarot";
  }
  return siteTitle;
}

function routeStateFromPath(pathname: string): { route: Route; spreadId?: string } {
  if (pathname === "/about") return { route: "about" };
  if (pathname === "/privacy") return { route: "privacy" };
  if (pathname === "/contact") return { route: "contact" };
  if (pathname === "/journals") return { route: "history" };
  const spreadMatch = /^\/spread\/([^/]+)$/.exec(pathname);
  if (spreadMatch && spreads.some((item) => item.id === spreadMatch[1])) {
    return { route: "detail", spreadId: spreadMatch[1] };
  }
  return { route: "home" };
}

function LogoMark() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M14.4 3.2a9 9 0 1 0 4.3 12.2 7 7 0 0 1-4.3-12.2z"
        fill="#ffe98a"
      />
      <path
        d="M17.6 4.2l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1z"
        fill="#fff"
      />
      <circle cx="6.5" cy="17.5" r="0.9" fill="#fff" opacity="0.85" />
    </svg>
  );
}

function GoogleLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

function accountName(user: User) {
  return user.displayName || user.email.split("@")[0] || "Arcana reader";
}

function accountInitial(user: User) {
  return accountName(user).slice(0, 1).toUpperCase();
}

function membershipDaysLeft(user: User) {
  const end = user.membership.currentPeriodEnd;
  if (!end) return null;
  return Math.max(0, Math.ceil((end - Date.now()) / 86_400_000));
}

function membershipCaption(user: User, freeLimit: number) {
  if (user.membership.tier === "year") return "Quarterly pass · unlimited readings";
  if (user.membership.tier === "quarter") return "Monthly pass · unlimited readings";
  if (user.subscribed) return "Pro pass · unlimited readings";
  return `${Math.max(0, freeLimit - user.freeUsed)} of ${freeLimit} free readings left`;
}

function CardBack() {
  return (
    <div className="tarot-back card-back-art">
      <svg width="42" height="42" viewBox="0 0 72 72" fill="none" stroke="#f0d693" strokeWidth="2">
        <circle cx="36" cy="36" r="30" opacity=".55" />
        <path d="M36 5l3.6 27.4L67 36l-27.4 3.6L36 67l-3.6-27.4L5 36l27.4-3.6z" />
      </svg>
    </div>
  );
}

function TarotImage({ card, reversed = false }: { card: TarotCard; reversed?: boolean }) {
  return (
    <div className="tarot-card" style={{ width: "100%", height: "100%" }}>
      <img
        alt={card.name}
        src={cardImage(card.num, card.name)}
        style={{ transform: reversed ? "rotate(180deg)" : undefined }}
      />
    </div>
  );
}

function splitReadingParagraphs(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function ReadingParagraphs({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const paragraphs = splitReadingParagraphs(text);
  return (
    <div className={className}>
      {paragraphs.map((paragraph, index) => (
        <p key={`${paragraph.slice(0, 28)}-${index}`}>{paragraph}</p>
      ))}
    </div>
  );
}

function ShuffleAnimation({ spread, question }: { spread: Spread; question: string }) {
  const mode = question.trim() ? "Your question" : "A general reading";

  return (
    <div className="shuffle-scene" role="status" aria-live="polite">
      <p className="shuffle-kicker">
        {spread.name} · {mode}
      </p>
      <h1 className="serif">Focus on your question...</h1>
      <div className="shuffle-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="shuffle-deck" aria-hidden="true">
        <div className="shuffle-glow" />
        <div className="shuffle-card shuffle-card-left">
          <CardBack />
        </div>
        <div className="shuffle-card shuffle-card-right">
          <CardBack />
        </div>
        <div className="shuffle-card shuffle-card-main">
          <CardBack />
        </div>
      </div>
      <div className="shuffle-progress" aria-hidden="true">
        <span />
      </div>
    </div>
  );
}

function getSynthesis(cards: DrawnCard[], question: string, spread: Spread) {
  if (!cards.length) return "";
  const first = cards[0];
  const last = cards[cards.length - 1];
  const firstWord = (first.reversed ? first.rev : first.up)[0];
  const lastWord = (last.reversed ? last.rev : last.up)[0];
  const opener = question.trim()
    ? `On “${question.trim()}”, the deck answers in layers.`
    : "Without a fixed question, the cards read the season you are in.";
  if (spread.id === "yesno") {
    const positive = !first.reversed && ["sun", "star", "wheel", "heart"].includes(first.glyph);
    return `${opener} The answer leans ${
      positive ? "yes" : "not yet"
    }. ${first.name} points to ${firstWord}, so the real message is less about force and more about timing.`;
  }
  return `${opener} The reading begins with ${firstWord} and resolves toward ${lastWord}. ${spread.name} is asking you to notice how the first impulse can mature into the final card's lesson.`;
}

function drawCards(spread: Spread) {
  const indexes = deck.map((_, index) => index);
  for (let i = indexes.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
  }

  return spread.positions.map((position, index) => {
    const card = deck[indexes[index]];
    return {
      ...card,
      key: `${position.label}-${card.num}-${index}`,
      reversed: Math.random() < 0.32,
      flipped: false,
      posLabel: position.label,
      posDesc: position.desc,
      x: position.x,
      y: position.y,
      rot: position.rot,
    };
  });
}

function SeoSection({
  openFaq,
  onToggleFaq,
}: {
  openFaq: number;
  onToggleFaq: (index: number) => void;
}) {
  const stats = [
    [String(spreads.length), "traditional spreads"],
    ["22", "Major Arcana cards"],
    ["1909", "Rider-Waite tradition"],
    ["100%", "private readings"],
  ];
  const pillars = [
    {
      title: "Grounded in experience",
      copy: "Shuffle, draw, and flip each card yourself. Arcana AI reads what actually landed in front of you, so no two readings are alike.",
      icon: (
        <>
          <path d="M3 16s5-8 13-8 13 8 13 8-5 8-13 8S3 16 3 16z" />
          <circle cx="16" cy="16" r="3.4" />
        </>
      ),
    },
    {
      title: "Rooted in tradition",
      copy: "Every card is the classic 1909 Rider-Waite-Smith illustration, interpreted with established upright and reversed meanings.",
      icon: (
        <>
          <path d="M5 24l-2-13 7 6 6-10 6 10 7-6-2 13z" />
          <path d="M5 27h22" />
        </>
      ),
    },
    {
      title: "Every spread explained",
      copy: "From a one-card Daily Draw to the Celtic Cross, each position is named, explained, then woven into one clear synthesis.",
      icon: (
        <>
          <circle cx="16" cy="16" r="11" />
          <circle cx="16" cy="16" r="3" />
          <path d="M16 5v8M16 19v8M5 16h8M19 16h8" />
        </>
      ),
    },
    {
      title: "Private & judgment-free",
      copy: "Your questions and saved readings stay in your own journal, linked to your account and available when you want to revisit them.",
      icon: (
        <>
          <path d="M16 4l11 4v8c0 7-5 11-11 12-6-1-11-5-11-12V8z" />
          <path d="M11 16l3.5 3.5L21 13" />
        </>
      ),
    },
  ];

  return (
    <section className="seo-block">
      <div className="seo-copy seo-copy-centered">
        <span className="seo-kicker">TAROT AI, DONE RIGHT</span>
        <h2 className="serif">
          A tarot AI built for a real reading, not a random card generator
        </h2>
        <p>
          Arcana AI turns the centuries-old practice of tarot into a guided digital
          ritual. Choose from twenty traditional spreads, hold your question, and draw
          from the complete Rider-Waite Major Arcana. Every <strong>AI tarot reading</strong>{" "}
          interprets the exact cards you drew — their position, their orientation, and the
          question you asked — into language you can actually act on.
        </p>
      </div>

      <div className="seo-ritual-panel starfield">
        <div className="seo-ritual-glow" aria-hidden="true" />
        <div className="seo-ritual-stars" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="seo-ritual-cards" aria-hidden="true">
          {[
            ["18", "The Moon", "left"],
            ["19", "The Sun", "right"],
            ["17", "The Star", "center"],
          ].map(([num, name, slot]) => (
            <div className={`seo-ritual-card seo-ritual-card-${slot}`} key={name}>
              <img alt={String(name)} src={cardImage(String(num), String(name))} loading="lazy" />
              {slot === "center" && <span className="seo-ritual-shimmer" />}
            </div>
          ))}
        </div>
        <div className="seo-ritual-copy">
          <span>A GUIDED RITUAL</span>
          <h3 className="serif">Every card you draw, read in context</h3>
          <p>
            Arcana AI weaves the cards you pulled, their positions and orientations, and
            the question you asked into one clear, personal interpretation — never a
            generic blurb.
          </p>
          <div className="seo-ritual-chips" aria-label="Reading features">
            <span>Upright & reversed</span>
            <span>Position-aware</span>
            <span>Whole-spread synthesis</span>
          </div>
        </div>
      </div>

      <div className="seo-stat-band" aria-label="Arcana AI tarot facts">
        {stats.map(([value, label]) => (
          <div className="seo-stat" key={label}>
            <strong className="serif">{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="seo-feature-row">
        {pillars.map((pillar) => (
          <article className="seo-feature" key={pillar.title}>
            <div className="seo-feature-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 32 32"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {pillar.icon}
              </svg>
            </div>
            <h3>{pillar.title}</h3>
            <p>{pillar.copy}</p>
          </article>
        ))}
      </div>

      <div className="faq-wrap">
        <h2 className="serif">AI tarot reading — questions, answered</h2>
        <div className="faq-list">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <article className="faq-item" key={faq.q}>
                <button className="faq-question" onClick={() => onToggleFaq(index)}>
                  <h3>{faq.q}</h3>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {isOpen && <p className="faq-answer">{faq.a}</p>}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SpreadSeoContent({ spread }: { spread: Spread }) {
  const seo = spreadSeoMeta[spread.id];
  if (!seo) return null;

  const steps = [
    {
      title: "Hold your question",
      copy: "Settle on what you want to understand. A focused intention gives the cards something clear to reflect.",
    },
    {
      title: "Draw the cards",
      copy: "Shuffle and reveal each card yourself. Every position in this spread has a named, specific meaning.",
    },
    {
      title: "Read the whole story",
      copy: "Arcana AI interprets the cards together — in context with each other and your question — not as isolated meanings.",
    },
  ];
  return (
    <section className="spread-seo-content" aria-labelledby="spread-seo-heading">
      <div className="spread-seo-hero">
        <div className="spread-seo-copy">
          <span>ABOUT THIS SPREAD</span>
          <h2 className="serif" id="spread-seo-heading">
            {seo.h}
          </h2>
          <p>{seo.p1}</p>
          <p>{seo.p2}</p>
        </div>
        <figure className="spread-seo-diagram starfield">
          <span>SPREAD STRUCTURE</span>
          <div className="spread-seo-layout" aria-hidden="true">
            {spread.positions.map((position, index) => {
              const card = deck[index % deck.length];
              return (
                <div
                  className="spread-seo-card"
                  key={`${spread.id}-${position.label}-seo`}
                  style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                    transform: `translate(-50%, -50%) rotate(${position.rot ?? 0}deg) scale(${
                      spread.count >= 10 ? 0.48 : spread.count >= 6 ? 0.66 : spread.count >= 5 ? 0.74 : 0.92
                    })`,
                  }}
                >
                  <img alt="" src={cardImage(card.num, card.name)} loading="lazy" />
                </div>
              );
            })}
          </div>
          <figcaption>
            {spread.name} · {spread.count} {spread.count === 1 ? "card" : "cards"} layout
          </figcaption>
        </figure>
      </div>

      <div className="spread-seo-steps">
        <h2 className="serif">How a {spread.name} reading works</h2>
        <div className="spread-seo-step-grid">
          {steps.map((step, index) => (
            <article className="spread-seo-step" key={step.title}>
              <b>{index + 1}</b>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="spread-seo-scenarios">
        <h2 className="serif">When to use this spread</h2>
        <div className="spread-seo-scenario-grid">
          {seo.scenarios.map((scenario) => (
            <article key={scenario.t}>
              <h3>{scenario.t}</h3>
              <p>{scenario.d}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="spread-seo-faq">
        <h2 className="serif">{spread.name} questions, answered</h2>
        <div className="spread-seo-faq-list">
          {seo.faq.map((item) => (
            <details key={item.q}>
              <summary>
                <span>{item.q}</span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function SpreadBreadcrumb({
  spread,
  onGoHome,
}: {
  spread: Spread;
  onGoHome: () => void;
}) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <button onClick={onGoHome}>Home</button>
      <span aria-hidden="true">›</span>
      <button onClick={onGoHome}>Spreads</button>
      <span aria-hidden="true">›</span>
      <strong>{spread.name}</strong>
    </nav>
  );
}

function SpreadReviewNote() {
  return (
    <aside className="review-note">
      <span className="review-mark" aria-hidden="true">
        <LogoMark />
      </span>
      <div>
        <h2>Reviewed by the Arcana AI tarot team</h2>
        <p>
          Our readings follow the traditional Rider-Waite-Smith structure used by
          practising tarot readers for over a century. Every spread and position
          meaning on this page is reviewed by experienced readers for accuracy. Tarot
          is a tool for reflection and self-insight, not a substitute for professional
          medical, legal, or financial advice. Last updated June 2026.
        </p>
      </div>
    </aside>
  );
}

function SiteFooter({
  onOpenSpread,
  onGoHome,
  onOpenPaywall,
  onRoute,
}: {
  onOpenSpread: (id: string) => void;
  onGoHome: () => void;
  onOpenPaywall: () => void;
  onRoute: (route: Route) => void;
}) {
  const readingLinks = [
    ["daily", "Daily Draw"],
    ["past-present-future", "Past · Present · Future"],
    ["celtic-cross", "Celtic Cross"],
    ["love-connection", "Love & Connection"],
  ];
  const moreLinks = [
    ["career-path", "Career & Path"],
    ["mind-body-spirit", "Mind · Body · Spirit"],
    ["year-ahead", "Year Ahead"],
    ["relationship-mirror", "Relationship Mirror"],
  ];

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <div className="footer-brand">
            <span className="footer-mark">
              <LogoMark />
            </span>
            <span style={{ fontSize: 17, fontWeight: 650 }}>Arcana</span>
            <span className="serif" style={{ color: "#cdbff0", fontSize: 17, fontStyle: "italic" }}>
              AI
            </span>
          </div>
          <p className="footer-copy">
            AI-guided tarot readings drawn from the classic Rider-Waite deck. Ask a
            question, draw your cards, and hear what you already know.
          </p>
          <button className="white-btn" style={{ padding: "10px 18px", fontSize: 13.5 }} onClick={onGoHome}>
            Begin a reading →
          </button>
        </div>
        <div>
          <div className="footer-title">READINGS</div>
          <div className="footer-links">
            {readingLinks.map(([id, label]) => (
              <button key={id} onClick={() => onOpenSpread(id)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="footer-title">MORE SPREADS</div>
          <div className="footer-links">
            {moreLinks.map(([id, label]) => (
              <button key={id} onClick={() => onOpenSpread(id)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="footer-title">ARCANA</div>
          <div className="footer-links">
            <button onClick={onOpenPaywall}>Arcana Pro</button>
            <button onClick={() => onRoute("about")}>About</button>
            <button onClick={() => onRoute("privacy")}>Privacy</button>
            <button onClick={() => onRoute("contact")}>Contact</button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © 2026 Arcana AI · For reflection and entertainment. You are the author of
          your own choices.
        </span>
        <nav aria-label="Footer">
          <button onClick={() => onRoute("about")}>About</button>
          <button onClick={() => onRoute("privacy")}>Privacy</button>
          <button onClick={() => onRoute("contact")}>Contact</button>
          <span>18+</span>
        </nav>
      </div>
    </footer>
  );
}

function AboutPage({ onBack, onBegin }: { onBack: () => void; onBegin: () => void }) {
  return (
    <main className="content-page">
      <button className="text-btn" onClick={onBack}>
        ‹ Back to spreads
      </button>
      <div style={{ marginTop: 24 }}>
        <span className="content-kicker">ABOUT</span>
        <h1 className="serif">A quieter way to ask the cards</h1>
        <p>
          Arcana AI began with a simple idea: a tarot reading should feel like a
          real conversation, not a fortune-cookie generator. We pair the
          time-honored symbolism of the Rider-Waite-Smith deck with an AI reader
          that interprets the exact cards you draw in the context of your question.
        </p>
        <p>
          Every spread follows a traditional structure, from a single daily card to
          the full ten-card Celtic Cross. The reader explains each card by position
          before weaving the whole spread into one clear reflection.
        </p>
        <h2 className="serif">What we believe</h2>
        <p>
          Tarot is not about predicting a fixed future. It is a mirror that helps
          you see your situation more honestly. Arcana AI is built to prompt
          reflection, never to make decisions for you.
        </p>
        <p>
          We keep the experience calm, ad-free, and account-protected, so your
          saved readings and subscription access stay connected to you.
        </p>
        <button className="primary-btn" style={{ marginTop: 14, borderRadius: 14 }} onClick={onBegin}>
          Begin a reading →
        </button>
      </div>
    </main>
  );
}

function PrivacyPage({ onBack }: { onBack: () => void }) {
  const sections = [
    {
      title: "Account and login",
      copy: "Arcana AI supports Google sign-in and email one-time codes. We store your email, optional Google profile details, a hashed session token, and basic timestamps so you can safely return to your journal.",
    },
    {
      title: "Your questions and readings",
      copy: "Saved readings are linked to your account so your journal can persist across sessions. Keep questions personal, but avoid entering sensitive legal, medical, or financial details.",
    },
    {
      title: "Payments",
      copy: "Stripe processes payment details. Arcana AI stores only the Stripe subscription identifier, plan, status, and renewal timing needed to unlock Pro access.",
    },
    {
      title: "Cookies",
      copy: "We use a secure session cookie with HttpOnly and SameSite=Lax settings. It keeps you signed in without exposing the session token to browser JavaScript.",
    },
    {
      title: "Questions about your data",
      copy: "Reach us at privacy@arcana.ai for account, billing, or data questions, including requests to export or delete your saved readings.",
    },
  ];

  return (
    <main className="content-page">
      <button className="text-btn" onClick={onBack}>
        ‹ Back to spreads
      </button>
      <div style={{ marginTop: 24 }}>
        <span className="content-kicker">PRIVACY</span>
        <h1 className="serif" style={{ marginBottom: 8 }}>
          Your readings stay yours
        </h1>
        <p style={{ color: "var(--soft)", fontSize: 14 }}>Last updated June 2026</p>
        <p>
          Arcana AI is designed to keep the product useful without collecting more
          than the app needs. This page is a product-facing draft and should be
          reviewed before launch.
        </p>
        <div className="content-sections">
          {sections.map((section) => (
            <section className="content-section" key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.copy}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

function ContactPage({ onBack }: { onBack: () => void }) {
  return (
    <main className="content-page">
      <button className="text-btn" onClick={onBack}>
        ‹ Back to spreads
      </button>
      <div style={{ marginTop: 24 }}>
        <span className="content-kicker">CONTACT</span>
        <h1 className="serif">We&apos;d love to hear from you</h1>
        <p>
          Questions, feedback, or a spread you would love to see? Reach out. A real
          person should read every message once this goes live.
        </p>
        <div className="contact-grid">
          <article className="contact-card">
            <h2 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 650 }}>
              General & support
            </h2>
            <p style={{ color: "var(--muted)" }}>
              hello<span>@</span>arcana.ai
            </p>
          </article>
          <article className="contact-card">
            <h2 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 650 }}>
              Billing & privacy
            </h2>
            <p style={{ color: "var(--muted)" }}>
              privacy<span>@</span>arcana.ai
            </p>
          </article>
        </div>
        <div className="contact-note">
          <h2 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 650 }}>
            Response time
          </h2>
          <p>
            We typically reply within two business days. For account or payment
            issues, include the email you used at checkout so support can find you
            faster.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function TarotApp({
  initialRoute = "home",
  initialSpreadId = spreads[0].id,
}: TarotAppProps = {}) {
  const [route, setRoute] = useState<Route>(initialRoute);
  const [spreadId, setSpreadId] = useState(
    spreads.some((item) => item.id === initialSpreadId) ? initialSpreadId : spreads[0].id
  );
  const [question, setQuestion] = useState("");
  const [cards, setCards] = useState<DrawnCard[]>([]);
  const [drawPhase, setDrawPhase] = useState<DrawPhase>("idle");
  const [user, setUser] = useState<User | null>(null);
  const [freeLimit, setFreeLimit] = useState(2);
  const [authOpen, setAuthOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [devCode, setDevCode] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan>("year");
  const [pendingDraw, setPendingDraw] = useState(false);
  const [stripeConfig, setStripeConfig] = useState<StripeConfig | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [history, setHistory] = useState<SavedReading[]>([]);
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [aiSynthesis, setAiSynthesis] = useState("");
  const [openFaq, setOpenFaq] = useState(-1);
  const beginDrawRef = useRef<() => Promise<void>>(async () => undefined);

  const spread = useMemo(
    () => spreads.find((item) => item.id === spreadId) ?? spreads[0],
    [spreadId]
  );

  function pushRoutePath(nextRoute: Route, nextSpread = spread) {
    const nextPath = routePath(nextRoute, nextSpread);
    if (window.location.pathname !== nextPath) {
      window.history.pushState(null, "", nextPath);
    }
  }

  useEffect(() => {
    const onPopState = () => {
      const next = routeStateFromPath(window.location.pathname);
      if (next.spreadId) setSpreadId(next.spreadId);
      setRoute(next.route);
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const synthesis = useMemo(() => getSynthesis(cards, question, spread), [cards, question, spread]);
  const questionPrompts = useMemo(
    () => spreadPrompts[spread.id] ?? defaultPrompts,
    [spread.id]
  );

  async function refreshMe() {
    const response = await fetch("/api/me");
    const data = (await response.json()) as { user: User | null; freeLimit: number };
    setUser(data.user);
    setFreeLimit(data.freeLimit);
  }

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const loginStatus = params.get("login");
    if (!loginStatus) return;

    window.setTimeout(() => {
      if (loginStatus === "google-ok") {
        flash("Signed in with Google.");
      } else if (loginStatus === "google-config") {
        setAuthOpen(true);
        setAuthMessage("Google sign-in is not configured yet.");
      } else if (loginStatus === "google-error") {
        setAuthOpen(true);
        setAuthMessage("Google sign-in could not be completed. Please try again.");
      }
    }, 0);

    params.delete("login");
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`
    );
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.all([
      fetch("/api/me").then((res) => res.json()) as Promise<{
        user: User | null;
        freeLimit: number;
      }>,
      fetch("/api/stripe/config").then((res) => res.json()) as Promise<StripeConfig>,
    ]).then(([me, config]) => {
      if (!active) return;
      setUser(me.user);
      setFreeLimit(me.freeLimit);
      setStripeConfig(config);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const rawResume = window.sessionStorage.getItem(googleResumeKey);
    if (!rawResume) return;
    window.sessionStorage.removeItem(googleResumeKey);

    try {
      const resume = JSON.parse(rawResume) as {
        pendingDraw?: boolean;
        spreadId?: string;
        question?: string;
      };
      window.setTimeout(() => {
        if (resume.spreadId) setSpreadId(resume.spreadId);
        if (typeof resume.question === "string") setQuestion(resume.question);
        if (resume.pendingDraw) {
          setPendingDraw(false);
          window.setTimeout(() => void beginDrawRef.current(), 350);
        }
      }, 0);
    } catch {
      window.sessionStorage.removeItem(googleResumeKey);
    }
  }, [user]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = documentTitleForRoute(route, spread);
    }
  }, [route, spread]);

  useEffect(() => {
    if (route !== "history" || !user) return;
    let active = true;
    void fetch("/api/readings")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { readings: SavedReading[] } | null) => {
        if (active && data) setHistory(data.readings);
      });

    return () => {
      active = false;
    };
  }, [route, user]);

  // Returning from Stripe Checkout: confirm the session so membership flips to
  // Pro immediately (the webhook is the backstop), then resume a pending draw.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    if (!checkout) return;

    const clearParams = () => {
      params.delete("checkout");
      params.delete("session_id");
      const query = params.toString();
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`
      );
    };

    if (checkout === "cancel") {
      clearParams();
      window.sessionStorage.removeItem(checkoutResumeKey);
      window.setTimeout(() => flash("Checkout canceled — you were not charged."), 0);
      return;
    }

    if (checkout !== "success") return;
    const sessionId = params.get("session_id") ?? "";
    clearParams();

    const resumeDraw = () => {
      const raw = window.sessionStorage.getItem(checkoutResumeKey);
      window.sessionStorage.removeItem(checkoutResumeKey);
      if (!raw) return;
      try {
        const resume = JSON.parse(raw) as {
          spreadId?: string;
          question?: string;
          pendingDraw?: boolean;
        };
        if (resume.spreadId) setSpreadId(resume.spreadId);
        if (typeof resume.question === "string") setQuestion(resume.question);
        if (resume.pendingDraw) window.setTimeout(() => void beginDrawRef.current(), 400);
      } catch {
        // ignore malformed resume payload
      }
    };

    void (async () => {
      flash("Confirming your subscription…");
      try {
        const response = await fetch("/api/stripe/confirm-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = (await response.json()) as {
          ok?: boolean;
          pending?: boolean;
          error?: string;
        };
        await refreshMe();
        setShowPaywall(false);
        setPendingDraw(false);
        if (!response.ok) {
          flash(data.error || "We couldn't confirm this checkout. If you were charged, contact support.");
          return;
        }
        if (data.ok) {
          flash("You're Pro — unlimited readings unlocked.");
          resumeDraw();
        } else {
          flash("Payment received — your membership will activate shortly.");
        }
      } catch {
        flash("Payment received — your membership will activate shortly.");
      }
    })();
  }, []);

  async function startCheckout(plan: Plan) {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    if (!stripeConfig?.enabled || checkoutBusy) return;

    setCheckoutBusy(true);
    setCheckoutMessage("Redirecting to secure checkout…");
    if (pendingDraw) {
      window.sessionStorage.setItem(
        checkoutResumeKey,
        JSON.stringify({ pendingDraw: true, spreadId, question })
      );
    }

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        setCheckoutBusy(false);
        setCheckoutMessage(data.error || "Could not start checkout. Please try again.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setCheckoutBusy(false);
      setCheckoutMessage("Could not start checkout. Please try again.");
    }
  }

  function openSpread(id: string) {
    const nextSpread = spreads.find((item) => item.id === id) ?? spread;
    setSpreadId(nextSpread.id);
    setRoute("detail");
    pushRoutePath("detail", nextSpread);
    window.scrollTo({ top: 0 });
  }

  function goHome() {
    setRoute("home");
    pushRoutePath("home");
    window.scrollTo({ top: 0 });
  }

  function beginAtSpreads() {
    setRoute("home");
    pushRoutePath("home");
    window.setTimeout(() => {
      document.getElementById("spreads")?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  }

  function goRoute(nextRoute: Route) {
    setRoute(nextRoute);
    pushRoutePath(nextRoute);
    window.scrollTo({ top: 0 });
  }

  async function beginDraw() {
    if (!user) {
      setAuthOpen(true);
      setPendingDraw(true);
      return;
    }

    const response = await fetch("/api/readings/begin", { method: "POST" });
    if (response.status === 402) {
      setShowPaywall(true);
      setPendingDraw(true);
      return;
    }
    if (!response.ok) {
      flash("Could not start the reading. Please sign in again.");
      return;
    }

    setAiSynthesis("");
    setRoute("draw");
    setDrawPhase("shuffling");
    setCards([]);
    window.scrollTo({ top: 0 });
    window.setTimeout(() => {
      setCards(drawCards(spread));
      setDrawPhase("dealt");
    }, 1800);
  }

  async function revealReading() {
    if (revealing) return;
    if (!cards.length) {
      setRoute("result");
      return;
    }
    setRevealing(true);
    try {
      const response = await fetch("/api/readings/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spreadId: spread.id,
          question,
          cards: cards.map((card) => ({ num: card.num, reversed: card.reversed })),
        }),
      });

      if (response.status === 401) {
        setAuthOpen(true);
        return;
      }
      if (response.status === 402) {
        setShowPaywall(true);
        return;
      }

      const data = (await response.json().catch(() => null)) as {
        interpretation?: ReadingInterpretation;
      } | null;
      if (!response.ok || !data?.interpretation) {
        flash("Could not generate the reading. Please try again.");
        return;
      }

      const byNum = new Map<string, string>();
      data.interpretation.cards.forEach((item, index) => {
        byNum.set(`${item.num}:${index}`, item.text);
      });
      setCards((current) =>
        current.map((card, index) => ({
          ...card,
          flipped: true,
          interpretation: byNum.get(`${card.num}:${index}`) ?? card.interpretation,
        }))
      );
      setAiSynthesis(data.interpretation.synthesis);
      await refreshMe();
      setRoute("result");
      window.scrollTo({ top: 0 });
    } catch {
      flash("Could not generate the reading. Please try again.");
    } finally {
      setRevealing(false);
    }
  }

  function startGoogleLogin() {
    setAuthMessage("Opening Google sign-in...");
    if (pendingDraw || route === "question") {
      window.sessionStorage.setItem(
        googleResumeKey,
        JSON.stringify({
          pendingDraw,
          spreadId,
          question,
        })
      );
    }
    window.location.href = "/api/auth/google/start?redirect=/";
  }

  useEffect(() => {
    beginDrawRef.current = beginDraw;
  });

  async function requestCode() {
    setAuthMessage("");
    setDevCode("");
    const response = await fetch("/api/auth/request-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: authEmail }),
    });
    const data = (await response.json()) as { error?: string; devCode?: string };
    if (!response.ok) {
      setAuthMessage(data.error ?? "Could not send code");
      return;
    }
    setCodeSent(true);
    setDevCode(data.devCode ?? "");
    setAuthMessage("Enter the 6-digit code from your email.");
  }

  async function verifyCode() {
    setAuthMessage("");
    const response = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: authEmail, code: authCode }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setAuthMessage(data.error ?? "Could not verify code");
      return;
    }
    await refreshMe();
    setAuthOpen(false);
    setCodeSent(false);
    setAuthCode("");
    flash("Signed in securely.");
    if (pendingDraw) {
      setPendingDraw(false);
      window.setTimeout(() => void beginDraw(), 200);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setHistory([]);
    setProfileOpen(false);
    flash("Signed out.");
  }

  async function saveReading() {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setSaving(true);
    const response = await fetch("/api/readings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        spreadId: spread.id,
        spreadName: spread.name,
        question,
        cards,
        synthesis: aiSynthesis || synthesis,
      }),
    });
    setSaving(false);
    if (!response.ok) {
      flash("Could not save this reading.");
      return;
    }
    flash("Reading saved to your journal.");
  }

  function openSaved(reading: SavedReading) {
    setSpreadId(reading.spreadId);
    setQuestion(reading.question);
    setCards(reading.payload.cards.map((card) => ({ ...card, flipped: true })));
    setAiSynthesis(reading.payload.synthesis || "");
    setRoute("result");
    window.scrollTo({ top: 0 });
  }

  const planName = selectedPlan === "year" ? "Quarterly Pass" : "Monthly Pass";
  const planPrice = selectedPlan === "year" ? "$19.99" : "$9.99";
  const activeDays = user ? membershipDaysLeft(user) : null;

  return (
    <div className="app-shell">
      <nav className="top-nav">
        <button className="brand" onClick={goHome} aria-label="Arcana AI home">
          <span className="brand-mark">
            <LogoMark />
          </span>
          <span>Arcana</span>
          <span className="brand-ai serif">AI</span>
        </button>
        <div className="nav-links">
          <button
            className={`nav-pill ${route !== "history" ? "active" : ""}`}
            onClick={goHome}
          >
            Spreads
          </button>
          <button
            className={`nav-pill ${route === "history" ? "active" : ""}`}
            onClick={() => goRoute("history")}
          >
            Journals
          </button>
        </div>
        <div className="account-actions">
          {user?.subscribed ? (
            <div className="pro-pill">
              <span style={{ color: "var(--gold-bright)" }}>⚡</span>
              <span style={{ color: "var(--gold-bright)" }}>PRO</span>
              <span style={{ color: "rgba(255,255,255,.62)", fontWeight: 600 }}>
                {activeDays !== null ? `${activeDays}d left` : "Active"}
              </span>
            </div>
          ) : (
            <button className="purple-pill" onClick={() => setShowPaywall(true)}>
              <span style={{ color: "var(--gold-bright)" }}>⚡</span>
              <span>Go Unlimited</span>
            </button>
          )}
          {!user && (
            <button
              className="nav-signin"
              aria-label="Sign in with Google"
              onClick={() => setAuthOpen(true)}
            >
              <GoogleLogo size={16} />
              <span>Sign in</span>
            </button>
          )}
          {user && (
            <div className="profile-wrap">
              <button
                className="avatar"
                onClick={() => setProfileOpen((open) => !open)}
                aria-label="Account"
              >
                {user.avatarUrl ? (
                  <img alt="" src={user.avatarUrl} />
                ) : (
                  accountInitial(user)
                )}
              </button>
              {profileOpen && (
                <div className="profile-menu">
                  <div className="profile-head">
                    <div className="avatar large">
                      {user.avatarUrl ? (
                        <img alt="" src={user.avatarUrl} />
                      ) : (
                        accountInitial(user)
                      )}
                    </div>
                    <div>
                      <strong>{accountName(user)}</strong>
                      <span>{user.email}</span>
                    </div>
                  </div>
                  <div className="profile-status">
                    <span className={`status-pill ${user.membership.tier}`}>
                      {user.membership.tier === "free" ? "FREE" : "PRO"}
                    </span>
                    <div>
                      <strong>{user.membership.label}</strong>
                      <span>{membershipCaption(user, freeLimit)}</span>
                    </div>
                    {!user.subscribed && (
                      <button
                        className="mini-upgrade"
                        onClick={() => {
                          setProfileOpen(false);
                          setShowPaywall(true);
                        }}
                      >
                        Upgrade
                      </button>
                    )}
                  </div>
                  <button
                    className="profile-action"
                    onClick={() => {
                      setProfileOpen(false);
                      goRoute("history");
                    }}
                  >
                    Your readings
                  </button>
                  <button className="profile-action" onClick={() => void logout()}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {route === "home" && (
        <main className="page">
          <section className="hero starfield">
            <div className="hero-content">
              <div className="eyebrow">
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "var(--gold-bright)",
                    boxShadow: "0 0 8px var(--gold-bright)",
                  }}
                />
                PRO TAROT READING
              </div>
              <h1 className="serif">
                Ask the cards<span style={{ color: "#cdbff0" }}>.</span>
                <br />
                Hear what you
                <br className="hero-break-desktop" />
                {" "}
                <span style={{ color: "#e0d8ff", fontStyle: "italic" }}>already know.</span>
              </h1>
              <p>
                Choose a spread, hold your question, and let an AI reader interpret the
                Rider-Waite deck just for you.
              </p>
              <button
                className="white-btn"
                onClick={beginAtSpreads}
              >
                Begin a reading →
              </button>
            </div>
            <div className="hero-fan" aria-hidden="true">
              <div className="hero-aura" />
              <div className="fan-float">
                {[
                  ["06", "The Lovers", -28, 0],
                  ["18", "The Moon", -14, 1],
                  ["19", "The Sun", 0, 3],
                  ["17", "The Star", 14, 1],
                  ["10", "Wheel of Fortune", 28, 0],
                ].map(([num, name, rot, z]) => (
                  <div
                    className="fan-card tarot-card"
                    key={name}
                    style={{
                      transform: `translateX(-50%) rotate(${rot}deg)`,
                      zIndex: Number(z),
                      width: name === "The Sun" ? 96 : 92,
                      height: name === "The Sun" ? 154 : 148,
                      bottom: name === "The Sun" ? 22 : 18,
                    }}
                  >
                    <img alt={String(name)} src={cardImage(String(num), String(name))} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="section-head" id="spreads">
            <h2>Choose your spread</h2>
            <span>
              {user ? membershipCaption(user, freeLimit) : "Choose a spread to begin your reading"}
            </span>
          </div>
          <div className="spread-grid">
            {spreads.map((item) => (
              <button className="spread-card" key={item.id} onClick={() => openSpread(item.id)}>
                <div className="spread-preview starfield">
                  <span className="preview-label">
                    {item.count} {item.count === 1 ? "card" : "cards"}
                  </span>
                  {item.tag && <span className="preview-badge">{item.tag}</span>}
                  {item.positions.map((position, index) => (
                    <span
                      className="mini-card"
                      key={`${item.id}-${position.label}`}
                      style={{
                        left: `${position.x}%`,
                        top: `${position.y}%`,
                        transform: `translate(-50%, -50%) rotate(${position.rot ?? 0}deg) scale(${
                          item.count >= 10 ? 0.6 : item.count >= 6 ? 0.82 : 1
                        })`,
                        animation: `tarot-bob ${3.4 + (index % 3) * 0.5}s ease-in-out infinite`,
                        animationDelay: `${index * 0.25}s`,
                      }}
                    />
                  ))}
                </div>
                <div className="spread-body">
                  <h3>{item.name}</h3>
                  <p>{item.blurb}</p>
                  <div className="spread-foot">
                    <span>{user?.subscribed ? "UNLIMITED" : ""}</span>
                    <span>Read ›</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <SeoSection openFaq={openFaq} onToggleFaq={(index) => setOpenFaq((current) => (current === index ? -1 : index))} />
          <SiteFooter
            onOpenSpread={openSpread}
            onGoHome={beginAtSpreads}
            onOpenPaywall={() => setShowPaywall(true)}
            onRoute={goRoute}
          />
        </main>
      )}

      {route === "detail" && (
        <main className="page">
          <SpreadBreadcrumb spread={spread} onGoHome={goHome} />
          <div className="detail-grid" style={{ marginTop: 22 }}>
            <section className="stage layout-panel starfield">
              <span className="preview-label">SPREAD LAYOUT</span>
              <div className="layout-area">
                {spread.positions.map((position, index) => (
                  <div
                    className="layout-card"
                    key={position.label}
                    style={{
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                      transform: `translate(-50%, -50%) rotate(${position.rot ?? 0}deg) scale(${
                        spread.count >= 10 ? 0.56 : spread.count >= 6 ? 0.78 : spread.count >= 5 ? 0.88 : 1
                      })`,
                    }}
                  >
                    <span className="serif">{index + 1}</span>
                    <em>{position.label}</em>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h1 className="serif detail-title">{spread.name}</h1>
              <div className="detail-meta">
                <span>
                  {spread.count} {spread.count === 1 ? "card" : "cards"}
                </span>
                {user?.subscribed && <b>UNLIMITED</b>}
              </div>
              <p style={{ fontSize: 16, lineHeight: 1.6 }}>{spread.blurb}</p>
              <p style={{ color: "var(--muted)", lineHeight: 1.5 }}>
                <strong style={{ color: "var(--ink)" }}>Good for:</strong> {spread.good}
              </p>
              <div className="position-list">
                {spread.positions.map((position, index) => (
                  <div className="position-row" key={position.label}>
                    <b>{index + 1}</b>
                    <div>
                      <strong>{position.label}</strong>
                      <p style={{ margin: "3px 0 0", color: "var(--soft)", fontSize: 13 }}>
                        {position.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="primary-btn"
                style={{ width: "100%", borderRadius: 16 }}
                onClick={() => setRoute("question")}
              >
                Ask your question
              </button>
              <p className="message">
                {user?.subscribed
                  ? `Unlimited readings with your ${user.membership.label}.`
                  : "Hold your question in mind as you draw."}
              </p>
            </section>
          </div>
          <SpreadSeoContent spread={spread} />
          <SpreadReviewNote />
          <SiteFooter
            onOpenSpread={openSpread}
            onGoHome={beginAtSpreads}
            onOpenPaywall={() => setShowPaywall(true)}
            onRoute={goRoute}
          />
        </main>
      )}

      {route === "question" && (
        <main className="page">
          <section className="reading-panel">
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "#1f1736",
                color: "var(--gold)",
                display: "grid",
                placeItems: "center",
                marginBottom: 18,
                fontSize: 28,
              }}
            >
              ◐
            </div>
            <h1 className="serif" style={{ margin: 0, fontSize: 42, fontWeight: 500 }}>
              What&apos;s on your mind?
            </h1>
            <p className="message" style={{ marginBottom: 18 }}>
              Your account keeps readings private, tracks free uses, and protects subscription
              access on the server.
            </p>
            <textarea
              className="textarea"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask about love, work, timing, or the pattern you keep circling..."
            />
            <div className="prompt-row" style={{ marginTop: 14 }}>
              {questionPrompts.map((prompt) => (
                <button className="prompt-chip" key={prompt} onClick={() => setQuestion(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
              <button className="primary-btn" onClick={() => void beginDraw()}>
                Shuffle & draw
              </button>
              <button className="secondary-btn" onClick={() => setRoute("detail")}>
                Cancel
              </button>
            </div>
          </section>
        </main>
      )}

      {route === "draw" && (
        drawPhase === "shuffling" ? (
          <main className="shuffle-page starfield">
            <ShuffleAnimation spread={spread} question={question} />
          </main>
        ) : (
          <main className="page">
            <section className="stage starfield" style={{ padding: 28 }}>
              <h1 className="serif" style={{ margin: 0, fontSize: 38, fontWeight: 500 }}>
                {cards.every((card) => card.flipped)
                  ? "All cards revealed"
                  : "Tap each card to reveal"}
              </h1>
              <div className="draw-board">
                {cards.map((card, index) => (
                  <div
                    className="draw-slot"
                    key={card.key}
                    style={{
                      left: `${card.x}%`,
                      top: `${card.y}%`,
                      transform: `translate(-50%, -50%) rotate(${card.rot ?? 0}deg) scale(${
                        spread.scale ?? 1
                      })`,
                    }}
                  >
                    <button
                      className={`draw-card ${card.flipped ? "flipped" : ""}`}
                      onClick={() =>
                        setCards((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, flipped: true } : item
                          )
                        )
                      }
                    >
                      <span className="draw-inner">
                        <span className="draw-face">
                          <CardBack />
                        </span>
                        <span className="draw-face draw-front">
                          <TarotImage card={card} reversed={card.reversed} />
                        </span>
                      </span>
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
                {!cards.every((card) => card.flipped) && (
                  <button
                    className="secondary-btn"
                    onClick={() =>
                      setCards((current) => current.map((card) => ({ ...card, flipped: true })))
                    }
                  >
                    Reveal all
                  </button>
                )}
                {cards.every((card) => card.flipped) && (
                  <button
                    className="white-btn"
                    disabled={revealing}
                    onClick={() => void revealReading()}
                  >
                    {revealing ? "Reading the cards..." : "Reveal my reading"}
                  </button>
                )}
              </div>
            </section>
          </main>
        )
      )}

      {route === "result" && (
        <main className="page result-page">
          <section className="result-heading">
            <button className="result-back" onClick={goHome}>
              ‹ <span>Spreads</span>
            </button>
            <p>{spread.name}</p>
            <h1 className="serif">
              {question.trim() ? `“${question.trim()}”` : "General reading"}
            </h1>
          </section>

          <section className="result-stage stage starfield" aria-label={`${spread.name} result cards`}>
            <div className="result-stage-board">
              {cards.map((card) => (
                <div
                  className="result-stage-slot"
                  key={card.key}
                  style={{
                    left: `${card.x}%`,
                    top: `${card.y}%`,
                    transform: `translate(-50%, -50%) rotate(${card.rot ?? 0}deg) scale(${
                      spread.count >= 10 ? 0.54 : spread.count >= 6 ? 0.72 : spread.count >= 5 ? 0.82 : 1
                    })`,
                  }}
                >
                  <div className="result-stage-card">
                    <TarotImage card={card} reversed={card.reversed} />
                  </div>
                  <span>{card.posLabel}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card-reading-section">
            <span className="result-kicker">CARD BY CARD</span>
            <div className="result-list">
              {cards.map((card) => {
                const keywords = card.reversed ? card.rev : card.up;
                return (
                  <article className="result-card" key={card.key}>
                    <div className="result-card-image">
                      <TarotImage card={card} reversed={card.reversed} />
                    </div>
                    <div className="result-card-copy">
                      <div className="result-card-title">
                        <span className="tag">{card.posLabel}</span>
                        <h2>{card.name}</h2>
                        <span className={`orientation-chip ${card.reversed ? "reversed" : "upright"}`}>
                          {card.reversed ? "Reversed" : "Upright"}
                        </span>
                      </div>
                      <ReadingParagraphs
                        className="reading-copy"
                        text={
                          card.interpretation ??
                          `${keywords[0]}, ${keywords[1]}. In this position, it points toward ${keywords[2]}.`
                        }
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="result-reading-panel">
            <div className="result-reading-label">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3l2.45 6.55L21 12l-6.55 2.45L12 21l-2.45-6.55L3 12l6.55-2.45L12 3z" />
              </svg>
              <span>THE READING</span>
            </div>
            <ReadingParagraphs className="reading-synthesis serif" text={aiSynthesis || synthesis} />
          </section>

          <div className="result-actions">
            <button className="primary-btn" disabled={saving} onClick={() => void saveReading()}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3.8L6 20V5a1 1 0 0 1 1-1z" />
              </svg>
              {saving ? "Saving..." : "Save to journal"}
            </button>
            <button className="secondary-btn" onClick={goHome}>
              New reading
            </button>
          </div>
        </main>
      )}

      {route === "history" && (
        <main className="page">
          <div className="section-head">
            <h2>Your readings</h2>
            <span>
              {user
                ? `${user.membership.label} · ${accountName(user)}`
                : "Sign in to view your journal"}
            </span>
          </div>
          {user && (
            <section className="account-summary">
              <div>
                <span className={`status-pill ${user.membership.tier}`}>
                  {user.membership.tier === "free" ? "FREE" : "PRO"}
                </span>
                <h3>{user.membership.label}</h3>
                <p>{membershipCaption(user, freeLimit)}</p>
              </div>
              {!user.subscribed && (
                <button className="primary-btn" onClick={() => setShowPaywall(true)}>
                  Upgrade
                </button>
              )}
            </section>
          )}
          {!user && (
            <section className="auth-panel">
              <h2 className="serif" style={{ fontSize: 34, margin: 0 }}>
                Your journal is private
              </h2>
              <p className="message">Sign in to sync readings and subscription access.</p>
              <button className="primary-btn" onClick={() => setAuthOpen(true)}>
                Sign in
              </button>
            </section>
          )}
          {user && history.length === 0 && (
            <section className="auth-panel">
              <h2 className="serif" style={{ fontSize: 34, margin: 0 }}>
                No saved readings yet
              </h2>
              <p className="message">Browse spreads and save a result to see it here.</p>
              <button className="primary-btn" onClick={goHome}>
                Browse spreads
              </button>
            </section>
          )}
          {user && history.length > 0 && (
            <div style={{ display: "grid", gap: 14 }}>
              {history.map((reading) => (
                <button
                  className="spread-card"
                  key={reading.id}
                  onClick={() => openSaved(reading)}
                  style={{ padding: 18 }}
                >
                  <h3 style={{ margin: "0 0 4px" }}>{reading.spreadName}</h3>
                  <p style={{ margin: 0, color: "var(--muted)" }}>
                    {new Date(reading.createdAt).toLocaleDateString()} ·{" "}
                    {reading.payload.cards.map((card) => card.name).join(" · ")}
                  </p>
                </button>
              ))}
            </div>
          )}
        </main>
      )}

      {route === "about" && <AboutPage onBack={goHome} onBegin={beginAtSpreads} />}

      {route === "privacy" && <PrivacyPage onBack={goHome} />}

      {route === "contact" && <ContactPage onBack={goHome} />}

      <nav className="mobile-tabbar" aria-label="Mobile navigation">
        <button className={route !== "history" ? "active" : ""} onClick={goHome}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="4" y="4" width="6" height="6" rx="1.2" />
            <rect x="14" y="4" width="6" height="6" rx="1.2" />
            <rect x="4" y="14" width="6" height="6" rx="1.2" />
            <rect x="14" y="14" width="6" height="6" rx="1.2" />
          </svg>
          <span>Spreads</span>
        </button>
        <button className={route === "history" ? "active" : ""} onClick={() => goRoute("history")}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3.6L6 20V5a1 1 0 0 1 1-1z" />
          </svg>
          <span>Journal</span>
        </button>
        <button
          className={profileOpen || authOpen ? "active" : ""}
          onClick={() => {
            if (user) {
              setProfileOpen((open) => !open);
            } else {
              setAuthOpen(true);
            }
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="3.4" />
            <path d="M5.5 20a6.8 6.8 0 0 1 13 0" />
          </svg>
          <span>Account</span>
        </button>
      </nav>

      {authOpen && (
        <div className="modal-backdrop">
          <section className="google-login-card" aria-modal="true" role="dialog">
            <button
              className="google-close"
              aria-label="Close"
              onClick={() => {
                setAuthOpen(false);
                setPendingDraw(false);
              }}
            >
              ✕
            </button>
            <div className="google-login-main">
              <GoogleLogo size={40} />
              <h2>Sign in</h2>
              <p>
                to continue to <strong>Arcana AI</strong>
              </p>
              <button className="google-login-btn" onClick={startGoogleLogin}>
                <GoogleLogo size={18} />
                <span>Continue with Google</span>
              </button>
              <p className="google-consent">
                Google will share your name, email address, and profile picture
                with Arcana AI.
              </p>
              <div className="auth-divider">
                <span>or use email code</span>
              </div>
              <label style={{ display: "grid", gap: 8, fontSize: 13, fontWeight: 700 }}>
                Email
                <input
                  className="field"
                  value={authEmail}
                  onChange={(event) => setAuthEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </label>
              {codeSent && (
                <label style={{ display: "grid", gap: 8, marginTop: 14, fontSize: 13, fontWeight: 700 }}>
                  Login code
                  <input
                    className="field"
                    value={authCode}
                    onChange={(event) => setAuthCode(event.target.value)}
                    placeholder="000000"
                    inputMode="numeric"
                  />
                </label>
              )}
              {devCode && <p className="message">Dev code: {devCode}</p>}
              {authMessage && (
                <p className={`message ${/could|incorrect|expired|too many|not configured/i.test(authMessage) ? "error" : ""}`}>
                  {authMessage}
                </p>
              )}
              <button
                className="primary-btn"
                style={{ width: "100%", marginTop: 18, borderRadius: 14 }}
                onClick={() => (codeSent ? void verifyCode() : void requestCode())}
              >
                {codeSent ? "Verify code" : "Send login code"}
              </button>
            </div>
          </section>
        </div>
      )}

      {showPaywall && (
        <div className="modal-backdrop">
          <section className="modal">
            <div className="modal-head starfield">
              <button
                className="text-btn"
                style={{ color: "#fff", float: "right" }}
                onClick={() => {
                  setShowPaywall(false);
                  setPendingDraw(false);
                  setCheckoutMessage("");
                  setCheckoutBusy(false);
                }}
              >
                ✕
              </button>
              <div className="eyebrow">ARCANA PRO</div>
              <h2 className="serif" style={{ margin: 0, fontSize: 34, fontWeight: 500 }}>
                Unlimited readings await
              </h2>
              <p style={{ color: "rgba(255,255,255,.72)", marginBottom: 0 }}>
                Unlock every spread and ask the cards as often as you like with a single pass.
              </p>
            </div>
            <div className="modal-body">
              {!user && (
                <>
                  <p className="message" style={{ marginTop: 0 }}>
                    Sign in first so your subscription is linked to the right account.
                  </p>
                  <button className="primary-btn" onClick={() => setAuthOpen(true)}>
                    Sign in
                  </button>
                </>
              )}
              {user && (
                <>
                  <button
                    className={`plan-row ${selectedPlan === "year" ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedPlan("year");
                      setCheckoutMessage("");
                    }}
                  >
                    <span className="plan-radio" aria-hidden="true">
                      <span />
                    </span>
                    <span>
                      <strong>Quarterly Pass</strong>
                      <br />
                      <small>$19.99 · 90 days · unlimited readings · ≈ $6.66 / mo</small>
                    </span>
                    <span className="tag">BEST VALUE</span>
                  </button>
                  <button
                    className={`plan-row ${selectedPlan === "quarter" ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedPlan("quarter");
                      setCheckoutMessage("");
                    }}
                  >
                    <span className="plan-radio" aria-hidden="true">
                      <span />
                    </span>
                    <span>
                      <strong>Monthly Pass</strong>
                      <br />
                      <small>$9.99 · 30 days · unlimited readings · ≈ $9.99 / mo</small>
                    </span>
                  </button>
                  {!stripeConfig?.enabled && (
                    <p className="message error">
                      Stripe is not configured yet. Add the secret key, webhook secret, and both
                      price IDs to the runtime environment.
                    </p>
                  )}
                  <button
                    className="primary-btn"
                    disabled={!stripeConfig?.enabled || checkoutBusy}
                    onClick={() => void startCheckout(selectedPlan)}
                    aria-label={`Subscribe to the ${planName} with Stripe`}
                  >
                    {checkoutBusy ? "Redirecting…" : `Subscribe — ${planPrice}`}
                  </button>
                  {checkoutMessage && <p className="message">{checkoutMessage}</p>}
                  <p className="message">Cancel anytime · renews automatically · secure checkout.</p>
                </>
              )}
            </div>
          </section>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
