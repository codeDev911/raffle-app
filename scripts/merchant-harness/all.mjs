// Runs both Merchant Connect suites and exits non-zero on any failure.
await import("./pure-logic.mjs")
await import("./lifecycle.mjs")

const { summary, failureCount } = await import("./_util.mjs")
summary()
if (failureCount() > 0) process.exitCode = 1
