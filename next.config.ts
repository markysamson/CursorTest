import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Native SQLite — must not be bundled or bindings break in production */
  serverExternalPackages: [
    "better-sqlite3",
    "@prisma/adapter-better-sqlite3",
    "@prisma/client",
  ],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
