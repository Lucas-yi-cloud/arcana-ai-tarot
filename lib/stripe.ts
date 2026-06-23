import { getAppEnv, requireEnv } from "@/lib/env";
import { isValidStripeSignature } from "@/lib/stripe-signature";

/**
 * Server-side Stripe client (raw fetch, matching how this worker calls
 * Google / Anthropic / Resend). Uses Stripe Checkout in subscription mode:
 * the server creates a hosted Checkout Session, the browser is redirected to
 * Stripe, and a signed webhook + a return confirmation activate membership.
 *
 * Test vs live mode is implied by the secret key prefix (sk_test_ / sk_live_),
 * so there is no separate environment flag.
 */

const STRIPE_API = "https://api.stripe.com/v1";

export type StripePlan = "year" | "quarter";

export function stripePriceId(plan: StripePlan) {
  return plan === "year"
    ? requireEnv("STRIPE_PRICE_ID_YEAR")
    : requireEnv("STRIPE_PRICE_ID_QUARTER");
}

export function planFromStripePriceId(priceId: string | null | undefined): StripePlan | null {
  if (!priceId) return null;
  const env = getAppEnv();
  if (priceId === env.STRIPE_PRICE_ID_YEAR) return "year";
  if (priceId === env.STRIPE_PRICE_ID_QUARTER) return "quarter";
  return null;
}

export function fallbackPeriodEnd(plan: StripePlan) {
  const days = plan === "year" ? 365 : 90;
  return Date.now() + days * 24 * 60 * 60 * 1000;
}

/** Stripe subscription statuses that grant Pro access. */
export function isActiveStripeStatus(status: string) {
  return status === "active" || status === "trialing";
}

type StripeError = { error?: { message?: string; type?: string } };

async function stripeRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const key = requireEnv("STRIPE_SECRET_KEY");
  const response = await fetch(`${STRIPE_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
      ...(init.headers ?? {}),
    },
  });

  const data = (await response.json()) as T & StripeError;
  if (!response.ok) {
    throw new Error(data?.error?.message ?? "Stripe request failed");
  }
  return data;
}

export type CheckoutSession = {
  id: string;
  url: string | null;
  status?: string;
  payment_status?: string;
  client_reference_id?: string | null;
  customer?: string | null;
  subscription?: StripeSubscription | string | null;
  metadata?: Record<string, string>;
};

export type StripeSubscription = {
  id: string;
  status: string;
  current_period_end?: number;
  customer?: string | null;
  cancel_at_period_end?: boolean;
  items?: { data?: Array<{ price?: { id?: string } }> };
  metadata?: Record<string, string>;
};

export async function createCheckoutSession(opts: {
  plan: StripePlan;
  priceId: string;
  userId: string;
  userEmail?: string | null;
  customerId?: string | null;
  successUrl: string;
  cancelUrl: string;
}): Promise<CheckoutSession> {
  const form = new URLSearchParams();
  form.set("mode", "subscription");
  form.set("line_items[0][price]", opts.priceId);
  form.set("line_items[0][quantity]", "1");
  form.set("success_url", opts.successUrl);
  form.set("cancel_url", opts.cancelUrl);
  // Ownership binding: the session and its subscription carry the account id,
  // so a leaked session/subscription id can't be linked to another account.
  form.set("client_reference_id", opts.userId);
  form.set("metadata[userId]", opts.userId);
  form.set("metadata[plan]", opts.plan);
  form.set("subscription_data[metadata][userId]", opts.userId);
  form.set("subscription_data[metadata][plan]", opts.plan);
  form.set("allow_promotion_codes", "true");
  if (opts.customerId) {
    form.set("customer", opts.customerId);
  } else if (opts.userEmail) {
    form.set("customer_email", opts.userEmail);
  }

  return stripeRequest<CheckoutSession>("/checkout/sessions", {
    method: "POST",
    body: form.toString(),
  });
}

export async function getCheckoutSession(sessionId: string): Promise<CheckoutSession> {
  return stripeRequest<CheckoutSession>(
    `/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=subscription`,
    { method: "GET" }
  );
}

export async function getStripeSubscription(subscriptionId: string): Promise<StripeSubscription> {
  return stripeRequest<StripeSubscription>(
    `/subscriptions/${encodeURIComponent(subscriptionId)}`,
    { method: "GET" }
  );
}

/** Verify a webhook payload against the Stripe-Signature header. */
export async function verifyStripeWebhook(payload: string, sigHeader: string | null): Promise<boolean> {
  const secret = requireEnv("STRIPE_WEBHOOK_SECRET");
  return isValidStripeSignature(payload, sigHeader, secret, Date.now());
}

/** Pull the price id out of a subscription's first line item. */
export function priceIdFromSubscription(sub: StripeSubscription): string | null {
  return sub.items?.data?.[0]?.price?.id ?? null;
}

/** Stripe sends period ends in seconds; we store milliseconds. */
export function periodEndMs(currentPeriodEndSeconds: number | undefined, plan: StripePlan): number {
  return currentPeriodEndSeconds && Number.isFinite(currentPeriodEndSeconds)
    ? currentPeriodEndSeconds * 1000
    : fallbackPeriodEnd(plan);
}
