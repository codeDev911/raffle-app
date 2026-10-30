// Client-side shapes of the Merchant Connect API responses (mirrors lib/merchants/dto.ts).

import type { IntakeAnswers } from "@/lib/merchants/intake"

export interface StoreDTO {
  id: string
  name: string
  storeUrl: string
  platform: string
  apiKeyPrefix: string
  webhookSecretPreview: string
  contactEmail: string
  contactPhone: string
  payoutDetails: string | null
  status: "ACTIVE" | "PAUSED"
  /** The merchant finished the manual Shopify setup (webhooks + widget snippet). */
  shopifyConnected: boolean
  shopifyConnectedAt: string | null
  shopifyWebhooksReady: boolean
  shopifyScriptInstalled: boolean
  onboardingStep: string
  onboardingCompletedAt: string | null
  /** Answers to the six intake questions; submittedAt is null until the merchant submits. */
  intake?: { answers: IntakeAnswers | null; submittedAt: string | null }
  createdAt: string
  updatedAt: string
}

export interface SettlementAccount {
  key: string
  label: string
  methods: string[]
  accountName: string
  accountNumber: string
  iban?: string
}

export interface MeResponse {
  store: StoreDTO
  integration: {
    webhookUrl: string
    topics: string[]
    entryFee: number
    storage: string
    safepay: boolean
    /** Script tag src installed on the storefront. */
    widgetUrl?: string
    /** The same tag, ready to paste into theme.liquid. */
    widgetSnippet?: string
  }
  settlementAccounts: SettlementAccount[]
}

export interface PrizeDTO {
  id: string
  title: string
  image: string | null
  category: string | null
  prizeValuePkr: number
  /** What one ticket in this raffle costs (whole PKR) — the merchant's per-ticket price. */
  ticketPricePkr: number
  endDate: string | null
}

export type RuleType = "ALL_ORDERS" | "MIN_QUANTITY" | "MIN_AMOUNT" | "MIN_QUANTITY_AND_AMOUNT"

export interface CampaignDTO {
  id: string
  storeId: string
  raffleId: string | null
  title: string
  ruleType: RuleType
  minQuantity: number | null
  minAmount: number | null
  productFilters: string[]
  ruleSummary: string
  ticketPrice: number
  maxEntries: number | null
  currentEntries: number
  status: "ACTIVE" | "PAUSED" | "PENDING_INVOICE" | "DRAW_READY" | "COMPLETED"
  isAcceptingEntries: boolean
  capReached: boolean
  ended: boolean
  startDate: string
  endDate: string
  winnerEntryId: string | null
  drawnAt: string | null
  createdAt: string
  prize: PrizeDTO | null
  billableEntries: number
  billableAmount: number
  testEntries: number
}

export interface EntryDTO {
  id: string
  campaignId: string
  invoiceId: string | null
  shopifyOrderId: string
  orderName: string | null
  customerName: string
  customerEmail: string | null
  customerPhone: string | null
  customerCity: string | null
  ticketNumber: string
  orderAmount: number
  itemCount: number
  isTest: boolean
  status: "ISSUED" | "INVOICED" | "PAID" | "CANCELLED"
  /** PakRaffle payment row status for this ticket (null when nothing was submitted). */
  paymentStatus: string | null
  /** A card checkout is still open for this ticket. */
  checkoutOpen: boolean
  cancelledReason: string | null
  createdAt: string
}

export interface InvoiceDTO {
  id: string
  campaignId: string
  storeId: string
  invoiceNumber: string
  totalEntries: number
  unitPrice: number
  amountDue: number
  paymentMethod: string | null
  paymentProof: string | null
  transactionRef: string | null
  adminNotes: string | null
  /** Safepay tracker for a live/completed card session; null for manual transfers. */
  gatewayRef: string | null
  /** Amount in paisa handed to Safepay for this batch. */
  gatewayAmount: number | null
  /** Hosted checkout URL while a session is open, so the dialog can resume it. */
  checkoutUrl: string | null
  status: "PENDING" | "UNDER_REVIEW" | "PAID"
  submittedAt: string | null
  paidAt: string | null
  createdAt: string
  campaignTitle: string | null
  storeName: string | null
  /** A transfer on this batch was rejected and has to be resubmitted. */
  paymentFailed: boolean
}

export interface InvoiceDetail {
  invoice: InvoiceDTO
  entries: EntryDTO[]
  store: { id: string; name: string; storeUrl: string; contactEmail: string } | null
  settlementAccounts: SettlementAccount[]
}

export interface InvoicePreview {
  campaignId: string
  campaignTitle: string
  totalEntries: number
  unitPrice: number
  amountDue: number
  canGenerate: boolean
}

export type IngestOutcome =
  | { campaignId: string; campaignTitle: string; result: "ISSUED" | "DUPLICATE"; ticketNumber: string; entryId: string }
  | { campaignId: string; campaignTitle: string; result: "REJECTED" | "CAP_REACHED"; reason: string }

export interface WebhookResult {
  topic: string
  action: "minted" | "cancelled" | "ignored"
  message: string
  outcomes?: IngestOutcome[]
  cancellation?: { cancelled: number; locked: number }
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  RAAST: "Raast",
  IBFT: "IBFT bank transfer",
  NAYAPAY: "NayaPay",
  SADAPAY: "SadaPay",
  JAZZCASH: "JazzCash",
  EASYPAISA: "Easypaisa",
  CARD: "Card",
}

/** Safepay is not a transfer method; it is the hosted checkout the merchant is redirected to. */
export const SAFEPAY_LABEL = "Card / wallet (Safepay)"

export const paymentMethodLabel = (method: string | null | undefined) =>
  method ? PAYMENT_METHOD_LABELS[method] || (method === "SAFEPAY" ? SAFEPAY_LABEL : method) : "—"
