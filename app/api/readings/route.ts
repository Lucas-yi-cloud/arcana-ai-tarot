import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { readings } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { jsonError, randomId } from "@/lib/security";

export async function GET(request: Request) {
  const { user, response } = await requireUser(request);
  if (!user) return response;

  const rows = await getDb()
    .select()
    .from(readings)
    .where(eq(readings.userId, user.id))
    .orderBy(desc(readings.createdAt))
    .limit(40);

  return Response.json({
    readings: rows.map((row) => ({
      ...row,
      payload: JSON.parse(row.payload),
    })),
  });
}

export async function POST(request: Request) {
  const { user, response } = await requireUser(request);
  if (!user) return response;

  try {
    const payload = (await request.json()) as {
      spreadId?: string;
      spreadName?: string;
      question?: string;
      cards?: unknown[];
      synthesis?: string;
    };
    if (!payload.spreadId || !payload.spreadName || !Array.isArray(payload.cards)) {
      return jsonError("Reading payload is incomplete");
    }

    const id = randomId("rdg_");
    const createdAt = Date.now();
    await getDb().insert(readings).values({
      id,
      userId: user.id,
      spreadId: payload.spreadId,
      spreadName: payload.spreadName,
      question: payload.question?.slice(0, 800) ?? "",
      payload: JSON.stringify({
        cards: payload.cards,
        synthesis: payload.synthesis?.slice(0, 2400) ?? "",
      }),
      createdAt,
    });

    return Response.json({ ok: true, id, createdAt }, { status: 201 });
  } catch {
    return jsonError("Could not save reading", 500);
  }
}
