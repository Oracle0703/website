/** @type {import('next').NextConfig} */

// Security response headers applied to every route.
// NOTE on HSTS: max-age is intentionally short to start. Once TLS auto-renewal
// is verified in production, raise it (e.g. 63072000) and consider `preload`.
// Keeping it short avoids hard-locking visitors out if a certificate lapses.
// A full Content-Security-Policy is intentionally NOT set here: the app renders
// inline JSON-LD and a theme-boot script, so a blanket CSP would break them.
// Add a nonce-based CSP as a follow-up instead.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=86400; includeSubDomains" }
];

const nextConfig = {
  reactStrictMode: true,
  images: {
    // Project mock assets are SVGs rendered through next/image. Allow SVG but
    // sandbox it (no script execution) so untrusted SVG can't run — safe for
    // these first-party assets and required for them to render via the optimizer.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
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
