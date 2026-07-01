import { getCurrentUser } from "@/lib/auth";
import { canUseFreeReading, FREE_READING_LIMIT } from "@/lib/readings";

/**
 * Eligibility check before a draw. Does NOT consume a free reading — the free
 * read is spent in /api/readings/interpret, and only when the AI reading
 * actually succeeds. This lets the client show the paywall before the shuffle
 * animation without burning a free read on a draw that never produces a result.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return Response.json({
      ok: true,
      eligible: true,
      subscribed: false,
      freeUsed: 0,
      freeLimit: FREE_READING_LIMIT,
    });
  }

  if (user.subscribed) {
    return Response.json({ ok: true, eligible: true, subscribed: true, freeUsed: user.freeUsed });
  }

  if (!canUseFreeReading(user.freeUsed)) {
    return Response.json(
      {
        error: "Free trial used",
        eligible: false,
        freeUsed: user.freeUsed,
        freeLimit: FREE_READING_LIMIT,
      },
      { status: 402 }
    );
  }

  return Response.json({
    ok: true,
    eligible: true,
    subscribed: false,
    freeUsed: user.freeUsed,
    freeLimit: FREE_READING_LIMIT,
  });
}
