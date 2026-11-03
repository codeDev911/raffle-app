// PakRaffle admin operations: campaign draws and store governance.
// Payment confirmation is NOT handled here — merchant payments land in Admin → Payments
// and are confirmed there, which then settles the matching tickets.
import crypto from "crypto"
import { getMerchantDb, type MerchantDb } from "../db"
import { toEntryDTO, toInvoiceDTO, toStoreDTO } from "../dto"
import { MerchantError, conflict, notFound } from "../errors"
import type { MerchantCampaign, MerchantEntry, MerchantInvoice, MerchantStore } from "../types"
import { adminCampaignStatusSchema, adminInvoiceNoteSchema, adminStoreStatusSchema } from "../validators"
import { decorateCampaigns } from "./campaigns"
import { invoiceCheckoutOpen } from "./checkout"
import { ticketPaymentStatuses } from "./entry-payments"
import { getInvoiceDetail } from "./invoices"
import { setStoreStatus, updateStoreSettings } from "./stores"
import { z } from "zod"

export async function adminOverview() {
  const db = await getMerchantDb()
  const [stores, campaigns, invoices] = (await Promise.all([
    db.merchantStore.findMany({ orderBy: { createdAt: "desc" } }),
    db.merchantCampaign.findMany({ orderBy: { createdAt: "desc" } }),
    db.merchantInvoice.findMany({ orderBy: { createdAt: "desc" } }),
  ])) as [MerchantStore[], MerchantCampaign[], MerchantInvoice[]]

  // Owner accounts, so the stores tab can show suspend state without a second round-trip.
  // The file-backed store has no user model, so owner info is simply absent there.
  const ownerIds = stores.map((s) => s.ownerId).filter((id): id is string => Boolean(id))
  const owners: Array<{ id: string; name: string | null; email: string; isActive: boolean }> =
    db.user && ownerIds.length ? await db.user.findMany({ where: { id: { in: ownerIds } } }) : []
  const ownerById = new Map(owners.map((u) => [u.id, u]))

  const storeNames = new Map(stores.map((s) => [s.id, s.name]))
  const campaignTitles = new Map(campaigns.map((c) => [c.id, c.title]))
  const decorated = await decorateCampaigns(campaigns)

  const winnerIds = campaigns.map((c) => c.winnerEntryId).filter((id): id is string => Boolean(id))
  const winners: MerchantEntry[] = winnerIds.length
    ? await db.merchantEntry.findMany({ where: { id: { in: winnerIds } } })
    : []
  const winnerById = new Map(winners.map((w) => [w.id, toEntryDTO(w)]))

  const sum = (list: MerchantInvoice[]) => list.reduce((acc, i) => acc + i.amountDue, 0)
  const paid = invoices.filter((i) => i.status === "PAID")
  const underReview = invoices.filter((i) => i.status === "UNDER_REVIEW")
  const pending = invoices.filter((i) => i.status === "PENDING")

  return {
    stats: {
      stores: stores.length,
      activeStores: stores.filter((s) => s.status === "ACTIVE").length,
      activeCampaigns: campaigns.filter((c) => c.status === "ACTIVE").length,
      drawReady: campaigns.filter((c) => c.status === "DRAW_READY").length,
      issuedEntries: campaigns.reduce((acc, c) => acc + c.currentEntries, 0),
      revenueCollected: sum(paid),
      awaitingReview: underReview.length,
      awaitingReviewAmount: sum(underReview),
      outstandingAmount: sum(pending),
    },
    stores: stores.map((s) => ({
      ...toStoreDTO(s),
      campaigns: campaigns.filter((c) => c.storeId === s.id).length,
      owner: s.ownerId
        ? (() => {
            const u = ownerById.get(s.ownerId!)
            return u ? { id: u.id, name: u.name, email: u.email, isActive: u.isActive } : null
          })()
        : null,
    })),
    campaigns: decorated.map((c) => ({
      ...c,
      storeName: storeNames.get(c.storeId) ?? "Unknown store",
      winner: c.winnerEntryId ? winnerById.get(c.winnerEntryId) ?? null : null,
    })),
    invoices: invoices.map((i) =>
      toInvoiceDTO(i, { campaignTitle: campaignTitles.get(i.campaignId), storeName: storeNames.get(i.storeId) }),
    ),
  }
}

