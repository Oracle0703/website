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
  // The Windows release workflow builds this output on the target OS. Keep the
  // trace root at the monorepo root because the website reads /content.
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../.."),
  poweredByHeader: false,
  images: {
    // All site imagery is local and already optimized. Serving it directly
    // avoids running the image transformer on the small production host.
    unoptimized: true
  },
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store"
          },
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow"
          }
        ]
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache"
          },
          {
            key: "Service-Worker-Allowed",
            value: "/"
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
