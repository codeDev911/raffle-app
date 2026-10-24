"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatCurrency, formatDate } from "@/lib/utils"
import {
  Gift,
  Search,
  Flame,
  CheckCircle2,
  Clock,
  ExternalLink,
  Trophy,
  ArrowRight,
  ShieldCheck,
  User,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface EntryItem {
  id: string
  quantity: number
  totalCost: number
  createdAt: string | Date
  paymentId?: string | null
  raffle: {
    id: string
    title: string
    description?: string
    image?: string | null
    price: number
    status: string
    category: string
    totalEntries: number
    currentEntries: number
    endDate: string | Date
  }
  payment?: {
    status: string
    method?: string | null
  } | null
}

interface EntriesClientProps {
  userName: string
  userEmail: string
  entries: EntryItem[]
}

export function EntriesClient({ userName, userEmail, entries }: EntriesClientProps) {
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL")
  const [search, setSearch] = useState("")

  const totalTickets = entries.reduce((sum, e) => sum + e.quantity, 0)
  const activeEntries = entries.filter((e) => e.raffle.status === "ACTIVE")
  const completedEntries = entries.filter((e) => e.raffle.status === "COMPLETED")

  const filteredEntries = entries.filter((entry) => {
    if (filter === "ACTIVE" && entry.raffle.status !== "ACTIVE") return false
    if (filter === "COMPLETED" && entry.raffle.status !== "COMPLETED") return false
    if (search.trim()) {
      const q = search.toLowerCase()
      return (
        entry.raffle.title.toLowerCase().includes(q) ||
        entry.raffle.category.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="space-y-8">
      {/* 1. TOP PROFILE HERO BANNER */}
      <div className="bg-gradient-to-r from-emerald-950 via-green-950 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-emerald-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Participation Records
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              My Lucky Draw Tickets
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/90 max-w-xl">
              Track your tickets in ongoing draws and check verified draw status. Remember: draws are executed once 100% of target tickets are sold!
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button asChild size="sm" className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs min-h-[42px] px-5">
              <Link href="/raffles">
                <Flame className="w-3.5 h-3.5 mr-1 text-amber-300" />
                Enter Another Draw
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-gray-200/80 shadow-2xs overflow-x-auto no-scrollbar">
        <Link
          href="/profile"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/60 transition-colors whitespace-nowrap"
        >
          <User className="w-4 h-4 text-gray-500" />
          Dashboard Overview
        </Link>
        <Link
          href="/profile/entries"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-700 text-white shadow-2xs whitespace-nowrap"
        >
          <Gift className="w-4 h-4" />
          My Tickets & Entries
          <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-emerald-900 text-white">
            {totalTickets}
          </span>
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

      {/* 3. METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            Total Tickets Held
          </span>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 font-mono">
            {totalTickets}
          </div>
          <p className="text-[11px] text-gray-500">Across {entries.length} lucky draws</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            Active Draws
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
            {activeEntries.length}
          </div>
          <p className="text-[11px] text-gray-500">Draws pending 100% target sales</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            Completed Draws
          </span>
          <div className="text-2xl sm:text-3xl font-black text-blue-700 font-mono">
            {completedEntries.length}
          </div>
          <p className="text-[11px] text-gray-500">Past lucky draws</p>
        </div>
      </div>

      {/* 4. FILTER TABS & SEARCH */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Segmented Filter Control */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-2xl">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                filter === "ALL"
                  ? "bg-white text-gray-900 shadow-2xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All Tickets ({entries.length})
            </button>
            <button
              onClick={() => setFilter("ACTIVE")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                filter === "ACTIVE"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Active Draws ({activeEntries.length})
            </button>
            <button
              onClick={() => setFilter("COMPLETED")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                filter === "COMPLETED"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Completed ({completedEntries.length})
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by prize name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* 100% Target Rule Callout */}
        <div className="flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-50/80 border border-emerald-200/80 px-3 py-2 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Official Rule:</strong> Each lucky draw date is finalized once 100% of target tickets are sold out.
          </span>
        </div>

        {/* Entries List */}
        {filteredEntries.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
              <Gift className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No tickets found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {search
                ? "No entries match your search query. Try clearing the filter."
                : "You don't have any tickets under this filter. Explore active lucky draws!"}
            </p>
            <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs">
              <Link href="/raffles">Browse Lucky Draws</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {filteredEntries.map((entry) => {
              const isActive = entry.raffle.status === "ACTIVE"
              const isCompleted = entry.raffle.status === "COMPLETED"

              return (
                <div
                  key={entry.id}
                  className="bg-white rounded-3xl p-5 border border-gray-200/90 shadow-2xs hover:shadow-xs transition-shadow space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                        <Image
                          src={entry.raffle.image || "/placeholder.jpg"}
                          alt={entry.raffle.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                            {entry.raffle.category}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isActive
                                ? "bg-emerald-100 text-emerald-800"
                                : isCompleted
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {isActive ? "Active (Draw Pending 100% Sales)" : entry.raffle.status}
                          </span>
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                          {entry.raffle.title}
                        </h3>

                        <p className="text-xs text-gray-500">
                          Purchased on {formatDate(new Date(entry.createdAt))}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap sm:flex-col sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
                      <div className="text-right">
                        <span className="text-xs text-gray-500 block">Tickets Allocated</span>
                        <span className="text-base sm:text-lg font-black text-gray-900 font-mono">
                          {entry.quantity} {entry.quantity === 1 ? "Ticket" : "Tickets"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-700 font-mono">
                          Total: {formatCurrency(entry.totalCost)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 text-gray-600">
                      <span className="flex items-center gap-1 font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified Payment
                      </span>
                      {entry.payment?.method && (
                        <>
                          <span>•</span>
                          <span>via {entry.payment.method}</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="text-gray-500">
                        {isActive
                          ? "Draws when all target tickets sold"
                          : "Draw conducted"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button asChild size="sm" variant="outline" className="rounded-xl text-xs font-bold border-gray-200">
                        <Link href={`/raffles/${entry.raffle.id}`}>
                          View Lucky Draw
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Link>
                      </Button>

                      {isCompleted && (
                        <Button asChild size="sm" className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-2xs">
                          <Link href={`/raffles/${entry.raffle.id}/winner`}>
                            <Trophy className="w-3 h-3 mr-1" />
                            Winner Proof
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
