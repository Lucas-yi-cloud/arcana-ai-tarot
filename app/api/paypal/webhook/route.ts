import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { paypalWebhookEvents, subscriptions } from "@/db/schema";
import { fallbackPeriodEnd, planFromPayPalPlanId, verifyPayPalWebhook } from "@/lib/paypal";

type PayPalWebhook = {
  id?: string;
  event_type?: string;
  resource?: {
    id?: string;
    status?: string;
    plan_id?: string;
    billing_agreement_id?: string;
    billing_info?: {
      next_billing_time?: string;
    };
  };
};

function subscriptionId(event: PayPalWebhook) {
  return event.resource?.id ?? event.resource?.billing_agreement_id ?? "";
}

function webhookStatus(event: PayPalWebhook) {
  switch (event.event_type) {
    case "BILLING.SUBSCRIPTION.ACTIVATED":
      return "ACTIVE";
    case "BILLING.SUBSCRIPTION.CANCELLED":
      return "CANCELLED";
    case "BILLING.SUBSCRIPTION.SUSPENDED":
      return "SUSPENDED";
    case "BILLING.SUBSCRIPTION.EXPIRED":
      return "EXPIRED";
    case "PAYMENT.SALE.COMPLETED":
      return "ACTIVE";
    case "PAYMENT.SALE.DENIED":
    case "PAYMENT.SALE.REFUNDED":
      return "PAYMENT_ATTENTION";
    default:
      return event.resource?.status ?? null;
  }
}

export async function POST(request: Request) {
  const event = (await request.json()) as PayPalWebhook;
  const verified = await verifyPayPalWebhook(request.headers, event);
  if (!verified) return Response.json({ error: "Invalid PayPal signature" }, { status: 400 });

  const db = getDb();
  const eventId = event.id;
  if (!eventId || !event.event_type) {
    return Response.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  const [seen] = await db
    .select()
    .from(paypalWebhookEvents)
    .where(eq(paypalWebhookEvents.id, eventId))
    .limit(1);
  if (seen) return Response.json({ ok: true, duplicate: true });

  await db.insert(paypalWebhookEvents).values({
    id: eventId,
    eventType: event.event_type,
    processedAt: Date.now(),
  });

  const paypalSubscriptionId = subscriptionId(event);
  const status = webhookStatus(event);
  if (paypalSubscriptionId && status) {
    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.paypalSubscriptionId, paypalSubscriptionId))
      .limit(1);

    if (sub) {
      const plan = event.resource?.plan_id
        ? planFromPayPalPlanId(event.resource.plan_id) ?? sub.plan
        : sub.plan;
      const nextBilling = event.resource?.billing_info?.next_billing_time;
      const parsedNextBilling = nextBilling ? Date.parse(nextBilling) : NaN;
      await db
        .update(subscriptions)
        .set({
          plan,
          status,
          currentPeriodEnd: Number.isFinite(parsedNextBilling)
            ? parsedNextBilling
            : sub.currentPeriodEnd ?? fallbackPeriodEnd(plan === "quarter" ? "quarter" : "year"),
          updatedAt: Date.now(),
        })
        .where(eq(subscriptions.id, sub.id));
    }
  }

  return Response.json({ ok: true });
}
