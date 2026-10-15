"use client"

import React, { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Trophy,
  Clock,
  Star,
  Search,
  Sparkles,
  ShieldCheck,
  Truck,
  Video,
  X,
  ArrowRight,
  Gift,
  Users,
  CheckCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react"

interface RaffleItem {
  id: string
  title: string
  description: string
  image?: string | null
  price: number // in paisa
  realPrice: number // in paisa
  totalEntries: number
  currentEntries: number
  category: string
  featured: boolean
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED"
  endDate: string | Date
  createdAt: string | Date
  _count?: {
    entries: number
  }
}

interface RafflesClientProps {
  initialRaffles: RaffleItem[]
  categories: string[]
}

const WHATSAPP_COMMUNITY_URL = "https://chat.whatsapp.com/invite/pakraffle-official"
const WHATSAPP_PHONE_CLEAN = "923377155722"

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.507 14.307l-.009.075c-.238-.12-1.406-.694-1.624-.774-.219-.079-.378-.12-.538.12-.158.239-.617.774-.757.933-.138.16-.279.179-.517.06-.239-.12-1.008-.372-1.92-1.185-.709-.633-1.188-1.415-1.328-1.654-.139-.239-.015-.368.105-.487.108-.107.239-.279.359-.418.119-.14.159-.239.239-.399.08-.159.04-.299-.02-.418-.06-.12-.538-1.296-.737-1.774-.194-.467-.393-.404-.539-.412l-.46-.008c-.159 0-.418.06-.637.299-.22.239-.837.817-.837 1.993 0 1.176.857 2.311.976 2.471.12.16 1.687 2.576 4.088 3.613.571.247 1.018.395 1.366.506.574.183 1.096.157 1.509.095.46-.069 1.406-.575 1.605-1.131.199-.557.199-1.035.139-1.135-.059-.1-.219-.16-.458-.279zM12.023 2C6.49 2 2 6.48 2 12c0 1.979.578 3.824 1.579 5.378L2.094 22l4.802-1.436C8.36 21.435 10.134 22 12.023 22c5.534 0 10.024-4.48 10.024-10S17.557 2 12.023 2zm0 18.25c-1.644 0-3.18-.49-4.475-1.332l-.321-.21-2.852.853.865-2.784-.23-.332A8.196 8.196 0 013.78 12c0-4.545 3.697-8.243 8.243-8.243 4.545 0 8.243 3.698 8.243 8.243 0 4.545-3.698 8.25-8.243 8.25z" />
    </svg>
  )
}

