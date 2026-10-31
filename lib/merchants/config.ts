// Merchant Connect platform configuration.
// Settlement accounts reuse the same env vars as the retail checkout (/payment/pay)
// so merchants and ticket buyers always pay into the same verified PakRaffle accounts.

// The flat per-ticket fee is only a fallback for campaigns that are not tied to a PakRaffle
// raffle; a linked raffle is billed at its own ticket price.
export const MERCHANT_ENTRY_FEE_PKR = Math.max(1, Number(process.env.MERCHANT_ENTRY_FEE_PKR) || 250)

/** What one minted ticket costs the merchant, in whole PKR. */
export function merchantTicketPrice(raffleTicketPricePkr?: number | null): number {
  const price = Math.round(Number(raffleTicketPricePkr) || 0)
  return price > 0 ? price : MERCHANT_ENTRY_FEE_PKR
}

export const MERCHANT_SESSION_COOKIE = "merchant_session"

/**
 * How long a Safepay checkout session stays payable before it is treated as dead.
 * Measured from when the session was opened — never from when the invoice was raised, or an
 * invoice billed yesterday would report its brand-new checkout as expired on the first look.
 */
export const CHECKOUT_SESSION_TTL_MS = 30 * 60 * 1000

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
