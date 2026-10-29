// Client-side shapes of the Merchant Connect API responses (mirrors lib/merchants/dto.ts).

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
  integration: { webhookUrl: string; topics: string[]; entryFee: number; storage: string }
  settlementAccounts: SettlementAccount[]
}

export interface PrizeDTO {
  id: string
  title: string
  image: string | null
  category: string | null
  prizeValuePkr: number
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
  ticketNumber: string
  orderAmount: number
  itemCount: number
  isTest: boolean
  status: "ISSUED" | "INVOICED" | "PAID" | "CANCELLED"
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
  status: "PENDING" | "UNDER_REVIEW" | "PAID"
  submittedAt: string | null
  paidAt: string | null
  createdAt: string
  campaignTitle: string | null
  storeName: string | null
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
