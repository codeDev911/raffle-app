// Response mappers. Raw rows never leave the service layer: hashes and secrets are
// stripped, and derived fields (rule summary, billable amounts) are computed once here.
import { describeRule } from "./rules"
import type { MerchantCampaign, MerchantEntry, MerchantInvoice, MerchantStore } from "./types"
import { maskName, maskPhone, maskSecret } from "./utils"

export interface PrizeSummary {
  id: string
  title: string
  image: string | null
  category: string | null
  prizeValuePkr: number
  endDate: Date | null
}

export function toStoreDTO(store: MerchantStore) {
  return {
    id: store.id,
    name: store.name,
    storeUrl: store.storeUrl,
    platform: store.platform,
    apiKeyPrefix: store.apiKeyPrefix,
    webhookSecretPreview: maskSecret(store.webhookSecret),
    contactEmail: store.contactEmail,
    contactPhone: store.contactPhone,
    payoutDetails: store.payoutDetails ?? null,
    status: store.status,
    createdAt: store.createdAt,
    updatedAt: store.updatedAt,
  }
}

export function toCampaignDTO(
  campaign: MerchantCampaign,
  extras: { prize?: PrizeSummary | null; billableEntries?: number; testEntries?: number } = {},
) {
  const now = Date.now()
  const capReached = Boolean(campaign.maxEntries && campaign.currentEntries >= campaign.maxEntries)
  const ended = new Date(campaign.endDate).getTime() < now
  return {
    id: campaign.id,
    storeId: campaign.storeId,
    raffleId: campaign.raffleId ?? null,
    title: campaign.title,
    ruleType: campaign.ruleType,
    minQuantity: campaign.minQuantity ?? null,
    minAmount: campaign.minAmount ?? null,
    productFilters: campaign.productFilters || [],
    ruleSummary: describeRule(campaign),
    ticketPrice: campaign.ticketPrice,
    maxEntries: campaign.maxEntries ?? null,
    currentEntries: campaign.currentEntries,
    status: campaign.status,
    isAcceptingEntries: campaign.status === "ACTIVE" && !ended && !capReached,
    capReached,
    ended,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    winnerEntryId: campaign.winnerEntryId ?? null,
    drawnAt: campaign.drawnAt ?? null,
    createdAt: campaign.createdAt,
    prize: extras.prize ?? null,
    billableEntries: extras.billableEntries ?? 0,
    billableAmount: (extras.billableEntries ?? 0) * campaign.ticketPrice,
    testEntries: extras.testEntries ?? 0,
  }
}

export function toEntryDTO(entry: MerchantEntry) {
  return {
    id: entry.id,
    campaignId: entry.campaignId,
    invoiceId: entry.invoiceId ?? null,
    shopifyOrderId: entry.shopifyOrderId,
    orderName: entry.orderName ?? null,
    customerName: entry.customerName,
    customerEmail: entry.customerEmail ?? null,
    customerPhone: entry.customerPhone ?? null,
    ticketNumber: entry.ticketNumber,
    orderAmount: entry.orderAmount,
    itemCount: entry.itemCount,
    isTest: entry.isTest,
    status: entry.status,
    cancelledReason: entry.cancelledReason ?? null,
    createdAt: entry.createdAt,
  }
}

export function toInvoiceDTO(invoice: MerchantInvoice, extras: { campaignTitle?: string; storeName?: string } = {}) {
  return {
    id: invoice.id,
    campaignId: invoice.campaignId,
    storeId: invoice.storeId,
    invoiceNumber: invoice.invoiceNumber,
    totalEntries: invoice.totalEntries,
    unitPrice: invoice.unitPrice,
    amountDue: invoice.amountDue,
    paymentMethod: invoice.paymentMethod ?? null,
    paymentProof: invoice.paymentProof ?? null,
    transactionRef: invoice.transactionRef ?? null,
    adminNotes: invoice.adminNotes ?? null,
    status: invoice.status,
    submittedAt: invoice.submittedAt ?? null,
    paidAt: invoice.paidAt ?? null,
    createdAt: invoice.createdAt,
    campaignTitle: extras.campaignTitle ?? null,
    storeName: extras.storeName ?? null,
  }
}

/** Public, privacy-safe view of a ticket for the customer lookup page. */
export function toPublicTicketDTO(
  entry: MerchantEntry,
  ctx: { storeName: string; campaign?: MerchantCampaign | null; prize?: PrizeSummary | null },
) {
  const campaign = ctx.campaign
  return {
    ticketNumber: entry.ticketNumber,
    status: entry.status,
    orderName: entry.orderName ?? null,
    customerName: maskName(entry.customerName),
    customerPhone: maskPhone(entry.customerPhone),
    storeName: ctx.storeName,
    campaignTitle: campaign?.title ?? "Lucky Draw",
    campaignStatus: campaign?.status ?? null,
    ruleSummary: campaign ? describeRule(campaign) : null,
    drawDate: campaign?.endDate ?? null,
    drawnAt: campaign?.drawnAt ?? null,
    isWinner: Boolean(campaign?.winnerEntryId && campaign.winnerEntryId === entry.id),
    prize: ctx.prize
      ? { title: ctx.prize.title, image: ctx.prize.image, prizeValuePkr: ctx.prize.prizeValuePkr }
      : null,
    issuedAt: entry.createdAt,
  }
}
