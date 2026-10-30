// Store onboarding, credential management and settings.
import { getMerchantDb } from "../db"
import { toStoreDTO } from "../dto"
import { MerchantError, conflict, isUniqueViolation, notFound } from "../errors"
import type { MerchantStore } from "../types"
import {
  generateApiKey,
  generateWebhookSecret,
  isValidStoreDomain,
  normalizeStoreDomain,
  sha256,
} from "../utils"
import { connectStoreSchema, updateSettingsSchema } from "../validators"

const keyPrefix = (apiKey: string) => `${apiKey.slice(0, 13)}…`

export async function connectStore(input: unknown, owner?: { id: string; role: string } | null) {
  const data = connectStoreSchema.parse(input)
  const storeUrl = normalizeStoreDomain(data.storeUrl)
  if (!isValidStoreDomain(storeUrl)) {
    throw new MerchantError("Enter a valid store domain, e.g. yourstore.myshopify.com", 400, "INVALID_DOMAIN")
  }

  const db = await getMerchantDb()
  const existing = await db.merchantStore.findUnique({ where: { storeUrl } })
  if (existing) throw conflict("This store is already connected. Log in with your API key instead.")

  const apiKey = generateApiKey()
  const webhookSecret = data.webhookSecret || generateWebhookSecret()

  try {
    const store: MerchantStore = await db.merchantStore.create({
      data: {
        name: data.name,
        storeUrl,
        platform: "SHOPIFY",
        apiKeyHash: sha256(apiKey),
        apiKeyPrefix: keyPrefix(apiKey),
        webhookSecret,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        payoutDetails: data.payoutDetails,
        ownerId: owner?.id || null,
      },
    })

    // Connecting a store is the moment an account becomes a merchant.
    if (owner && owner.role !== "MERCHANT") {
      try {
        await db.user.update({ where: { id: owner.id }, data: { role: "MERCHANT" } })
      } catch (err) {
        console.warn("[MerchantConnect] Could not promote account to MERCHANT:", err)
      }
      // Keep the session payload in sync so role checks see the new role immediately.
      try {
        const { createSession } = await import("@/lib/auth")
        await createSession(owner.id, "MERCHANT")
      } catch (err) {
        console.warn("[MerchantConnect] Could not refresh session role:", err)
      }
    }

    // Plain-text credentials are returned exactly once; only the API key hash is persisted.
    return { store, dto: toStoreDTO(store), apiKey, webhookSecret }
  } catch (err) {
    if (isUniqueViolation(err)) throw conflict("This store is already connected. Log in with your API key instead.")
    throw err
  }
}

export async function authenticateApiKey(apiKey: string): Promise<MerchantStore | null> {
  const key = String(apiKey || "").trim()
  if (!key.startsWith("prk_")) return null
  const db = await getMerchantDb()
  return db.merchantStore.findUnique({ where: { apiKeyHash: sha256(key) } })
}

export async function getStoreById(id: string): Promise<MerchantStore | null> {
  if (!id) return null
  const db = await getMerchantDb()
  return db.merchantStore.findUnique({ where: { id } })
}

export async function findStoreByDomain(domain: string): Promise<MerchantStore | null> {
  const storeUrl = normalizeStoreDomain(domain)
  if (!storeUrl) return null
  const db = await getMerchantDb()
  return db.merchantStore.findUnique({ where: { storeUrl } })
}

export async function updateStoreSettings(store: MerchantStore, input: unknown) {
  const data = updateSettingsSchema.parse(input)
  if (data.webhookSecret && data.regenerateWebhookSecret) {
    throw new MerchantError("Either paste a signing secret or regenerate one, not both")
  }

  const patch: Record<string, unknown> = {}
  if (data.name !== undefined) patch.name = data.name
  if (data.contactEmail !== undefined) patch.contactEmail = data.contactEmail
  if (data.contactPhone !== undefined) patch.contactPhone = data.contactPhone
  if (data.payoutDetails !== undefined) patch.payoutDetails = data.payoutDetails

  let revealedSecret: string | null = null
  if (data.webhookSecret) {
    patch.webhookSecret = data.webhookSecret
  } else if (data.regenerateWebhookSecret) {
    revealedSecret = generateWebhookSecret()
    patch.webhookSecret = revealedSecret
  }

  if (Object.keys(patch).length === 0) return { store, dto: toStoreDTO(store), webhookSecret: null }

  const db = await getMerchantDb()
  const updated: MerchantStore = await db.merchantStore.update({ where: { id: store.id }, data: patch })
  return { store: updated, dto: toStoreDTO(updated), webhookSecret: revealedSecret }
}

/** Issues a new API key; existing sessions bound to the old key stop working. */
export async function rotateApiKey(store: MerchantStore) {
  const apiKey = generateApiKey()
  const db = await getMerchantDb()
  const updated: MerchantStore = await db.merchantStore.update({
    where: { id: store.id },
    data: { apiKeyHash: sha256(apiKey), apiKeyPrefix: keyPrefix(apiKey) },
  })
  return { store: updated, dto: toStoreDTO(updated), apiKey }
}

export async function setStoreStatus(storeId: string, status: "ACTIVE" | "PAUSED") {
  const db = await getMerchantDb()
  const store = await db.merchantStore.findUnique({ where: { id: storeId } })
  if (!store) throw notFound("Store")
  const updated: MerchantStore = await db.merchantStore.update({ where: { id: storeId }, data: { status } })
  return toStoreDTO(updated)
}
