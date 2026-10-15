import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const supabaseOrigin = (() => {
  const raw =
    process.env.NEXT_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  try {
    return new URL(raw).origin;
  } catch {
    return "";
  }
})();

const supabaseConnect = [
  supabaseOrigin,
  supabaseOrigin ? supabaseOrigin.replace(/^http/, "ws") : "",
  "https://*.supabase.co",
  "wss://*.supabase.co",
]
  .filter(Boolean)
  .join(" ");

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://*.supabase.co",
  "media-src 'self' blob: https://*.supabase.co",
  "font-src 'self'",
  `connect-src 'self' ${supabaseConnect}`,
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  env: {
    NEXT_SUPABASE_URL:
      process.env.NEXT_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(self), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
