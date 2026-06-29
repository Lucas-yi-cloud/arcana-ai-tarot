declare module "next" {
  type WebpackConfig = {
    plugins?: unknown[];
    resolve?: {
      alias?: Record<string, string>;
    };
  };

  type WebpackContext = {
    webpack: {
      NormalModuleReplacementPlugin: new (
        resourceRegExp: RegExp,
        newResource: string
      ) => unknown;
    };
  };

  export type Metadata = Record<string, unknown>;
  export type Viewport = Record<string, unknown>;
  export type NextConfig = {
    output?: "standalone";
    outputFileTracingRoot?: string;
    webpack?: (config: WebpackConfig, context: WebpackContext) => WebpackConfig;
    [key: string]: unknown;
  };
}

declare module "next/server" {
  export class NextRequest extends Request {
    nextUrl: URL;
    cookies: unknown;
  }

  export class NextResponse extends Response {
    static json<JsonBody>(body: JsonBody, init?: ResponseInit): NextResponse;
    static redirect(url: string | URL, init?: number | ResponseInit): NextResponse;
    static rewrite(destination: string | URL, init?: ResponseInit): NextResponse;
    static next(init?: ResponseInit): NextResponse;
  }

  export class ImageResponse extends Response {
    constructor(...args: unknown[]);
  }

  export const URLPattern: unknown;
  export function after(callback: () => unknown | Promise<unknown>): void;
  export function connection(): Promise<void>;
  export function userAgent(request: NextRequest | Request): unknown;
  export function userAgentFromString(input: string | undefined): unknown;
}

declare module "next/navigation" {
  export function notFound(): never;
}

declare module "cloudflare:workers" {
  type CloudflareEnv = {
    DB?: D1Database;
  } & Record<string, string | D1Database | undefined>;

  export const env: CloudflareEnv;
  export class WorkerEntrypoint {}
  export class DurableObject {}
  export class WorkflowEntrypoint {}
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(column?: string): Promise<T | null>;
  run<T = unknown>(): Promise<T>;
  all<T = unknown>(): Promise<T>;
  raw<T = unknown[]>(): Promise<T[]>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<T[]>;
  exec(query: string): Promise<unknown>;
}

interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

declare module "next/types.js" {
  export type {
    ResolvingMetadata,
    ResolvingViewport,
  } from "next/dist/lib/metadata/types/metadata-interface.js";
}

declare module "next/server.js" {
  export {
    ImageResponse,
    NextRequest,
    NextResponse,
    URLPattern,
    after,
    connection,
    userAgent,
    userAgentFromString,
  } from "next/server";
}

declare module "next/dist/build/segment-config/app/app-segment-config.js" {
  export type InstantConfigForTypeCheckInternal = unknown;
}

declare module "next/dist/lib/metadata/types/metadata-interface.js" {
  export type Metadata = Record<string, unknown>;
  export type Viewport = Record<string, unknown>;
  export type ResolvingMetadata = Promise<Metadata>;
  export type ResolvingViewport = Promise<Viewport>;
}
