// Response mappers. Raw rows never leave the service layer: hashes and secrets are
// stripped, and derived fields (rule summary, billable amounts) are computed once here.
import { describeRule } from "./rules"
import type { IntakeAnswers } from "./intake"
import type { MerchantCampaign, MerchantEntry, MerchantInvoice, MerchantStore } from "./types"
import { maskName, maskPhone, maskSecret } from "./utils"

export interface PrizeSummary {
  id: string
  title: string
  image: string | null
  category: string | null
  prizeValuePkr: number
  /** What a retail buyer pays for one ticket in this raffle, whole PKR. 0 when unset. */
  ticketPricePkr: number
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
    ownerId: store.ownerId ?? null,
    status: store.status,
    // Shopify one-click connect state (the token itself never leaves the server).
    shopifyConnected: Boolean(store.shopifyConnectedAt),
    shopifyConnectedAt: store.shopifyConnectedAt ?? null,
    shopifyWebhooksReady: Boolean(store.shopifyWebhooksReady),
    shopifyScriptInstalled: Boolean(store.shopifyScriptTagId),
    onboardingStep: store.onboardingStep ?? "WELCOME",
    onboardingCompletedAt: store.onboardingCompletedAt ?? null,
    /** Store-intake answers, so the wizard can resume where the merchant left off. */
    intake: {
      answers: (store.intakeAnswers as IntakeAnswers | null | undefined) ?? null,
      submittedAt: store.intakeSubmittedAt ?? null,
    },
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

export function toEntryDTO(entry: MerchantEntry, extras: { paymentStatus?: string | null } = {}) {
  return {
    id: entry.id,
    campaignId: entry.campaignId,
    invoiceId: entry.invoiceId ?? null,
    shopifyOrderId: entry.shopifyOrderId,
    orderName: entry.orderName ?? null,
    customerName: entry.customerName,
    customerEmail: entry.customerEmail ?? null,
    customerPhone: entry.customerPhone ?? null,
    customerCity: entry.customerCity ?? null,
    ticketNumber: entry.ticketNumber,
    orderAmount: entry.orderAmount,
    itemCount: entry.itemCount,
    isTest: entry.isTest,
    status: entry.status,
    /** PakRaffle payment row status for this ticket (null when nothing was submitted). */
    paymentStatus: extras.paymentStatus ?? null,
    /** A card checkout is open for this ticket, so the merchant can pick it up where they left. */
    checkoutOpen: Boolean(entry.gatewayRef && entry.checkoutUrl && entry.status === "INVOICED"),
    cancelledReason: entry.cancelledReason ?? null,
    createdAt: entry.createdAt,
  }
}

export function toInvoiceDTO(
  invoice: MerchantInvoice,
  extras: { campaignTitle?: string; storeName?: string; paymentFailed?: boolean; checkoutOpen?: boolean } = {},
) {
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
    /** Safepay tracker for a live/completed card session; null for manual transfers. */
    gatewayRef: invoice.gatewayRef ?? null,
    /** Amount in paisa that Safepay was asked to collect for this batch. */
    gatewayAmount: invoice.gatewayAmount ?? null,
    /** Hosted checkout URL while a session is open, so the dialog can resume it. */
    checkoutUrl: invoice.checkoutUrl ?? null,
    /** The session is still payable; an expired one keeps its tracker but is not resumable. */
    checkoutOpen: extras.checkoutOpen ?? false,
    status: invoice.status,
    submittedAt: invoice.submittedAt ?? null,
    paidAt: invoice.paidAt ?? null,
    createdAt: invoice.createdAt,
    campaignTitle: extras.campaignTitle ?? null,
    storeName: extras.storeName ?? null,
    /** PakRaffle rejected a transfer on this batch: it has to be paid and resubmitted. */
    paymentFailed: extras.paymentFailed ?? false,
  }
}

/** Where the shopper's ticket actually stands, expressed in the customer's terms. */
export type PublicTicketStage = "PAYMENT_PENDING" | "PAYMENT_FAILED" | "AWAITING_CONFIRMATION" | "CONFIRMED" | "VOIDED"

function publicStage(entry: MerchantEntry, paymentStatus?: string | null): PublicTicketStage {
  if (entry.status === "CANCELLED") return "VOIDED"
  if (entry.status === "PAID" || paymentStatus === "COMPLETED") return "CONFIRMED"
  // PakRaffle rejected the transfer: the store has to send the money again.
  if (paymentStatus === "FAILED" || paymentStatus === "REFUNDED") return "PAYMENT_FAILED"
  // A payment row exists but PakRaffle has not confirmed it yet.
  if (paymentStatus === "PENDING" || paymentStatus === "PROCESSING") return "AWAITING_CONFIRMATION"
  // The store has not paid for this ticket yet (individually or via its batch invoice).
  return "PAYMENT_PENDING"
}

/** Merchant storefront as a browser-safe URL (stored rows hold a bare domain). */
function storefrontUrl(value?: string | null): string | null {
  const domain = String(value || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
  return domain ? `https://${domain}` : null
}

/** Public, privacy-safe view of a ticket for the customer lookup page. */
export function toPublicTicketDTO(
  entry: MerchantEntry,
  ctx: {
    storeName: string
    /** Storefront domain — the shopper needs to know which store raised this ticket. */
    storeUrl?: string | null
    campaign?: MerchantCampaign | null
    prize?: PrizeSummary | null
    /** Status of this ticket's PakRaffle payment row, when one exists. */
    paymentStatus?: string | null
  },
) {
  const campaign = ctx.campaign
  return {
    ticketNumber: entry.ticketNumber,
    status: entry.status,
    stage: publicStage(entry, ctx.paymentStatus),
    orderName: entry.orderName ?? null,
    customerName: maskName(entry.customerName),
    customerPhone: maskPhone(entry.customerPhone),
    storeName: ctx.storeName,
    storeUrl: storefrontUrl(ctx.storeUrl),
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
