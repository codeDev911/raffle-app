// Data-source resolver for Merchant Connect.
// Real PostgreSQL (via the shared Prisma client) when DATABASE_URL is configured and the
// merchant tables exist; otherwise the file-backed Prisma-compatible store. The choice is
// made once per process so reads and writes never split across two backends.
import { prisma, isUsingRealDatabase } from "@/lib/prisma"
import { getMerchantFileDb } from "./file-db"
import { isSchemaMissing } from "./errors"

export type MerchantDb = any

const globalForMerchantDb = globalThis as unknown as {
  merchantDbResolution?: Promise<{ db: MerchantDb; mode: "postgres" | "file" }>
}

async function resolve(): Promise<{ db: MerchantDb; mode: "postgres" | "file" }> {
  if (isUsingRealDatabase()) {
    const client = prisma as any
    if (client.merchantStore && typeof client.$transaction === "function") {
      try {
        await client.merchantStore.count()
        return { db: client, mode: "postgres" }
      } catch (err) {
        if (!isSchemaMissing(err)) {
          // Transient connection problems must not silently split data across two backends.
          console.error("[MerchantConnect] PostgreSQL health check failed; staying on PostgreSQL:", err)
          return { db: client, mode: "postgres" }
        }
        console.warn(
          "[MerchantConnect] Merchant tables are missing in PostgreSQL. Run `npx prisma db push`. Using file store until then.",
        )
      }
    } else {
      console.warn("[MerchantConnect] Prisma client has no merchant models. Run `npx prisma generate`. Using file store.")
    }
  }
  return { db: getMerchantFileDb(), mode: "file" }
}

export async function getMerchantDb(): Promise<MerchantDb> {
  if (!globalForMerchantDb.merchantDbResolution) {
    globalForMerchantDb.merchantDbResolution = resolve()
  }
  return (await globalForMerchantDb.merchantDbResolution).db
}

export async function getMerchantDbMode(): Promise<"postgres" | "file"> {
  await getMerchantDb()
  return (await globalForMerchantDb.merchantDbResolution!).mode
}
