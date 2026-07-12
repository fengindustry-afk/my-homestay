import type { NextConfig } from "next";

// Tailored Content-Security-Policy. Allow-lists exactly the third parties this
// site uses (Supabase, Unsplash/pravatar images, Vercel Speed Insights) while
// keeping everything else locked to 'self'. 'unsafe-inline' on script/style is
// required by Next.js' inline runtime and Tailwind; 'unsafe-eval' is only added
// in dev (next dev uses eval for fast refresh).
const isDev = process.env.NODE_ENV !== "production";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://i.pravatar.cc https://*.supabase.co https://lh3.googleusercontent.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://va.vercel-scripts.com https://vitals.vercel-insights.com https://www.google-analytics.com https://analytics.google.com https://region1.analytics.google.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

// Mirrors the edge-hardening headers from the rawsec Nginx reverse proxy.
const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "geolocation=(), microphone=(), camera=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  // Pin the workspace root to this project so Next.js doesn't infer it from a
  // stray parent lockfile (D:\Project 1\package-lock.json).
  turbopack: {
    root: __dirname,
  },
  // Hide the framework version (equivalent to Nginx 'server_tokens off').
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
