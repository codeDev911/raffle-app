"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Trophy,
  ShieldCheck,
  Plus,
  Minus,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Lock,
  ArrowRight,
  Clock,
  Zap,
  ChevronDown,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import Image from "next/image"

interface Raffle {
  id: string
  title: string
  price: number
  totalEntries: number
  currentEntries: number
  image?: string
}

interface EnterRaffleModalProps {
  raffle: Raffle
  referralLinkId: string | boolean
  isOpen: boolean
  onClose: () => void
}

const paymentMethodsList = [
  {
    id: "NAYAPAY",
    title: "NayaPay",
    subtitle: "Digital Wallet & Visa Debit",
    tag: "Zero Fee",
    color: "border-orange-500 text-orange-700 bg-orange-50/70",
    badgeColor: "bg-orange-100 text-orange-800",
    avatarBg: "bg-orange-500 text-white",
    logo: "/assets/nayapay.svg",
  },
  {
    id: "SADAPAY",
    title: "SadaPay",
    subtitle: "Mastercard & SadaBiz Wallet",
    tag: "Free Transfer",
    color: "border-teal-500 text-teal-700 bg-teal-50/70",
    badgeColor: "bg-teal-100 text-teal-800",
    avatarBg: "bg-teal-600 text-white",
    logo: "/assets/sadapay.svg",
  },
  {
    id: "MEZAN",
    title: "Meezan Bank & Raast",
    subtitle: "Direct Bank Transfer / Raast",
    tag: "Raast Instant",
    color: "border-purple-600 text-purple-800 bg-purple-50/70",
    badgeColor: "bg-purple-100 text-purple-800",
    avatarBg: "bg-purple-800 text-white",
    logo: "/assets/raast.svg",
  },
]

