# Arcana AI Tarot

Arcana AI is a full-stack AI tarot reading web app built from a high-fidelity design handoff. Users can choose a spread, ask a question, draw Rider-Waite Major Arcana cards, save readings to a private journal, and unlock unlimited readings through Stripe subscriptions.

## Features

- Twenty tarot spreads, including Daily Draw, Celtic Cross, Ex & Closure, Week Ahead, and Year Ahead
- Animated spread previews, draw stage, card flip interaction, and result view
- Real server-side AI interpretation via Claude (per-card readings + synthesis), with a deterministic fallback when no API key is set
- Google OAuth sign-in with email one-time-code fallback and HttpOnly session cookies
- Server-side free-trial gating: 2 free readings before paywall, consumed only when a reading succeeds
- D1-backed users, sessions, readings, subscriptions, and Stripe webhook events
- Stripe Checkout subscription integration for quarterly and monthly plans
- About, Privacy, Contact, SEO content, FAQ, and footer routes

## Stack

- Vinext / Next app router
- React
- Cloudflare Workers-compatible runtime
- Cloudflare D1 with Drizzle
- Anthropic Claude (server-side tarot interpretation)
- Google OAuth / OpenID Connect
- Stripe Checkout + Subscriptions API

## Local Development

```bash
npm install
npm run dev
```

The local dev server runs at `http://localhost:3000`.

Create `.dev.vars` locally from `.env.example` and fill development values. Do not commit real secrets.

```env
AUTH_SECRET="replace-with-a-long-random-secret"
AUTH_DEV_MODE="true"
APP_BASE_URL="http://localhost:3000"
ANTHROPIC_API_KEY=""
AI_MODEL="claude-opus-4-8"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""
STRIPE_PRICE_ID_QUARTERLY=""
STRIPE_PRICE_ID_MONTHLY=""
```

## Database

Schema lives in `db/schema.ts`. Generate migrations after schema changes:

```bash
npm run db:generate
```

The initial migration is committed in `drizzle/`.

## Google Login Setup

Create an OAuth client in Google Cloud Console and set these authorized redirect URIs:

```text
http://localhost:3000/api/auth/google/callback
https://your-production-domain.com/api/auth/google/callback
```

Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `APP_BASE_URL` in the runtime environment. Google sign-in stores the verified email, Google subject id, optional display name/avatar, and then uses Arcana AI's own secure session cookie.

## Verification

```bash
npm run lint
npm run build
```

## Analytics

GA4 conversion events are documented in `docs/ga4-conversion-events.md`.

## Stripe Setup

In the Stripe Dashboard (Test mode first), create a product with two recurring
prices:

- Quarterly Pass: `$19.99` / every 90 days
- Monthly Pass: `$9.99` / every 30 days

Copy each price's `price_…` id into `STRIPE_PRICE_ID_QUARTERLY` /
`STRIPE_PRICE_ID_MONTHLY`,
and set `STRIPE_SECRET_KEY` (the publishable key is optional — hosted Checkout
doesn't use it client-side). Add a webhook endpoint pointing at:

```text
https://<your-domain>/api/stripe/webhook
```

subscribing to `checkout.session.completed`, `customer.subscription.created`,
`customer.subscription.updated`, and `customer.subscription.deleted`, then put
its signing secret in
`STRIPE_WEBHOOK_SECRET`. The webhook signature is verified (HMAC-SHA256 with a
timestamp tolerance) on every request. Checkout runs in hosted subscription mode;
the success return is confirmed server-side and the webhook keeps status in sync.

Test with card `4242 4242 4242 4242`, any future expiry and CVC.

## AI Interpretation

Readings are generated server-side (`lib/ai.ts` → `/api/readings/interpret`). The
endpoint rebuilds the draw from the canonical deck/spread (so card meanings can't
be tampered with by the client), asks the model for a per-card reading plus a
final synthesis (structured JSON output), and consumes a free read only when
generation succeeds.

Two providers are supported — set **one** key:

- **Google Gemini** — `GEMINI_API_KEY` (AI Studio key), optional `GEMINI_MODEL`
  (default `gemini-2.5-flash`).
- **Anthropic Claude** — `ANTHROPIC_API_KEY`, optional `AI_MODEL` (default
  `claude-opus-4-8`).

The provider is auto-detected (Gemini preferred when both keys are present), or
force one with `AI_PROVIDER="gemini"｜"anthropic"`. Without any key it falls back
to deterministic Rider-Waite text, so the app still runs end-to-end with no
secrets.

## Testing

```bash
npm run lint
npm test
npm run build
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full Cloudflare Workers + D1 guide:
database creation, migrations, secrets, third-party setup, and `npm run deploy`.
