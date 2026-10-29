// Stub of @/lib/prisma for the node harness: forces the file-backed merchant store.
const raffleRow = (id) => ({
  id,
  title: "iPhone 16 Pro Max",
  image: null,
  category: "Electronics",
  realPrice: 45000000, // paisa → Rs. 450,000
  endDate: new Date(Date.now() + 20 * 24 * 3600 * 1000),
  status: "ACTIVE",
})

const raffleStore = {
  findMany: async () => [raffleRow("prize-1")],
  findUnique: async ({ where }) => raffleRow(where.id),
}

// prizes.ts calls mockPrisma.raffle.findMany as a fallback when the primary DB errors.
export const mockPrisma = { raffle: raffleStore }

export const prisma = { raffle: raffleStore }

export const isUsingRealDatabase = () => false
