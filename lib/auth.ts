import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { loginCodes, sessions, subscriptions, users } from "@/db/schema";
import { getAppEnv, requireEnv } from "@/lib/env";
import {
  codeHash,
  ipHash,
  parseSessionCookie,
  randomId,
  SESSION_DAYS,
  sessionCookie,
  tokenHash,
} from "@/lib/security";

export type CurrentUser = {
  id: string;
  email: string;
  freeUsed: number;
  subscription: {
    plan: string;
    status: string;
    currentPeriodEnd: number | null;
  } | null;
  subscribed: boolean;
};

export function isActiveSubscription(status: string, currentPeriodEnd: number | null) {
  if (status !== "ACTIVE") return false;
  return !currentPeriodEnd || currentPeriodEnd > Date.now();
}

export async function getCurrentUser(request: Request): Promise<CurrentUser | null> {
  const cookie = parseSessionCookie(request);
  if (!cookie) return null;

  const secret = requireEnv("AUTH_SECRET");
  const db = getDb();
  const hashed = await tokenHash(cookie.token, secret);
  const now = Date.now();

  const [session] = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.id, cookie.sessionId),
        eq(sessions.tokenHash, hashed),
        isNull(sessions.revokedAt),
        gt(sessions.expiresAt, now)
      )
    )
    .limit(1);

  if (!session) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user) return null;

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id))
    .orderBy(desc(subscriptions.updatedAt))
    .limit(1);

  const subscription = sub
    ? {
        plan: sub.plan,
        status: sub.status,
        currentPeriodEnd: sub.currentPeriodEnd,
      }
    : null;

  return {
    id: user.id,
    email: user.email,
    freeUsed: user.freeUsed,
    subscription,
    subscribed: subscription
      ? isActiveSubscription(subscription.status, subscription.currentPeriodEnd)
      : false,
  };
}

export async function requireUser(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return {
      user: null,
      response: Response.json({ error: "Sign in required" }, { status: 401 }),
    } as const;
  }

  return { user, response: null } as const;
}

export async function createLoginCode(request: Request, email: string, code: string) {
  const secret = requireEnv("AUTH_SECRET");
  const db = getDb();
  const now = Date.now();
  const row = {
    id: randomId("lc_"),
    email,
    codeHash: await codeHash(email, code, secret),
    attempts: 0,
    expiresAt: now + 10 * 60 * 1000,
    createdAt: now,
    usedAt: null,
    ipHash: await ipHash(request, secret),
  };

  await db.insert(loginCodes).values(row);
  return row;
}

export async function verifyLoginCode(request: Request, email: string, code: string) {
  const secret = requireEnv("AUTH_SECRET");
  const db = getDb();
  const now = Date.now();
  const [row] = await db
    .select()
    .from(loginCodes)
    .where(
      and(
        eq(loginCodes.email, email),
        isNull(loginCodes.usedAt),
        gt(loginCodes.expiresAt, now)
      )
    )
    .orderBy(desc(loginCodes.createdAt))
    .limit(1);

  if (!row) return { ok: false as const, reason: "Code expired. Request a new one." };
  if (row.attempts >= 5) return { ok: false as const, reason: "Too many attempts." };

  const expected = await codeHash(email, code, secret);
  if (expected !== row.codeHash) {
    await db
      .update(loginCodes)
      .set({ attempts: row.attempts + 1 })
      .where(eq(loginCodes.id, row.id));
    return { ok: false as const, reason: "Incorrect code." };
  }

  await db.update(loginCodes).set({ usedAt: now }).where(eq(loginCodes.id, row.id));

  let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    const id = randomId("usr_");
    await db.insert(users).values({
      id,
      email,
      freeUsed: 0,
      createdAt: now,
      lastLoginAt: now,
    });
    [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  } else {
    await db.update(users).set({ lastLoginAt: now }).where(eq(users.id, user.id));
  }

  const sessionId = randomId("ses_");
  const token = randomId("tok_");
  await db.insert(sessions).values({
    id: sessionId,
    userId: user.id,
    tokenHash: await tokenHash(token, secret),
    createdAt: now,
    expiresAt: now + SESSION_DAYS * 24 * 60 * 60 * 1000,
    revokedAt: null,
    userAgent: request.headers.get("user-agent"),
    ipHash: await ipHash(request, secret),
  });

  return {
    ok: true as const,
    user,
    cookie: sessionCookie(sessionId, token, request),
  };
}

export async function sendLoginEmail(email: string, code: string) {
  const appEnv = getAppEnv();
  if (appEnv.AUTH_DEV_MODE === "true") return { dev: true };

  if (!appEnv.RESEND_API_KEY || !appEnv.LOGIN_EMAIL_FROM) {
    throw new Error("Email delivery is not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${appEnv.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: appEnv.LOGIN_EMAIL_FROM,
      to: email,
      subject: "Your Arcana AI login code",
      text: `Your Arcana AI login code is ${code}. It expires in 10 minutes.`,
    }),
  });

  if (!response.ok) {
    throw new Error("Could not send login email");
  }

  return { dev: false };
}
