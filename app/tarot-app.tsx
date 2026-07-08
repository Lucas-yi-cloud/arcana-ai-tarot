"use client";

/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { cardImage, deck, spreads, type Spread, type TarotCard } from "@/lib/tarot-data";
import { spreadDescription, spreadTitle } from "@/lib/structured-data";
import { siteBaseUrl, siteDescription, siteTitle, spreadSeoMeta } from "@/lib/tarot-seo";

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
type PaywallSource = "nav" | "result" | "draw_limit" | "new_reading" | "followup";
type TrackEvent =
  | "landing_view"
  | "spread_click"
  | "question_submit"
  | "draw_start"
  | "draw_complete"
  | "result_view"
  | "paywall_view"
  | "paywall_cta_click"
  | "plan_select"
  | "login_start"
  | "login_success"
  | "begin_checkout"
  | "checkout_start"
  | "checkout_success"
  | "checkout_cancel"
  | "checkout_error"
  | "purchase";

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

type SaveReadingPayload = {
  spreadId: string;
  spreadName: string;
  question: string;
  cards: DrawnCard[];
  synthesis: string;
};

type StripeConfig = {
  enabled: boolean;
  publishableKey: string;
  prices: Record<Plan, string>;
};

type CheckoutIntent = {
  plan: Plan;
  paywallSrc: PaywallSource;
  productId: string;
  value: number;
  currency: "USD";
};

type ConfirmCheckoutResponse = {
  ok?: boolean;
  pending?: boolean;
  error?: string;
  plan?: Plan;
  priceId?: string;
  price?: number;
  currency?: "USD";
  subscriptionId?: string;
  status?: string;
};

type ReadingProfile = {
  readerName: string;
  birthDate: string;
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

const reflectivePrompts = [
  "What should I understand before I choose?",
  "What is the lesson in this situation?",
  "What would help me move with more clarity?",
  "What am I ready to release?",
  "What should I focus on next?",
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
const checkoutIntentKey = "arcana.checkoutIntent";
const pendingSubscribeKey = "arcana.pendingSubscribe";
const guestFreeUsedKey = "aitarot.freeUsed";
const pendingSaveKey = "arcana.pendingSave";
const pendingSavePayloadKey = "arcana.pendingSavePayload";
const shuffleDurationMs = 5000;
const dobMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dobMonthIndexes = dobMonths.map((_, index) => index);
const dobStartYear = 1940;
const dobYears = Array.from(
  { length: new Date().getFullYear() - dobStartYear + 1 },
  (_, index) => dobStartYear + index
);

const planAnalytics: Record<
  Plan,
  { itemId: string; itemName: string; periodDays: number; value: number }
> = {
  quarter: {
    itemId: "arcana_monthly_pass",
    itemName: "Monthly Pass",
    periodDays: 30,
    value: 9.99,
  },
  year: {
    itemId: "arcana_quarterly_pass",
    itemName: "Quarterly Pass",
    periodDays: 90,
    value: 19.99,
  },
};

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

function absoluteRouteUrl(route: Route, spread: Spread) {
  const path = routePath(route, spread);
  return path === "/" ? siteBaseUrl : `${siteBaseUrl}${path}`;
}

function handleClientLink(event: ReactMouseEvent<HTMLAnchorElement>, action: () => void) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  event.preventDefault();
  action();
}

function documentTitleForRoute(route: Route, spread: Spread) {
  if (route === "detail" || route === "question" || route === "draw" || route === "result") {
    return spreadTitle(spread);
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

function documentDescriptionForRoute(route: Route, spread: Spread) {
  if (route === "detail" || route === "question" || route === "draw" || route === "result") {
    return spreadDescription(spread);
  }
  if (route === "about") {
    return "Learn how Arcana AI pairs Rider-Waite tarot symbolism with AI-guided interpretation for private, reflective readings.";
  }
  if (route === "privacy") {
    return "Read how Arcana AI handles accounts, saved tarot readings, payments, cookies, and privacy requests.";
  }
  if (route === "contact") {
    return "Contact Arcana AI for support, privacy requests, product feedback, or partnership questions.";
  }
  if (route === "history") {
    return "Sign in to view your private Arcana AI tarot journal and saved readings.";
  }
  return siteDescription;
}

function robotsForRoute(route: Route) {
  return route === "history" ? "noindex, follow" : "index, follow";
}

function ensureSingleHeadElement<T extends HTMLElement>(
  selector: string,
  createElement: () => T
) {
  const existing = Array.from(document.head.querySelectorAll<T>(selector));
  const element = existing[0] ?? createElement();
  existing.slice(1).forEach((node) => node.remove());
  if (!element.parentElement) document.head.appendChild(element);
  return element;
}

function syncDocumentHead(route: Route, spread: Spread) {
  const title = documentTitleForRoute(route, spread);
  const description = documentDescriptionForRoute(route, spread);
  const canonicalUrl = absoluteRouteUrl(route, spread);

  document.title = title;

  const canonical = ensureSingleHeadElement("link[rel='canonical']", () => {
    const link = document.createElement("link");
    link.rel = "canonical";
    return link;
  });
  canonical.href = canonicalUrl;

  const descriptionMeta = ensureSingleHeadElement("meta[name='description']", () => {
    const meta = document.createElement("meta");
    meta.name = "description";
    return meta;
  });
  descriptionMeta.content = description;

  const robotsMeta = ensureSingleHeadElement("meta[name='robots']", () => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    return meta;
  });
  robotsMeta.content = robotsForRoute(route);

  const ogUrl = document.head.querySelector<HTMLMetaElement>("meta[property='og:url']");
  if (ogUrl) ogUrl.content = canonicalUrl;

  const ogTitle = document.head.querySelector<HTMLMetaElement>("meta[property='og:title']");
  if (ogTitle) ogTitle.content = title;

  const ogDescription = document.head.querySelector<HTMLMetaElement>(
    "meta[property='og:description']"
  );
  if (ogDescription) ogDescription.content = description;

  const twitterTitle = document.head.querySelector<HTMLMetaElement>("meta[name='twitter:title']");
  if (twitterTitle) twitterTitle.content = title;

  const twitterDescription = document.head.querySelector<HTMLMetaElement>(
    "meta[name='twitter:description']"
  );
  if (twitterDescription) twitterDescription.content = description;
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

function renderReadingInline(text: string): ReactNode[] {
  const normalized = text
    .replace(/^\*\*(.+?)\*\*$/u, "$1")
    .replace(/\*\*/g, "")
    .trim();
  const takeaway = normalized.match(/^KEY TAKEAWAY:\s*(.+)$/iu);
  if (takeaway) {
    return [
      <strong className="reading-highlight" key="key-takeaway">
        {`KEY TAKEAWAY: ${takeaway[1].trim()}`}
      </strong>,
    ];
  }

  const parts = normalized.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong className="reading-highlight" key={`${part.slice(0, 24)}-${index}`}>
          {part.slice(2, -2).trim()}
        </strong>
      );
    }

    return <span key={`${part.slice(0, 24)}-${index}`}>{part}</span>;
  });
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
        <p key={`${paragraph.slice(0, 28)}-${index}`}>{renderReadingInline(paragraph)}</p>
      ))}
    </div>
  );
}

