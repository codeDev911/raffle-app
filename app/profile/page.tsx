import { getUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate } from "@/lib/utils"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Trophy,
  Gift,
  Star,
  Settings,
  ArrowRight,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "My Profile & Lucky Draw Dashboard — PakRaffle",
  description: "View your active lucky draw tickets, track upcoming draws, and manage your account on PakRaffle.",
  robots: "noindex, nofollow",
}

async function getUserProfileData() {
  const sessionUser = await getUser()
  if (!sessionUser) {
    redirect("/auth/login")
  }

  const [user, entries, winners] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sessionUser.id },
      include: {
        _count: {
          select: {
            entries: true,
            winners: true,
          },
        },
      },
    }),
    prisma.entry.findMany({
      where: { userId: sessionUser.id },
      include: {
        raffle: {
          select: {
            id: true,
            title: true,
            image: true,
            price: true,
            status: true,
            category: true,
            totalEntries: true,
            currentEntries: true,
            endDate: true,
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
      take: 6,
    }),
    prisma.winner.findMany({
      where: { userId: sessionUser.id },
      include: {
        raffle: {
          select: {
            id: true,
            title: true,
            image: true,
            category: true,
          },
        },
      },
      orderBy: { drawnAt: "desc" },
    }),
  ])

  if (!user) {
    redirect("/auth/login")
  }

  // Aggregate user's total tickets count and total winnings
  const totalTickets = entries.reduce((sum, e) => sum + e.quantity, 0)
  const activeEntriesCount = entries.filter((e) => e.raffle.status === "ACTIVE").length

  const totalWinnings = await prisma.winner.aggregate({
    where: { userId: sessionUser.id },
    _sum: { prizeValue: true },
  })

  return {
    user,
    entries,
    winners,
    totalTickets,
    activeEntriesCount,
    totalWinnings: totalWinnings._sum.prizeValue || 0,
  }
}

