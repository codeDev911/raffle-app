// Reads PakRaffle prizes (existing Raffle model) for campaign linking. Uses the shared
// prisma proxy with the same in-memory fallback convention as the public raffle APIs.
import { prisma, mockPrisma } from "@/lib/prisma"
import type { PrizeSummary } from "../dto"

const PRIZE_SELECT = {
  id: true,
  title: true,
  image: true,
  category: true,
  realPrice: true,
  price: true,
  status: true,
  endDate: true,
}

async function findRaffles(args: any): Promise<any[]> {
  try {
    return await prisma.raffle.findMany(args)
  } catch (err) {
    console.warn("[MerchantConnect] Raffle lookup failed on primary DB, using fallback store:", err)
    return await (mockPrisma as any).raffle.findMany(args)
  }
}

function toPrize(raffle: any): PrizeSummary {
  return {
    id: raffle.id,
    title: raffle.title,
    image: raffle.image ?? null,
    category: raffle.category ?? null,
    // Raffle prices are stored in paisa; Merchant Connect works in whole PKR.
    prizeValuePkr: Math.round(Number(raffle.realPrice || raffle.price || 0) / 100),
    // Raffle.price is the ticket price a retail buyer pays, not the prize's market value.
    ticketPricePkr: Math.max(0, Math.round(Number(raffle.price || 0) / 100)),
    endDate: raffle.endDate ? new Date(raffle.endDate) : null,
  }
}

export async function listPrizeOptions(): Promise<PrizeSummary[]> {
  const raffles = await findRaffles({ where: { status: "ACTIVE" }, select: PRIZE_SELECT })
  return raffles.map(toPrize).sort((a, b) => b.prizeValuePkr - a.prizeValuePkr)
}

export async function getActivePrize(raffleId: string): Promise<PrizeSummary | null> {
  const [raffle] = await findRaffles({ where: { id: raffleId, status: "ACTIVE" }, select: PRIZE_SELECT, take: 1 })
  return raffle ? toPrize(raffle) : null
}

export async function getPrizeMap(raffleIds: (string | null | undefined)[]): Promise<Map<string, PrizeSummary>> {
  const ids = Array.from(new Set(raffleIds.filter((id): id is string => Boolean(id))))
  if (ids.length === 0) return new Map()
  const raffles = await findRaffles({ where: { id: { in: ids } }, select: PRIZE_SELECT })
  return new Map(raffles.map((r) => [r.id, toPrize(r)]))
}
