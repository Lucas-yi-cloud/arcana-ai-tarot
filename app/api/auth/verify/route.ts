import { verifyLoginCode } from "@/lib/auth";
import { isEmail, jsonError, normalizeEmail } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { email?: string; code?: string };
    const email = normalizeEmail(payload.email ?? "");
    const code = (payload.code ?? "").trim();
    if (!isEmail(email)) return jsonError("Enter a valid email address");
    if (!/^\d{6}$/.test(code)) return jsonError("Enter the 6-digit code");

    const result = await verifyLoginCode(request, email, code);
    if (!result.ok) return jsonError(result.reason, 400);

    return Response.json(
      { ok: true },
      {
        headers: {
          "Set-Cookie": result.cookie,
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not verify login";
    return jsonError(message, 500);
  }
}
