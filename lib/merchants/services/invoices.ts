// Batch invoice settlement: close a campaign, bill its fulfilled entries, collect payment proof.
import { getSettlementAccounts } from "../config"
import { getMerchantDb, type MerchantDb } from "../db"
import { toEntryDTO, toInvoiceDTO } from "../dto"
import { MerchantError, conflict, isUniqueViolation, notFound } from "../errors"
import type { MerchantCampaign, MerchantEntry, MerchantInvoice, MerchantStore } from "../types"
import { generateInvoiceNumber } from "../utils"
import { generateInvoiceSchema, submitPaymentSchema } from "../validators"
import { getOwnedCampaign } from "./campaigns"

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
  return invoices.map((i) => toInvoiceDTO(i, { campaignTitle: titles.get(i.campaignId), storeName: store.name }))
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

  return {
    invoice: toInvoiceDTO(invoice, { campaignTitle: campaign?.title, storeName: store?.name }),
    entries: (entries as MerchantEntry[]).map(toEntryDTO),
    store: store ? { id: store.id, name: store.name, storeUrl: store.storeUrl, contactEmail: store.contactEmail } : null,
    settlementAccounts: getSettlementAccounts(),
  }
}

export async function submitInvoicePayment(store: MerchantStore, invoiceId: string, input: unknown) {
  const data = submitPaymentSchema.parse(input)
  const db = await getMerchantDb()

  const { count } = await db.merchantInvoice.updateMany({
    where: { id: invoiceId, storeId: store.id, status: "PENDING" },
    data: {
      status: "UNDER_REVIEW",
      paymentMethod: data.paymentMethod,
      transactionRef: data.transactionRef,
      paymentProof: data.paymentProof,
      submittedAt: new Date(),
    },
  })
  if (count === 0) {
    const exists = await db.merchantInvoice.findFirst({ where: { id: invoiceId, storeId: store.id } })
    if (!exists) throw notFound("Invoice")
    throw conflict("This invoice is not awaiting payment")
  }
  return getInvoiceDetail(invoiceId, store.id)
}
