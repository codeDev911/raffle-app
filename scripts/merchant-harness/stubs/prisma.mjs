// Stub of @/lib/prisma for the node harness: forces the file-backed merchant store and adds an
// in-memory ledger for the main-app tables the per-ticket settlement path writes to.
const raffleRow = (id) => ({
  id,
  title: "iPhone 16 Pro Max",
  image: null,
  category: "Electronics",
  realPrice: 45000000, // paisa → Rs. 450,000 prize value
  price: 50000, // paisa → Rs. 500 per ticket
  endDate: new Date(Date.now() + 20 * 24 * 3600 * 1000),
  status: "ACTIVE",
})

const raffleStore = {
  findMany: async () => [raffleRow("prize-1")],
  findUnique: async ({ where }) => raffleRow(where.id),
}

// ── tiny Prisma-alike for user / payment / entry ──
let seq = 0
const nextId = (prefix) => `${prefix}_${++seq}`

function matches(row, where = {}) {
  return Object.entries(where).every(([key, value]) => {
    const actual = row[key]
    if (value && typeof value === "object" && !(value instanceof Date)) {
      if ("in" in value) return Array.isArray(value.in) && value.in.includes(actual)
      if ("not" in value) return actual !== value.not
    }
    return actual === value
  })
}

function makeStore(prefix, defaults = {}) {
  const rows = []
  return {
    rows,
    findUnique: async ({ where }) => rows.find((row) => matches(row, where)) ?? null,
    findFirst: async ({ where } = {}) => rows.find((row) => matches(row, where)) ?? null,
    findMany: async ({ where } = {}) => rows.filter((row) => matches(row, where)),
    count: async ({ where } = {}) => rows.filter((row) => matches(row, where)).length,
    create: async ({ data }) => {
      const row = { id: nextId(prefix), createdAt: new Date(), updatedAt: new Date(), ...defaults, ...data }
      rows.push(row)
      return row
    },
    update: async ({ where, data }) => {
      const row = rows.find((r) => matches(r, where))
      if (!row) throw new Error(`${prefix} not found`)
      Object.assign(row, data, { updatedAt: new Date() })
      return row
    },
    updateMany: async ({ where, data }) => {
      const hit = rows.filter((r) => matches(r, where))
      for (const row of hit) Object.assign(row, data, { updatedAt: new Date() })
      return { count: hit.length }
    },
  }
}

export const users = makeStore("usr")
export const payments = makeStore("pay", { currency: "PKR", status: "PENDING" })
export const entries = makeStore("ent")

// Mock-mode parity: entry.create bumps the raffle counter (Postgres would not — real mode
// increments explicitly in settleMerchantPayment).
export const mockPrisma = { raffle: raffleStore, user: users, payment: payments, entry: entries }

// The settlement path goes through the primary client even in file mode.
export const prisma = { raffle: raffleStore, user: users, payment: payments, entry: entries }

export const isUsingRealDatabase = () => false

/** Test helper: clear the in-memory ledger between scenarios. */
export function __resetLedger() {
  users.rows.length = 0
  payments.rows.length = 0
  entries.rows.length = 0
}