export default async function ProfilePage() {
  const { user, entries, winners, totalTickets, activeEntriesCount, totalWinnings } =
    await getUserProfileData()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* 1. TOP PROFILE HERO BANNER */}
        <div className="bg-gradient-to-r from-emerald-950 via-green-950 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-emerald-800/40 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <Avatar className="h-18 w-18 sm:h-22 sm:w-22 border-2 border-emerald-400/80 shadow-md">
                <AvatarFallback className="bg-emerald-600 text-white text-xl sm:text-2xl font-black">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    {user.name}
                  </h1>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Verified Participant
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-200/90 pt-0.5">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    {user.email}
                  </span>
                  {user.city && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        {user.city}, Pakistan
                      </span>
                    </>
                  )}
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    Member since {formatDate(new Date(user.createdAt))}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Button asChild size="sm" className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs min-h-[42px] px-4">
                <Link href="/raffles">
                  <Flame className="w-3.5 h-3.5 mr-1 text-amber-300" />
                  Enter New Draw
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-xl border-emerald-600 text-white bg-white/10 hover:bg-white/20 hover:text-white font-semibold text-xs min-h-[42px] px-4">
                <Link href="/profile/settings">
                  <Settings className="w-3.5 h-3.5 mr-1" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* 2. SUB-NAVIGATION TABS (STICKY-FRIENDLY & SEAMLESS) */}
        <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-gray-200/80 shadow-2xs overflow-x-auto no-scrollbar">
          <Link
            href="/profile"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-700 text-white shadow-2xs whitespace-nowrap"
          >
            <User className="w-4 h-4" />
            Dashboard Overview
          </Link>
          <Link
            href="/profile/entries"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/60 transition-colors whitespace-nowrap"
          >
            <Gift className="w-4 h-4 text-emerald-600" />
            My Tickets & Entries
            {activeEntriesCount > 0 && (
              <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                {activeEntriesCount}
              </span>
            )}
          </Link>
          <Link
            href="/profile/settings"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/60 transition-colors whitespace-nowrap"
          >
            <Settings className="w-4 h-4 text-gray-500" />
            Account Settings
          </Link>
          <Link
            href="/winners"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/60 transition-colors whitespace-nowrap ml-auto"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            Winners Hall of Fame
          </Link>
        </div>

        {/* 3. KEY METRICS STATS OVERVIEW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-emerald-700">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Active Tickets
              </span>
              <div className="p-2 rounded-xl bg-emerald-50">
                <Gift className="w-4 h-4 text-emerald-700" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 font-mono">
              {activeEntriesCount}
            </div>
            <p className="text-[11px] text-gray-500">In pending & live draws</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-blue-700">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Entries
              </span>
              <div className="p-2 rounded-xl bg-blue-50">
                <Flame className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 font-mono">
              {user._count.entries}
            </div>
            <p className="text-[11px] text-gray-500">Lifetime tickets entered</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-amber-600">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Prizes Won
              </span>
              <div className="p-2 rounded-xl bg-amber-50">
                <Trophy className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 font-mono">
              {user._count.winners}
            </div>
            <p className="text-[11px] text-gray-500">Certified lucky draw wins</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-purple-600">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Winnings
              </span>
              <div className="p-2 rounded-xl bg-purple-50">
                <Star className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono truncate">
              {formatCurrency(totalWinnings)}
            </div>
            <p className="text-[11px] text-gray-500">Disbursed & delivered</p>
          </div>
        </div>

        {/* 4. OFFICIAL 100% TICKET SOLD RULE NOTICE */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-emerald-950">
                PakRaffle 100% Target Ticket Sell-Out Policy
              </h3>
              <p className="text-[11px] sm:text-xs text-emerald-800/90 mt-0.5">
                Every raffle draw is conducted live immediately once all target tickets are sold. No partial draws, 100% transparent.
              </p>
            </div>
          </div>
          <Link
            href="/terms"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline shrink-0"
          >
            Read Draw Terms →
          </Link>
        </div>

        {/* 5. MAIN CONTENT TWO COLUMNS */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column (2 cols): Active & Recent Tickets */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-emerald-600" />
                    Your Lucky Draw Entries
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Your tickets in ongoing and recently concluded draws
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-emerald-700 hover:text-emerald-800 text-xs font-bold">
                  <Link href="/profile/entries">
                    View All ({entries.length}) <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </Button>
              </div>

              {entries.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="w-14 h-14 rounded-3xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                    <Gift className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">No active raffle entries</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    You haven&apos;t entered any lucky draws yet. Browse our active prizes including bikes, iPhones, cash, and gaming consoles!
                  </p>
                  <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs">
                    <Link href="/raffles">Browse Active Raffles</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {entries.map((entry) => {
                    const isActive = entry.raffle.status === "ACTIVE"
                    return (
                      <div
                        key={entry.id}
                        className="p-3.5 sm:p-4 rounded-2xl border border-gray-100 bg-gray-50/70 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-gray-200 shrink-0 border border-gray-200">
                            <Image
                              src={entry.raffle.image || "/placeholder.jpg"}
                              alt={entry.raffle.title}
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                                {entry.raffle.category}
                              </span>
                              <span className="text-gray-300">•</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.2 rounded-md ${
                                  isActive
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-gray-200 text-gray-700"
                                }`}
                              >
                                {isActive ? "Draw Pending (100% Target)" : entry.raffle.status}
                              </span>
                            </div>

                            <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                              {entry.raffle.title}
                            </h4>

                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="font-semibold text-emerald-700 font-mono">
                                {entry.quantity} {entry.quantity === 1 ? "Ticket" : "Tickets"}
                              </span>
                              <span>•</span>
                              <span>{formatCurrency(entry.totalCost)}</span>
                              <span>•</span>
                              <span>{formatDate(new Date(entry.createdAt))}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <Button asChild size="sm" variant="outline" className="rounded-xl text-xs font-semibold border-gray-200 hover:border-emerald-300">
                            <Link href={`/raffles/${entry.raffle.id}`}>
                              View Draw
                              <ExternalLink className="w-3 h-3 ml-1 text-gray-400" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Wins & Handover Proof (if any) */}
            {winners.length > 0 && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 rounded-3xl p-5 sm:p-6 border border-amber-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
                  <h3 className="text-base font-bold text-amber-950 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-600" />
                    Congratulations! Your Winning Prizes
                  </h3>
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    {winners.length} {winners.length === 1 ? "Prize" : "Prizes"} Won
                  </span>
                </div>

                <div className="space-y-3">
                  {winners.map((w) => (
                    <div
                      key={w.id}
                      className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                          <Trophy className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                            {w.raffle.title}
                          </h4>
                          <p className="text-xs font-bold text-emerald-700 font-mono">
                            Prize Value: {formatCurrency(w.prizeValue)}
                          </p>
                          <span className="text-[10px] text-gray-400">
                            Drawn on {formatDate(new Date(w.drawnAt))}
                          </span>
                        </div>
                      </div>

                      <Button asChild size="sm" className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0">
                        <Link href={`/raffles/${w.raffle.id}/winner`}>
                          Winner Proof
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (1 col): Personal Profile Details & Quick Actions */}
          <div className="space-y-6">
            {/* Personal Details Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-700" />
                  Account Details
                </h3>
                <Link
                  href="/profile/settings"
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  Edit
                </Link>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-gray-400 block text-[11px]">Full Name</span>
                  <span className="font-bold text-gray-900 text-sm">{user.name}</span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[11px]">Email Address</span>
                  <span className="font-semibold text-gray-800">{user.email}</span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[11px]">Contact Number</span>
                  <span className="font-semibold text-gray-800">
                    {user.phone ? user.phone : <span className="text-gray-400 italic">Not set</span>}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[11px]">Shipping City</span>
                  <span className="font-semibold text-gray-800">
                    {user.city ? `${user.city}, Pakistan` : <span className="text-gray-400 italic">Not set</span>}
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-gray-400 text-[11px]">Account Status</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                    Active & Verified
                  </span>
                </div>
              </div>

              <Button asChild variant="outline" className="w-full rounded-xl text-xs font-bold h-10 border-gray-200 hover:bg-gray-50">
                <Link href="/profile/settings">
                  <Settings className="w-3.5 h-3.5 mr-1 text-gray-500" />
                  Update Profile & Password
                </Link>
              </Button>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Quick Shortcuts
              </h3>
              <div className="space-y-2 text-xs">
                <Link
                  href="/raffles"
                  className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-emerald-50 text-gray-800 hover:text-emerald-800 transition-colors"
                >
                  <span className="font-semibold flex items-center gap-2">
                    <Flame className="w-4 h-4 text-emerald-600" />
                    Browse All Lucky Draws
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                </Link>

                <Link
                  href="/profile/entries"
                  className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-emerald-50 text-gray-800 hover:text-emerald-800 transition-colors"
                >
                  <span className="font-semibold flex items-center gap-2">
                    <Gift className="w-4 h-4 text-emerald-600" />
                    My Tickets History
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                </Link>

                <Link
                  href="/terms"
                  className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-emerald-50 text-gray-800 hover:text-emerald-800 transition-colors"
                >
                  <span className="font-semibold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    100% Ticket Draw Terms
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                </Link>
              </div>
            </div>

            {/* Official Support Box */}
            <div className="bg-emerald-900 text-white rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                  24/7 Live Support
                </h4>
              </div>
              <p className="text-xs text-emerald-100/90 leading-relaxed">
                Need help checking your ticket status or verifying a payment? Our Pakistani team is active on WhatsApp and email.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-3 rounded-xl bg-white text-emerald-950 text-xs font-bold hover:bg-emerald-50 transition-colors"
              >
                Contact Customer Help Desk
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
