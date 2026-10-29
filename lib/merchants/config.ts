// Merchant Connect platform configuration.
// Settlement accounts reuse the same env vars as the retail checkout (/payment/pay)
// so merchants and ticket buyers always pay into the same verified PakRaffle accounts.

export const MERCHANT_ENTRY_FEE_PKR = Math.max(1, Number(process.env.MERCHANT_ENTRY_FEE_PKR) || 250)

export const MERCHANT_SESSION_COOKIE = "merchant_session"

export const TICKET_PREFIX = "PKR-SHOPIFY"

export const WHATSAPP_SUPPORT_INTL = "923377155722"

export interface SettlementAccount {
  key: string
  label: string
  methods: string[]
  accountName: string
  accountNumber: string
  iban?: string
}

export function getSettlementAccounts(): SettlementAccount[] {
  return [
    {
      key: "meezan",
      label: "Meezan Bank · Raast / IBFT",
      methods: ["RAAST", "IBFT"],
      accountName: process.env.NEXT_PUBLIC_MEEZAN_ACCOUNT_NAME || "Muhammad Afnan",
      accountNumber: process.env.NEXT_PUBLIC_MEEZAN_ACCOUNT_NUMBER || "000030011243",
      iban: process.env.NEXT_PUBLIC_MEEZAN_ACCOUNT_IBAN || "PK53MEZN0000300112437772",
    },
    {
      key: "nayapay",
      label: "NayaPay Wallet",
      methods: ["NAYAPAY"],
      accountName: process.env.NEXT_PUBLIC_NAYAPAY_ACCOUNT_NAME || "Muhammad Afnan",
      accountNumber: process.env.NEXT_PUBLIC_NAYAPAY_ACCOUNT_NUMBER || "03051767579",
    },
    {
      key: "sadapay",
      label: "SadaPay Wallet",
      methods: ["SADAPAY"],
      accountName: process.env.NEXT_PUBLIC_SADAPAY_ACCOUNT_NAME || "Muhammad Afnan",
      accountNumber: process.env.NEXT_PUBLIC_SADAPAY_ACCOUNT_NUMBER || "03045645642",
    },
  ]
}
