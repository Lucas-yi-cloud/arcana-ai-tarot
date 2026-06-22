import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { canUseFreeReading, FREE_READING_LIMIT } from "@/lib/readings";

export async function POST(request: Request) {
  const { user, response } = await requireUser(request);
  if (!user) return response;

  if (user.subscribed) {
    return Response.json({ ok: true, freeUsed: user.freeUsed, subscribed: true });
  }

  if (!canUseFreeReading(user.freeUsed)) {
    return Response.json(
      {
        error: "Free trial used",
        freeUsed: user.freeUsed,
        freeLimit: FREE_READING_LIMIT,
      },
      { status: 402 }
    );
  }

  const freeUsed = user.freeUsed + 1;
  await getDb().update(users).set({ freeUsed }).where(eq(users.id, user.id));
  return Response.json({ ok: true, freeUsed, subscribed: false });
}
