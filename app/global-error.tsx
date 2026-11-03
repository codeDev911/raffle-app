"use client"

// Root-level crash screen. Next renders this only when a failure escapes every route segment,
// and because it replaces the whole document it must supply its own <html> and <body>.
//
// Styling is inline on purpose: if the stylesheet, theme provider or a shared component is what
// broke, a screen built from them would fail too and the visitor would get a blank page.
import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // @sentry/nextjs v10 no longer wraps this file at build time, so the render crash has to be
    // reported here. `handled: false` is what marks it as an unhandled error in GlitchTip.
    Sentry.captureException(error, { mechanism: { handled: false, type: "global-error" } })
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          color: "#0f172a",
          fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif",
        }}
      >
        <main style={{ maxWidth: "30rem", padding: "2.5rem 1.5rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#dc2626", fontWeight: 700, margin: 0 }}>
            PakRaffle
          </p>
          <h1 style={{ fontSize: "1.5rem", lineHeight: 1.3, margin: "0.75rem 0 0.5rem" }}>Something went wrong on our side</h1>
          <p style={{ fontSize: "0.9375rem", lineHeight: 1.6, color: "#475569", margin: 0 }}>
            The problem has been reported to the team. Reloading usually clears it — your entries and
            tickets are untouched.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "1.75rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                background: "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: "0.75rem",
                padding: "0.7rem 1.25rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                border: "1px solid #cbd5e1",
                borderRadius: "0.75rem",
                padding: "0.7rem 1.25rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#0f172a",
                textDecoration: "none",
                background: "#fff",
              }}
            >
              Back to the draws
            </a>
          </div>
        </main>
      </body>
    </html>
  )
}
