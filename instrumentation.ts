// Next.js boot hook. On Next 14 this only runs while experimental.instrumentationHook is on
// (see next.config.mjs); it became unflagged in Next 15.
//
// A monitoring SDK must never be able to take the app down, so each import is guarded: if the
// SDK fails to initialise, the site still serves traffic and the failure is logged.
export async function register() {
  try {
    if (process.env.NEXT_RUNTIME === "nodejs") {
      await import("./sentry.server.config")
    }
    if (process.env.NEXT_RUNTIME === "edge") {
      await import("./sentry.edge.config")
    }
  } catch (err) {
    console.error("[GlitchTip] SDK failed to initialise:", err)
  }
}