/** Picks one winner uniformly at random (CSPRNG) from the campaign's paid, non-test tickets. */
export async function adminExecuteDraw(campaignId: string) {
  const db = await getMerchantDb()

  const winner: MerchantEntry = await db.$transaction(async (tx: MerchantDb) => {
    const campaign: MerchantCampaign | null = await tx.merchantCampaign.findUnique({ where: { id: campaignId } })
    if (!campaign) throw notFound("Campaign")
    if (campaign.status === "COMPLETED") throw conflict("The draw for this campaign has already been executed")
    if (campaign.status !== "DRAW_READY") throw conflict("Settle the campaign invoice before running the draw")

    const pool: MerchantEntry[] = await tx.merchantEntry.findMany({
      where: { campaignId: campaign.id, status: "PAID", isTest: false },
      orderBy: [{ createdAt: "asc" }, { ticketNumber: "asc" }],
    })
    if (pool.length === 0) throw new MerchantError("No paid entries are eligible for this draw", 400, "EMPTY_POOL")

    const picked = pool[crypto.randomInt(pool.length)]
    const { count } = await tx.merchantCampaign.updateMany({
      where: { id: campaign.id, status: "DRAW_READY" },
      data: { status: "COMPLETED", winnerEntryId: picked.id, drawnAt: new Date() },
    })
    if (count === 0) throw conflict("The draw for this campaign has already been executed")
    return picked
  })

  return { winner: toEntryDTO(winner) }
}

export async function adminUpdateStoreStatus(storeId: string, input: unknown) {
  const { status } = adminStoreStatusSchema.parse(input)
  return setStoreStatus(storeId, status)
}

export async function adminUpdateStoreSettings(storeId: string, input: unknown) {
  const db = await getMerchantDb()
  const store = await db.merchantStore.findUnique({ where: { id: storeId } })
  if (!store) throw notFound("Store")
  const { store: updated, dto } = await updateStoreSettings(store, input)
  return dto
}

export async function adminUpdateUserStatus(userId: string, input: unknown) {
  const db = await getMerchantDb()
  if (!db.user) throw new MerchantError("Account suspension requires the PostgreSQL database", 501, "USER_STORE_UNAVAILABLE")
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) throw notFound("User account")
  const { isActive } = z.object({ isActive: z.boolean() }).parse(input)
  const updated = await db.user.update({ where: { id: userId }, data: { isActive } })
  return { id: updated.id, email: updated.email, name: updated.name, role: updated.role, isActive: updated.isActive }
}

export async function adminGetStoreDetail(storeId: string) {
  const db = await getMerchantDb()
  const store = await db.merchantStore.findUnique({ where: { id: storeId } })
  if (!store) throw notFound("Store")
  const owner = store.ownerId && db.user ? await db.user.findUnique({ where: { id: store.ownerId } }) : null

  const campaigns: MerchantCampaign[] = await db.merchantCampaign.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
  })
  const invoices: MerchantInvoice[] = await db.merchantInvoice.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
  })
  const decorated = await decorateCampaigns(campaigns)
  const paid = invoices.filter((i) => i.status === "PAID")

  return {
    store: toStoreDTO(store),
    owner: owner
      ? { id: owner.id, email: owner.email, name: owner.name, role: owner.role, isActive: owner.isActive }
      : null,
    campaigns: decorated,
    invoices: invoices.map((i) =>
      toInvoiceDTO(i, { campaignTitle: campaigns.find((c) => c.id === i.campaignId)?.title }),
    ),
    stats: {
      campaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c) => c.status === "ACTIVE").length,
      tickets: campaigns.reduce((acc, c) => acc + c.currentEntries, 0),
      revenueCollected: paid.reduce((acc, i) => acc + i.amountDue, 0),
      outstanding: invoices
        .filter((i) => i.status !== "PAID")
        .reduce((acc, i) => acc + i.amountDue, 0),
    },
  }
}

/**
 * Full campaign record for the admin detail page: rule, prize, every ledger line, the invoices
 * raised against it and the winner. The whole entry set is read because the numbers on this page
 * are the ones an operator acts on — a capped sample would misreport the pool.
 */
