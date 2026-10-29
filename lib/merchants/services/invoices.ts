// Batch invoice settlement: close a campaign, bill its fulfilled entries, collect payment proof.
// Submitting the batch opens one PakRaffle payment per customer ticket, so the batch is verified
// from /admin/payments exactly like an individually paid entry.
import { getSettlementAccounts } from "../config"
import { getMerchantDb, type MerchantDb } from "../db"
import { toEntryDTO, toInvoiceDTO } from "../dto"
import { MerchantError, conflict, isUniqueViolation, notFound } from "../errors"
import type { MerchantCampaign, MerchantEntry, MerchantInvoice, MerchantStore } from "../types"
import { generateInvoiceNumber } from "../utils"
import { generateInvoiceSchema, submitPaymentSchema } from "../validators"
import { getOwnedCampaign } from "./campaigns"
import { settleInvoiceEntries, ticketPaymentStatuses } from "./entry-payments"

const INVOICEABLE_STATUSES = ["ACTIVE", "PAUSED"]

export async function previewInvoice(store: MerchantStore, campaignId: string) {
  const campaign = await getOwnedCampaign(store.id, campaignId)
  const db = await getMerchantDb()
  const totalEntries: number = await db.merchantEntry.count({
    where: { campaignId: campaign.id, status: "ISSUED", isTest: false },
  })
  return {
    campaignId: campaign.id,
    campaignTitle: campaign.title,
    totalEntries,
    unitPrice: campaign.ticketPrice,
    amountDue: totalEntries * campaign.ticketPrice,
    canGenerate: INVOICEABLE_STATUSES.includes(campaign.status) && totalEntries > 0,
  }
}

/**
 * Closes the campaign to new entries and bills every issued, non-test ticket.
 * The conditional status flip is the lock: concurrent mints re-check status and are
 * rejected once it leaves ACTIVE, so no ticket can slip in un-billed.
 */
export async function generateInvoice(store: MerchantStore, input: unknown) {
  const { campaignId } = generateInvoiceSchema.parse(input)
  await getOwnedCampaign(store.id, campaignId)
  const db = await getMerchantDb()

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const invoice: MerchantInvoice = await db.$transaction(async (tx: MerchantDb) => {
        const campaign: MerchantCampaign | null = await tx.merchantCampaign.findFirst({
          where: { id: campaignId, storeId: store.id },
        })
        if (!campaign) throw notFound("Campaign")

        const lock = await tx.merchantCampaign.updateMany({
          where: { id: campaign.id, status: { in: INVOICEABLE_STATUSES } },
          data: { status: "PENDING_INVOICE" },
        })
        if (lock.count === 0) throw conflict("This campaign has already been invoiced")

        const entries: MerchantEntry[] = await tx.merchantEntry.findMany({
          where: { campaignId: campaign.id, status: "ISSUED", isTest: false },
        })
        if (entries.length === 0) {
          throw new MerchantError("No billable entries yet — tickets are issued when orders are fulfilled", 400, "NOTHING_TO_INVOICE")
        }

        const created: MerchantInvoice = await tx.merchantInvoice.create({
          data: {
            campaignId: campaign.id,
            storeId: store.id,
            invoiceNumber: generateInvoiceNumber(),
            totalEntries: entries.length,
            unitPrice: campaign.ticketPrice,
            amountDue: entries.length * campaign.ticketPrice,
            status: "PENDING",
          },
        })

        const linked = await tx.merchantEntry.updateMany({
          where: { id: { in: entries.map((e) => e.id) }, status: "ISSUED" },
          data: { status: "INVOICED", invoiceId: created.id },
        })
        if (linked.count !== entries.length) {
          throw conflict("Entries changed while generating the invoice. Please retry.")
        }
        return created
      })
      return toInvoiceDTO(invoice)
    } catch (err) {
      // Only an invoice-number collision is retried; everything else is surfaced.
      if (!isUniqueViolation(err)) throw err
    }
  }
  throw new MerchantError("Could not allocate an invoice number. Please retry.", 503, "INVOICE_NUMBER_FAILED")
}

async function campaignTitles(db: MerchantDb, ids: string[]): Promise<Map<string, string>> {
  const unique = Array.from(new Set(ids))
  if (unique.length === 0) return new Map()
  const campaigns: MerchantCampaign[] = await db.merchantCampaign.findMany({ where: { id: { in: unique } } })
  return new Map(campaigns.map((c) => [c.id, c.title]))
}

