"use client"

import React, { Suspense, useState, useId } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  Ticket,
  Eye,
  Copy,
  Check,
  Trophy,
  ShieldCheck,
  FileText,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ChevronDown,
  RefreshCw,
  Home,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const paymentMethodsConfig: Record<
  string,
  {
    name: string
    shortName: string
    icon: string
    badgeBg: string
    badgeText: string
    borderColor: string
  }
> = {
  easypaisa: {
    name: "EasyPaisa Mobile Wallet",
    shortName: "EasyPaisa",
    icon: "/assets/easypaisa-logo.png",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-800",
    borderColor: "border-emerald-200",
  },
  jazzcash: {
    name: "JazzCash Mobile Account",
    shortName: "JazzCash",
    icon: "/assets/jazzcash-logo.png",
    badgeBg: "bg-red-50",
    badgeText: "text-red-800",
    borderColor: "border-red-200",
  },
  nayapay: {
    name: "NayaPay Digital Wallet",
    shortName: "NayaPay",
    icon: "/assets/nayapay.png",
    badgeBg: "bg-orange-50",
    badgeText: "text-orange-800",
    borderColor: "border-orange-200",
  },
  sadapay: {
    name: "SadaPay Debit & Wallet",
    shortName: "SadaPay",
    icon: "https://crystalpng.com/wp-content/uploads/2025/09/Sadapay-Logo-768x768.png",
    badgeBg: "bg-teal-50",
    badgeText: "text-teal-800",
    borderColor: "border-teal-200",
  },
  sayapay: {
    name: "SadaPay Debit & Wallet",
    shortName: "SadaPay",
    icon: "https://crystalpng.com/wp-content/uploads/2025/09/Sadapay-Logo-768x768.png",
    badgeBg: "bg-teal-50",
    badgeText: "text-teal-800",
    borderColor: "border-teal-200",
  },
  meezan: {
    name: "Meezan Bank & Raast",
    shortName: "Meezan Bank",
    icon: "https://crystalpng.com/wp-content/uploads/2024/09/Meezan-Bank-Logo.png",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-800",
    borderColor: "border-blue-200",
  },
}