export async function adminGetCampaignDetail(campaignId: string) {
  const db = await getMerchantDb()

  const found: MerchantCampaign | null = await db.merchantCampaign.findUnique({ where: { id: campaignId } })
  if (!found) throw notFound("Campaign")
  const campaign = found

  const [store, invoiceRows, entryRows] = (await Promise.all([
    db.merchantStore.findUnique({ where: { id: campaign.storeId } }),
    db.merchantInvoice.findMany({ where: { campaignId }, orderBy: { createdAt: "desc" } }),
    db.merchantEntry.findMany({ where: { campaignId }, orderBy: { createdAt: "desc" } }),
  ])) as [MerchantStore | null, MerchantInvoice[], MerchantEntry[]]

  const [campaignDto] = await decorateCampaigns([campaign])

  const payments = await ticketPaymentStatuses(entryRows.map((entry) => entry.ticketNumber))
  const paymentState = (ticketNumber: string) => payments.get(ticketNumber) ?? null
  const rejected = (ticketNumber: string) => ["FAILED", "REFUNDED"].includes(String(paymentState(ticketNumber)))

  const winner: MerchantEntry | null = campaign.winnerEntryId
    ? ((await db.merchantEntry.findUnique({ where: { id: campaign.winnerEntryId } })) as MerchantEntry | null)
    : null

  // "Live" tickets are every non-test, non-cancelled entry — the lifetime billing base.
  // campaign.billableEntries from the decorator means something narrower (unbilled only), so the
  // two are named apart to stop an operator reading Rs 0 as "nothing to pay".
  const liveTickets = entryRows.filter((e) => !e.isTest && e.status !== "CANCELLED")

  return {
    campaign: { ...campaignDto, storeName: store?.name ?? "Unknown store" },
    store: store ? toStoreDTO(store) : null,
    winner: winner ? toEntryDTO(winner) : null,
    entries: entryRows.map((entry) => toEntryDTO(entry, { paymentStatus: paymentState(entry.ticketNumber) })),
    invoices: invoiceRows.map((invoice) =>
      toInvoiceDTO(invoice, {
        campaignTitle: campaign.title,
        storeName: store?.name,
        paymentFailed: entryRows.some((e) => e.invoiceId === invoice.id && rejected(e.ticketNumber)),
        checkoutOpen: invoiceCheckoutOpen(invoice),
      }),
    ),
    ledger: {
      total: entryRows.length,
      paid: entryRows.filter((e) => e.status === "PAID").length,
      invoiced: entryRows.filter((e) => e.status === "INVOICED").length,
      issued: entryRows.filter((e) => e.status === "ISSUED").length,
      cancelled: entryRows.filter((e) => e.status === "CANCELLED").length,
      test: entryRows.filter((e) => e.isTest).length,
      live: liveTickets.length,
      liveAmount: liveTickets.length * campaign.ticketPrice,
      paymentRejected: entryRows.filter((e) => rejected(e.ticketNumber)).length,
      drawPool: entryRows.filter((e) => e.status === "PAID" && !e.isTest).length,
    },
  }
}

/**
 * Pause or resume minting. Everything past the minting stage is deliberately locked: an invoice
 * already raised, a draw already armed or a completed campaign must be resolved through
 * settlement and the draw, not by flipping the status back to ACTIVE.
 */
export async function adminUpdateCampaignStatus(campaignId: string, input: unknown) {
  const { status } = adminCampaignStatusSchema.parse(input)
  const db = await getMerchantDb()

  const found: MerchantCampaign | null = await db.merchantCampaign.findUnique({ where: { id: campaignId } })
  if (!found) throw notFound("Campaign")

  const lockedStages = ["PENDING_INVOICE", "DRAW_READY", "COMPLETED"]
  if (lockedStages.includes(found.status)) {
    throw conflict(`This campaign is already ${found.status.toLowerCase().replace(/_/g, " ")}`)
  }
  if (found.status === status) return (await decorateCampaigns([found]))[0]

  const updated: MerchantCampaign = await db.merchantCampaign.update({ where: { id: campaignId }, data: { status } })
  return (await decorateCampaigns([updated]))[0]
}

/** Settlement detail: the invoice, its ledger lines, the campaign behind it and the store. */
export async function adminGetInvoiceDetail(invoiceId: string) {
  const db = await getMerchantDb()
  const detail = await getInvoiceDetail(invoiceId)

  const campaign: MerchantCampaign | null = await db.merchantCampaign.findUnique({
    where: { id: detail.invoice.campaignId },
  })
  const [campaignDto] = campaign ? await decorateCampaigns([campaign]) : [null]

  const store: MerchantStore | null = await db.merchantStore.findUnique({ where: { id: detail.invoice.storeId } })

  return {
    ...detail,
    store: store ? toStoreDTO(store) : detail.store,
    campaign: campaignDto ? { ...campaignDto, storeName: store?.name ?? null } : null,
  }
}

/** Record (or clear) the operator note attached to a settlement. Never touches money or status. */
export async function adminUpdateInvoiceNotes(invoiceId: string, input: unknown) {
  const { adminNotes } = adminInvoiceNoteSchema.parse(input)
  const db = await getMerchantDb()

  const found: MerchantInvoice | null = await db.merchantInvoice.findUnique({ where: { id: invoiceId } })
  if (!found) throw notFound("Invoice")

  const updated: MerchantInvoice = await db.merchantInvoice.update({
    where: { id: invoiceId },
    data: { adminNotes },
  })
  const campaign: MerchantCampaign | null = await db.merchantCampaign.findUnique({ where: { id: updated.campaignId } })
  const store: MerchantStore | null = await db.merchantStore.findUnique({ where: { id: updated.storeId } })

  return toInvoiceDTO(updated, {
    campaignTitle: campaign?.title,
    storeName: store?.name,
    checkoutOpen: invoiceCheckoutOpen(updated),
  })
}
