import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { subscriptions } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import {
  fallbackPeriodEnd,
  getPayPalSubscription,
  paypalPlanId,
  type PayPalPlan,
} from "@/lib/paypal";
import { jsonError, randomId } from "@/lib/security";

function isPlan(value: string): value is PayPalPlan {
  return value === "year" || value === "quarter";
}

export async function POST(request: Request) {
  const { user, response } = await requireUser(request);
  if (!user) return response;

  try {
    const payload = (await request.json()) as {
      subscriptionId?: string;
      plan?: string;
    };
    const subscriptionId = payload.subscriptionId?.trim() ?? "";
    const plan = payload.plan ?? "";
    if (!subscriptionId || !isPlan(plan)) return jsonError("Invalid subscription");

    const details = await getPayPalSubscription(subscriptionId);
    if (details.plan_id !== paypalPlanId(plan)) {
      return jsonError("PayPal plan does not match", 400);
    }

    const periodEnd = details.billing_info?.next_billing_time
      ? Date.parse(details.billing_info.next_billing_time)
      : fallbackPeriodEnd(plan);
    const now = Date.now();
    const db = getDb();
    const [existing] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.paypalSubscriptionId, subscriptionId))
      .limit(1);

    if (existing) {
      if (existing.userId !== user.id) return jsonError("Subscription already linked", 409);
      await db
        .update(subscriptions)
        .set({
          plan,
          status: details.status,
          currentPeriodEnd: Number.isFinite(periodEnd) ? periodEnd : fallbackPeriodEnd(plan),
          updatedAt: now,
        })
        .where(eq(subscriptions.id, existing.id));
    } else {
      await db.insert(subscriptions).values({
        id: randomId("sub_"),
        userId: user.id,
        paypalSubscriptionId: subscriptionId,
        plan,
        status: details.status,
        currentPeriodEnd: Number.isFinite(periodEnd) ? periodEnd : fallbackPeriodEnd(plan),
        createdAt: now,
        updatedAt: now,
      });
    }

    return Response.json({ ok: true, status: details.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not confirm PayPal subscription";
    return jsonError(message, 500);
  }
}
