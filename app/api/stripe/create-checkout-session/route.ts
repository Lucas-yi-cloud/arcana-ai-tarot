import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { subscriptions } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getAppEnv } from "@/lib/env";
import { createCheckoutSession, stripePriceId, type StripePlan } from "@/lib/stripe";
import { jsonError, requestOrigin } from "@/lib/security";

function isPlan(value: string): value is StripePlan {
  return value === "year" || value === "quarter";
}

export async function POST(request: Request) {
  const { user, response } = await requireUser(request);
  if (!user) return response;

  try {
    const payload = (await request.json()) as { plan?: string };
    const plan = payload.plan ?? "";
    if (!isPlan(plan)) return jsonError("Invalid plan");

    const origin = getAppEnv().APP_BASE_URL || requestOrigin(request);

    // Reuse the user's existing Stripe customer if we already created one, so
    // repeat purchases don't spawn duplicate customers.
    const [existing] = await getDb()
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, user.id))
      .orderBy(desc(subscriptions.updatedAt))
      .limit(1);

    const session = await createCheckoutSession({
      plan,
      priceId: stripePriceId(plan),
      userId: user.id,
      userEmail: user.email,
      customerId: existing?.stripeCustomerId ?? null,
      successUrl: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/?checkout=cancel`,
    });

    if (!session.url) return jsonError("Could not start checkout", 502);
    return Response.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start checkout";
    return jsonError(message, 500);
  }
}