function ThankYouContent() {
  const searchParams = useSearchParams()

  const orderId = searchParams.get("orderId") || "PR-" + Math.floor(100000 + Math.random() * 900000)
  const raffleId = searchParams.get("raffleId") || ""
  const rawMethod = (searchParams.get("paymentMethod") || "easypaisa").toLowerCase()
  const amountParam = searchParams.get("amount") || ""
  const quantityParam = searchParams.get("quantity") || ""
  const raffleTitleParam = searchParams.get("raffleTitle") || ""

  const selectedMethod = paymentMethodsConfig[rawMethod] || paymentMethodsConfig.easypaisa

  const [copiedOrder, setCopiedOrder] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleCopyOrder = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId)
      setCopiedOrder(true)
      setTimeout(() => setCopiedOrder(false), 2000)
    }
  }

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gray-50/60 text-gray-900 pb-20">
      {/* Top Simple Nav */}
      <header className="bg-white border-b border-gray-200/80 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>

          <span className="text-xs text-gray-400 hidden sm:inline">Receipt queued for verification</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Celebration / Status Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-200/80 text-center relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

          {/* Animated Success Badge Icon */}
          <div className="relative mx-auto mb-5 w-20 h-20 sm:w-24 sm:h-24">
            <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-30" />
            <div className="relative w-full h-full rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-600/25">
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-white stroke-[2.2]" />
            </div>
          </div>

          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-800 border-emerald-200 px-3.5 py-1 text-xs sm:text-sm font-bold rounded-full mb-3 inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Receipt Submitted & Queued
          </Badge>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-2 sm:mb-3">
            Payment Receipt Received!
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
            Thank you! Your payment proof has been successfully transmitted to the PakRaffle accounts desk.
            We will verify your transaction against bank records within{" "}
            <span className="font-bold text-gray-900">15 to 30 minutes</span> and allocate your official lucky ticket numbers.
          </p>

          {/* Order ID Pill with Copy */}
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 p-2 px-4 rounded-2xl bg-gray-50 border border-gray-200">
            <span className="text-xs text-gray-500 font-medium">Order Reference:</span>
            <span className="font-mono font-bold text-sm sm:text-base text-gray-900">#{orderId}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopyOrder}
              className="h-7 px-2.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-emerald-700 hover:bg-white"
            >
              {copiedOrder ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 3-Step Live Progress Timeline */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-200/80 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Verification & Ticket Allocation Journey
            </h3>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Step 2 of 3 Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 relative">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  <Check className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  1. Receipt Uploaded
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-snug">
                Your payment screenshot and order details have been securely logged into our system.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-800 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Completed</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 relative">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold animate-pulse shadow-xs">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  2. Bank Statement Match
                </span>
              </div>
              <p className="text-xs text-gray-700 leading-snug">
                Our Pakistani banking desk is verifying the transaction ID & sender amount with {selectedMethod.shortName}.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-800 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                <span>Under Review (15–30 Mins)</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 relative">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-xs font-bold shadow-xs">
                  <Ticket className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  3. Official Ticket Issued
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-snug">
                Once approved, unique serial raffle ticket numbers are credited to your account and sent via SMS/Email.
              </p>
              <div className="mt-3 text-[11px] text-gray-400 font-medium">
                <span>Final Step</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details & Receipt Breakdown Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-200/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Submission Details
            </h3>
            <Badge variant="secondary" className="font-mono text-xs font-semibold">
              Pending Verification
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-[11px] font-medium text-gray-500 block">Payment Method</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-6 h-6 rounded-md bg-white border border-gray-200 p-0.5 flex items-center justify-center shrink-0">
                  <img
                    src={selectedMethod.icon}
                    alt={selectedMethod.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback if image fails
                      ;(e.target as HTMLElement).style.display = "none"
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-900 line-clamp-1">{selectedMethod.name}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-[11px] font-medium text-gray-500 block">Tickets Reserved</span>
              <span className="text-sm font-bold text-gray-900 font-mono mt-1 block">
                {quantityParam ? `${quantityParam} Entries` : "Active Request"}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-[11px] font-medium text-gray-500 block">Total Amount</span>
              <span className="text-sm font-black text-emerald-700 font-mono mt-1 block">
                {amountParam ? `Rs. ${Number(amountParam).toLocaleString()}` : "Paid in PKR"}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-[11px] font-medium text-gray-500 block">Raffle Draw</span>
              <span className="text-xs font-bold text-gray-900 line-clamp-1 mt-1 block">
                {raffleTitleParam || (raffleId ? `Raffle #${raffleId}` : "PakRaffle Official")}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons Hub */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {raffleId && (
            <Link href={`/raffles/${raffleId}`} className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto rounded-2xl h-12 px-6 border-gray-300 hover:border-gray-400 font-semibold text-gray-700 flex items-center justify-center gap-2 text-sm shadow-2xs"
              >
                <Eye className="w-4 h-4" />
                <span>Return to Raffle</span>
              </Button>
            </Link>
          )}

          <Link href="/profile/entries" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto rounded-2xl h-12 px-7 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2">
              <Ticket className="w-4 h-4" />
              <span>View My Entries & Tickets</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href="/raffles" className="w-full sm:w-auto">
            <Button
              variant="ghost"
              className="w-full sm:w-auto rounded-2xl h-12 px-5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium text-sm"
            >
              <Layers className="w-4 h-4 mr-1.5 text-gray-400" />
              <span>Explore More Draws</span>
            </Button>
          </Link>
        </div>

        {/* Trust & Guarantee Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 text-center space-y-1 text-xs text-gray-500">
          <div className="flex items-center justify-center gap-1.5 font-bold text-gray-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>PakRaffle Official Transparency Guarantee</span>
          </div>
          <p className="text-[11px] text-gray-500 max-w-xl mx-auto">
            All draws are conducted live with certified random selection. Receipts are manually matched to official bank statements.
            For any dispute or clarification, reach us anytime through our support desk at support@pakraffle.com.
          </p>
        </div>
      </main>
    </div>
  )
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-gray-500">Loading payment confirmation...</p>
          </div>
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  )
}
