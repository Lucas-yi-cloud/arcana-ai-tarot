import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const isCloudRunBuild = process.env.CLOUD_RUN_BUILD === "1";

const nextConfig: NextConfig = isCloudRunBuild
  ? {
      output: "standalone",
      outputFileTracingRoot: rootDir,
      webpack(config, { webpack }) {
        const shimPath = path.join(
          rootDir,
          "lib/cloudrun/cloudflare-workers-shim.ts"
        );

        config.plugins ??= [];
        config.plugins.push(
          new webpack.NormalModuleReplacementPlugin(
            /^cloudflare:workers$/,
            shimPath
          )
        );

        config.resolve ??= {};
        config.resolve.alias ??= {};
        config.resolve.alias["cloudflare:workers"] = shimPath;

        return config;
      },
    }
  : {};

export default nextConfig;
