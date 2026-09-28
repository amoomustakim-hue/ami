import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Next 16 emits agent rule files on dev; the repo keeps its own docs.
  agentRules: false,
  compress: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Frame sequence is content-addressed by build; cache hard.
        source: "/frames/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
