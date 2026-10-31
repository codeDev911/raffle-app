// File-backed, Prisma-compatible data store for Merchant Connect.
//
// Used automatically when no real PostgreSQL database is configured (same dual-mode
// strategy as lib/prisma.ts + lib/listing-storage.ts). It implements the subset of the
// Prisma delegate API the merchant service relies on, including:
//   - unique constraints (throws { code: "P2002" } like Prisma)
//   - atomic { increment } / { decrement } updates and conditional updateMany
//   - serialized, all-or-nothing $transaction() with snapshot rollback
// so the service layer is written once against the Prisma API and behaves identically
// in both modes.
import fs from "fs"
import path from "path"
import crypto from "crypto"

type Row = Record<string, any>
type ModelName = "merchantStore" | "merchantCampaign" | "merchantEntry" | "merchantInvoice"
type State = Record<ModelName, Row[]>

interface ModelSpec {
  defaults: () => Row
  unique: string[][]
}

const DATE_FIELDS = [
  "createdAt",
  "updatedAt",
  "startDate",
  "endDate",
  "drawnAt",
  "submittedAt",
  "paidAt",
  "gatewayStartedAt",
]

const MODELS: Record<ModelName, ModelSpec> = {
  merchantStore: {
    defaults: () => ({ platform: "SHOPIFY", status: "ACTIVE", payoutDetails: null }),
    unique: [["storeUrl"], ["apiKeyHash"]],
  },
  merchantCampaign: {
    defaults: () => ({
      raffleId: null,
      ruleType: "MIN_QUANTITY",
      minQuantity: null,
      minAmount: null,
      productFilters: [],
      maxEntries: null,
      currentEntries: 0,
      status: "ACTIVE",
      startDate: new Date(),
      winnerEntryId: null,
      drawnAt: null,
    }),
    unique: [],
  },
  merchantEntry: {
    defaults: () => ({
      invoiceId: null,
      orderName: null,
      customerEmail: null,
      customerPhone: null,
      phoneNormalized: null,
      isTest: false,
      status: "ISSUED",
      cancelledReason: null,
    }),
    unique: [["ticketNumber"], ["campaignId", "shopifyOrderId"]],
  },
  merchantInvoice: {
    defaults: () => ({
      paymentMethod: null,
      paymentProof: null,
      transactionRef: null,
      adminNotes: null,
      status: "PENDING",
      submittedAt: null,
      paidAt: null,
      gatewayRef: null,
      gatewayAmount: null,
      checkoutUrl: null,
      gatewayStartedAt: null,
    }),
    unique: [["invoiceNumber"]],
  },
}

const PRIMARY_FILE = path.join(process.cwd(), "data", "merchant-connect.json")
const FALLBACK_FILE = path.join("/tmp", "pakraffle-merchant-connect.json")

const emptyState = (): State => ({ merchantStore: [], merchantCampaign: [], merchantEntry: [], merchantInvoice: [] })

function cuid(): string {
  return `c${Date.now().toString(36)}${crypto.randomBytes(8).toString("hex")}`
}

// ───────────────────────── where / data helpers ─────────────────────────

function comparable(v: any): any {
  return v instanceof Date ? v.getTime() : v
}

function matchField(actual: any, condition: any): boolean {
  if (condition === undefined) return true
  if (condition === null) return actual === null || actual === undefined
  if (typeof condition !== "object" || condition instanceof Date || Array.isArray(condition)) {
    return comparable(actual) === comparable(condition)
  }

  const insensitive = condition.mode === "insensitive"
  const a = comparable(actual)
  for (const [op, raw] of Object.entries(condition)) {
    if (op === "mode") continue
    const v = comparable(raw)
    switch (op) {
      case "equals":
        if (raw === null ? !(actual === null || actual === undefined) : a !== v) return false
        break
      case "not":
        if (raw === null ? actual === null || actual === undefined : a === v) return false
        break
      case "in":
        if (!(raw as any[]).map(comparable).includes(a)) return false
        break
      case "notIn":
        if ((raw as any[]).map(comparable).includes(a)) return false
        break
      case "lt":
        if (!(a < v)) return false
        break
      case "lte":
        if (!(a <= v)) return false
        break
      case "gt":
        if (!(a > v)) return false
        break
      case "gte":
        if (!(a >= v)) return false
        break
      case "contains": {
        const hay = String(actual ?? "")
        const needle = String(raw ?? "")
        if (insensitive ? !hay.toLowerCase().includes(needle.toLowerCase()) : !hay.includes(needle)) return false
        break
      }
      case "has":
        if (!Array.isArray(actual) || !actual.includes(raw)) return false
        break
      default:
        throw new Error(`[MerchantFileDb] Unsupported filter operator "${op}"`)
    }
  }
  return true
}

