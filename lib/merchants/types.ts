// Merchant Connect domain types.
// Mirrors the Merchant* models in prisma/schema.prisma. All money values are whole PKR.
import type { IntakeAnswers } from "./intake"

export const STORE_STATUSES = ["ACTIVE", "PAUSED"] as const
export const RULE_TYPES = ["ALL_ORDERS", "MIN_QUANTITY", "MIN_AMOUNT", "MIN_QUANTITY_AND_AMOUNT"] as const
export const CAMPAIGN_STATUSES = ["ACTIVE", "PAUSED", "PENDING_INVOICE", "DRAW_READY", "COMPLETED"] as const
export const ENTRY_STATUSES = ["ISSUED", "INVOICED", "PAID", "CANCELLED"] as const
export const INVOICE_STATUSES = ["PENDING", "UNDER_REVIEW", "PAID"] as const
/** Methods a merchant can claim on the manual transfer form (verified by PakRaffle). */
export const PAYMENT_METHODS = ["RAAST", "IBFT", "NAYAPAY", "SADAPAY", "JAZZCASH", "EASYPAISA", "CARD"] as const
/** Everything the ledger stores, including the hosted checkout that settles itself. */
export const MERCHANT_PAYMENT_METHODS = [...PAYMENT_METHODS, "SAFEPAY"] as const

export type MerchantStoreStatus = (typeof STORE_STATUSES)[number]
export type MerchantRuleType = (typeof RULE_TYPES)[number]
export type MerchantCampaignStatus = (typeof CAMPAIGN_STATUSES)[number]
export type MerchantEntryStatus = (typeof ENTRY_STATUSES)[number]
export type MerchantInvoiceStatus = (typeof INVOICE_STATUSES)[number]
export type ManualPaymentMethod = (typeof PAYMENT_METHODS)[number]
export type MerchantPaymentMethod = (typeof MERCHANT_PAYMENT_METHODS)[number]

export interface MerchantStore {
  id: string
  name: string
  storeUrl: string
  platform: string
  apiKeyHash: string
  apiKeyPrefix: string
  webhookSecret: string
  contactEmail: string
  contactPhone: string
  payoutDetails?: string | null
  status: MerchantStoreStatus
  /** Shopify OAuth install state — the offline token stays on the server. */
  shopifyAccessToken?: string | null
  shopifyScope?: string | null
  shopifyConnectedAt?: Date | null
  shopifyWebhooksReady?: boolean
  shopifyScriptTagId?: string | null
  /** Post-signup welcome wizard progress. */
  onboardingStep?: string
  onboardingCompletedAt?: Date | null
  tallySubmissionId?: string | null
  /** Answers to the six intake questions, keyed by question (see intake.ts). */
  intakeAnswers?: IntakeAnswers | null
  intakeSubmittedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface MerchantCampaign {
  id: string
  storeId: string
  raffleId?: string | null
  title: string
  ruleType: MerchantRuleType
  minQuantity?: number | null
  minAmount?: number | null
  productFilters: string[]
  ticketPrice: number
  maxEntries?: number | null
  currentEntries: number
  status: MerchantCampaignStatus
  startDate: Date
  endDate: Date
  winnerEntryId?: string | null
  drawnAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface MerchantEntry {
  id: string
  campaignId: string
  storeId: string
  invoiceId?: string | null
  shopifyOrderId: string
  orderName?: string | null
  customerName: string
  customerEmail?: string | null
  customerPhone?: string | null
  /** Shipping city from the order — becomes the customer account's location. */
  customerCity?: string | null
  phoneNormalized?: string | null
  ticketNumber: string
  orderAmount: number
  itemCount: number
  /** Browser nonce from the cart, used by the storefront popup. */
  claimToken?: string | null
  isTest: boolean
  status: MerchantEntryStatus
  cancelledReason?: string | null
  /** Safepay tracker of the ticket's live checkout session, cleared once it ends. */
  gatewayRef?: string | null
  /** Amount in paisa we asked for — the figure a capture must match. */
  gatewayAmount?: number | null
  /** Same session, re-openable while it is alive. */
  checkoutUrl?: string | null
  /** When the session opened; its age decides when the ticket is released again. */
  gatewayStartedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface MerchantInvoice {
  id: string
  campaignId: string
  storeId: string
  invoiceNumber: string
  totalEntries: number
  unitPrice: number
  amountDue: number
  paymentMethod?: MerchantPaymentMethod | null
  paymentProof?: string | null
  transactionRef?: string | null
  adminNotes?: string | null
  status: MerchantInvoiceStatus
  submittedAt?: Date | null
  paidAt?: Date | null
  /** Safepay tracker of the hosted checkout session opened for this batch. */
  gatewayRef?: string | null
  /** Amount in paisa we asked Safepay to collect — the figure a capture must match. */
  gatewayAmount?: number | null
  /** Hosted checkout URL the merchant can re-open while the session is alive. */
  checkoutUrl?: string | null
  /** When the session opened; its age decides when the batch session stops being payable. */
  gatewayStartedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

/** Platform-agnostic order shape that the rule engine evaluates. */
export interface NormalizedLineItem {
  title: string
  sku?: string | null
  productId?: string | null
  variantId?: string | null
  quantity: number
  unitPrice: number // PKR, may contain decimals
}

export interface NormalizedOrder {
  orderId: string
  orderName?: string | null
  customerName: string
  customerEmail?: string | null
  customerPhone?: string | null
  /** Shipping city, stored as the customer account's location. */
  customerCity?: string | null
  subtotal: number // PKR, may contain decimals
  lineItems: NormalizedLineItem[]
  /** Browser nonce stamped on the cart by the storefront widget (arrives as a note attribute). */
  claimToken?: string | null
  fulfilled: boolean
  cancelled: boolean
  financialStatus?: string | null
}

export type IngestOutcome =
  | { campaignId: string; campaignTitle: string; result: "ISSUED"; ticketNumber: string; entryId: string }
  | { campaignId: string; campaignTitle: string; result: "DUPLICATE"; ticketNumber: string; entryId: string }
  | { campaignId: string; campaignTitle: string; result: "REJECTED"; reason: string }
  | { campaignId: string; campaignTitle: string; result: "CAP_REACHED"; reason: string }
