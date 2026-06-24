import { env } from "cloudflare:workers";
import { drizzle as drizzleD1, type DrizzleD1Database } from "drizzle-orm/d1";
import { drizzle as drizzleProxy } from "drizzle-orm/sqlite-proxy";
import * as schema from "./schema";

/**
 * Database access that works on BOTH hosts:
 * - Cloudflare Workers: the native D1 binding `env.DB` (fast, in-region).
 * - Cloud Run / any Node host: the SAME D1 database over its HTTP API, via
 *   drizzle's sqlite-proxy. `cloudflare:workers` is shimmed to process.env on
 *   the Cloud Run build (see next.config.ts), so `env` carries the CF_*
 *   credentials supplied as Cloud Run environment variables.
 *
 * Both paths return a drizzle SQLite database with an identical query API, so
 * the route handlers are unchanged.
 */

function readEnv(key: string): string | undefined {
  const value = (env as unknown as Record<string, unknown>)[key];
  return typeof value === "string" && value ? value : undefined;
}

function isD1Binding(value: unknown): value is D1Database {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as { prepare?: unknown }).prepare === "function"
  );
}

type D1HttpResponse = {
  success?: boolean;
  errors?: unknown;
  result?: Array<{ results?: Array<Record<string, unknown>> }>;
};

/** drizzle sqlite-proxy callback backed by the Cloudflare D1 query HTTP API. */
function d1HttpDriver(accountId: string, databaseId: string, token: string) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;

  return async (sql: string, params: unknown[], method: "run" | "all" | "values" | "get") => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
    });

    const body = (await response.json()) as D1HttpResponse;
    if (!response.ok || !body.success) {
      throw new Error(`D1 HTTP query failed: ${JSON.stringify(body.errors ?? response.status)}`);
    }

    // D1 returns each row as an object keyed by column; sqlite-proxy expects
    // positional value arrays (column order is preserved by SQLite/D1).
    const rows = (body.result?.[0]?.results ?? []).map((row) => Object.values(row));
    return { rows: method === "get" ? (rows[0] ?? []) : rows };
  };
}

export function getDb(): DrizzleD1Database<typeof schema> {
  const binding = (env as unknown as { DB?: unknown }).DB;
  if (isD1Binding(binding)) {
    return drizzleD1(binding, { schema });
  }

  const accountId = readEnv("CF_ACCOUNT_ID");
  const databaseId = readEnv("CF_D1_DATABASE_ID");
  const token = readEnv("CF_D1_API_TOKEN");
  if (accountId && databaseId && token) {
    // Same query API as the D1 driver; cast keeps route handlers host-agnostic.
    return drizzleProxy(d1HttpDriver(accountId, databaseId, token), {
      schema,
    }) as unknown as DrizzleD1Database<typeof schema>;
  }

  throw new Error(
    "No database available. On Cloudflare Workers set the D1 `DB` binding; on Cloud Run / Node set CF_ACCOUNT_ID, CF_D1_DATABASE_ID, and CF_D1_API_TOKEN (a token with D1 edit access) so the worker can reach D1 over its HTTP API."
  );
}
