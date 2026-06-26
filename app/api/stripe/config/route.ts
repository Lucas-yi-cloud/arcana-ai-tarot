import { getAppEnv } from "@/lib/env";
import { stripePriceIds } from "@/lib/stripe";

export async function GET() {
  const env = getAppEnv();
  const prices = stripePriceIds();
  const enabled = Boolean(
    env.STRIPE_SECRET_KEY &&
      env.STRIPE_WEBHOOK_SECRET &&
      prices.year &&
      prices.quarter
  );

  return Response.json({
    enabled,
    publishableKey: env.STRIPE_PUBLISHABLE_KEY ?? "",
    prices,
  });
}
