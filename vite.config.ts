import vinext from "vinext";
import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import hostingConfig from "./.openai/hosting.json";
import d1Config from "./wrangler.d1.json";
import { sites } from "./build/sites-vite-plugin";

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

const { d1, r2 } = hostingConfig;

// Single source of truth for the D1 database: wrangler.d1.json (also used by the
// `wrangler` CLI for migrations). `vinext deploy` bakes these values into the
// generated worker config. Environment variables win so CI can inject the real
// database without editing the file. Defaults keep local dev + the site-creator
// control plane working out of the box. See DEPLOYMENT.md.
const d1FromConfig = d1Config.d1_databases?.[0];
const D1_DATABASE_ID =
  process.env.CF_D1_DATABASE_ID ||
  d1FromConfig?.database_id ||
  SITE_CREATOR_PLACEHOLDER_DATABASE_ID;
const D1_DATABASE_NAME =
  process.env.CF_D1_DATABASE_NAME || d1FromConfig?.database_name || "site-creator-d1";

const localBindingConfig = {
  main: "./worker/index.ts",
  compatibility_flags: ["nodejs_compat"],
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: D1_DATABASE_NAME,
          database_id: D1_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: "site-creator-r2",
        },
      ]
    : [],
};

export default defineConfig({
  plugins: [
    vinext(),
    sites(),
    cloudflare({
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
      config: localBindingConfig,
    }),
  ],
});