function daysInMonth(monthIndex: number, year: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function formatBirthDate(monthIndex: number, day: number, year: number) {
  return `${dobMonths[monthIndex]} ${day}, ${year}`;
}

function DateWheelColumn<T extends string | number>({
  label,
  options,
  value,
  onChange,
  renderOption,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (value: T) => void;
  renderOption?: (value: T) => string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const suppressRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const node = scrollRef.current;
    const selectedIndex = options.findIndex((option) => option === value);
    if (!node || selectedIndex < 0) return;

    suppressRef.current = true;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        node.scrollTop = selectedIndex * 36;
        window.setTimeout(() => {
          suppressRef.current = false;
        }, 80);
      });
    });
  }, [options, value]);

  function handleScroll() {
    if (suppressRef.current) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      const node = scrollRef.current;
      if (!node) return;
      const nextIndex = Math.min(options.length - 1, Math.max(0, Math.round(node.scrollTop / 36)));
      const next = options[nextIndex];
      if (next !== value) onChange(next);
    }, 90);
  }

  return (
    <div className="dob-col-wrap">
      <span className="sr-only">{label}</span>
      <div className="dob-col" ref={scrollRef} onScroll={handleScroll} role="listbox" aria-label={label}>
        <div className="dob-spacer" />
        {options.map((option) => (
          <div className="dob-item" key={String(option)} role="option" aria-selected={option === value}>
            {renderOption ? renderOption(option) : option}
          </div>
        ))}
        <div className="dob-spacer" />
      </div>
    </div>
  );
}

function PersonalizationCard({
  readerName,
  birthMonth,
  birthDay,
  birthYear,
  onReaderNameChange,
  onBirthMonthChange,
  onBirthDayChange,
  onBirthYearChange,
}: {
  readerName: string;
  birthMonth: number;
  birthDay: number;
  birthYear: number;
  onReaderNameChange: (value: string) => void;
  onBirthMonthChange: (value: number) => void;
  onBirthDayChange: (value: number) => void;
  onBirthYearChange: (value: number) => void;
}) {
  const dayOptions = useMemo(
    () => Array.from({ length: daysInMonth(birthMonth, birthYear) }, (_, index) => index + 1),
    [birthMonth, birthYear]
  );

  return (
    <section className="personal-card" aria-label="Personalise your reading">
      <div className="personal-head">
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="8" r="3.3" />
          <path d="M5.5 20a6.8 6.8 0 0 1 13 0" />
        </svg>
        <strong>Personalise your reading</strong>
      </div>
      <p>Your details attune the spread to you. This stays private to your reading.</p>
      <div className="personal-fields">
        <label>
          <span>Your name</span>
          <input
            className="field"
            value={readerName}
            onChange={(event) => onReaderNameChange(event.target.value)}
            placeholder="e.g. Ava"
            maxLength={40}
          />
        </label>
        <label>
          <span>
            Date of birth <em>· optional</em>
          </span>
          <div className="dob-wheel" aria-label={formatBirthDate(birthMonth, birthDay, birthYear)}>
            <div className="dob-selection" aria-hidden="true" />
            <div className="dob-fade top" aria-hidden="true" />
            <DateWheelColumn
              label="Birth month"
              options={dobMonthIndexes}
              value={birthMonth}
              onChange={onBirthMonthChange}
              renderOption={(value) => dobMonths[value]}
            />
            <DateWheelColumn
              label="Birth day"
              options={dayOptions}
              value={birthDay}
              onChange={onBirthDayChange}
            />
            <DateWheelColumn
              label="Birth year"
              options={dobYears}
              value={birthYear}
              onChange={onBirthYearChange}
            />
            <div className="dob-fade bottom" aria-hidden="true" />
          </div>
        </label>
      </div>
    </section>
  );
}

function SmallMoonIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M24 17.5A9 9 0 1 1 14.5 8a7 7 0 0 0 9.5 9.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="22" cy="9" r="1.1" fill="currentColor" />
    </svg>
  );
}

function detailDiagramHeight(spread: Spread) {
  if (spread.count >= 10) return 480;
  if (spread.count >= 7) return 380;
  if (spread.count >= 5) return 330;
  return 260;
}

function detailLayoutScale(spread: Spread) {
  if (spread.count === 1) return 1.7;
  if (spread.count >= 10) return 0.56;
  if (spread.count >= 7) return 0.68;
  if (spread.count >= 5) return 0.86;
  return 1;
}

