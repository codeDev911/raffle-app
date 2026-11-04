/** Shape of /api/admin/merchant-refunds rows (mirrors lib/merchants/dto.ts toRefundDTO). */
export interface RefundAdminDTO {
  id: string
  storeId: string
  storeName: string | null
  payoutDetails: string | null
  campaignId: string
  entryId: string
  ticketNumber: string
  shopifyOrderId: string
  orderName: string | null
  invoiceId: string | null
  creditInvoiceId: string | null
  grossAmount: number
  gatewayCost: number
  netAmount: number
  reason: string
  note: string | null
  source: "WEBHOOK" | "MERCHANT" | "ADMIN"
  settlement: "CREDIT" | "PAYOUT"
  status: "REQUESTED" | "APPROVED" | "PAID" | "REJECTED" | "CREDITED"
  statusLabel: string
  triggerTopic: string | null
  shopifyEventAt: string | null
  receivedAt: string
  actionedAt: string | null
  decidedAt: string | null
  decidedBy: string | null
  settledAt: string | null
  applied: boolean
  events: { at: string; kind: string; label: string; detail?: string | null }[]
  createdAt: string
}