export async function listInvoices(store: MerchantStore) {
  const db = await getMerchantDb()
  const invoices: MerchantInvoice[] = await db.merchantInvoice.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: "desc" },
  })
  const titles = await campaignTitles(db, invoices.map((i) => i.campaignId))
  const failed = await invoicesWithFailedPayment(db, invoices)
  return invoices.map((i) =>
    toInvoiceDTO(i, { campaignTitle: titles.get(i.campaignId), storeName: store.name, paymentFailed: failed.has(i.id) }),
  )
}

/** Invoices holding a ticket whose transfer PakRaffle rejected — the batch must be paid again. */
async function invoicesWithFailedPayment(db: MerchantDb, invoices: MerchantInvoice[]): Promise<Set<string>> {
  const open = invoices.filter((i) => i.status !== "PAID").map((i) => i.id)
  if (open.length === 0) return new Set()
  const entries: MerchantEntry[] = await db.merchantEntry.findMany({ where: { invoiceId: { in: open } } })
  const statuses = await ticketPaymentStatuses(entries.map((entry) => entry.ticketNumber))
  const failed = new Set<string>()
  for (const entry of entries) {
    const status = statuses.get(entry.ticketNumber)
    if (entry.invoiceId && (status === "FAILED" || status === "REFUNDED")) failed.add(entry.invoiceId)
  }
  return failed
}

/** Itemized invoice with its ledger lines and the accounts the merchant should pay into. */
export async function getInvoiceDetail(invoiceId: string, storeId?: string) {
  const db = await getMerchantDb()
  const invoice: MerchantInvoice | null = await db.merchantInvoice.findFirst({
    where: storeId ? { id: invoiceId, storeId } : { id: invoiceId },
  })
  if (!invoice) throw notFound("Invoice")

  const [entries, campaign, store] = await Promise.all([
    db.merchantEntry.findMany({ where: { invoiceId: invoice.id }, orderBy: { createdAt: "asc" } }),
    db.merchantCampaign.findUnique({ where: { id: invoice.campaignId } }),
    db.merchantStore.findUnique({ where: { id: invoice.storeId } }),
  ])

  const rows = entries as MerchantEntry[]
  const payments = await ticketPaymentStatuses(rows.map((entry) => entry.ticketNumber))
  const paymentFailed = rows.some((entry) => {
    const status = payments.get(entry.ticketNumber)
    return status === "FAILED" || status === "REFUNDED"
  })

  return {
    invoice: toInvoiceDTO(invoice, { campaignTitle: campaign?.title, storeName: store?.name, paymentFailed }),
    entries: rows.map((entry) => toEntryDTO(entry, { paymentStatus: payments.get(entry.ticketNumber) ?? null })),
    store: store ? { id: store.id, name: store.name, storeUrl: store.storeUrl, contactEmail: store.contactEmail } : null,
    settlementAccounts: getSettlementAccounts(),
  }
}

/**
 * Records the merchant's transfer for a batch. Each open ticket gets its own payment under the
 * Shopify customer's account (one per customer) and moves to INVOICED, awaiting confirmation in
 * /admin/payments. Re-submitting after a failed transfer re-arms the same payment rows.
 */
export async function submitInvoicePayment(store: MerchantStore, invoiceId: string, input: unknown) {
  const data = submitPaymentSchema.parse(input)
  const db = await getMerchantDb()

  const invoice: MerchantInvoice | null = await db.merchantInvoice.findFirst({
    where: { id: invoiceId, storeId: store.id },
  })
  if (!invoice) throw notFound("Invoice")
  if (invoice.status === "PAID") throw conflict("This invoice has already been settled")
  if (invoice.status !== "PENDING" && invoice.status !== "UNDER_REVIEW") {
    throw conflict("This invoice is not awaiting payment")
  }

  const entries: MerchantEntry[] = await db.merchantEntry.findMany({
    where: { invoiceId: invoice.id, status: { in: ["ISSUED", "INVOICED"] } },
  })
  if (entries.length === 0) {
    throw new MerchantError("This invoice has no open tickets left to settle", 400, "NOTHING_TO_SETTLE")
  }

  const campaign: MerchantCampaign | null = await db.merchantCampaign.findUnique({ where: { id: invoice.campaignId } })
  await settleInvoiceEntries(store, invoice, campaign, entries, data)

  await db.merchantInvoice.update({
    where: { id: invoice.id },
    data: {
      status: "UNDER_REVIEW",
      paymentMethod: data.paymentMethod,
      transactionRef: data.transactionRef,
      paymentProof: data.paymentProof,
      submittedAt: new Date(),
    },
  })
  return getInvoiceDetail(invoiceId, store.id)
}
