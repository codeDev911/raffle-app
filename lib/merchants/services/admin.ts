// PakRaffle admin operations: settlement review and campaign draws.
import crypto from "crypto"
import { getMerchantDb, type MerchantDb } from "../db"
import { toEntryDTO, toInvoiceDTO, toStoreDTO } from "../dto"
import { MerchantError, conflict, notFound } from "../errors"
import type { MerchantCampaign, MerchantEntry, MerchantInvoice, MerchantStore } from "../types"
import { adminReviewInvoiceSchema, adminStoreStatusSchema } from "../validators"
import { decorateCampaigns } from "./campaigns"
import { setStoreStatus } from "./stores"

export async function adminOverview() {
  const db = await getMerchantDb()
  const [stores, campaigns, invoices] = (await Promise.all([
    db.merchantStore.findMany({ orderBy: { createdAt: "desc" } }),
    db.merchantCampaign.findMany({ orderBy: { createdAt: "desc" } }),
    db.merchantInvoice.findMany({ orderBy: { createdAt: "desc" } }),
  ])) as [MerchantStore[], MerchantCampaign[], MerchantInvoice[]]

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

/** Approve: invoice PAID, its tickets PAID, campaign DRAW_READY. Reject: back to PENDING with a note. */
export async function adminReviewInvoice(invoiceId: string, input: unknown) {
  const data = adminReviewInvoiceSchema.parse(input)
  const db = await getMerchantDb()

  await db.$transaction(async (tx: MerchantDb) => {
    const invoice: MerchantInvoice | null = await tx.merchantInvoice.findUnique({ where: { id: invoiceId } })
    if (!invoice) throw notFound("Invoice")

    if (data.action === "reject") {
      const { count } = await tx.merchantInvoice.updateMany({
        where: { id: invoice.id, status: "UNDER_REVIEW" },
        data: { status: "PENDING", adminNotes: data.adminNotes },
      })
      if (count === 0) throw conflict("Only invoices under review can be rejected")
      return
    }

    // Admins may also approve a PENDING invoice when payment was confirmed out-of-band.
    const { count } = await tx.merchantInvoice.updateMany({
      where: { id: invoice.id, status: { in: ["PENDING", "UNDER_REVIEW"] } },
      data: { status: "PAID", paidAt: new Date(), adminNotes: data.adminNotes },
    })
    if (count === 0) throw conflict("This invoice has already been settled")

    await tx.merchantEntry.updateMany({
      where: { invoiceId: invoice.id, status: "INVOICED" },
      data: { status: "PAID" },
    })
    await tx.merchantCampaign.updateMany({
      where: { id: invoice.campaignId, status: "PENDING_INVOICE" },
      data: { status: "DRAW_READY" },
    })
  })

  const invoice: MerchantInvoice = await db.merchantInvoice.findUnique({ where: { id: invoiceId } })
  return toInvoiceDTO(invoice)
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
