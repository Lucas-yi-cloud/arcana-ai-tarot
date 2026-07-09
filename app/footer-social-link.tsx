export function FooterInstagramLink() {
  return (
    <a
      className="footer-social-link"
      href="https://www.instagram.com/arcana_tarot_ai/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Follow Arcana AI on Instagram"
    >
      <span className="footer-social-icon" aria-hidden="true">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
          <circle cx="12" cy="12" r="4.1" />
          <circle cx="17.1" cy="6.9" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <span>@arcana_tarot_ai</span>
    </a>
  );
}
