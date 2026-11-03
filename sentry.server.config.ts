// Node runtime (route handlers, server components, Prisma calls). Loaded by instrumentation.ts.
import * as Sentry from "@sentry/nextjs"
import { GLOTCHTIP_DSN, GLOTCHTIP_TRACES_SAMPLE_RATE } from "./lib/glitchtip"

Sentry.init({
  dsn: GLOTCHTIP_DSN,
  tracesSampleRate: GLOTCHTIP_TRACES_SAMPLE_RATE,
  environment: process.env.NODE_ENV,
  sendDefaultPii: false,
})
