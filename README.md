# Arcana AI Tarot

Arcana AI is a full-stack AI tarot reading web app built from a high-fidelity design handoff. Users can choose a spread, ask a question, draw Rider-Waite Major Arcana cards, save readings to a private journal, and unlock unlimited readings through PayPal subscriptions.

## Features

- Fourteen tarot spreads, including Daily Draw, Celtic Cross, Relationship Mirror, and Year Ahead
- Animated spread previews, draw stage, card flip interaction, and result view
- Email one-time-code login with HttpOnly session cookies
- Server-side free-trial gating: 2 free readings before paywall
- D1-backed users, sessions, readings, subscriptions, and PayPal webhook events
- PayPal subscription integration scaffold for annual and quarterly plans
- About, Privacy, Contact, SEO content, FAQ, and footer routes

## Stack

- Vinext / Next app router
- React
- Cloudflare Workers-compatible runtime
- Cloudflare D1 with Drizzle
- PayPal Subscriptions API

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
PAYPAL_ENV="sandbox"
PAYPAL_CLIENT_ID=""
PAYPAL_CLIENT_SECRET=""
PAYPAL_WEBHOOK_ID=""
PAYPAL_PLAN_ID_YEAR=""
PAYPAL_PLAN_ID_QUARTER=""
```

## Database

Schema lives in `db/schema.ts`. Generate migrations after schema changes:

```bash
npm run db:generate
```

The initial migration is committed in `drizzle/`.

## Verification

```bash
npm run lint
npm run build
```

## PayPal Setup

Create a PayPal Sandbox app, product, and two subscription plans:

- Annual Pass: 365 days, `$19.99`
- Quarterly Pass: 90 days, `$9.99`

Then set the runtime environment variables listed in `.env.example`. Webhook handling is implemented at:

```text
/api/paypal/webhook
```

Use PayPal webhook signature verification in production with `PAYPAL_WEBHOOK_ID`.

## Notes

The current interpretation text is deterministic client-side placeholder logic. Replace it with a server-side LLM call before production launch if live AI interpretation is required.
