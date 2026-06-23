import { and, eq, gt, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { oauthStates } from "@/db/schema";
import { createUserSession, findOrCreateUser } from "@/lib/auth";
import { getAppEnv, requireEnv } from "@/lib/env";
import { ipHash, normalizeEmail, randomId, sha256 } from "@/lib/security";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const GOOGLE_OAUTH_PROVIDER = "google";
const GOOGLE_STATE_COOKIE = "arcana_google_state";
const GOOGLE_VERIFIER_COOKIE = "arcana_google_verifier";
const GOOGLE_OAUTH_TTL_SECONDS = 10 * 60;

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleProfile = {
  sub?: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  picture?: string;
};

const encoder = new TextEncoder();

function baseUrl(request: Request) {
  return (getAppEnv().APP_BASE_URL || new URL(request.url).origin).replace(/\/$/, "");
}

function callbackUrl(request: Request) {
  return `${baseUrl(request)}/api/auth/google/callback`;
}

function safeRedirectPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  if (value.startsWith("/api/")) return "/";
  return value;
}

function statusRedirect(request: Request, path: string, status: string) {
  const url = new URL(safeRedirectPath(path), baseUrl(request));
  url.searchParams.set("login", status);
  return url.toString();
}

function base64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomOAuthValue() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

async function codeChallenge(verifier: string) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(verifier));
  return base64Url(new Uint8Array(digest));
}

function readCookie(request: Request, name: string) {
  const cookie = request.headers.get("cookie") ?? "";
  return (
    cookie
      .split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${name}=`))
      ?.slice(name.length + 1) ?? null
  );
}

function cookieOptions(request: Request, maxAge: number) {
  const secure = new URL(request.url).protocol === "https:" ? " Secure;" : "";
  return `Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge};${secure}`;
}

function oauthCookie(request: Request, name: string, value: string) {
  return `${name}=${encodeURIComponent(value)}; ${cookieOptions(
    request,
    GOOGLE_OAUTH_TTL_SECONDS
  )}`;
}

function clearOAuthCookie(request: Request, name: string) {
  return `${name}=; ${cookieOptions(request, 0)}`;
}

function redirectResponse(location: string, cookies: string[] = []) {
  const headers = new Headers({ Location: location });
  cookies.forEach((cookie) => headers.append("Set-Cookie", cookie));
  return new Response(null, { status: 302, headers });
}

async function exchangeCode(request: Request, code: string, verifier: string) {
  const body = new URLSearchParams({
    code,
    client_id: requireEnv("GOOGLE_CLIENT_ID"),
    client_secret: requireEnv("GOOGLE_CLIENT_SECRET"),
    redirect_uri: callbackUrl(request),
    grant_type: "authorization_code",
    code_verifier: verifier,
  });

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const payload = (await response.json()) as GoogleTokenResponse;
  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description ?? payload.error ?? "Google token exchange failed");
  }

  return payload.access_token;
}

async function fetchGoogleProfile(accessToken: string) {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const profile = (await response.json()) as GoogleProfile;
  if (!response.ok) throw new Error("Could not read Google profile");
  if (!profile.sub || !profile.email) throw new Error("Google profile is missing identity data");
  if (profile.email_verified !== true && profile.email_verified !== "true") {
    throw new Error("Google email is not verified");
  }

  return profile;
}

export async function startGoogleSignIn(request: Request) {
  const clientId = requireEnv("GOOGLE_CLIENT_ID");
  const clientSecret = requireEnv("GOOGLE_CLIENT_SECRET");
  const url = new URL(request.url);
  const redirectPath = safeRedirectPath(url.searchParams.get("redirect"));
  const state = randomOAuthValue();
  const verifier = randomOAuthValue();
  const now = Date.now();
  void clientSecret;

  await getDb()
    .insert(oauthStates)
    .values({
      id: randomId("oauth_"),
      provider: GOOGLE_OAUTH_PROVIDER,
      stateHash: await sha256(state),
      verifierHash: await sha256(verifier),
      redirectPath,
      expiresAt: now + GOOGLE_OAUTH_TTL_SECONDS * 1000,
      createdAt: now,
      usedAt: null,
      ipHash: await ipHash(request, requireEnv("AUTH_SECRET")),
    });

  const googleUrl = new URL(GOOGLE_AUTH_URL);
  googleUrl.searchParams.set("client_id", clientId);
  googleUrl.searchParams.set("redirect_uri", callbackUrl(request));
  googleUrl.searchParams.set("response_type", "code");
  googleUrl.searchParams.set("scope", "openid email profile");
  googleUrl.searchParams.set("state", state);
  googleUrl.searchParams.set("code_challenge", await codeChallenge(verifier));
  googleUrl.searchParams.set("code_challenge_method", "S256");
  googleUrl.searchParams.set("prompt", "select_account");

  return redirectResponse(googleUrl.toString(), [
    oauthCookie(request, GOOGLE_STATE_COOKIE, state),
    oauthCookie(request, GOOGLE_VERIFIER_COOKIE, verifier),
  ]);
}

export async function completeGoogleSignIn(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");
  const verifierCookie = readCookie(request, GOOGLE_VERIFIER_COOKIE);
  const stateCookie = readCookie(request, GOOGLE_STATE_COOKIE);
  const clearCookies = [
    clearOAuthCookie(request, GOOGLE_STATE_COOKIE),
    clearOAuthCookie(request, GOOGLE_VERIFIER_COOKIE),
  ];

  let redirectPath = "/";

  try {
    if (oauthError) throw new Error(oauthError);
    if (!code || !state || !stateCookie || !verifierCookie) {
      throw new Error("Google sign-in could not be verified");
    }
    if (decodeURIComponent(stateCookie) !== state) {
      throw new Error("Google sign-in state mismatch");
    }

    const db = getDb();
    const stateHash = await sha256(state);
    const verifier = decodeURIComponent(verifierCookie);
    const verifierHash = await sha256(verifier);
    const now = Date.now();
    const [savedState] = await db
      .select()
      .from(oauthStates)
      .where(
        and(
          eq(oauthStates.provider, GOOGLE_OAUTH_PROVIDER),
          eq(oauthStates.stateHash, stateHash),
          eq(oauthStates.verifierHash, verifierHash),
          isNull(oauthStates.usedAt),
          gt(oauthStates.expiresAt, now)
        )
      )
      .limit(1);

    if (!savedState) throw new Error("Google sign-in expired. Please try again.");
    redirectPath = savedState.redirectPath;
    await db.update(oauthStates).set({ usedAt: now }).where(eq(oauthStates.id, savedState.id));

    const accessToken = await exchangeCode(request, code, verifier);
    const profile = await fetchGoogleProfile(accessToken);
    const user = await findOrCreateUser({
      email: normalizeEmail(profile.email),
      displayName: profile.name ?? null,
      avatarUrl: profile.picture ?? null,
      googleSub: profile.sub,
      authProvider: "google",
    });
    const sessionCookie = await createUserSession(request, user.id);

    return redirectResponse(statusRedirect(request, redirectPath, "google-ok"), [
      ...clearCookies,
      sessionCookie,
    ]);
  } catch {
    return redirectResponse(statusRedirect(request, redirectPath, "google-error"), clearCookies);
  }
}
