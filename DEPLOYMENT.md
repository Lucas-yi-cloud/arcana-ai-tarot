# Deploying Arcana AI

Arcana AI runs on **Cloudflare Workers** with a **D1** database. This guide takes
you from a fresh clone to a live, production-ready deployment.

The app is designed to degrade gracefully: it builds and runs with **zero
secrets** (auth dev mode, no Stripe, deterministic readings). You only add the
secrets for the features you want live.

---

## 0. Prerequisites

- Node.js `>= 22.13`
- A Cloudflare account
- `npm install` already run in the project

Authenticate the Wrangler CLI once (used for D1 + deploy):

```bash
npx wrangler login            # interactive, local dev
# or, for CI:  export CLOUDFLARE_API_TOKEN=...   (Edit Cloudflare Workers template)
```

Tell Wrangler which account to use (find it in the dashboard URL or `wrangler whoami`):

```bash
export CLOUDFLARE_ACCOUNT_ID=<your-account-id>
```

---

## 1. Create the D1 database

```bash
npm run db:create
```

This prints a `database_id`. Put it (and the database name it created) into
**`wrangler.d1.json`** — this one file is the single source of truth for both
migrations and the build:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "arcana-ai-tarot",
      "database_id": "<paste-the-id-here>",
      "migrations_dir": "drizzle"
    }
  ]
}
```

> ⚠️ **Required step.** `wrangler.d1.json` ships with a placeholder
> `database_id` (`00000000-…`) so local dev works out of the box. You **must**
> replace it with your real id before deploying, or the deployed worker's `DB`
> binding will fail at runtime.
>
> **CI alternative:** instead of editing the file, export `CF_D1_DATABASE_ID`
> and `CF_D1_DATABASE_NAME` in the deploy environment — they override
> `wrangler.d1.json` for the build. CI deploys **must** set these; otherwise the
> build bakes in the placeholder id.

---

## 2. Apply migrations

The schema lives in `db/schema.ts`; committed migrations are in `drizzle/`.

```bash
# Local dev database (used by `npm run dev`)
npm run db:migrate:local

# Remote / production database
npm run db:migrate:remote
```

If you change `db/schema.ts`, regenerate migrations with `npm run db:generate`
and re-run the migrate commands.

---

## 3. Configure secrets

The app reads configuration from the worker environment. For **local dev**, copy
`.env.example` to `.dev.vars` and fill in what you need. For **production**, set
each as a Wrangler secret:

```bash
npx wrangler secret put AUTH_SECRET            # required: long random string
npx wrangler secret put ANTHROPIC_API_KEY      # enables real AI readings
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put STRIPE_PRICE_ID_YEAR
npx wrangler secret put STRIPE_PRICE_ID_QUARTER
npx wrangler secret put RESEND_API_KEY         # optional: real login emails
```

Non-secret vars (`APP_BASE_URL`, `AI_MODEL`, `LOGIN_EMAIL_FROM`) can be set as
plain `vars` in the deploy config or as secrets — secrets are fine.

Generate a strong `AUTH_SECRET`:

```bash
node -e "console.log(crypto.randomBytes(48).toString('base64url'))"
```

### Feature → required secrets

| Feature | Secrets |
|---|---|
| **Sessions** (always) | `AUTH_SECRET` |
| **Real AI readings** | `ANTHROPIC_API_KEY` (optional `AI_MODEL`, default `claude-opus-4-8`) |
| **Google sign-in** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `APP_BASE_URL` |
| **Email login codes** | `RESEND_API_KEY`, `LOGIN_EMAIL_FROM` (else set `AUTH_DEV_MODE=true`) |
| **Stripe subscriptions** | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_YEAR`, `STRIPE_PRICE_ID_QUARTER`, `APP_BASE_URL` (optional: `STRIPE_PUBLISHABLE_KEY`, unused by hosted Checkout) |

Without `ANTHROPIC_API_KEY`, readings fall back to deterministic Rider-Waite
text — the app still works, it just isn't AI-generated.

---

## 4. Deploy

```bash
npm run deploy
```

`vinext deploy` builds the app and pushes it to Cloudflare Workers, using the
D1 binding from `wrangler.d1.json` (or the `CF_D1_*` env overrides).

> ⚠️ Confirm step 1 is done: the worker is built with whatever `database_id` is
> in `wrangler.d1.json` (or `CF_D1_DATABASE_ID`). If it's still the placeholder
> `00000000-…`, the deploy succeeds but the live `DB` binding won't resolve.

After the first deploy, note your worker URL (e.g.
`https://arcana-ai-tarot.<subdomain>.workers.dev`) and set `APP_BASE_URL` to it
(or to your custom domain). Re-deploy so OAuth redirects resolve correctly.

---

## 5. Third-party setup

### Google OAuth

In Google Cloud Console → Credentials → OAuth client, add authorized redirect URIs:

```
http://localhost:3000/api/auth/google/callback
https://<your-domain>/api/auth/google/callback
```

### Stripe

In the Stripe Dashboard (Test mode first), create a product with two recurring
prices (Annual `$19.99`/year, Quarterly `$9.99`/3 months). Set the `price_…` ids
as `STRIPE_PRICE_ID_YEAR` / `STRIPE_PRICE_ID_QUARTER` and the keys as
`STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY`. Register a webhook endpoint at:

```
https://<your-domain>/api/stripe/webhook
```

Subscribe it to `checkout.session.completed`, `customer.subscription.created`,
`customer.subscription.updated`, and `customer.subscription.deleted`, then put
its signing secret (`whsec_…`) in
`STRIPE_WEBHOOK_SECRET`. `APP_BASE_URL` must be your real origin so Checkout
success/cancel redirects come back to the app. Use live keys (`sk_live_…`) only
after testing with `sk_test_…`; mode is implied by the key prefix.

### Anthropic

Create an API key at the Anthropic console and set `ANTHROPIC_API_KEY`. The
default model is `claude-opus-4-8`; override with `AI_MODEL` (e.g.
`claude-sonnet-4-6` or `claude-haiku-4-5`) to trade quality for cost.

---

## 6. Verify

```bash
npm run lint
npm run test
npm run build
```

Then smoke-test the live site: sign in, draw a reading (confirm the text is
AI-generated when the key is set), save it, and exercise the Stripe Checkout
flow with test card `4242 4242 4242 4242`.

---

## Troubleshooting

- **`DB binding unavailable`** — migrations not applied, or `database_id` not set
  in `wrangler.d1.json`. Run steps 1–2.
- **`AUTH_SECRET is not configured`** — set the secret (step 3).
- **Google/Stripe "not configured"** — the corresponding secrets are missing;
  the app intentionally surfaces this instead of failing silently.
- **Readings aren't AI-generated** — `ANTHROPIC_API_KEY` is unset or invalid;
  the app fell back to deterministic text by design.