function matchesWhere(row: Row, where?: Row): boolean {
  if (!where) return true
  for (const [key, cond] of Object.entries(where)) {
    if (cond === undefined) continue
    if (key === "OR") {
      if (!(cond as Row[]).some((w) => matchesWhere(row, w))) return false
    } else if (key === "AND") {
      if (!(cond as Row[]).every((w) => matchesWhere(row, w))) return false
    } else if (key === "NOT") {
      if (matchesWhere(row, cond)) return false
    } else if (!matchField(row[key], cond)) {
      return false
    }
  }
  return true
}

function applyData(row: Row, data: Row): Row {
  const next = { ...row }
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue
    if (value && typeof value === "object" && !(value instanceof Date) && !Array.isArray(value)) {
      if ("increment" in value) next[key] = (Number(next[key]) || 0) + Number(value.increment)
      else if ("decrement" in value) next[key] = (Number(next[key]) || 0) - Number(value.decrement)
      else if ("set" in value) next[key] = value.set
      else next[key] = value
    } else {
      next[key] = value
    }
  }
  next.updatedAt = new Date()
  return next
}

function sortRows(rows: Row[], orderBy?: Row | Row[]): Row[] {
  if (!orderBy) return rows
  const clauses = (Array.isArray(orderBy) ? orderBy : [orderBy]).flatMap((o) => Object.entries(o))
  return [...rows].sort((x, y) => {
    for (const [field, dir] of clauses) {
      const a = comparable(x[field])
      const b = comparable(y[field])
      if (a === b) continue
      const cmp = a === null || a === undefined ? -1 : b === null || b === undefined ? 1 : a < b ? -1 : 1
      return dir === "desc" ? -cmp : cmp
    }
    return 0
  })
}

function uniqueViolation(model: ModelName, fields: string[]): Error {
  const err: any = new Error(`Unique constraint failed on ${model} (${fields.join(", ")})`)
  err.code = "P2002"
  err.meta = { target: fields }
  return err
}

function notFoundError(model: ModelName): Error {
  const err: any = new Error(`No ${model} record found for update`)
  err.code = "P2025"
  return err
}

// ───────────────────────── persistence ─────────────────────────

class Mutex {
  private tail: Promise<unknown> = Promise.resolve()
  run<T>(fn: () => Promise<T> | T): Promise<T> {
    const result = this.tail.then(fn)
    this.tail = result.then(
      () => undefined,
      () => undefined,
    )
    return result
  }
}

class FileStore {
  state: State = emptyState()
  private loadedMtime = -1
  private filePath = PRIMARY_FILE
  readonly lock = new Mutex()

  constructor() {
    try {
      fs.mkdirSync(path.dirname(PRIMARY_FILE), { recursive: true })
    } catch {
      this.filePath = FALLBACK_FILE
    }
  }

  /** Reloads from disk when another worker/process has written since our last read. */
  refresh() {
    try {
      if (!fs.existsSync(this.filePath)) return
      const mtime = fs.statSync(this.filePath).mtimeMs
      if (mtime === this.loadedMtime) return
      const parsed = JSON.parse(fs.readFileSync(this.filePath, "utf-8"))
      const next = emptyState()
      for (const model of Object.keys(next) as ModelName[]) {
        next[model] = Array.isArray(parsed?.[model])
          ? parsed[model].map((row: Row) => {
              const revived = { ...row }
              for (const f of DATE_FIELDS) if (revived[f]) revived[f] = new Date(revived[f])
              return revived
            })
          : []
      }
      this.state = next
      this.loadedMtime = mtime
    } catch (err) {
      console.warn("[MerchantFileDb] Failed to read store file, keeping in-memory state:", err)
    }
  }

  persist() {
    const body = JSON.stringify(this.state, null, 2)
    for (const file of [this.filePath, FALLBACK_FILE]) {
      try {
        fs.writeFileSync(file, body, "utf-8")
        this.filePath = file
        this.loadedMtime = fs.statSync(file).mtimeMs
        return
      } catch (err) {
        console.warn(`[MerchantFileDb] Failed to write ${file}:`, err)
      }
    }
  }
}

// ───────────────────────── Prisma-like delegates ─────────────────────────

