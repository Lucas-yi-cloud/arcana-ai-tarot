"use client";

/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element */

import { useState } from "react";
import { spreads } from "@/lib/tarot-data";
import {
  cardIndexFaq,
  cardMeaningPath,
  findTarotCardMeaning,
  tarotCardMeanings,
  type TarotCardMeaning,
} from "@/lib/tarot-card-meanings";

function LogoMark() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M14.4 3.2a9 9 0 1 0 4.3 12.2 7 7 0 0 1-4.3-12.2z"
        fill="#ffe98a"
      />
      <path d="M17.6 4.2 18.6 6.6 21 7.6 18.6 8.6 17.6 11 16.6 8.6 14.2 7.6 16.6 6.6Z" fill="#fff" />
      <circle cx="6.5" cy="17.5" r="0.9" fill="#fff" opacity="0.85" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function CategoryIcon({ type }: { type: "love" | "career" | "money" }) {
  const path =
    type === "love"
      ? "M20.8 8.8c0 5.2-8.8 10-8.8 10s-8.8-4.8-8.8-10A4.8 4.8 0 0 1 12 5a4.8 4.8 0 0 1 8.8 3.8Z"
      : type === "career"
        ? "M9 6V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1M4 9h16v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9Zm0 0 7 5h2l7-5"
        : "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6";
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

function CardTopNav({ active = "cards" }: { active?: "spreads" | "cards" | "journals" }) {
  return (
    <>
      <nav className="cm-top-nav" aria-label="Card meanings navigation">
        <a className="cm-brand" href="/" aria-label="Arcana AI home">
          <span className="cm-brand-mark">
            <LogoMark />
          </span>
          <span>Arcana</span>
          <span className="cm-brand-ai serif">AI</span>
        </a>
        <div className="cm-nav-pills">
          <a className={active === "spreads" ? "active" : ""} href="/#spreads">
            Spreads
          </a>
          <a className={active === "cards" ? "active" : ""} href="/card" aria-current={active === "cards" ? "page" : undefined}>
            Cards
          </a>
          <a className={active === "journals" ? "active" : ""} href="/journals">
            Journals
          </a>
        </div>
        <a className="cm-account-pill" href="/journals">
          Sign in
        </a>
      </nav>
      <nav className="cm-bottom-tabs" aria-label="Mobile card meanings navigation">
        <a href="/">
          <span className="cm-tab-icon grid" aria-hidden="true" />
          <span>Home</span>
        </a>
        <a className="active" href="/card" aria-current="page">
          <span className="cm-tab-icon cards" aria-hidden="true" />
          <span>Cards</span>
        </a>
        <a href="/journals">
          <span className="cm-tab-icon bookmark" aria-hidden="true" />
          <span>Readings</span>
        </a>
      </nav>
    </>
  );
}

function CardFooter() {
  return (
    <footer className="cm-footer">
      <div>
        <a className="cm-footer-brand" href="/">
          <span className="cm-brand-mark">
            <LogoMark />
          </span>
          <span>Arcana</span>
          <span className="cm-brand-ai serif">AI</span>
        </a>
        <p>AI-guided tarot readings and Major Arcana meanings drawn from the Rider-Waite-Smith deck.</p>
      </div>
      <nav aria-label="Footer card links">
        <a href="/card">All 22 Major Arcana</a>
        <a href="/spread/daily">Daily Draw</a>
        <a href="/spread/past-present-future">Past · Present · Future</a>
        <a href="/about">About</a>
        <a href="/privacy">Privacy</a>
        <a href="/contact">Contact</a>
      </nav>
      <div className="cm-footer-bottom">© 2026 Arcana AI · For reflection and entertainment.</div>
    </footer>
  );
}

function FaqList({ items }: { items: Array<{ q: string; a: string }> }) {
  return (
    <div className="cm-faq-list">
      {items.map((item) => (
        <details key={item.q} className="cm-faq-row">
          <summary>
            <span>{item.q}</span>
            <i>
              <ChevronIcon />
            </i>
          </summary>
          <p>{item.a}</p>
        </details>
      ))}
    </div>
  );
}

function CardGrid() {
  return (
    <div className="cm-card-grid">
      {tarotCardMeanings.map((card) => (
        <a className="cm-grid-card" href={cardMeaningPath(card)} key={card.slug}>
          <div className="cm-grid-image">
            <img src={card.image} alt={`${card.name} tarot card`} loading="lazy" />
            <span>{card.roman}</span>
          </div>
          <div className="cm-grid-copy">
            <h3>{card.name}</h3>
            <div>
              {card.keywords.map((keyword) => (
                <em key={keyword}>{keyword}</em>
              ))}
            </div>
            <b>
              View meaning <ArrowIcon />
            </b>
          </div>
        </a>
      ))}
    </div>
  );
}

export function CardMeaningsIndex() {
  return (
    <div className="cm-page">
      <CardTopNav />
      <main className="cm-container">
        <section className="cm-hero cm-index-hero">
          <div className="cm-starfield" aria-hidden="true" />
          <div className="cm-hero-copy">
            <span className="cm-eyebrow gold">TAROT CARD MEANINGS</span>
            <h1 className="serif">Tarot Card Meanings</h1>
            <p>
              Explore the 22 Major Arcana cards used in Arcana AI readings. Learn each card&apos;s upright and reversed meanings, how it speaks in love, career, money, and yes or no questions, and how the meaning changes by spread position.
            </p>
            <div className="cm-actions">
              <a className="cm-button primary" href="/#spreads">
                Start a free AI tarot reading <ArrowIcon />
              </a>
              <a className="cm-button ghost" href="/#spreads">
                Browse tarot spreads
              </a>
            </div>
          </div>
          <div className="cm-hero-fan" aria-hidden="true">
            <img className="left" src="/assets/tarot/RWS_Tarot_17_Star.jpg" alt="" />
            <img className="right" src="/assets/tarot/RWS_Tarot_19_Sun.jpg" alt="" />
            <img className="center" src="/assets/tarot/RWS_Tarot_00_Fool.jpg" alt="" />
          </div>
        </section>

        <section className="cm-intro">
          <h2 className="serif">What are the Major Arcana?</h2>
          <p>
            The Major Arcana are the 22 archetypal cards of the tarot deck. They represent turning points, inner lessons, life chapters, and symbolic forces that shape a reading. Arcana AI currently reads from the Major Arcana because these cards carry clear, memorable themes that work well for focused online tarot readings.
          </p>
        </section>

        <section className="cm-grid-section" aria-labelledby="major-arcana-heading">
          <div className="cm-section-head">
            <h2 id="major-arcana-heading" className="serif">The 22 Major Arcana</h2>
            <span>00 — 21</span>
          </div>
          <CardGrid />
        </section>

        <section className="cm-learning">
          <div>
            <span className="cm-eyebrow">READING BASICS</span>
            <h2 className="serif">How to read upright and reversed cards</h2>
          </div>
          <p>
            An upright card usually expresses its energy directly. A reversed card does not always mean the opposite. It can show blocked energy, an inward version of the card, delay, resistance, or a lesson that needs more attention. Arcana AI reads reversals in context with your question and the card&apos;s position in the spread.
          </p>
        </section>

        <section className="cm-cta">
          <h2 className="serif">Want to know what a card means for your question?</h2>
          <p>
            A card meaning changes when it appears in a real spread. Draw the cards, hold your question, and let Arcana AI interpret the position, orientation, and whole story together.
          </p>
          <a className="cm-button primary" href="/spread/past-present-future">
            Start a free AI tarot reading <ArrowIcon />
          </a>
        </section>

        <section className="cm-faq-section" aria-labelledby="card-faq-heading">
          <h2 id="card-faq-heading" className="serif">Frequently asked questions</h2>
          <FaqList items={cardIndexFaq} />
        </section>
      </main>
      <CardFooter />
    </div>
  );
}

export function CardMeaningDetail({ card }: { card: TarotCardMeaning }) {
  const [orientation, setOrientation] = useState<"upright" | "reversed">("upright");
  const isReversed = orientation === "reversed";
  const related = card.related
    .map((slug) => findTarotCardMeaning(slug))
    .filter((item): item is TarotCardMeaning => Boolean(item));
  const recommendedSpread = spreads.find((spread) => spread.id === card.recommendedSpreadId);

  return (
    <div className="cm-page">
      <CardTopNav />
      <main className="cm-container narrow">
        <nav className="cm-breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span>/</span>
          <a href="/card">Tarot Cards</a>
          <span>/</span>
          <b>{card.name}</b>
        </nav>
        <a className="cm-back-link" href="/card">‹ All tarot cards</a>

        <section className="cm-hero cm-detail-hero">
          <div className="cm-starfield" aria-hidden="true" />
          <div className="cm-card-frame-wrap">
            <div className="cm-card-frame" style={{ transform: `rotate(${isReversed ? 180 : 0}deg)` }}>
              <img src={card.image} alt={`${card.name} tarot card`} />
            </div>
          </div>
          <div className="cm-detail-copy">
            <span className="cm-eyebrow gold">MAJOR ARCANA · {card.num}</span>
            <h1 className="serif">{card.name} Tarot Card Meaning</h1>
            <p>{card.oneLine}</p>
            <div className="cm-toggle" aria-label="Card orientation">
              <button className={!isReversed ? "active" : ""} onClick={() => setOrientation("upright")}>
                Upright
              </button>
              <button className={isReversed ? "active" : ""} onClick={() => setOrientation("reversed")}>
                Reversed
              </button>
            </div>
            <div className={`cm-keywords ${isReversed ? "reversed" : "upright"}`}>
              {(isReversed ? card.reversedKeywords : card.upKeywords).map((keyword) => (
                <span key={keyword}>{keyword}</span>
              ))}
            </div>
            <div className="cm-actions">
              <a className="cm-button primary" href="/#spreads">
                Ask the cards <ArrowIcon />
              </a>
              <a className="cm-button ghost" href="/card">
                All card meanings
              </a>
            </div>
          </div>
        </section>

        <section className="cm-overview">
          <span className="cm-eyebrow">OVERVIEW</span>
          <p className="serif">{card.overview}</p>
        </section>

        <section className="cm-orientation-grid" aria-label={`${card.name} upright and reversed meanings`}>
          <article className="cm-meaning-card upright">
            <span>↑</span>
            <h2>Upright meaning</h2>
            <p>{card.upright}</p>
          </article>
          <article className="cm-meaning-card reversed">
            <span>↓</span>
            <h2>Reversed meaning</h2>
            <p>{card.reversed}</p>
          </article>
        </section>

        <section className="cm-topic-grid" aria-label={`${card.name} meaning by topic`}>
          {[
            ["love", "Love", card.love],
            ["career", "Career", card.career],
            ["money", "Money", card.money],
          ].map(([type, title, text]) => (
            <article className={`cm-topic-card ${type}`} key={type}>
              <span>
                <CategoryIcon type={type as "love" | "career" | "money"} />
              </span>
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </section>

        <section className="cm-yes-no">
          <span className="cm-eyebrow">YES OR NO</span>
          <h2 className="serif">{card.name} as a yes or no card</h2>
          <b>{card.yesNo}</b>
          <p>{card.yesNoExplanation}</p>
        </section>

        <section className="cm-positions">
          <h2 className="serif">How {card.name} changes by spread position</h2>
          <div>
            {card.positions.map((position) => (
              <article key={position.label}>
                <strong>{position.label}</strong>
                <p>{position.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cm-related">
          <div className="cm-section-head">
            <h2 className="serif">Related cards</h2>
            {recommendedSpread && <a href={`/spread/${recommendedSpread.id}`}>Try {recommendedSpread.name}</a>}
          </div>
          <div className="cm-related-grid">
            {related.map((relatedCard) => (
              <a href={cardMeaningPath(relatedCard)} key={relatedCard.slug}>
                <img src={relatedCard.image} alt={`${relatedCard.name} tarot card`} loading="lazy" />
                <span>{relatedCard.roman}</span>
                <strong>{relatedCard.name}</strong>
                <i>›</i>
              </a>
            ))}
          </div>
        </section>

        <section className="cm-faq-section detail" aria-labelledby="detail-card-faq">
          <h2 id="detail-card-faq" className="serif">{card.name} questions, answered</h2>
          <FaqList items={card.faqs} />
        </section>

        <section className="cm-cta">
          <h2 className="serif">Read {card.name} inside a real spread</h2>
          <p>
            A card meaning becomes sharper when it has a position, orientation, and question. Draw your own cards and let Arcana AI read the whole pattern.
          </p>
          <a className="cm-button primary" href="/#spreads">
            Begin a reading <ArrowIcon />
          </a>
        </section>
      </main>
      <CardFooter />
    </div>
  );
}
