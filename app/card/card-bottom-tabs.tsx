/* eslint-disable @next/next/no-html-link-for-pages */

export default function CardBottomTabs() {
  return (
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
  );
}
