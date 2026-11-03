// Browser-side error reporting. This file is picked up automatically by the Sentry build
// plugin (see withSentryConfig in next.config.mjs) and injected into the client bundle —
// nothing in the app has to import it.
import * as Sentry from "@sentry/nextjs"
import { GLOTCHTIP_DSN, GLOTCHTIP_TRACES_SAMPLE_RATE, GLOTCHTIP_TUNNEL_ROUTE } from "./lib/glitchtip"

Sentry.init({
  dsn: GLOTCHTIP_DSN,
  tracesSampleRate: GLOTCHTIP_TRACES_SAMPLE_RATE,
  environment: process.env.NODE_ENV,

  // Events are relayed through our own origin (app/api/glitchtip-tunnel). Browser extensions
  // that block trackers kill app.glitchtip.com requests outright, which would mean quietly
  // losing the very errors we are trying to see.
  tunnel: GLOTCHTIP_TUNNEL_ROUTE,

  // Nothing identifying is attached unless a call asks for it explicitly.
  sendDefaultPii: false,

  // Noise this site generates by design and that we cannot fix in our own code: injected
  // extension/adbusting scripts and the carousel's benign layout warnings.
  ignoreErrors: [
    /chrome-extension:\/\//i,
    /webstore-extension:\/\//i,
    /top\.google\.com/i,
    /pagead|doubleclick|googlesyndication/i,
    /ResizeObserver loop/i,
  ],
})