export function RafflesClient({ initialRaffles, categories }: RafflesClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const hasActiveRaffles = initialRaffles.some((r) => r.status === "ACTIVE")
  const [selectedStatus, setSelectedStatus] = useState<"ACTIVE" | "COMPLETED" | "ALL">(
    hasActiveRaffles ? "ACTIVE" : "ALL"
  )
  const [sortBy, setSortBy] = useState("popular")

  // Filter & sort logic
  const filteredRaffles = useMemo(() => {
    return initialRaffles
      .filter((raffle) => {
        // Status filter
        if (selectedStatus !== "ALL" && raffle.status !== selectedStatus) {
          return false
        }

        // Category filter
        if (selectedCategory !== "all" && raffle.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false
        }

        // Search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim()
          const titleMatch = raffle.title.toLowerCase().includes(query)
          const descMatch = raffle.description.toLowerCase().includes(query)
          const catMatch = raffle.category.toLowerCase().includes(query)
          if (!titleMatch && !descMatch && !catMatch) return false
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === "popular") {
          return (b.currentEntries || 0) - (a.currentEntries || 0)
        }
        if (sortBy === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
        if (sortBy === "price-low") {
          return a.price - b.price
        }
        if (sortBy === "price-high") {
          return b.price - a.price
        }
        if (sortBy === "popular") {
          return (b.currentEntries || 0) - (a.currentEntries || 0)
        }
        return 0
      })
  }, [initialRaffles, selectedStatus, selectedCategory, searchQuery, sortBy])

  // Count active vs completed
  const activeCount = initialRaffles.filter((r) => r.status === "ACTIVE").length
  const completedCount = initialRaffles.filter((r) => r.status === "COMPLETED").length

  return (
    <div className="min-h-screen bg-gray-50 pb-20 text-gray-900">
      {/* Hero Header */}
      <div className="bg-gradient-to-b from-emerald-50/60 via-white to-gray-50 border-b border-gray-200/80 pt-8 pb-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100/80 text-green-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-green-600" />
              100% Transparent Lucky Draws in Pakistan
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Win Big Prizes for a Few Coins
            </h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Choose from brand new iPhones, motorcycles, consoles, and cash grand prizes. Verified live draws broadcasted publicly on YouTube & Facebook.
            </p>
          </div>

          {/* Trust Value Badges Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 max-w-4xl mx-auto mt-8">
            <div className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl bg-white border border-gray-200/90 shadow-2xs">
              <div className="p-1.5 rounded-lg bg-green-50 text-green-600 shrink-0">
                <Video className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-gray-900 block leading-tight">Live Video Draw</span>
                <span className="text-[10px] text-gray-500">Public random picker</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl bg-white border border-gray-200/90 shadow-2xs">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-gray-900 block leading-tight">PTA & Sealed Box</span>
                <span className="text-[10px] text-gray-500">Official brand warranty</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl bg-white border border-gray-200/90 shadow-2xs">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-gray-900 block leading-tight">Free TCS Courier</span>
                <span className="text-[10px] text-gray-500">Nationwide delivery</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl bg-white border border-gray-200/90 shadow-2xs">
              <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 shrink-0">
                <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-gray-900 block leading-tight">24/7 WhatsApp</span>
                <span className="text-[10px] text-gray-500">Live draw reminders</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 space-y-6">
        {/* Status Mode Tabs (Active Draws vs Past Winners) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="inline-flex p-1 bg-gray-200/80 rounded-xl max-w-sm">
            <button
              onClick={() => setSelectedStatus("ACTIVE")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedStatus === "ACTIVE"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Active Draws ({activeCount})
            </button>
            <button
              onClick={() => setSelectedStatus("COMPLETED")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedStatus === "COMPLETED"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Completed Winners ({completedCount})
            </button>
            <button
              onClick={() => setSelectedStatus("ALL")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedStatus === "ALL"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={WHATSAPP_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold shadow-2xs transition-colors shrink-0"
            >
              <WhatsAppIcon className="w-4 h-4" />
              Join WhatsApp Draw Alerts
            </a>
          </div>
        </div>

        {/* Filter Controls Suite */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-3.5">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by prize name (e.g., iPhone, Honda, PS5, Cash)..."
                className="pl-10 pr-9 rounded-xl border-gray-200 h-11 text-xs sm:text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="w-full md:w-52 shrink-0">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="rounded-xl border-gray-200 h-11 text-xs sm:text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest Added</SelectItem>
                  <SelectItem value="price-low">Entry Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Entry Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Category Pills Scrollbar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar touch-pan-x pt-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                selectedCategory === "all"
                  ? "bg-green-600 text-white shadow-2xs"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat.toLowerCase())}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                  selectedCategory === cat.toLowerCase()
                    ? "bg-green-600 text-white shadow-2xs"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Raffles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredRaffles.map((raffle) => {
            const isCompleted = raffle.status === "COMPLETED"

            return (
              <div
                key={raffle.id}
                className="group bg-white rounded-2xl border border-gray-200/90 hover:border-green-300 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
              >
                {/* Image & Badges */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                  <Image
                    src={raffle.image || "/placeholder.jpg"}
                    alt={raffle.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                    className="object-cover group-hover:scale-103 transition-transform duration-300"
                  />

                  {raffle.featured && (
                    <div className="absolute top-2.5 left-2.5 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" />
                      Featured
                    </div>
                  )}

                  <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-xs text-gray-800 text-[10px] font-semibold px-2 py-0.5 rounded shadow-2xs border border-gray-200">
                    {raffle.category}
                  </div>

                  {/* Draw Status Overlay Badge (No days or countdown) */}
                  <div className="absolute bottom-2.5 left-2.5">
                    {isCompleted ? (
                      <div className="bg-sky-600/95 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-2xs flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        Draw Completed
                      </div>
                    ) : (
                      <div className="bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-2xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Live Draw
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <Link href={`/raffles/${raffle.id}`}>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1 leading-snug">
                        {raffle.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {raffle.description}
                    </p>
                  </div>

                  {/* Price & Valuation */}
                  <div className="flex items-baseline justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase tracking-wider font-semibold">Entry Ticket</span>
                      <span className="text-xl font-bold text-green-600 font-mono">
                        {formatCurrency(raffle.price)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-500 block uppercase tracking-wider font-semibold">Market Value</span>
                      <span className="text-xs font-semibold text-gray-400 line-through font-mono">
                        {formatCurrency(raffle.realPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-1">
                    {isCompleted ? (
                      <Button asChild variant="outline" className="w-full rounded-xl py-5 border-amber-300 text-amber-900 hover:bg-amber-50 text-xs font-bold">
                        <Link href={`/raffles/${raffle.id}/winner`}>
                          <Trophy className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                          View Winner Result
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-5 text-xs font-bold shadow-2xs">
                        <Link href={`/raffles/${raffle.id}`}>
                          <Gift className="w-3.5 h-3.5 mr-1.5" />
                          Enter Draw ({formatCurrency(raffle.price)})
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredRaffles.length === 0 && (
          <div className="text-center py-16 px-4 bg-white rounded-2xl border border-gray-200">
            <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900 mb-1">No raffles match your filters</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5">
              Try searching for different keywords or clear your category filter to see active prizes.
            </p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
                setSelectedStatus("ACTIVE")
              }}
              variant="outline"
              className="rounded-xl text-xs"
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* Bottom Official WhatsApp Community Banner */}
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-xs shrink-0 mx-auto sm:mx-0">
              <WhatsAppIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900">
                Join PakRaffle WhatsApp Channel
              </h4>
              <p className="text-xs text-gray-600 mt-0.5">
                Over 25,000 members receive live draw links, fast receipt verification, and exclusive discount drops.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <a
              href={WHATSAPP_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold shadow-xs transition-colors whitespace-nowrap min-h-[44px]"
            >
              <WhatsAppIcon className="w-4 h-4" />
              Join WhatsApp Channel
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
