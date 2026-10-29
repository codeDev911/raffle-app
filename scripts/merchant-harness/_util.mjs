// Merchant Connect verification harness.
// Runs the real service layer against the file-backed Prisma-compatible store:
//   node --experimental-strip-types --import ./scripts/merchant-harness/register.mjs scripts/merchant-harness/all.mjs

let passed = 0
const failures = []

export function check(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(
      () => {
        passed++
        console.log(`  ok   ${name}`)
      },
      (err) => {
        failures.push({ name, err })
        console.log(`  FAIL ${name}\n       ${err.message}`)
      },
    )
}

export function failureCount() {
  return failures.length
}

export function summary() {
  console.log(`\n${passed} passed · ${failures.length} failed`)
  if (failures.length > 0) {
    for (const f of failures) console.error(`\n${f.name}\n${f.err?.stack}`)
    process.exitCode = 1
  }
}
