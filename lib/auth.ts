import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { loginCodes, sessions, subscriptions, users } from "@/db/schema";
import { getAppEnv, requireEnv } from "@/lib/env";
import { FREE_READING_LIMIT } from "@/lib/readings";
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
  displayName: string | null;
  avatarUrl: string | null;
  freeUsed: number;
  subscription: {
    plan: string;
    status: string;
    currentPeriodEnd: number | null;
  } | null;
  subscribed: boolean;
  membership: {
    tier: "free" | "quarter" | "year";
    label: string;
    detail: string;
    currentPeriodEnd: number | null;
  };
};

type UserIdentity = {
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  googleSub?: string | null;
  authProvider?: "email" | "google";
};

export function isActiveSubscription(status: string, currentPeriodEnd: number | null) {
  // Stripe subscription statuses that grant access (active or in trial).
  if (status !== "active" && status !== "trialing") return false;
  return !currentPeriodEnd || currentPeriodEnd > Date.now();
}

function membershipFor(
  subscription: CurrentUser["subscription"],
  freeUsed: number
): CurrentUser["membership"] {
  const active = subscription
    ? isActiveSubscription(subscription.status, subscription.currentPeriodEnd)
    : false;

  if (active && subscription?.plan === "quarter") {
    return {
      tier: "quarter",
      label: "Quarterly member",
      detail: "90-day unlimited pass",
      currentPeriodEnd: subscription.currentPeriodEnd,
    };
  }

  if (active && subscription?.plan === "year") {
    return {
      tier: "year",
      label: "Annual member",
      detail: "365-day unlimited pass",
      currentPeriodEnd: subscription.currentPeriodEnd,
    };
  }

  return {
    tier: "free",
    label: "Free user",
    detail: `${Math.max(0, FREE_READING_LIMIT - freeUsed)} free readings left`,
    currentPeriodEnd: null,
  };
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

  // A user can accrue several subscription rows over time (Stripe issues a new
  // id on every re-subscribe, and only stripe_subscription_id is unique). Grant
  // access if ANY row is currently active, and represent membership with the
  // active row whose access reaches furthest into the future — never trust the
  // single most-recently-updated row, which a stale event on an old/canceled
  // subscription could otherwise flip.
  const rows = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id));

  const farthest = (value: number | null) => value ?? Number.MAX_SAFE_INTEGER;
  const activeRows = rows
    .filter((row) => isActiveSubscription(row.status, row.currentPeriodEnd))
    .sort((a, b) => farthest(b.currentPeriodEnd) - farthest(a.currentPeriodEnd));
  const latestRow = [...rows].sort((a, b) => b.updatedAt - a.updatedAt)[0] ?? null;
  const chosen = activeRows[0] ?? latestRow;

  const subscription = chosen
    ? {
        plan: chosen.plan,
        status: chosen.status,
        currentPeriodEnd: chosen.currentPeriodEnd,
      }
    : null;

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    freeUsed: user.freeUsed,
    subscription,
    subscribed: activeRows.length > 0,
    membership: membershipFor(subscription, user.freeUsed),
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

export const LOGIN_CODE_COOLDOWN_MS = 60 * 1000;

export async function createLoginCode(request: Request, email: string, code: string) {
  const secret = requireEnv("AUTH_SECRET");
  const db = getDb();
  const now = Date.now();

  // Throttle: refuse a new code if an unused, unexpired one was issued for this
  // email within the cooldown window. Prevents email/quota flooding.
  const [recent] = await db
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

  if (recent && now - recent.createdAt < LOGIN_CODE_COOLDOWN_MS) {
    return { throttled: true as const };
  }

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
  return { throttled: false as const, row };
}

export async function findOrCreateUser(identity: UserIdentity) {
  const db = getDb();
  const now = Date.now();
  let [user] =
    identity.googleSub
      ? await db.select().from(users).where(eq(users.googleSub, identity.googleSub)).limit(1)
      : [];

  if (!user) {
    [user] = await db.select().from(users).where(eq(users.email, identity.email)).limit(1);
  }

  if (!user) {
    const id = randomId("usr_");
    await db.insert(users).values({
      id,
      email: identity.email,
      displayName: identity.displayName ?? null,
      avatarUrl: identity.avatarUrl ?? null,
      googleSub: identity.googleSub ?? null,
      authProvider: identity.authProvider ?? "email",
      freeUsed: 0,
      createdAt: now,
      lastLoginAt: now,
    });
    [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  if (
    identity.googleSub &&
    user.googleSub &&
    user.googleSub !== identity.googleSub
  ) {
    throw new Error("This email is already linked to another Google account");
  }

  await db
    .update(users)
    .set({
      email: identity.email,
      displayName: identity.displayName ?? user.displayName,
      avatarUrl: identity.avatarUrl ?? user.avatarUrl,
      googleSub: identity.googleSub ?? user.googleSub,
      authProvider: identity.authProvider ?? user.authProvider,
      lastLoginAt: now,
    })
    .where(eq(users.id, user.id));

  [user] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
  return user;
}

export async function createUserSession(request: Request, userId: string) {
  const secret = requireEnv("AUTH_SECRET");
  const now = Date.now();
  const sessionId = randomId("ses_");
  const token = randomId("tok_");

  await getDb()
    .insert(sessions)
    .values({
      id: sessionId,
      userId,
      tokenHash: await tokenHash(token, secret),
      createdAt: now,
      expiresAt: now + SESSION_DAYS * 24 * 60 * 60 * 1000,
      revokedAt: null,
      userAgent: request.headers.get("user-agent"),
      ipHash: await ipHash(request, secret),
    });

  return sessionCookie(sessionId, token, request);
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

  const user = await findOrCreateUser({ email, authProvider: "email" });

  return {
    ok: true as const,
    user,
    cookie: await createUserSession(request, user.id),
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
