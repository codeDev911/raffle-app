// Edge runtime. The app has no middleware today, but instrumentation.ts imports this file
// whenever NEXT_RUNTIME is "edge" — leaving it out would throw at startup the day one is added.
import * as Sentry from "@sentry/nextjs"
import { GLOTCHTIP_DSN, GLOTCHTIP_TRACES_SAMPLE_RATE } from "./lib/glitchtip"

Sentry.init({
  dsn: GLOTCHTIP_DSN,
  tracesSampleRate: GLOTCHTIP_TRACES_SAMPLE_RATE,
  environment: process.env.NODE_ENV,
  sendDefaultPii: false,
})
