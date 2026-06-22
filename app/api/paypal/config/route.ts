import { getAppEnv } from "@/lib/env";

export async function GET() {
  const env = getAppEnv();
  return Response.json({
    env: env.PAYPAL_ENV === "live" ? "live" : "sandbox",
    clientId: env.PAYPAL_CLIENT_ID ?? "",
    plans: {
      year: env.PAYPAL_PLAN_ID_YEAR ?? "",
      quarter: env.PAYPAL_PLAN_ID_QUARTER ?? "",
    },
    enabled: Boolean(
      env.PAYPAL_CLIENT_ID &&
        env.PAYPAL_CLIENT_SECRET &&
        env.PAYPAL_PLAN_ID_YEAR &&
        env.PAYPAL_PLAN_ID_QUARTER
    ),
  });
}
