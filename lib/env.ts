import { env } from "cloudflare:workers";

export type AppEnv = {
  DB?: D1Database;
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
};

export function getAppEnv() {
  return env as unknown as AppEnv;
}

export function requireEnv(name: keyof AppEnv) {
  const value = getAppEnv()[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}
