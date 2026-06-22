import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { sessions } from "@/db/schema";
import { clearSessionCookie, parseSessionCookie } from "@/lib/security";

export async function POST(request: Request) {
  const cookie = parseSessionCookie(request);
  if (cookie) {
    await getDb()
      .update(sessions)
      .set({ revokedAt: Date.now() })
      .where(eq(sessions.id, cookie.sessionId));
  }

  return Response.json(
    { ok: true },
    {
      headers: {
        "Set-Cookie": clearSessionCookie(request),
      },
    }
  );
}
