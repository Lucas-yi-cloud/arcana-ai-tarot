import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { stripeWebhookEvents, subscriptions } from "@/db/schema";
import {
  getStripeSubscription,
  periodEndMs,
  planFromStripePriceId,
  priceIdFromSubscription,
  verifyStripeWebhook,
  type StripePlan,
  type StripeSubscription,
} from "@/lib/stripe";
import { randomId } from "@/lib/security";

type StripeEventObject = {
  id?: string;
  subscription?: string | { id?: string };
  client_reference_id?: string | null;
  customer?: string | null;
  metadata?: Record<string, string>;
  status?: string;
  current_period_end?: number;
  items?: { data?: Array<{ price?: { id?: string } }> };
};

type StripeEvent = {
  id?: string;
  type?: string;
  data?: { object?: StripeEventObject };
};

type Db = ReturnType<typeof getDb>;

export async function POST(request: Request) {
  try {
    return await handleWebhook(request);
  } catch {
    // Controlled failure: a 5xx tells Stripe to retry, and we never leak an
    // unhandled stack trace from the payment path.
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function handleWebhook(request: Request) {
  // Stripe signs the RAW body — read text, not parsed JSON.
  const payload = await request.text();
  const valid = await verifyStripeWebhook(payload, request.headers.get("stripe-signature"));
  if (!valid) return Response.json({ error: "Invalid Stripe signature" }, { status: 400 });

  const event = JSON.parse(payload) as StripeEvent;
  if (!event.id || !event.type) {
    return Response.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  const db = getDb();

  // Atomic idempotency: insert-or-skip on the event id.
  const recorded = await db
    .insert(stripeWebhookEvents)
    .values({ id: event.id, eventType: event.type, processedAt: Date.now() })
    .onConflictDoNothing()
    .returning({ id: stripeWebhookEvents.id });
  if (recorded.length === 0) return Response.json({ ok: true, duplicate: true });

  try {
    await applyEvent(db, event);
  } catch (err) {
    // Roll back the idempotency marker so Stripe's retry reprocesses this event
    // instead of short-circuiting it as already handled.
    await db.delete(stripeWebhookEvents).where(eq(stripeWebhookEvents.id, event.id));
    throw err;
  }
  return Response.json({ ok: true });
}

async function applyEvent(db: Db, event: StripeEvent) {
  const obj = event.data?.object ?? {};

  if (event.type === "checkout.session.completed") {
    const subId = typeof obj.subscription === "string" ? obj.subscription : obj.subscription?.id;
    if (!subId) return;
    const userId = obj.client_reference_id || obj.metadata?.userId || null;
    const sessionCustomer = typeof obj.customer === "string" ? obj.customer : null;
    // The session payload doesn't carry price/period — fetch the subscription.
    const sub = await getStripeSubscription(subId);
    await upsertSubscription(db, {
      subId: sub.id,
      status: sub.status,
      currentPeriodEnd: sub.current_period_end,
      priceId: priceIdFromSubscription(sub),
      metaPlan: obj.metadata?.plan ?? sub.metadata?.plan,
      userId,
      customerId: sessionCustomer ?? (typeof sub.customer === "string" ? sub.customer : null),
    });
    return;
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    if (!obj.id || !obj.status) return;
    await upsertSubscription(db, {
      subId: obj.id,
      status: obj.status,
      currentPeriodEnd: obj.current_period_end,
      priceId: priceIdFromSubscription(obj as StripeSubscription),
      metaPlan: obj.metadata?.plan,
      userId: obj.metadata?.userId || null,
      customerId: typeof obj.customer === "string" ? obj.customer : null,
    });
  }
}

async function upsertSubscription(
  db: Db,
  p: {
    subId: string;
    status: string;
    currentPeriodEnd?: number;
    priceId: string | null;
    metaPlan?: string;
    userId: string | null;
    customerId: string | null;
  }
) {
  const now = Date.now();
  const [existing] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, p.subId))
    .limit(1);

  // Prefer the plan we stamped into Stripe metadata at checkout (authoritative
  // and immune to price-id drift), then the live price id, then the existing
  // row, and only as a last resort the safer-to-undersell default.
  const metaPlan = p.metaPlan === "year" || p.metaPlan === "quarter" ? p.metaPlan : null;
  const plan: StripePlan =
    metaPlan ??
    planFromStripePriceId(p.priceId) ??
    (existing?.plan as StripePlan | undefined) ??
    "year";
  const periodEnd = periodEndMs(p.currentPeriodEnd, plan);

  if (existing) {
    await db
      .update(subscriptions)
      .set({
        plan,
        status: p.status,
        currentPeriodEnd: periodEnd,
        stripeCustomerId: p.customerId ?? existing.stripeCustomerId,
        updatedAt: now,
      })
      .where(eq(subscriptions.id, existing.id));
    return;
  }

  // Can't create a row without knowing the owner; the confirm-session call or a
  // later subscription event (which carries metadata.userId) will reconcile.
  if (!p.userId) return;

  await db
    .insert(subscriptions)
    .values({
      id: randomId("sub_"),
      userId: p.userId,
      stripeSubscriptionId: p.subId,
      stripeCustomerId: p.customerId,
      plan,
      status: p.status,
      currentPeriodEnd: periodEnd,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing();
}