function createDelegate(store: FileStore, model: ModelName, inTransaction: boolean) {
  const spec = MODELS[model]
  const rows = () => store.state[model]

  const assertUnique = (candidate: Row, ignoreId?: string) => {
    for (const fields of spec.unique) {
      if (fields.some((f) => candidate[f] === null || candidate[f] === undefined)) continue
      const clash = rows().some(
        (r) => r.id !== ignoreId && fields.every((f) => comparable(r[f]) === comparable(candidate[f])),
      )
      if (clash) throw uniqueViolation(model, fields)
    }
  }

  // Root-level calls are serialized through the store mutex and persisted immediately;
  // calls made inside $transaction run directly and are persisted on commit.
  const runOp = <T>(write: boolean, fn: () => T): Promise<T> => {
    if (inTransaction) return Promise.resolve().then(() => structuredClone(fn()))
    return store.lock.run(() => {
      store.refresh()
      const snapshot = write ? structuredClone(store.state) : null
      try {
        const result = fn()
        if (write) store.persist()
        return structuredClone(result)
      } catch (err) {
        if (snapshot) store.state = snapshot
        throw err
      }
    })
  }

  return {
    findUnique: (args: { where: Row }) => runOp(false, () => rows().find((r) => matchesWhere(r, args.where)) ?? null),
    findFirst: (args: { where?: Row; orderBy?: Row | Row[] } = {}) =>
      runOp(false, () => sortRows(rows().filter((r) => matchesWhere(r, args.where)), args.orderBy)[0] ?? null),
    findMany: (args: { where?: Row; orderBy?: Row | Row[]; take?: number; skip?: number } = {}) =>
      runOp(false, () => {
        const sorted = sortRows(rows().filter((r) => matchesWhere(r, args.where)), args.orderBy)
        const start = args.skip ?? 0
        return args.take !== undefined ? sorted.slice(start, start + args.take) : sorted.slice(start)
      }),
    count: (args: { where?: Row } = {}) => runOp(false, () => rows().filter((r) => matchesWhere(r, args.where)).length),
    create: (args: { data: Row }) =>
      runOp(true, () => {
        const now = new Date()
        const row: Row = { id: cuid(), ...spec.defaults(), createdAt: now, updatedAt: now }
        for (const [k, v] of Object.entries(args.data)) if (v !== undefined) row[k] = v
        assertUnique(row)
        rows().push(row)
        return row
      }),
    update: (args: { where: Row; data: Row }) =>
      runOp(true, () => {
        const idx = rows().findIndex((r) => matchesWhere(r, args.where))
        if (idx === -1) throw notFoundError(model)
        const next = applyData(rows()[idx], args.data)
        assertUnique(next, next.id)
        rows()[idx] = next
        return next
      }),
    updateMany: (args: { where?: Row; data: Row }) =>
      runOp(true, () => {
        let count = 0
        store.state[model] = rows().map((r) => {
          if (!matchesWhere(r, args.where)) return r
          count++
          return applyData(r, args.data)
        })
        return { count }
      }),
    deleteMany: (args: { where?: Row } = {}) =>
      runOp(true, () => {
        const before = rows().length
        store.state[model] = rows().filter((r) => !matchesWhere(r, args.where))
        return { count: before - store.state[model].length }
      }),
  }
}

export type MerchantFileDb = ReturnType<typeof createFileDb>

function createClient(store: FileStore, inTransaction: boolean) {
  return {
    merchantStore: createDelegate(store, "merchantStore", inTransaction),
    merchantCampaign: createDelegate(store, "merchantCampaign", inTransaction),
    merchantEntry: createDelegate(store, "merchantEntry", inTransaction),
    merchantInvoice: createDelegate(store, "merchantInvoice", inTransaction),
  }
}

function createFileDb(store: FileStore) {
  const txClient = createClient(store, true)
  return {
    ...createClient(store, false),
    /** All-or-nothing: state is restored from a snapshot if the callback throws. */
    $transaction: <T>(fn: (tx: typeof txClient) => Promise<T>): Promise<T> =>
      store.lock.run(async () => {
        store.refresh()
        const snapshot = structuredClone(store.state)
        try {
          const result = await fn(txClient)
          store.persist()
          return result
        } catch (err) {
          store.state = snapshot
          throw err
        }
      }),
  }
}

const globalForFileDb = globalThis as unknown as { merchantFileDb?: MerchantFileDb }

export function getMerchantFileDb(): MerchantFileDb {
  if (!globalForFileDb.merchantFileDb) {
    globalForFileDb.merchantFileDb = createFileDb(new FileStore())
  }
  return globalForFileDb.merchantFileDb
}
