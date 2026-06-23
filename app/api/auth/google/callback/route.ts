import { completeGoogleSignIn } from "@/lib/google-auth";

export async function GET(request: Request) {
  return completeGoogleSignIn(request);
}
