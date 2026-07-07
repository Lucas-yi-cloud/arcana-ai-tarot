import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { subscriptions } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import {
  getCheckoutSession,
  periodEndMs,
  planFromStripePriceId,
  priceIdFromSubscription,
  type StripeSubscription,
} from "@/lib/stripe";
import { jsonError, randomId } from "@/lib/security";

/**
 * Called when the browser returns from Stripe Checkout. Confirms the session
 * belongs to the signed-in user and links the subscription immediately so the
 * UI flips to Pro without waiting for the webhook (which is the backstop).
 */
export async function POST(request: Request) {
  const { user, response } = await requireUser(request);
  if (!user) return response;
  const accountId = user.id;

  try {
    const payload = (await request.json()) as { sessionId?: string };
    const sessionId = payload.sessionId?.trim() ?? "";
    if (!sessionId) return jsonError("Missing checkout session");

    const session = await getCheckoutSession(sessionId);

    // Ownership (fail closed): every session we create carries the account id in
    // client_reference_id and metadata.userId. Reject unless one of those
    // server-set signals matches — a missing owner must NOT pass the gate.
    const sub =
      session.subscription && typeof session.subscription === "object"
        ? (session.subscription as StripeSubscription)
        : null;
    const owner =
      session.client_reference_id || session.metadata?.userId || sub?.metadata?.userId || null;
    if (!owner || owner !== accountId) {
      return jsonError("This checkout belongs to a different account", 403);
    }

    if (!sub || !sub.id) {
      // Subscription not materialized yet; the webhook will finalize it.
      return Response.json({ ok: false, pending: true });
    }

    const metaPlan = session.metadata?.plan || sub.metadata?.plan;
    const priceId = priceIdFromSubscription(sub);
    const plan =
      planFromStripePriceId(priceId) ??
      (metaPlan === "year" || metaPlan === "quarter" ? metaPlan : null);
    if (!plan) return jsonError("Unknown plan for this subscription", 400);

    const now = Date.now();
    const periodEnd = periodEndMs(sub.current_period_end, plan);
    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : typeof sub.customer === "string"
          ? sub.customer
          : null;

    const db = getDb();
    const successPayload = {
      ok: true,
      status: sub.status,
      plan,
      priceId: priceId ?? undefined,
      price: plan === "year" ? 19.99 : 9.99,
      currency: "USD" as const,
      subscriptionId: sub.id,
      customerId,
    };

    const linkExisting = async (id: string, ownerId: string) => {
      if (ownerId !== accountId) return jsonError("Subscription already linked", 409);
      await db
        .update(subscriptions)
        .set({
          plan,
          status: sub.status,
          currentPeriodEnd: periodEnd,
          stripeCustomerId: customerId,
          updatedAt: now,
        })
        .where(eq(subscriptions.id, id));
      return Response.json(successPayload);
    };

    const [existing] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, sub.id))
      .limit(1);
    if (existing) return await linkExisting(existing.id, existing.userId);

    // Atomic create; if a concurrent request (or the webhook) inserted first,
    // reload and fall back to the update path instead of crashing.
    const inserted = await db
      .insert(subscriptions)
      .values({
        id: randomId("sub_"),
        userId: accountId,
        stripeSubscriptionId: sub.id,
        stripeCustomerId: customerId,
        plan,
        status: sub.status,
        currentPeriodEnd: periodEnd,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing()
      .returning({ id: subscriptions.id });

    if (inserted.length === 0) {
      const [row] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.stripeSubscriptionId, sub.id))
        .limit(1);
      if (!row) return jsonError("Could not confirm subscription", 500);
      return await linkExisting(row.id, row.userId);
    }

    return Response.json(successPayload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not confirm subscription";
    return jsonError(message, 500);
  }
}
