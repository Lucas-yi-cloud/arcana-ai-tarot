import { createLoginCode, sendLoginEmail } from "@/lib/auth";
import { getAppEnv } from "@/lib/env";
import { isEmail, jsonError, loginCode, normalizeEmail } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { email?: string };
    const email = normalizeEmail(payload.email ?? "");
    if (!isEmail(email)) return jsonError("Enter a valid email address");

    const code = loginCode();
    await createLoginCode(request, email, code);
    const delivery = await sendLoginEmail(email, code);

    return Response.json({
      ok: true,
      devCode: getAppEnv().AUTH_DEV_MODE === "true" && delivery.dev ? code : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start login";
    return jsonError(message, 500);
  }
}
