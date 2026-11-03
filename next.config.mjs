import { withSentryConfig } from "@sentry/nextjs/config"

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
    async headers() {
        return [
            {
                // matching all API routes
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: process.env.DEVELOPMENT == "true" ? "http://localhost:3000" : "https://partner.pakraffle.com" }, // replace this your actual origin
                    { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token,api-key, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
                ]
            }
        ]
    },
  experimental: {
    // Next 14 only loads instrumentation.ts — the file that boots the GlitchTip SDK on the
    // server — while this flag is on. It became unflagged in Next 15.
    instrumentationHook: true,
  },
}

// GlitchTip error monitoring over the Sentry protocol.
//
// The wrapper does two jobs: it injects sentry.client.config.ts into the browser bundle, and it
// instruments server components, route handlers and pages so unhandled failures are reported.
// Source-map upload is deliberately conditional — without credentials a clone or CI build must
// still succeed, and error reporting itself never depends on the upload step.
export default withSentryConfig(nextConfig, {
  ...(process.env.SENTRY_AUTH_TOKEN
    ? {
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        sentryUrl: process.env.GLOTCHTIP_URL || "https://app.glitchtip.com",
      }
    : {}),
  // Sentry's own build telemetry targets sentry.io; this project reports to GlitchTip.
  telemetry: false,
})