export function EnterRaffleModal({ raffle, isOpen, onClose, referralLinkId }: EnterRaffleModalProps) {
  const [entries, setEntries] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("EASYPAISA")
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const remainingAvailable = Math.max(0, (raffle?.totalEntries || 1000) - (raffle?.currentEntries || 0))
  const maxAllowed = Math.min(10, remainingAvailable > 0 ? remainingAvailable : 1)

  // Price in DB is stored in Paisas (cents)
  const singleTicketPricePkr = (raffle?.price || 0) / 100
  const totalCostPkr = singleTicketPricePkr * entries

  const handleQuickSelect = (count: number) => {
    setEntries(Math.min(count, maxAllowed))
    setErrorMessage(null)
  }

  const handleIncrement = () => {
    if (entries < maxAllowed) {
      setEntries(entries + 1)
      setErrorMessage(null)
    }
  }

  const handleDecrement = () => {
    if (entries > 1) {
      setEntries(entries - 1)
      setErrorMessage(null)
    }
  }

  const handleSubmit = async () => {
    setErrorMessage(null)

    if (remainingAvailable < entries) {
      setErrorMessage(`Only ${remainingAvailable} tickets remain available for this draw!`)
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/payments/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raffleId: raffle.id,
          quantity: entries,
          referralLinkId: referralLinkId || undefined,
          method: paymentMethod,
        }),
      })

      const data = await response.json()

      if (response.ok && data?.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        setErrorMessage(data?.error || data?.message || "Unable to initiate payment. Please try again.")
      }
    } catch (error) {
      console.error("Network error during payment initiation:", error)
      setErrorMessage("Network error occurred. Please check your connection and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const selectedMethodObj = paymentMethodsList.find((m) => m.id === paymentMethod) || paymentMethodsList[0]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed left-0 top-0 translate-x-0 translate-y-0 w-full h-[100dvh] max-w-none rounded-none border-0 p-0 overflow-hidden bg-white flex flex-col sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:w-full sm:max-w-lg sm:h-auto sm:max-h-[90vh] sm:rounded-3xl sm:border sm:border-gray-200 sm:shadow-2xl [&>button]:text-white [&>button]:opacity-90 [&>button]:hover:opacity-100 [&>button]:bg-white/20 [&>button]:hover:bg-white/30 [&>button]:rounded-full [&>button]:p-1.5 [&>button]:top-4 [&>button]:right-4">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 px-6 py-5 text-white relative">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20">
                <Trophy className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Enter Draw
                  <span className="text-[11px] font-semibold bg-emerald-400/30 text-emerald-100 border border-emerald-300/30 px-2 py-0.5 rounded-full">
                    Official Entry
                  </span>
                </DialogTitle>
                <DialogDescription className="text-emerald-100 text-xs sm:text-sm line-clamp-1 mt-0.5">
                  {raffle?.title}
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Mini Raffle Card inside header */}
          <div className="mt-4 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {raffle?.image ? (
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white/10 shrink-0 border border-white/20">
                  <Image
                    src={raffle.image}
                    alt={raffle.title}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-yellow-300" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-white font-semibold text-xs sm:text-sm truncate">
                  {raffle?.title}
                </p>
                <p className="text-emerald-100 text-xs flex items-center gap-1.5 mt-0.5">
                  <span className="font-bold text-white font-mono">{formatCurrency(raffle.price)}</span>
                  <span>/ ticket</span>
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[11px] text-emerald-200 block">Remaining</span>
              <span className="text-xs sm:text-sm font-bold text-white font-mono">
                {remainingAvailable} left
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="px-5 sm:px-6 py-5 overflow-y-auto space-y-5 text-gray-900 flex-1">
          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-red-800 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Unable to proceed</p>
                <p className="text-red-700 text-xs mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Ticket Quantity Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <span>Select Number of Tickets</span>
                <span className="text-[11px] font-normal text-gray-500">(Max 10 per order)</span>
              </label>
              {entries > 1 && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-600" />
                  {entries}x Winning Chance
                </span>
              )}
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleDecrement}
                disabled={entries <= 1 || submitting}
                className="h-12 w-12 rounded-2xl border-gray-200 hover:bg-gray-100 shrink-0 text-gray-700 disabled:opacity-40"
              >
                <Minus className="h-5 w-5" />
              </Button>

              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl h-12 flex items-center justify-center gap-2 px-4 shadow-inner">
                <span className="text-xl font-bold font-mono text-gray-900">{entries}</span>
                <span className="text-xs text-gray-500 font-medium">
                  {entries === 1 ? "Ticket" : "Tickets"}
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleIncrement}
                disabled={entries >= maxAllowed || submitting}
                className="h-12 w-12 rounded-2xl border-gray-200 hover:bg-gray-100 shrink-0 text-gray-700 disabled:opacity-40"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            {/* Quick Preset Chips */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[1, 2, 5, 10].map((count) => {
                const disabled = count > maxAllowed
                const isSelected = entries === count
                return (
                  <button
                    key={count}
                    type="button"
                    disabled={disabled || submitting}
                    onClick={() => handleQuickSelect(count)}
                    className={`py-2 px-1 text-xs font-semibold rounded-xl border transition-all text-center ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : disabled
                        ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                        : "bg-white text-gray-700 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                    }`}
                  >
                    {count} {count === 1 ? "Ticket" : "Tickets"}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Payment Method Selector (Select Dropdown - Provider Names Only) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="payment-method-select" className="text-xs sm:text-sm font-bold text-gray-800">
                Payment Method
              </label>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Instant Verification
              </span>
            </div>

            <div className="relative">
              {/* Selected Method Logo Preview on Left */}
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center p-1 shadow-2xs">
                  {selectedMethodObj.logo ? (
                    <img
                      src={selectedMethodObj.logo}
                      alt={selectedMethodObj.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                      {selectedMethodObj.title.slice(0, 2)}
                    </div>
                  )}
                </div>
              </div>

              {/* Native / Stylized Select Dropdown with Provider Names Only */}
              <select
                id="payment-method-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={submitting}
                className="w-full pl-13 pr-10 py-3.5 text-xs sm:text-sm font-bold bg-white border-2 border-gray-200 rounded-2xl appearance-none focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-gray-900 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              >
                {paymentMethodsList.map((m) => (
                  <option key={m.id} value={m.id} className="text-gray-900 font-semibold py-2">
                    {m.title}
                  </option>
                ))}
              </select>

              {/* Custom Down Arrow Icon */}
              <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-gray-400">
                <ChevronDown className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* Pricing & Order Summary Card */}
          <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/50 rounded-2xl border border-emerald-100 p-4 space-y-2.5">
            <div className="flex justify-between items-center text-xs text-gray-600">
              <span>
                Ticket Price ({entries} × {formatCurrency(raffle.price)})
              </span>
              <span className="font-semibold text-gray-800 font-mono">
                Rs. {totalCostPkr.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs text-gray-600">
              <span className="flex items-center gap-1">
                TCS Courier & Platform Fee
              </span>
              <span className="font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded text-[11px]">
                FREE
              </span>
            </div>

            <div className="pt-2 border-t border-emerald-200/60 flex justify-between items-center">
              <div>
                <span className="text-xs text-gray-600 block">Total Payable</span>
                <span className="text-[11px] text-emerald-700 font-medium">Via {selectedMethodObj.title}</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
                  Rs. {totalCostPkr.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Security & Verification Guarantee */}
          <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 flex items-center justify-between gap-2 text-[11px] text-gray-600">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Secure & Verified Live Draw</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <Lock className="w-3 h-3 text-gray-400" />
              <span>End-to-End SSL</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 sm:px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={submitting}
            className="rounded-2xl h-12 px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 font-semibold text-sm"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 rounded-2xl h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Opening Checkout...</span>
              </>
            ) : (
              <>
                <span>Pay Rs. {totalCostPkr.toLocaleString()}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