function SpreadLayoutInfoCard({ spread }: { spread: Spread }) {
  const height = detailDiagramHeight(spread);
  const scale = detailLayoutScale(spread);

  return (
    <section className="detail-layout-card">
      <div className="detail-layout-stage starfield">
        <span className="detail-stage-label">SPREAD LAYOUT</span>
        <span className="detail-layout-glow" aria-hidden="true" />
        <div className="detail-layout-area" style={{ height }}>
          {spread.positions.map((position, index) => (
            <div
              className="detail-layout-position"
              key={position.label}
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: `translate(-50%, -50%) rotate(${position.rot ?? 0}deg) scale(${scale})`,
              }}
            >
              <div className="detail-layout-mini">
                <span className="serif">{index + 1}</span>
              </div>
              <em>{position.label}</em>
            </div>
          ))}
        </div>
      </div>
      <div className="detail-layout-body">
        <p>
          <strong>Good for:</strong> {spread.good}
        </p>
        <div className="position-list detail-position-list">
          <span>THE POSITIONS</span>
          {spread.positions.map((position, index) => (
            <div className="position-row" key={position.label}>
              <b>{index + 1}</b>
              <div>
                <strong>{position.label}</strong>
                <p>{position.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DetailAskCard({
  question,
  prompts,
  readerName,
  birthMonth,
  birthDay,
  birthYear,
  status,
  onQuestionChange,
  onPromptPick,
  onReaderNameChange,
  onBirthMonthChange,
  onBirthDayChange,
  onBirthYearChange,
  onBeginDraw,
}: {
  question: string;
  prompts: string[];
  readerName: string;
  birthMonth: number;
  birthDay: number;
  birthYear: number;
  status: string;
  onQuestionChange: (value: string) => void;
  onPromptPick: (value: string) => void;
  onReaderNameChange: (value: string) => void;
  onBirthMonthChange: (value: number) => void;
  onBirthDayChange: (value: number) => void;
  onBirthYearChange: (value: number) => void;
  onBeginDraw: () => void;
}) {
  const dayOptions = useMemo(
    () => Array.from({ length: daysInMonth(birthMonth, birthYear) }, (_, index) => index + 1),
    [birthMonth, birthYear]
  );
  const disabled = question.trim().length === 0;

  return (
    <section className="detail-ask-card" aria-label="Start this tarot reading">
      <div className="detail-ask-head">
        <SmallMoonIcon />
        <span>What&apos;s on your mind?</span>
      </div>
      <textarea
        className="detail-ask-textarea"
        value={question}
        onChange={(event) => onQuestionChange(event.target.value)}
        placeholder="Type your question for the cards…"
      />
      <div className="detail-prompt-strip">
        {prompts.map((prompt) => (
          <button type="button" key={prompt} onClick={() => onPromptPick(prompt)}>
            {prompt}
          </button>
        ))}
      </div>
      <label className="detail-ask-label">
        <span>
          Your name <em>· optional, personalises the reading</em>
        </span>
        <input
          value={readerName}
          onChange={(event) => onReaderNameChange(event.target.value)}
          placeholder="e.g. Ava"
          maxLength={40}
        />
      </label>
      <label className="detail-ask-label">
        <span>
          Date of birth <em>· optional</em>
        </span>
        <div className="dob-wheel detail-dob-wheel" aria-label={formatBirthDate(birthMonth, birthDay, birthYear)}>
          <div className="dob-selection" aria-hidden="true" />
          <div className="dob-fade top" aria-hidden="true" />
          <DateWheelColumn
            label="Birth month"
            options={dobMonthIndexes}
            value={birthMonth}
            onChange={onBirthMonthChange}
            renderOption={(value) => dobMonths[value]}
          />
          <DateWheelColumn
            label="Birth day"
            options={dayOptions}
            value={birthDay}
            onChange={onBirthDayChange}
          />
          <DateWheelColumn
            label="Birth year"
            options={dobYears}
            value={birthYear}
            onChange={onBirthYearChange}
          />
          <div className="dob-fade bottom" aria-hidden="true" />
        </div>
      </label>
      <button className="detail-draw-btn" type="button" disabled={disabled} onClick={onBeginDraw}>
        <span>Shuffle &amp; draw this spread</span>
        <svg
          viewBox="0 0 24 24"
          width="17"
          height="17"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>
      <p className="detail-status">{disabled ? "Enter your question to begin." : status}</p>
    </section>
  );
}

function RelatedSpreads({
  spread,
  onOpenSpread,
  onGoHome,
}: {
  spread: Spread;
  onOpenSpread: (id: string) => void;
  onGoHome: () => void;
}) {
  const index = Math.max(0, spreads.findIndex((item) => item.id === spread.id));
  const related = Array.from({ length: Math.min(6, spreads.length - 1) }, (_, offset) => {
    const nextIndex = (index + offset + 1) % spreads.length;
    return spreads[nextIndex];
  });

  return (
    <nav className="related-spreads" aria-label="Other tarot spreads">
      <div className="related-spreads-head">
        <h2>Explore other spreads</h2>
        <a
          href="/#spreads"
          onClick={(event) => handleClientLink(event, onGoHome)}
        >
          All {spreads.length} spreads
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </a>
      </div>
      <div className="related-spread-grid">
        {related.map((item) => (
          <a
            href={`/spread/${item.id}`}
            key={item.id}
            onClick={(event) => handleClientLink(event, () => onOpenSpread(item.id))}
          >
            <div>
              <strong>{item.name}</strong>
              <span>
                {item.count} {item.count === 1 ? "card" : "cards"}
              </span>
            </div>
            <p>{item.blurb}</p>
          </a>
        ))}
      </div>
    </nav>
  );
}

function QuestionMoonIcon() {
  return (
    <div className="question-icon" aria-hidden="true">
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
        <path
          d="M24 17.5A9 9 0 1 1 14.5 8a7 7 0 0 0 9.5 9.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="22" cy="9" r="1.1" fill="currentColor" />
      </svg>
    </div>
  );
}

function ShuffleAnimation({
  spread,
  question,
  readerName,
}: {
  spread: Spread;
  question: string;
  readerName: string;
}) {
  const mode = question.trim() ? "Your question" : "A general reading";
  const firstName = readerName.trim().split(/\s+/)[0];

  return (
    <div className="shuffle-scene" role="status" aria-live="polite">
      <p className="shuffle-kicker">
        {spread.name} · {mode}
      </p>
      <h1 className="serif">{firstName ? `${firstName}, focus on your question...` : "Focus on your question..."}</h1>
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

function getYesNoVerdict(card: DrawnCard | undefined) {
  if (!card) return "";

  const supportiveCards = new Set([
    "The Fool",
    "The Magician",
    "The Empress",
    "The Emperor",
    "The Lovers",
    "The Chariot",
    "Strength",
    "Wheel of Fortune",
    "Temperance",
    "The Star",
    "The Sun",
    "Judgement",
    "The World",
  ]);
  const unclearCards = new Set(["The High Priestess", "The Hermit", "The Hanged Man", "The Moon"]);

  if (card.reversed) {
    return supportiveCards.has(card.name) ? "Not yet — realign first" : "No — pause first";
  }
  if (supportiveCards.has(card.name)) return "Likely — with care";
  if (unclearCards.has(card.name)) return "Unclear — wait for more";
  return "No — pause first";
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
          <a
            className="white-btn"
            href="/#spreads"
            style={{ padding: "10px 18px", fontSize: 13.5 }}
            onClick={(event) => handleClientLink(event, onGoHome)}
          >
            Begin a reading →
          </a>
        </div>
        <div>
          <div className="footer-title">READINGS</div>
          <div className="footer-links">
            {readingLinks.map(([id, label]) => (
              <a
                href={`/spread/${id}`}
                key={id}
                onClick={(event) => handleClientLink(event, () => onOpenSpread(id))}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
        <div>
          <div className="footer-title">MORE SPREADS</div>
          <div className="footer-links">
            {moreLinks.map(([id, label]) => (
              <a
                href={`/spread/${id}`}
                key={id}
                onClick={(event) => handleClientLink(event, () => onOpenSpread(id))}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
        <div>
          <div className="footer-title">ARCANA</div>
          <div className="footer-links">
            <button onClick={onOpenPaywall}>Arcana Pro</button>
            <a href="/about" onClick={(event) => handleClientLink(event, () => onRoute("about"))}>
              About
            </a>
            <a href="/privacy" onClick={(event) => handleClientLink(event, () => onRoute("privacy"))}>
              Privacy
            </a>
            <a href="/contact" onClick={(event) => handleClientLink(event, () => onRoute("contact"))}>
              Contact
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © 2026 Arcana AI · For reflection and entertainment. You are the author of
          your own choices.
        </span>
        <nav aria-label="Footer">
          <a href="/about" onClick={(event) => handleClientLink(event, () => onRoute("about"))}>
            About
          </a>
          <a href="/privacy" onClick={(event) => handleClientLink(event, () => onRoute("privacy"))}>
            Privacy
          </a>
          <a href="/contact" onClick={(event) => handleClientLink(event, () => onRoute("contact"))}>
            Contact
          </a>
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
  const [readerName, setReaderName] = useState("");
  const [birthMonth, setBirthMonth] = useState(5);
  const [birthDay, setBirthDay] = useState(15);
  const [birthYear, setBirthYear] = useState(1995);
  const [cards, setCards] = useState<DrawnCard[]>([]);
  const [drawPhase, setDrawPhase] = useState<DrawPhase>("idle");
  const [user, setUser] = useState<User | null>(null);
  const [freeLimit, setFreeLimit] = useState(1);
  const [guestFreeUsed, setGuestFreeUsed] = useState(0);
  const [authOpen, setAuthOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [devCode, setDevCode] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan>("quarter");
  const [paywallSrc, setPaywallSrc] = useState<PaywallSource>("nav");
  const [pendingDraw, setPendingDraw] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);
  const [stripeConfig, setStripeConfig] = useState<StripeConfig | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [history, setHistory] = useState<SavedReading[]>([]);
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [resultLoading, setResultLoading] = useState(false);
  const [aiSynthesis, setAiSynthesis] = useState("");
  const [openFaq, setOpenFaq] = useState(-1);
  const beginDrawRef = useRef<() => Promise<void>>(async () => undefined);
  const latestSavePayloadRef = useRef<SaveReadingPayload | null>(null);

  const spread = useMemo(
    () => spreads.find((item) => item.id === spreadId) ?? spreads[0],
    [spreadId]
  );
  const readingProfile = useMemo<ReadingProfile>(
    () => ({
      readerName: readerName.trim(),
      birthDate: formatBirthDate(birthMonth, birthDay, birthYear),
    }),
    [birthDay, birthMonth, birthYear, readerName]
  );

  function updateBirthMonth(nextMonth: number) {
    setBirthMonth(nextMonth);
    setBirthDay((current) => Math.min(current, daysInMonth(nextMonth, birthYear)));
  }

  function updateBirthYear(nextYear: number) {
    setBirthYear(nextYear);
    setBirthDay((current) => Math.min(current, daysInMonth(birthMonth, nextYear)));
  }

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
    () => [...new Set([...(spreadPrompts[spread.id] ?? defaultPrompts), ...reflectivePrompts])],
    [spread.id]
  );
  const userStatus = user?.subscribed ? "pro" : user ? "free" : "guest";
  const effectiveFreeUsed = user ? user.freeUsed : guestFreeUsed;
  const freeReadingsLeft = Math.max(0, freeLimit - effectiveFreeUsed);
  const isSubscribed = Boolean(user?.subscribed);

  function track(event: TrackEvent, params: Record<string, unknown> = {}) {
    const search = new URLSearchParams(window.location.search);
    const payload = {
      page_url: window.location.href,
      referrer: document.referrer || "",
      utm_source: search.get("utm_source") || "",
      utm_campaign: search.get("utm_campaign") || "",
      utm_term: search.get("utm_term") || "",
      user_status: userStatus,
      free_readings_left: freeReadingsLeft,
      spread_id: spread.id,
      device_type: window.matchMedia("(max-width: 760px)").matches ? "mobile" : "desktop",
      timestamp: new Date().toISOString(),
      ...params,
    };
    const win = window as typeof window & {
      dataLayer?: Array<Record<string, unknown>>;
      gtag?: (command: "event", eventName: string, params: Record<string, unknown>) => void;
    };
    if (typeof win.gtag === "function") {
      win.gtag("event", event, payload);
    } else {
      win.dataLayer = win.dataLayer || [];
      win.dataLayer.push({ event, ...payload });
    }
  }

  function isPlan(value: unknown): value is Plan {
    return value === "year" || value === "quarter";
  }

  function isPaywallSource(value: unknown): value is PaywallSource {
    return (
      value === "nav" ||
      value === "result" ||
      value === "draw_limit" ||
      value === "new_reading" ||
      value === "followup"
    );
  }

  function planEventParams(plan: Plan, productId?: string, price?: number) {
    const meta = planAnalytics[plan];
    const value = typeof price === "number" && Number.isFinite(price) ? price : meta.value;
    const itemId = productId || meta.itemId;
    return {
      plan,
      plan_name: meta.itemName,
      product_id: itemId,
      value,
      price: value,
      currency: "USD",
      items: [
        {
          item_id: itemId,
          item_name: meta.itemName,
          item_category: "subscription",
          item_variant: `${meta.periodDays}_days`,
          price: value,
          quantity: 1,
        },
      ],
    };
  }

  function writeCheckoutIntent(plan: Plan, source: PaywallSource = paywallSrc) {
    const meta = planAnalytics[plan];
    const intent: CheckoutIntent = {
      plan,
      paywallSrc: source,
      productId: stripeConfig?.prices[plan] || meta.itemId,
      value: meta.value,
      currency: "USD",
    };
    window.sessionStorage.setItem(checkoutIntentKey, JSON.stringify(intent));
    return intent;
  }

  function readCheckoutIntent() {
    try {
      const raw = window.sessionStorage.getItem(checkoutIntentKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<CheckoutIntent>;
      if (!isPlan(parsed.plan)) return null;
      return {
        plan: parsed.plan,
        paywallSrc: isPaywallSource(parsed.paywallSrc) ? parsed.paywallSrc : "nav",
        productId:
          typeof parsed.productId === "string" && parsed.productId
            ? parsed.productId
            : planAnalytics[parsed.plan].itemId,
        value:
          typeof parsed.value === "number" && Number.isFinite(parsed.value)
            ? parsed.value
            : planAnalytics[parsed.plan].value,
        currency: "USD" as const,
      };
    } catch {
      return null;
    }
  }

  function clearCheckoutIntent() {
    window.sessionStorage.removeItem(checkoutIntentKey);
  }

  function readGuestFreeUsed() {
    if (typeof window === "undefined") return 0;
    const value = Number(window.localStorage.getItem(guestFreeUsedKey) || "0");
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
  }

  function setStoredGuestFreeUsed(value: number) {
    const next = Math.max(0, value);
    window.localStorage.setItem(guestFreeUsedKey, String(next));
    setGuestFreeUsed(next);
  }

  function currentSavePayload(): SaveReadingPayload {
    return {
      spreadId: spread.id,
      spreadName: spread.name,
      question,
      cards,
      synthesis: aiSynthesis || synthesis,
    };
  }

  function queuePendingSave() {
    const payload = currentSavePayload();
    latestSavePayloadRef.current = payload;
    setPendingSave(true);
    window.sessionStorage.setItem(pendingSaveKey, "1");
    window.sessionStorage.setItem(pendingSavePayloadKey, JSON.stringify(payload));
  }

  function openLogin(trigger: string) {
    track("login_start", { trigger });
    setAuthOpen(true);
  }

  function openPaywall(src: PaywallSource) {
    setPaywallSrc(src);
    setCheckoutMessage("");
    setCheckoutBusy(false);
    if (!user) {
      window.sessionStorage.setItem(
        pendingSubscribeKey,
        JSON.stringify({ plan: selectedPlan, paywallSrc: src, pendingDraw, spreadId, question })
      );
      setShowPaywall(false);
      openLogin(`paywall_${src}`);
      return;
    }
    setShowPaywall(true);
    track("paywall_view", { paywall_src: src });
  }

  function closePaywall(trackCancel = false) {
    if (trackCancel) track("checkout_cancel", { paywall_src: paywallSrc });
    setShowPaywall(false);
    setPendingDraw(false);
    setCheckoutMessage("");
    setCheckoutBusy(false);
    window.sessionStorage.removeItem(checkoutResumeKey);
  }

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
    const storedGuestFreeUsed = readGuestFreeUsed();
    window.setTimeout(() => setGuestFreeUsed(storedGuestFreeUsed), 0);
    track("landing_view", {
      route,
      free_readings_left: Math.max(0, freeLimit - storedGuestFreeUsed),
    });
    // landing_view should fire once per page load with the entry route.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const loginStatus = params.get("login");
    if (!loginStatus) return;

    window.setTimeout(() => {
      if (loginStatus === "google-ok") {
        track("login_success", { method: "google" });
        flash("Signed in with Google.");
      } else if (loginStatus === "google-config") {
        openLogin("google_config_error");
        setAuthMessage("Google sign-in is not configured yet.");
      } else if (loginStatus === "google-error") {
        openLogin("google_error");
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
    // This consumes one-time URL params on initial load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const rawPendingSave = window.sessionStorage.getItem(pendingSavePayloadKey);
    if (rawPendingSave || pendingSave || window.sessionStorage.getItem(pendingSaveKey)) {
      window.sessionStorage.removeItem(pendingSaveKey);
      window.sessionStorage.removeItem(pendingSavePayloadKey);
      window.setTimeout(() => {
        setPendingSave(false);
        try {
          const payload = rawPendingSave
            ? (JSON.parse(rawPendingSave) as SaveReadingPayload)
            : latestSavePayloadRef.current;
          if (payload) {
            setSpreadId(payload.spreadId);
            setQuestion(payload.question);
            setCards(payload.cards.map((card) => ({ ...card, flipped: true })));
            setAiSynthesis(payload.synthesis);
            setRoute("result");
            window.setTimeout(() => void persistReading(payload), 250);
          }
        } catch {
          flash("Signed in. Please save the reading again.");
        }
      }, 0);
    }

    if (window.sessionStorage.getItem(pendingSubscribeKey)) {
      window.sessionStorage.removeItem(googleResumeKey);
      return;
    }

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
    // This resumes work only when a session becomes available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    syncDocumentHead(route, spread);
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
      const intent = readCheckoutIntent();
      clearParams();
      window.sessionStorage.removeItem(checkoutResumeKey);
      clearCheckoutIntent();
      const cancelParams: Record<string, unknown> = {
        paywall_src: intent?.paywallSrc ?? "checkout_return",
      };
      if (intent) {
        Object.assign(cancelParams, planEventParams(intent.plan, intent.productId, intent.value));
      }
      track("checkout_cancel", cancelParams);
      window.setTimeout(() => flash("Checkout canceled — you were not charged."), 0);
      return;
    }

    if (checkout !== "success") return;
    const sessionId = params.get("session_id") ?? "";
    const checkoutIntent = readCheckoutIntent();
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
        const data = (await response.json()) as ConfirmCheckoutResponse;
        await refreshMe();
        setShowPaywall(false);
        setPendingDraw(false);
        const confirmedPlan = isPlan(data.plan) ? data.plan : checkoutIntent?.plan ?? selectedPlan;
        const purchaseParams = {
          checkout_session_id: sessionId,
          transaction_id: sessionId,
          subscription_id: data.subscriptionId || "",
          payment_status: data.status || "",
          paywall_src: checkoutIntent?.paywallSrc ?? paywallSrc,
          ...planEventParams(
            confirmedPlan,
            data.priceId || checkoutIntent?.productId,
            data.price ?? checkoutIntent?.value
          ),
        };
        if (!response.ok) {
          track("checkout_error", {
            ...purchaseParams,
            step: "confirm_checkout",
            error_code: response.status,
            error_message:
              data.error || "We couldn't confirm this checkout. If you were charged, contact support.",
          });
          clearCheckoutIntent();
          flash(data.error || "We couldn't confirm this checkout. If you were charged, contact support.");
          return;
        }
        if (data.ok) {
          track("checkout_success", purchaseParams);
          track("purchase", {
            affiliation: "Stripe Checkout",
            ...purchaseParams,
          });
          clearCheckoutIntent();
          flash("You're Pro — unlimited readings unlocked.");
          resumeDraw();
        } else {
          track("checkout_error", {
            ...purchaseParams,
            step: "confirm_checkout",
            error_message: data.pending ? "subscription_pending" : "checkout_not_confirmed",
          });
          clearCheckoutIntent();
          flash("Payment received — your membership will activate shortly.");
        }
      } catch {
        const fallbackPlan = checkoutIntent?.plan ?? selectedPlan;
        track("checkout_error", {
          checkout_session_id: sessionId,
          transaction_id: sessionId,
          paywall_src: checkoutIntent?.paywallSrc ?? paywallSrc,
          step: "confirm_checkout",
          error_message: "network_or_parse_error",
          ...planEventParams(fallbackPlan, checkoutIntent?.productId, checkoutIntent?.value),
        });
        clearCheckoutIntent();
        flash("Payment received — your membership will activate shortly.");
      }
    })();
    // This consumes Stripe return params on initial load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user || stripeConfig === null) return;
    const raw = window.sessionStorage.getItem(pendingSubscribeKey);
    if (!raw) return;
    window.sessionStorage.removeItem(pendingSubscribeKey);

    try {
      const pending = JSON.parse(raw) as {
        plan?: unknown;
        paywallSrc?: unknown;
        pendingDraw?: unknown;
        spreadId?: unknown;
        question?: unknown;
      };
      const plan = isPlan(pending.plan) ? pending.plan : selectedPlan;
      const source = isPaywallSource(pending.paywallSrc) ? pending.paywallSrc : paywallSrc;
      const shouldResumeDraw = Boolean(pending.pendingDraw);
      const resumeSpreadId = typeof pending.spreadId === "string" ? pending.spreadId : spreadId;
      const resumeQuestion = typeof pending.question === "string" ? pending.question : question;
      if (shouldResumeDraw) {
        window.sessionStorage.setItem(
          checkoutResumeKey,
          JSON.stringify({
            pendingDraw: true,
            spreadId: resumeSpreadId,
            question: resumeQuestion,
          })
        );
      }
      window.setTimeout(() => {
        if (resumeSpreadId) setSpreadId(resumeSpreadId);
        if (typeof resumeQuestion === "string") setQuestion(resumeQuestion);
        setPendingDraw(shouldResumeDraw);
        setSelectedPlan(plan);
        setPaywallSrc(source);
        setCheckoutBusy(false);
        setCheckoutMessage("");
        setShowPaywall(true);
        track("paywall_view", { paywall_src: source, after_login: true });
      }, 0);
    } catch {
      window.sessionStorage.removeItem(pendingSubscribeKey);
    }
    // This resumes a subscription intent after Google or email login.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, stripeConfig]);

  async function startCheckout(
    plan: Plan,
    options: { resumed?: boolean; source?: PaywallSource } = {}
  ) {
    if (!stripeConfig?.enabled || checkoutBusy) return;

    const source = options.source ?? paywallSrc;
    const intent = writeCheckoutIntent(plan, source);
    const eventParams = {
      paywall_src: source,
      ...planEventParams(plan, intent.productId, intent.value),
    };
    if (!options.resumed) track("paywall_cta_click", eventParams);

    if (!user) {
      window.sessionStorage.setItem(
        pendingSubscribeKey,
        JSON.stringify({ plan, paywallSrc: source, pendingDraw, spreadId, question })
      );
      setShowPaywall(false);
      setCheckoutMessage("");
      setCheckoutBusy(false);
      openLogin("checkout");
      return;
    }

    setCheckoutBusy(true);
    setCheckoutMessage("Redirecting to secure checkout…");
    track("checkout_start", eventParams);
    track("begin_checkout", eventParams);
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
        track("checkout_error", {
          ...eventParams,
          step: "create_checkout_session",
          error_code: response.status,
          error_message: data.error || "missing_checkout_url",
        });
        clearCheckoutIntent();
        return;
      }
      window.location.href = data.url;
    } catch (error) {
      setCheckoutBusy(false);
      setCheckoutMessage("Could not start checkout. Please try again.");
      track("checkout_error", {
        ...eventParams,
        step: "create_checkout_session",
        error_message: error instanceof Error ? error.message : "network_error",
      });
      clearCheckoutIntent();
    }
  }

  function openSpread(id: string) {
    const nextSpread = spreads.find((item) => item.id === id) ?? spread;
    setSpreadId(nextSpread.id);
    setRoute("detail");
    pushRoutePath("detail", nextSpread);
    track("spread_click", { spread_id: nextSpread.id });
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

  function startFreeReading() {
    openSpread("past-present-future");
  }

  function goRoute(nextRoute: Route) {
    setRoute(nextRoute);
    pushRoutePath(nextRoute);
    window.scrollTo({ top: 0 });
  }

  function startDrawAnimation() {
    setAiSynthesis("");
    setResultLoading(false);
    setRoute("draw");
    setDrawPhase("shuffling");
    setCards([]);
    track("draw_start");
    window.scrollTo({ top: 0 });
    window.setTimeout(() => {
      setCards(drawCards(spread));
      setDrawPhase("dealt");
      track("draw_complete");
    }, shuffleDurationMs);
  }

  async function beginDraw() {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      flash("Please enter your question first.");
      return;
    }
    track("question_submit", {
      question_length: trimmedQuestion.length,
      source: route === "detail" ? "detail_ask" : route,
    });

    if (!isSubscribed && effectiveFreeUsed >= freeLimit) {
      setPendingDraw(true);
      openPaywall("draw_limit");
      return;
    }

    if (user) {
      const response = await fetch("/api/readings/begin", { method: "POST" });
      if (response.status === 402) {
        setPendingDraw(true);
        openPaywall("draw_limit");
        return;
      }
      if (!response.ok) {
        flash("Could not start the reading. Please sign in again.");
        return;
      }
    }

    startDrawAnimation();
  }

  async function revealReading() {
    if (revealing) return;
    if (!cards.length) {
      setRoute("result");
      return;
    }
    setRevealing(true);
    setResultLoading(true);
    setRoute("result");
    window.scrollTo({ top: 0 });
    try {
      const response = await fetch("/api/readings/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spreadId: spread.id,
          question,
          profile: readingProfile,
          cards: cards.map((card) => ({ num: card.num, reversed: card.reversed })),
        }),
      });

      if (response.status === 401) {
        openLogin("interpret");
        setResultLoading(false);
        return;
      }
      if (response.status === 402) {
        openPaywall("draw_limit");
        setResultLoading(false);
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
      if (user) {
        await refreshMe();
      } else {
        setStoredGuestFreeUsed(readGuestFreeUsed() + 1);
      }
      setResultLoading(false);
      track("result_view", {
        spread_id: spread.id,
        card_count: cards.length,
      });
    } catch {
      setResultLoading(false);
      flash("Could not generate the reading. Please try again.");
    } finally {
      setRevealing(false);
    }
  }

  function startGoogleLogin() {
    setAuthMessage("Opening Google sign-in...");
    const hasPendingSubscribe = Boolean(window.sessionStorage.getItem(pendingSubscribeKey));
    if (pendingSave) {
      queuePendingSave();
    }
    if ((pendingDraw || route === "question") && !hasPendingSubscribe) {
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
    track("login_success", { method: "email" });
    flash("Signed in securely.");
    const hasPendingSubscribe = Boolean(window.sessionStorage.getItem(pendingSubscribeKey));
    if (pendingSave) {
      setPendingSave(false);
      window.sessionStorage.removeItem(pendingSaveKey);
      window.sessionStorage.removeItem(pendingSavePayloadKey);
      window.setTimeout(() => void persistReading(latestSavePayloadRef.current ?? currentSavePayload()), 250);
    } else if (pendingDraw && !hasPendingSubscribe) {
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

  async function persistReading(payload: SaveReadingPayload = currentSavePayload()) {
    setSaving(true);
    const response = await fetch("/api/readings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!response.ok) {
      flash("Could not save this reading.");
      return;
    }
    flash("Reading saved to your journal.");
  }

  async function saveReading() {
    if (!user) {
      queuePendingSave();
      openLogin("save_journal");
      return;
    }
    await persistReading();
  }

  function startNewReading() {
    if (!isSubscribed && effectiveFreeUsed >= freeLimit) {
      openPaywall("new_reading");
      return;
    }
    goHome();
  }

  function selectPlan(nextPlan: Plan) {
    setSelectedPlan(nextPlan);
    setCheckoutMessage("");
    track("plan_select", {
      paywall_src: paywallSrc,
      ...planEventParams(nextPlan, stripeConfig?.prices[nextPlan]),
    });
  }

  function openSaved(reading: SavedReading) {
    setSpreadId(reading.spreadId);
    setQuestion(reading.question);
    setCards(reading.payload.cards.map((card) => ({ ...card, flipped: true })));
    setAiSynthesis(reading.payload.synthesis || "");
    setRoute("result");
    track("result_view", {
      spread_id: reading.spreadId,
      source: "journal",
      card_count: reading.payload.cards.length,
    });
    window.scrollTo({ top: 0 });
  }

  const planName = selectedPlan === "year" ? "Quarterly Pass" : "Monthly Pass";
  const planPrice = selectedPlan === "year" ? "$19.99" : "$9.99";
  const activeDays = user ? membershipDaysLeft(user) : null;

  return (
    <div className="app-shell">
      <nav className="top-nav">
        <a
          className="brand"
          href="/"
          aria-label="Arcana AI home"
          onClick={(event) => handleClientLink(event, goHome)}
        >
          <span className="brand-mark">
            <LogoMark />
          </span>
          <span>Arcana</span>
          <span className="brand-ai serif">AI</span>
        </a>
        <div className="nav-links">
          <a
            className={`nav-pill ${route !== "history" ? "active" : ""}`}
            href="/#spreads"
            onClick={(event) => handleClientLink(event, beginAtSpreads)}
          >
            Spreads
          </a>
	          <a
	            className={`nav-pill ${route === "history" ? "active" : ""}`}
	            href="/journals"
	            onClick={(event) => handleClientLink(event, () => goRoute("history"))}
	          >
	            Readings
	          </a>
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
            <button className="purple-pill" onClick={() => openPaywall("nav")}>
              <span style={{ color: "var(--gold-bright)" }}>⚡</span>
              <span>Go Unlimited</span>
            </button>
          )}
          {!user && (
            <button
              className="nav-signin"
              aria-label="Sign in with Google"
              onClick={() => openLogin("nav")}
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
                          openPaywall("nav");
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
	                Hold your question, draw the Rider-Waite deck, and get a clear, personal
	                reading in under a minute — no sign-up needed.
	              </p>
	              <button
	                className="white-btn"
	                onClick={startFreeReading}
	              >
	                Start a free reading →
	              </button>
	              <div className="hero-trust" aria-label="Reading benefits">
	                <span>First reading free</span>
	                <span>No sign-up to start</span>
	                <span>Real Rider-Waite deck</span>
	              </div>
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
	              {user
	                ? membershipCaption(user, freeLimit)
	                : "Choose a spread to begin your reading"}
	            </span>
          </div>
          <div className="spread-grid">
            {spreads.map((item) => (
              <a
                className="spread-card"
                href={`/spread/${item.id}`}
                key={item.id}
                onClick={(event) => handleClientLink(event, () => openSpread(item.id))}
              >
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
              </a>
            ))}
          </div>
          <SeoSection openFaq={openFaq} onToggleFaq={(index) => setOpenFaq((current) => (current === index ? -1 : index))} />
          <SiteFooter
            onOpenSpread={openSpread}
            onGoHome={beginAtSpreads}
            onOpenPaywall={() => openPaywall("nav")}
            onRoute={goRoute}
          />
        </main>
      )}

	      {route === "detail" && (
	        <main className="page detail-page">
	          <a
	            className="detail-back-link"
	            href="/#spreads"
	            onClick={(event) => handleClientLink(event, beginAtSpreads)}
	          >
	            ‹ All spreads
	          </a>
	          <header className="detail-header">
	            <h1 className="serif detail-title">{spread.name}</h1>
	            <div className="detail-meta">
	              <span>
	                {spread.count} {spread.count === 1 ? "card" : "cards"}
	              </span>
	              {user?.subscribed && <b>UNLIMITED</b>}
	            </div>
	            <p>{spread.blurb}</p>
	          </header>
	          <div className="detail-start-grid">
	            <SpreadLayoutInfoCard spread={spread} />
	            <DetailAskCard
	              question={question}
	              prompts={questionPrompts}
	              readerName={readerName}
	              birthMonth={birthMonth}
	              birthDay={birthDay}
	              birthYear={birthYear}
	              status={
	                user?.subscribed
	                  ? `Unlimited readings with your ${user.membership.label}.`
	                  : `${freeReadingsLeft} free reading${freeReadingsLeft === 1 ? "" : "s"} left`
	              }
	              onQuestionChange={setQuestion}
	              onPromptPick={setQuestion}
	              onReaderNameChange={setReaderName}
	              onBirthMonthChange={updateBirthMonth}
	              onBirthDayChange={setBirthDay}
	              onBirthYearChange={updateBirthYear}
	              onBeginDraw={() => void beginDraw()}
	            />
	          </div>
	          <RelatedSpreads spread={spread} onOpenSpread={openSpread} onGoHome={beginAtSpreads} />
	          <SpreadSeoContent spread={spread} />
	          <SpreadReviewNote />
	          <SiteFooter
	            onOpenSpread={openSpread}
	            onGoHome={beginAtSpreads}
	            onOpenPaywall={() => openPaywall("nav")}
	            onRoute={goRoute}
	          />
	        </main>
	      )}

      {route === "question" && (
        <main className="question-page">
          <section className="question-shell">
            <QuestionMoonIcon />
            <h1 className="serif question-title">
              What&apos;s on your mind?
            </h1>
            <p className="question-subtitle">
              Hold your question as you read. The clearer your intention, the clearer the cards.
              You can also leave it open.
            </p>
            <textarea
              className="textarea question-textarea"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Type your question for the cards…"
            />
            <div className="prompt-row question-prompts">
              {questionPrompts.map((prompt) => (
                <button className="prompt-chip" key={prompt} onClick={() => setQuestion(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
            <PersonalizationCard
              readerName={readerName}
              birthMonth={birthMonth}
              birthDay={birthDay}
              birthYear={birthYear}
              onReaderNameChange={setReaderName}
              onBirthMonthChange={updateBirthMonth}
              onBirthDayChange={setBirthDay}
              onBirthYearChange={updateBirthYear}
            />
            <div className="question-actions">
              <button className="primary-btn question-submit" onClick={() => void beginDraw()}>
                <span>Shuffle & draw</span>
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
              <button className="question-cancel" onClick={() => setRoute("detail")}>
                Cancel
              </button>
            </div>
          </section>
        </main>
      )}

      {route === "draw" && (
        drawPhase === "shuffling" ? (
          <main className="shuffle-page starfield">
            <ShuffleAnimation spread={spread} question={question} readerName={readerName} />
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
            <a
              className="result-back"
              href="/#spreads"
              onClick={(event) => handleClientLink(event, beginAtSpreads)}
            >
              ‹ <span>Spreads</span>
            </a>
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

          {spread.id === "yesno" && cards[0] && (
            <section className="answer-panel stage starfield" aria-label="The answer">
              <span>THE ANSWER</span>
              <h2 className="serif">{getYesNoVerdict(cards[0])}</h2>
            </section>
          )}

          {resultLoading ? (
            <section className="result-thinking" role="status" aria-live="polite">
              <span className="thinking-orb" aria-hidden="true" />
              <div>
                <strong>The reader is interpreting your cards…</strong>
                <p>Connecting the spread positions, card meanings, and your question.</p>
              </div>
            </section>
          ) : (
            <>
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

              {!isSubscribed && (
                <section className="followup-card" aria-label="Ask a follow-up question">
                  <div className="followup-head">
                    <div>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                      </svg>
                      <strong>Ask a follow-up question</strong>
                    </div>
                    <span className="followup-pro">PRO</span>
                  </div>
                  <div className="followup-input-row">
                    <button className="followup-field" onClick={() => openPaywall("followup")}>
                      e.g. What should I focus on next?
                    </button>
                    <button
                      className="followup-send"
                      aria-label="Unlock follow-up questions"
                      onClick={() => openPaywall("followup")}
                    >
                      <svg
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M22 2 11 13" />
                        <path d="m22 2-7 20-4-9-9-4 20-7z" />
                      </svg>
                    </button>
                  </div>
                  <p>
                    Keep the conversation going with your cards — unlimited follow-ups are included
                    with Arcana Pro.
                  </p>
                </section>
              )}

              <div className="result-actions">
                <button className="result-action-btn" disabled={saving} onClick={() => void saveReading()}>
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
                <button className="result-action-btn" onClick={startNewReading}>
                  New reading
                </button>
              </div>

              {!isSubscribed ? (
                <section className="result-upsell stage starfield">
                  <div className="eyebrow">ARCANA PRO</div>
                  <h2 className="serif">Want to ask another question about this reading?</h2>
                  <p>
                    Unlock unlimited readings and keep your private journal. Save this
                    reading and continue whenever you return.
                  </p>
                  <div className="upsell-benefits">
                    <span>✓ Unlimited readings</span>
                    <span>✓ Private journal</span>
                    <span>✓ All spreads unlocked</span>
                  </div>
                  <button className="white-btn" onClick={() => openPaywall("result")}>
                    Go unlimited
                  </button>
                </section>
              ) : (
                <p className="pro-active-line">Unlimited readings active</p>
              )}
            </>
          )}
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
                <button className="primary-btn" onClick={() => openPaywall("nav")}>
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
              <button className="primary-btn" onClick={() => openLogin("journal")}>
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
              <a
                className="primary-btn"
                href="/#spreads"
                onClick={(event) => handleClientLink(event, beginAtSpreads)}
              >
                Browse spreads
              </a>
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
	        <a
	          className={route !== "history" ? "active" : ""}
	          href="/"
	          onClick={(event) => handleClientLink(event, goHome)}
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
            <rect x="4" y="4" width="6" height="6" rx="1.2" />
            <rect x="14" y="4" width="6" height="6" rx="1.2" />
            <rect x="4" y="14" width="6" height="6" rx="1.2" />
            <rect x="14" y="14" width="6" height="6" rx="1.2" />
	          </svg>
	          <span>Home</span>
	        </a>
	        <a
	          className={route === "history" ? "active" : ""}
	          href="/journals"
	          onClick={(event) => handleClientLink(event, () => goRoute("history"))}
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
            <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3.6L6 20V5a1 1 0 0 1 1-1z" />
	          </svg>
	          <span>Readings</span>
	        </a>
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
                setPendingSave(false);
                window.sessionStorage.removeItem(pendingSubscribeKey);
                window.sessionStorage.removeItem(checkoutResumeKey);
                clearCheckoutIntent();
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
                  closePaywall(true);
                }}
              >
                ✕
              </button>
              <div className="eyebrow">ARCANA PRO</div>
              <h2 className="serif" style={{ margin: 0, fontSize: 34, fontWeight: 500 }}>
                Unlimited readings await
              </h2>
              <p style={{ color: "rgba(255,255,255,.72)", marginBottom: 0 }}>
                Unlock every spread and keep a private journal of every reading.
              </p>
              <div className="paywall-benefits" aria-label="Arcana Pro benefits">
                <span>✓ Unlimited readings</span>
                <span>✓ Private journal</span>
                <span>✓ All spreads unlocked</span>
              </div>
            </div>
            <div className="modal-body">
              <button
                className={`plan-row ${selectedPlan === "quarter" ? "selected" : ""}`}
                onClick={() => selectPlan("quarter")}
              >
                <span className="plan-radio" aria-hidden="true">
                  <span />
                </span>
                <span>
                  <strong>Monthly Pass</strong>
                  <br />
                  <small>30 days · unlimited readings · ≈ $0.33 / day</small>
                </span>
                <span className="tag">POPULAR</span>
              </button>
              <button
                className={`plan-row ${selectedPlan === "year" ? "selected" : ""}`}
                onClick={() => selectPlan("year")}
              >
                <span className="plan-radio" aria-hidden="true">
                  <span />
                </span>
                <span>
                  <strong>Quarterly Pass</strong>
                  <br />
                  <small>90 days · unlimited readings · ≈ $6.66 / mo</small>
                </span>
                <span className="tag">BEST VALUE</span>
              </button>
              {!stripeConfig?.enabled && (
                <p className="message error">
                  Stripe is not configured yet. Add the secret key, webhook secret, and both
                  price IDs to the runtime environment.
                </p>
              )}
              {!user && (
                <p className="message" style={{ marginTop: 0 }}>
                  You&apos;ll sign in first so your subscription is linked to the right account.
                </p>
              )}
              <button
                className="primary-btn"
                disabled={!stripeConfig?.enabled || checkoutBusy}
                onClick={() => void startCheckout(selectedPlan)}
                aria-label={user ? `Subscribe to the ${planName} with Stripe` : "Continue with Arcana Pro"}
              >
                {checkoutBusy ? "Redirecting…" : user ? `Continue — ${planPrice}` : "Continue with Pro"}
              </button>
              {checkoutMessage && <p className="message">{checkoutMessage}</p>}
              <p className="secure-line">Secure Stripe checkout · Cancel anytime</p>
            </div>
          </section>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
