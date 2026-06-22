import { getAppEnv, requireEnv } from "@/lib/env";

export type PayPalPlan = "year" | "quarter";

export function paypalBaseUrl() {
  return getAppEnv().PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export function paypalPlanId(plan: PayPalPlan) {
  return plan === "year"
    ? requireEnv("PAYPAL_PLAN_ID_YEAR")
    : requireEnv("PAYPAL_PLAN_ID_QUARTER");
}

export function planFromPayPalPlanId(planId: string) {
  const env = getAppEnv();
  if (planId === env.PAYPAL_PLAN_ID_YEAR) return "year" as const;
  if (planId === env.PAYPAL_PLAN_ID_QUARTER) return "quarter" as const;
  return null;
}

export function fallbackPeriodEnd(plan: PayPalPlan) {
  const days = plan === "year" ? 365 : 90;
  return Date.now() + days * 24 * 60 * 60 * 1000;
}

async function accessToken() {
  const clientId = requireEnv("PAYPAL_CLIENT_ID");
  const secret = requireEnv("PAYPAL_CLIENT_SECRET");
  const response = await fetch(`${paypalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${secret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("PayPal access token request failed");
  }

  const payload = (await response.json()) as { access_token?: string };
  if (!payload.access_token) throw new Error("PayPal access token missing");
  return payload.access_token;
}

export async function getPayPalSubscription(subscriptionId: string) {
  const token = await accessToken();
  const response = await fetch(
    `${paypalBaseUrl()}/v1/billing/subscriptions/${encodeURIComponent(
      subscriptionId
    )}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("PayPal subscription lookup failed");
  }

  return (await response.json()) as {
    id: string;
    status: string;
    plan_id: string;
    billing_info?: {
      next_billing_time?: string;
    };
  };
}

export async function verifyPayPalWebhook(
  requestHeaders: Headers,
  webhookEvent: unknown
) {
  const token = await accessToken();
  const response = await fetch(
    `${paypalBaseUrl()}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: requestHeaders.get("paypal-auth-algo"),
        cert_url: requestHeaders.get("paypal-cert-url"),
        transmission_id: requestHeaders.get("paypal-transmission-id"),
        transmission_sig: requestHeaders.get("paypal-transmission-sig"),
        transmission_time: requestHeaders.get("paypal-transmission-time"),
        webhook_id: requireEnv("PAYPAL_WEBHOOK_ID"),
        webhook_event: webhookEvent,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("PayPal webhook verification failed");
  }

  const payload = (await response.json()) as { verification_status?: string };
  return payload.verification_status === "SUCCESS";
}
