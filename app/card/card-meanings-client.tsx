/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element */

import CardBottomTabs from "@/app/card/card-bottom-tabs";
import { CardMeaningHero } from "@/app/card/card-meaning-hero";
import SiteHeader from "@/app/site-header";
import { spreads } from "@/lib/tarot-data";
import {
  cardMeaningPath,
  findTarotCardMeaning,
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

export function CardMeaningDetail({ card }: { card: TarotCardMeaning }) {
  const related = card.related
    .map((slug) => findTarotCardMeaning(slug))
    .filter((item): item is TarotCardMeaning => Boolean(item));
  const recommendedSpread = spreads.find((spread) => spread.id === card.recommendedSpreadId);

  return (
    <div className="cm-page">
      <SiteHeader active="cards" />
      <CardBottomTabs />
      <main className="cm-container narrow">
        <nav className="cm-breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span>/</span>
          <a href="/card">Tarot Cards</a>
          <span>/</span>
          <b>{card.name}</b>
        </nav>
        <a className="cm-back-link" href="/card">‹ All tarot cards</a>

        <CardMeaningHero
          image={card.image}
          name={card.name}
          num={card.num}
          oneLine={card.oneLine}
          upKeywords={card.upKeywords}
          reversedKeywords={card.reversedKeywords}
        />

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
                <img src={relatedCard.image} alt={`${relatedCard.name} tarot card`} loading="lazy" decoding="async" fetchPriority="low" />
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
