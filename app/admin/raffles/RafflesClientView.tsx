"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Gift,
  Search,
  Edit,
  Calendar,
  Users,
  DollarSign,
  Trophy,
  ExternalLink,
  Plus,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"
import { DeleteRaffleButton } from "@/components/delete-raffle-button"

interface FormattedRaffle {
  id: string
  title: string
  description: string
  image: string | null
  price: number
  realPrice: number
  totalEntries: number
  currentEntries: number
  status: string
  category: string
  endDate: string
  createdAt: string
  totalRevenue: number
  entriesCount: number
}

export function RafflesClientView({ initialRaffles }: { initialRaffles: FormattedRaffle[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  const filtered = useMemo(() => {
    return initialRaffles.filter((raffle) => {
      const matchSearch =
        raffle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        raffle.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        raffle.category.toLowerCase().includes(searchTerm.toLowerCase())

      const matchStatus =
        statusFilter === "All" || raffle.status === statusFilter.toUpperCase()

      return matchSearch && matchStatus
    })
  }, [initialRaffles, searchTerm, statusFilter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            Active
          </span>
        )
      case "COMPLETED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
            Completed
          </span>
        )
      case "DRAFT":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            Draft
          </span>
        )
      case "CANCELLED":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 pointer-events-none" />
              <Input
                placeholder="Search raffles by title, description or category..."
                className="pl-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white min-h-[44px] text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {["All", "Active", "Completed", "Draft", "Cancelled"].map((status) => {
                const isActive = statusFilter === status
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors min-h-[40px] ${
                      isActive
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                    }`}
                  >
                    {status === "All" ? "All Raffles" : status}
                  </button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Raffles Grid (Mobile-friendly stacked cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {filtered.map((raffle) => {
          const percent = Math.min(
            100,
            Math.round((raffle.currentEntries / raffle.totalEntries) * 100)
          )

          return (
            <Card
              key={raffle.id}
              className="rounded-2xl border border-slate-200/80 shadow-xs bg-white overflow-hidden hover:border-slate-300 transition-all flex flex-col"
            >
              {/* Card Header on Mobile / Split on Desktop */}
              <div className="flex flex-col sm:flex-row h-full">
                {/* Image Section */}
                <div className="sm:w-48 h-48 sm:h-auto relative bg-slate-100 shrink-0">
                  <Image
                    src={raffle.image || "/placeholder.svg?height=200&width=300"}
                    alt={raffle.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 192px"
                  />
                  <div className="absolute top-3 left-3 sm:hidden">
                    {getStatusBadge(raffle.status)}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Link
                        href={`/admin/raffles/${raffle.id}`}
                        className="font-bold text-base text-slate-900 hover:text-red-600 transition-colors line-clamp-1"
                      >
                        {raffle.title}
                      </Link>
                      <div className="hidden sm:block shrink-0">
                        {getStatusBadge(raffle.status)}
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                      {raffle.description}
                    </p>

                    {/* Stats metrics */}
                    <div className="grid grid-cols-2 gap-2.5 py-3 border-y border-slate-100 text-xs mb-3">
                      <div>
                        <span className="text-slate-400 text-[11px] block">Price / Ticket</span>
                        <span className="font-mono font-bold text-slate-900">
                          {formatCurrency(raffle.price)}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 text-[11px] block">Total Revenue</span>
                        <span className="font-mono font-bold text-emerald-600">
                          {formatCurrency(raffle.totalRevenue)}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 text-[11px] block">Tickets Sold</span>
                        <span className="font-semibold text-slate-800">
                          {raffle.currentEntries} / {raffle.totalEntries}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 text-[11px] block">End Date</span>
                        <span className="font-medium text-slate-600">
                          {formatDate(new Date(raffle.endDate))}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 mb-4">
                      <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                        <span>Sale Progress</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-red-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs font-semibold min-h-[38px] flex-1 sm:flex-initial"
                    >
                      <Link href={`/admin/raffles/${raffle.id}`}>
                        Manage Details
                      </Link>
                    </Button>

                    <div className="flex items-center gap-1.5">
                      <Button
                        asChild
                        variant="outline"
                        size="icon"
                        className="rounded-xl h-[38px] w-[38px] text-slate-600 hover:text-slate-900"
                      >
                        <Link href={`/admin/raffles/${raffle.id}/edit`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit Raffle</span>
                        </Link>
                      </Button>

                      <DeleteRaffleButton raffleId={raffle.id} />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-12 text-center">
            <Gift className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No raffles found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              {searchTerm || statusFilter !== "All"
                ? "No campaigns match your search term or status filter."
                : "Get started by creating your first promotional raffle."}
            </p>
            <Button asChild className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs">
              <Link href="/admin/raffles/create">
                <Plus className="mr-2 h-4 w-4" />
                Create New Raffle
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
