import { env } from "cloudflare:workers";

export type AppEnv = {
  DB?: D1Database;
  // Cloud Run / Node: reach the same D1 database over its HTTP API (see db/index.ts).
  CF_ACCOUNT_ID?: string;
  CF_D1_DATABASE_ID?: string;
  CF_D1_API_TOKEN?: string;
  AUTH_SECRET?: string;
  AUTH_DEV_MODE?: string;
  APP_BASE_URL?: string;
  RESEND_API_KEY?: string;
  LOGIN_EMAIL_FROM?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_PUBLISHABLE_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PRICE_ID_YEAR?: string;
  STRIPE_PRICE_ID_QUARTER?: string;
  ANTHROPIC_API_KEY?: string;
  AI_MODEL?: string;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
  AI_PROVIDER?: "gemini" | "anthropic";
};

export function getAppEnv() {
  return env as unknown as AppEnv;
}

export function requireEnv<K extends keyof AppEnv>(name: K): NonNullable<AppEnv[K]> {
  const value = getAppEnv()[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value as NonNullable<AppEnv[K]>;
}
