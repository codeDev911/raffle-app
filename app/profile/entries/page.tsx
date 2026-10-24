import { getUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { EntriesClient } from "./EntriesClient"

export const metadata = {
  title: "My Raffle Tickets & Entries — PakRaffle",
  description: "View all your active and past lucky draw tickets, verify payment status, and track draw dates.",
  robots: "noindex, nofollow",
}

async function getUserEntries() {
  const sessionUser = await getUser()
  if (!sessionUser) {
    redirect("/auth/login")
  }

  const entries = await prisma.entry.findMany({
    where: { userId: sessionUser.id },
    include: {
      raffle: {
        select: {
          id: true,
          title: true,
          description: true,
          image: true,
          status: true,
          endDate: true,
          price: true,
          category: true,
          totalEntries: true,
          currentEntries: true,
        },
      },
      payment: {
        select: {
          status: true,
          method: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return {
    user: sessionUser,
    entries,
  }
}

export default async function UserEntriesPage() {
  const { user, entries } = await getUserEntries()

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <EntriesClient
          userName={user.name}
          userEmail={user.email}
          entries={entries}
        />
      </div>
    </div>
  )
}
