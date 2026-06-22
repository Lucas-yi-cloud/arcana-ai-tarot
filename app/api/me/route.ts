import { getCurrentUser } from "@/lib/auth";
import { FREE_READING_LIMIT } from "@/lib/readings";

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  return Response.json({
    user,
    freeLimit: FREE_READING_LIMIT,
  });
}
