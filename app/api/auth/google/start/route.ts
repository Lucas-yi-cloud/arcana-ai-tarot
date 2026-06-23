import { startGoogleSignIn } from "@/lib/google-auth";

export async function GET(request: Request) {
  try {
    return await startGoogleSignIn(request);
  } catch {
    const url = new URL("/", request.url);
    url.searchParams.set("login", "google-config");
    return Response.redirect(url.toString(), 302);
  }
}
