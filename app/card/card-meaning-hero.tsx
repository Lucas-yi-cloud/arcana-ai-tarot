"use client";

/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element */

import { useState } from "react";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

type CardMeaningHeroProps = {
  image: string;
  name: string;
  num: string;
  oneLine: string;
  upKeywords: string[];
  reversedKeywords: string[];
};

export function CardMeaningHero({
  image,
  name,
  num,
  oneLine,
  upKeywords,
  reversedKeywords,
}: CardMeaningHeroProps) {
  const [orientation, setOrientation] = useState<"upright" | "reversed">("upright");
  const isReversed = orientation === "reversed";

  return (
    <section className="cm-hero cm-detail-hero">
      <div className="cm-starfield" aria-hidden="true" />
      <div className="cm-card-frame-wrap">
        <div className="cm-card-frame" style={{ transform: `rotate(${isReversed ? 180 : 0}deg)` }}>
          <img src={image} alt={`${name} tarot card`} loading="eager" decoding="async" fetchPriority="high" />
        </div>
      </div>
      <div className="cm-detail-copy">
        <span className="cm-eyebrow gold">MAJOR ARCANA · {num}</span>
        <h1 className="serif">{name} Tarot Card Meaning</h1>
        <p>{oneLine}</p>
        <div className="cm-toggle" aria-label="Card orientation">
          <button className={!isReversed ? "active" : ""} onClick={() => setOrientation("upright")}>
            Upright
          </button>
          <button className={isReversed ? "active" : ""} onClick={() => setOrientation("reversed")}>
            Reversed
          </button>
        </div>
        <div className={`cm-keywords ${isReversed ? "reversed" : "upright"}`}>
          {(isReversed ? reversedKeywords : upKeywords).map((keyword) => (
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
  );
}
