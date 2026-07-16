const path = require("node:path");

const releaseSha = /^[0-9a-f]{7,40}$/i.test(process.env.NEXT_PUBLIC_RELEASE_SHA ?? "")
  ? process.env.NEXT_PUBLIC_RELEASE_SHA
  : "local";

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains"
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff"
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin"
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()"
  },
  {
    key: "X-Frame-Options",
    value: "DENY"
  },
  {
    key: "X-Release-Sha",
    value: releaseSha
  }
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The Windows release workflow builds this output on Windows so native
  // dependencies such as sharp match the production host. Keep the trace root
  // at the monorepo root because the website reads content from /content.
  output: "standalone",
  experimental: {
    outputFileTracingRoot: path.join(__dirname, "../..")
  },
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      }
    ];
  }
};

module.exports = nextConfig;
