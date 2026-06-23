import { getAppEnv } from "@/lib/env";

export async function GET() {
  const env = getAppEnv();
  const enabled = Boolean(
    env.STRIPE_SECRET_KEY &&
      env.STRIPE_WEBHOOK_SECRET &&
      env.STRIPE_PRICE_ID_YEAR &&
      env.STRIPE_PRICE_ID_QUARTER
  );

  return Response.json({
    enabled,
    publishableKey: env.STRIPE_PUBLISHABLE_KEY ?? "",
    prices: {
      year: env.STRIPE_PRICE_ID_YEAR ?? "",
      quarter: env.STRIPE_PRICE_ID_QUARTER ?? "",
    },
  });
}
