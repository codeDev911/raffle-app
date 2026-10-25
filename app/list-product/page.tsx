"use client"

import React, { useState, useId } from "react"
import Link from "next/link"
import {
  Tag,
  DollarSign,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Upload,
  AlertCircle,
  HelpCircle,
  Clock,
  Layers,
  ChevronDown,
  Building,
  Smartphone,
  Bike,
  Gamepad2,
  Laptop,
  Flame,
  Check,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

const PRODUCT_CATEGORIES = [
  { id: "Electronics", name: "Smartphones & Tablets (iPhone, Samsung)", icon: Smartphone },
  { id: "Vehicles", name: "Motorcycles & Scooters (Honda, Yamaha, Suzuki)", icon: Bike },
  { id: "Gaming", name: "Gaming Consoles & PCs (PS5, Xbox, Custom Rigs)", icon: Gamepad2 },
  { id: "Laptops", name: "Laptops & Computing (MacBook, Dell, HP)", icon: Laptop },
  { id: "Appliances", name: "Home Appliances & 4K TVs", icon: Layers },
  { id: "Watches", name: "Luxury Watches & Gold", icon: Sparkles },
  { id: "Other", name: "Other High-Value Assets", icon: Tag },
]

const CITIES_LIST = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Gujranwala",
  "Sialkot",
  "Quetta",
  "Other City in Pakistan",
]

export default function ListProductPage() {
  // Calculator State
  const [calcMarketPrice, setCalcMarketPrice] = useState<number>(350000)
  const [calcTicketPrice, setCalcTicketPrice] = useState<number>(500)

  // Form State
  const [formData, setFormData] = useState({
    fullNameCnic: "",
    cnicNumber: "",
    phone: "",
    email: "",
    city: "Lahore",
    productType: "Electronics",
    productName: "",
    condition: "Brand New (Sealed)",
    description: "",
    marketPrice: "350000",
    ticketPrice: "500",
    imageUrl: "",
    agreeTerms: false,
  })

  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [successData, setSuccessData] = useState<any>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // Calculations for Calculator
  const calcGrossRevenue = Math.round(calcMarketPrice / 0.92)
  const calcTotalTickets = Math.max(1, Math.ceil(calcGrossRevenue / calcTicketPrice))
  const calcActualGross = calcTotalTickets * calcTicketPrice
  const calcPlatformFee = Math.round(calcActualGross * 0.08)
  const calcSellerPayout = calcActualGross - calcPlatformFee

  // Calculations for Form
  const formMarket = Math.max(0, parseInt(formData.marketPrice) || 0)
  const formTicket = Math.max(1, parseInt(formData.ticketPrice) || 1)
  const formGrossTarget = Math.round(formMarket / 0.92)
  const formTotalTickets = Math.max(1, Math.ceil(formGrossTarget / formTicket))
  const formActualGross = formTotalTickets * formTicket
  const formPlatformFee = Math.round(formActualGross * 0.08)
  const formSellerPayout = formActualGross - formPlatformFee

  const handleApplyCalculatorToForm = () => {
    setFormData((prev) => ({
      ...prev,
      marketPrice: calcMarketPrice.toString(),
      ticketPrice: calcTicketPrice.toString(),
    }))
    const formEl = document.getElementById("listing-form-section")
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")

    if (!formData.fullNameCnic.trim()) {
      setErrorMsg("Please enter your full legal name as it appears on your CNIC.")
      return
    }
    if (!formData.phone.trim()) {
      setErrorMsg("Please provide a valid WhatsApp phone number for verification.")
      return
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMsg("Please enter a valid email address.")
      return
    }
    if (!formData.productName.trim()) {
      setErrorMsg("Please provide your product title/name.")
      return
    }
    if (!formData.description.trim() || formData.description.length < 20) {
      setErrorMsg("Please provide a detailed description (specs, warranty, PTA status, etc. - min 20 chars).")
      return
    }
    if (formMarket < 1000) {
      setErrorMsg("Market price must be at least PKR 1,000.")
      return
    }
    if (formTicket < 50) {
      setErrorMsg("Ticket price must be at least PKR 50.")
      return
    }
    if (!formData.agreeTerms) {
      setErrorMsg("Please certify that you legally own this asset and all details are truthful.")
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        fullNameCnic: formData.fullNameCnic.trim(),
        cnicNumber: formData.cnicNumber.trim() || undefined,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        city: formData.city,
        productType: formData.productType,
        productName: formData.productName.trim(),
        condition: formData.condition,
        description: formData.description.trim(),
        marketPrice: formMarket,
        ticketPrice: formTicket,
        images: formData.imageUrl.trim() ? [formData.imageUrl.trim()] : [],
      }

      const res = await fetch("/api/listing-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setSuccessData(data.request)
        // reset fields
        setFormData({
          fullNameCnic: "",
          cnicNumber: "",
          phone: "",
          email: "",
          city: "Lahore",
          productType: "Electronics",
          productName: "",
          condition: "Brand New (Sealed)",
          description: "",
          marketPrice: "350000",
          ticketPrice: "500",
          imageUrl: "",
          agreeTerms: false,
        })
      } else {
        setErrorMsg(data.error || "Failed to submit request. Please try again.")
      }
    } catch (err) {
      console.error(err)
      setErrorMsg("Network error occurred. Please check your internet connection and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const faqs = [
    {
      q: "How and when will the PakRaffle team get in touch with me?",
      a: "After you submit your product listing application, our review team inspects your submitted details. We will reach out directly to you using one of your provided contact channels (WhatsApp, phone call, or email) within 24 to 48 hours to confirm specifications, schedule physical verification, and discuss campaign launch timing.",
    },
    {
      q: "Why must the item be shipped to PakRaffle for custody?",
      a: "To protect the integrity of the platform and build 100% buyer trust, all listed items must be physically shipped or personally delivered to our authorized inspection facility (in Lahore, Islamabad, or Karachi). We perform an in-person physical inspection and hold the product securely in insured escrow custody until the raffle is either successfully completed or officially cancelled.",
    },
    {
      q: "Can I cancel my raffle after it goes live? (Refunds & 8% fee rule)",
      a: "Yes, you may request to cancel your raffle. However, to protect participants who purchased tickets in good faith: (1) All sold tickets will be refunded 100% to buyers immediately, and (2) The seller must pay the 8% platform fee (covering verification, payment gateway processing, and promotional costs) before the product is released and returned.",
    },
    {
      q: "What is the 3-Month maximum campaign duration limit?",
      a: "Every listed raffle must be completed within 3 months (90 days) from its launch date. If the required ticket threshold is not reached within 3 months, PakRaffle will cancel the raffle, issue full 100% refunds to all ticket buyers, charge/deduct the 8% platform fee, and return the item to the seller.",
    },
    {
      q: "How does the 8% platform fee work on completed raffles?",
      a: "Our flat 8% fee is deducted from the total raffle gross revenue upon successful completion. There are zero upfront listing fees and zero hidden charges. You receive 92% of the total revenue, covering your agreed market price directly into your bank account.",
    },
    {
      q: "Why do I need to enter my full name as per CNIC?",
      a: "In compliance with Pakistani anti-fraud regulations and NADRA verification protocols, all product hosts must be legal Pakistani residents holding a valid CNIC. Bank/Raast payouts and custody agreements must strictly match your verified legal name.",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white text-xs py-2.5 px-4 border-b border-emerald-800/40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-emerald-400">PAKRAFFLE ASSET LISTINGS:</span>
            <span className="text-slate-300 hidden sm:inline">
              List Flagships, Bikes, Consoles &amp; Luxury Assets
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Flat 8% Platform Fee Only
            </span>
            <span className="text-slate-500 hidden md:inline">•</span>
            <span className="text-slate-300 hidden md:inline">Zero Upfront Cost</span>
            <span className="text-slate-500 hidden md:inline">•</span>
            <span className="text-amber-300 font-bold">100% Guaranteed Payout</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-emerald-50/40 to-slate-50 pt-12 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-200/80">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-emerald-300/20 to-teal-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-300/80 text-emerald-900 text-xs sm:text-sm font-semibold mb-6 shadow-2xs">
            <Flame className="w-4 h-4 text-emerald-600 fill-emerald-500" />
            <span>Turn Any High-Value Product Into Full Market Cash</span>
            <span className="bg-emerald-600 text-white text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full">
              8% Low Fee
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            List Your Product as a <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent">
              Verified Public Raffle
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Stop dealing with lowballers, delayed payments, and classified scam risks. List your
            phones, motorcycles, consoles, or gadgets. Thousands of Pakistani users buy small tickets,
            and you receive full market value minus our modest 8% platform fee.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <a
              href="#listing-form-section"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Submit Listing Application</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="#calculator-section"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-sm border border-slate-300 shadow-2xs transition-colors"
            >
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>Simulate 8% Fee &amp; Earnings</span>
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto text-left">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Platform Commission
              </span>
              <span className="text-2xl font-extrabold text-emerald-600">8% Flat</span>
              <span className="text-xs text-slate-500 block mt-0.5">92% Net Seller Payout</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Upfront Listing Cost
              </span>
              <span className="text-2xl font-extrabold text-slate-900">Rs. 0</span>
              <span className="text-xs text-slate-500 block mt-0.5">Pay only when sold</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Identity Safety
              </span>
              <span className="text-2xl font-extrabold text-slate-900">NADRA CNIC</span>
              <span className="text-xs text-slate-500 block mt-0.5">Verified Legal Owners</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Payout Channels
              </span>
              <span className="text-2xl font-extrabold text-slate-900">Instant</span>
              <span className="text-xs text-slate-500 block mt-0.5">Bank / Raast / JazzCash</span>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: PakRaffle vs Traditional Selling */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge className="bg-slate-900 text-white px-3 py-1 text-xs mb-3">Why Raffle Selling?</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Why Sell on PakRaffle vs Online Classifieds?
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Traditional marketplaces force you into endless bargaining, meetups with strangers, and huge price cuts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Classifieds Box */}
          <div className="bg-red-50/50 border border-red-200/80 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg">
                ✕
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">Traditional Classifieds / OLX</h3>
                <p className="text-xs text-red-700">High friction, slow turnaround, bargaining hassle</p>
              </div>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 font-bold shrink-0">✕</span>
                <span>Buyers demand 20% to 35% below genuine market value.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 font-bold shrink-0">✕</span>
                <span>Dozens of spam calls, fake screenshots, and no-show meetings.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 font-bold shrink-0">✕</span>
                <span>Takes weeks or months to find a single buyer with full cash in hand.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 font-bold shrink-0">✕</span>
                <span>Risk of counterfeit currency or unverified bank transfers.</span>
              </li>
            </ul>
          </div>

          {/* PakRaffle Box */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                ✓
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">PakRaffle Community Listing</h3>
                <p className="text-xs text-emerald-800 font-semibold">Fast sellouts, full market price, 100% escrow</p>
              </div>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-800 font-medium">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>You set and receive your full desired market price without discounts.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>Affordable tickets (Rs. 250 - Rs. 1,000) sell out rapidly across thousands of fans.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>Clear, transparent 8% platform fee automatically covers marketing &amp; escrow.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>Funds pre-collected in escrow — immediate bank transfer upon draw completion.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works Steps */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Simple 4-Step Listing &amp; Payout Process
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              From submission to full bank payout in as little as 3 to 7 days
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 relative group hover:border-emerald-500 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm mb-4 shadow-sm">
                01
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">Submit Product &amp; CNIC</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Fill the application below with your exact market price, product specs, photos, and CNIC details.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 relative group hover:border-emerald-500 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-extrabold flex items-center justify-center text-sm mb-4 shadow-sm">
                02
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">Verification &amp; Escrow</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our verification desk checks authenticity, PTA status, or vehicle documents and locks the campaign agreement.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 relative group hover:border-emerald-500 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-extrabold flex items-center justify-center text-sm mb-4 shadow-sm">
                03
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">Live Draw Campaign</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Featured across PakRaffle web, Instagram, and WhatsApp channels. Participants purchase tickets instantly.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 relative group hover:border-emerald-500 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm mb-4 shadow-sm">
                04
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">Receive 92% Payout</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Once tickets are filled and drawn, 92% net cash is wired directly to your verified Pakistani bank account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive 8% Fee & Ticket Calculator */}
      <section id="calculator-section" className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 rounded-3xl p-6 sm:p-10 text-white border border-slate-800 shadow-xl">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-400/20">
              <Calculator className="w-3.5 h-3.5" />
              <span>Auto-Calculation Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Interactive 8% Fee &amp; Ticket Price Calculator
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              Enter what you want in hand for your product. We automatically compute the suggested ticket price,
              total tickets, gross revenue, and our 8% platform fee.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Input Controls */}
            <div className="lg:col-span-7 space-y-6">
              {/* Market Price input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-semibold text-slate-200">
                    Product Market Price (What You Want to Receive)
                  </label>
                  <span className="text-base sm:text-lg font-mono font-bold text-emerald-400">
                    Rs. {calcMarketPrice.toLocaleString()}
                  </span>
                </div>
                <Input
                  type="number"
                  min="5000"
                  max="50000000"
                  step="5000"
                  value={calcMarketPrice}
                  onChange={(e) => setCalcMarketPrice(Math.max(1000, Number(e.target.value) || 0))}
                  className="bg-slate-900/80 border-slate-700 text-white font-mono text-base h-12 rounded-xl focus:border-emerald-500"
                />

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { label: "Rs. 75,000 (Console)", val: 75000 },
                    { label: "Rs. 185,000 (Laptop)", val: 185000 },
                    { label: "Rs. 350,000 (iPhone 16 Pro)", val: 350000 },
                    { label: "Rs. 490,000 (Bike)", val: 490000 },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setCalcMarketPrice(preset.val)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                        calcMarketPrice === preset.val
                          ? "bg-emerald-600 text-white border-emerald-500"
                          : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ticket Price input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-semibold text-slate-200">
                    Suggested Ticket Price per Entry
                  </label>
                  <span className="text-base sm:text-lg font-mono font-bold text-amber-400">
                    Rs. {calcTicketPrice.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[250, 500, 1000, 2500].map((price) => (
                    <button
                      key={price}
                      type="button"
                      onClick={() => setCalcTicketPrice(price)}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        calcTicketPrice === price
                          ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md"
                          : "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      Rs. {price}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-slate-400">Custom Ticket Price:</span>
                  <Input
                    type="number"
                    min="50"
                    step="50"
                    value={calcTicketPrice}
                    onChange={(e) => setCalcTicketPrice(Math.max(50, Number(e.target.value) || 50))}
                    className="bg-slate-900/80 border-slate-700 text-white font-mono text-xs h-8 w-28 rounded-lg"
                  />
                  <span className="text-[11px] text-slate-400">PKR</span>
                </div>
              </div>
            </div>

            {/* Calculated Breakdown Card */}
            <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl p-6 border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Campaign Financial Summary
                </span>
                <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  8% Flat Fee
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Product Market Value:</span>
                  <span className="font-mono font-bold text-white text-sm">
                    Rs. {calcMarketPrice.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span>Ticket Price per Entry:</span>
                  <span className="font-mono font-bold text-amber-400">
                    Rs. {calcTicketPrice.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span>Required Tickets to Sell:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {calcTotalTickets.toLocaleString()} Tickets
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span>Gross Campaign Revenue:</span>
                  <span className="font-mono font-bold text-white">
                    Rs. {calcActualGross.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-red-300 pt-1 pb-1 border-t border-slate-800/80">
                  <span className="flex items-center gap-1 font-semibold">
                    <span>PakRaffle Fee (8%):</span>
                  </span>
                  <span className="font-mono font-bold text-red-400">
                    - Rs. {calcPlatformFee.toLocaleString()}
                  </span>
                </div>

                <div className="bg-emerald-950/70 p-3.5 rounded-xl border border-emerald-500/40 flex justify-between items-center">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-300 uppercase block tracking-wider">
                      Net Seller Payout (92%)
                    </span>
                    <span className="text-[10px] text-emerald-400/80">Direct bank transfer upon draw</span>
                  </div>
                  <span className="font-mono text-lg font-extrabold text-emerald-300">
                    Rs. {calcSellerPayout.toLocaleString()}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleApplyCalculatorToForm}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-11 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Use These Values in Listing Form</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Official Seller Agreement & Custody Terms Policy Card */}
      <section className="py-6 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-amber-500/10 via-emerald-500/10 to-teal-500/10 border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-200/80">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                  Seller Agreement, Custody &amp; Cancellation Policy
                </h3>
                <p className="text-xs text-slate-600">
                  Please review these mandatory operational rules before submitting your application
                </p>
              </div>
            </div>
            <Badge className="bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider hidden sm:inline-flex">
              Binding Terms
            </Badge>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            {/* Rule 1: Review & Contact */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px]">
                  1
                </span>
                <span>Review &amp; Contact Outreach</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                After reviewing your application, our compliance team will get in touch directly using one of your provided contact details (WhatsApp, phone, or email) to verify identity and confirm specifications.
              </p>
            </div>

            {/* Rule 2: Item Shipped & Custody Hold */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px]">
                  2
                </span>
                <span>Physical Shipping &amp; Custody Hold</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                The item must be shipped or delivered to PakRaffle for physical verification and will be held in secure escrow custody until the raffle is either completed or officially cancelled.
              </p>
            </div>

            {/* Rule 3: Cancellation & 8% Platform Fee */}
            <div className="bg-white p-4 rounded-2xl border border-amber-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[11px]">
                  3
                </span>
                <span>Seller Cancellation &amp; 8% Fee</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                If a seller chooses to cancel their raffle after launch, all sold tickets will be refunded 100% to buyers, and the seller must pay PakRaffle the 8% platform fee before receiving their product back.
              </p>
            </div>

            {/* Rule 4: 3-Month Maximum Duration */}
            <div className="bg-white p-4 rounded-2xl border border-amber-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[11px]">
                  4
                </span>
                <span>3-Month Completion Limit</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                The raffle must be completed within 3 months (90 days). Otherwise, PakRaffle will cancel the raffle, issue full refunds to all ticket buyers, charge/deduct the 8% platform fee, and return the item.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Listing Application Form */}
      <section id="listing-form-section" className="py-10 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 px-6 sm:px-8 py-6 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/20 shrink-0">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Product Listing Application
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100 mt-0.5">
                  Complete this form to submit your asset for verification and draw scheduling
                </p>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8">
            {errorMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs sm:text-sm">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Please check your inputs</p>
                  <p className="text-red-700 mt-0.5">{errorMsg}</p>
                </div>
              </div>
            )}

            {successData ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center border-2 border-emerald-300">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  Application Submitted Successfully!
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Your reference ID is{" "}
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    {successData.id}
                  </span>
                  . Our verification desk will review your submission and contact you via WhatsApp within 24 hours.
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-md mx-auto text-left space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Product:</span>
                    <span className="font-semibold text-slate-900">{successData.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Legal Name (CNIC):</span>
                    <span className="font-semibold text-slate-900">{successData.fullNameCnic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Market Price:</span>
                    <span className="font-semibold text-slate-900">Rs. {successData.marketPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Suggested Ticket:</span>
                    <span className="font-semibold text-slate-900">Rs. {successData.ticketPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">8% Platform Fee:</span>
                    <span className="font-semibold text-red-600">Rs. {successData.platformFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
                    <span className="text-emerald-700">Estimated Net Payout:</span>
                    <span className="text-emerald-700 font-mono">Rs. {successData.sellerPayout.toLocaleString()}</span>
                  </div>
                </div>

                {/* Next Steps & Terms Reminder */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 max-w-md mx-auto text-left text-[11px] text-amber-900 space-y-1.5">
                  <p className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Next Steps &amp; Policy Timeline:</span>
                  </p>
                  <p>1. Our team will contact you via WhatsApp / Phone within 24-48 hours to confirm identity.</p>
                  <p>2. You will be provided shipping/handover instructions to our verified custody desk.</p>
                  <p>3. Campaign runs for a maximum of 3 months (90 days). If cancelled or expired, full ticket buyer refunds + 8% fee applies.</p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    type="button"
                    onClick={() => setSuccessData(null)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs px-6 h-11"
                  >
                    Submit Another Product
                  </Button>
                  <Button asChild variant="outline" className="rounded-xl text-xs px-6 h-11">
                    <Link href="/raffles">Browse Live Draws</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section 1: Seller Identity */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Seller Legal Identity &amp; Contact
                    </h3>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullNameCnic" className="text-xs font-bold text-slate-800">
                        Full Legal Name (as per CNIC) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="fullNameCnic"
                        required
                        placeholder="e.g. Muhammad Usman Nadeem"
                        value={formData.fullNameCnic}
                        onChange={(e) => setFormData({ ...formData, fullNameCnic: e.target.value })}
                        className="rounded-xl h-11 text-xs sm:text-sm"
                      />
                      <span className="text-[11px] text-slate-500 block">
                        Must match your Pakistani Bank / JazzCash account for payout.
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="cnicNumber" className="text-xs font-bold text-slate-800">
                        CNIC Number (Optional for initial review)
                      </Label>
                      <Input
                        id="cnicNumber"
                        placeholder="e.g. 35201-1234567-1"
                        value={formData.cnicNumber}
                        onChange={(e) => setFormData({ ...formData, cnicNumber: e.target.value })}
                        className="rounded-xl h-11 text-xs sm:text-sm font-mono"
                      />
                      <span className="text-[11px] text-slate-500 block">
                        Will be formally verified before campaign launch.
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs font-bold text-slate-800">
                        WhatsApp Contact Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        required
                        placeholder="e.g. +92 300 1234567"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="rounded-xl h-11 text-xs sm:text-sm font-mono"
                      />
                      <span className="text-[11px] text-slate-500 block">
                        Our verification team contacts you via WhatsApp.
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-bold text-slate-800">
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="e.g. yourname@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="rounded-xl h-11 text-xs sm:text-sm"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="city" className="text-xs font-bold text-slate-800">
                        City / Physical Inspection Desk Location <span className="text-red-500">*</span>
                      </Label>
                      <select
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3.5 h-11 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-medium focus:outline-hidden focus:border-emerald-600"
                      >
                        {CITIES_LIST.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Product Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      2
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Product Specifications &amp; Condition
                    </h3>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="productType" className="text-xs font-bold text-slate-800">
                        Product Category / Type <span className="text-red-500">*</span>
                      </Label>
                      <select
                        id="productType"
                        value={formData.productType}
                        onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                        className="w-full px-3.5 h-11 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-medium focus:outline-hidden focus:border-emerald-600"
                      >
                        {PRODUCT_CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="condition" className="text-xs font-bold text-slate-800">
                        Item Physical Condition <span className="text-red-500">*</span>
                      </Label>
                      <select
                        id="condition"
                        value={formData.condition}
                        onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                        className="w-full px-3.5 h-11 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-medium focus:outline-hidden focus:border-emerald-600"
                      >
                        <option value="Brand New (Sealed)">Brand New (Factory Sealed)</option>
                        <option value="Brand New (Zero Meter)">Brand New (Zero Meter / Vehicle)</option>
                        <option value="Open Box - Like New">Open Box - 10/10 Mint Condition</option>
                        <option value="Gently Used (With Box)">Gently Used (With Box &amp; Accessories)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="productName" className="text-xs font-bold text-slate-800">
                        Product Title &amp; Exact Model <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="productName"
                        required
                        placeholder="e.g. Apple iPhone 16 Pro Max 256GB Desert Titanium (PTA Approved)"
                        value={formData.productName}
                        onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                        className="rounded-xl h-11 text-xs sm:text-sm"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="description" className="text-xs font-bold text-slate-800">
                        Detailed Description &amp; Included Accessories <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        required
                        rows={4}
                        placeholder="Detail storage, color, official warranty remaining, PTA approval status, original receipt availability, charger, box condition, etc."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="rounded-xl text-xs sm:text-sm"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="imageUrl" className="text-xs font-bold text-slate-800">
                        Photo or Verification Image URL (Optional)
                      </Label>
                      <Input
                        id="imageUrl"
                        placeholder="https://images.unsplash.com/... or Google Drive link"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        className="rounded-xl h-11 text-xs sm:text-sm font-mono"
                      />
                      <span className="text-[11px] text-slate-500 block">
                        You can also share high-resolution photos and video verification directly via WhatsApp after submitting.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Financial & 8% Fee Auto-Calculation */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      3
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Pricing &amp; 8% Platform Fee Auto-Calculation
                    </h3>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="formMarketPrice" className="text-xs font-bold text-slate-800">
                        Product Market Price (PKR) <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3.5 flex items-center text-xs font-bold text-slate-400">
                          Rs.
                        </span>
                        <Input
                          id="formMarketPrice"
                          type="number"
                          required
                          min="1000"
                          step="1000"
                          value={formData.marketPrice}
                          onChange={(e) => setFormData({ ...formData, marketPrice: e.target.value })}
                          className="rounded-xl h-11 pl-10 text-xs sm:text-sm font-mono font-bold"
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        Net amount you expect to receive.
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="formTicketPrice" className="text-xs font-bold text-slate-800">
                        Suggested Ticket Price per Entry (PKR) <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3.5 flex items-center text-xs font-bold text-slate-400">
                          Rs.
                        </span>
                        <Input
                          id="formTicketPrice"
                          type="number"
                          required
                          min="50"
                          step="50"
                          value={formData.ticketPrice}
                          onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                          className="rounded-xl h-11 pl-10 text-xs sm:text-sm font-mono font-bold text-amber-600"
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        Common presets: Rs. 250, Rs. 500, Rs. 1,000
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Real-Time Math Card */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50/60 rounded-2xl p-5 border border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-200/80">
                      <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Calculator className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Live Revenue &amp; 8% Fee Breakdown</span>
                      </span>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-md">
                        Auto-Generated
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                        <span className="text-[11px] text-slate-500 block">Required Tickets:</span>
                        <span className="font-mono font-extrabold text-slate-900 text-sm">
                          {formTotalTickets.toLocaleString()}
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                        <span className="text-[11px] text-slate-500 block">Gross Revenue:</span>
                        <span className="font-mono font-extrabold text-slate-900 text-sm">
                          Rs. {formActualGross.toLocaleString()}
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-red-200 shadow-2xs">
                        <span className="text-[11px] text-red-600 font-semibold block">PakRaffle Fee (8%):</span>
                        <span className="font-mono font-extrabold text-red-600 text-sm">
                          Rs. {formPlatformFee.toLocaleString()}
                        </span>
                      </div>

                      <div className="bg-emerald-600 p-3 rounded-xl text-white shadow-xs">
                        <span className="text-[11px] text-emerald-100 font-semibold block">Your Net Payout (92%):</span>
                        <span className="font-mono font-extrabold text-white text-sm">
                          Rs. {formSellerPayout.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 4: Mandatory Terms & Legal Agreement */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Mandatory Seller Agreement &amp; Escrow Policies
                    </span>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold shrink-0 mt-0.5">•</span>
                      <span>
                        <strong>Contact Outreach:</strong> Our verification team will reach out via your verified contact details (WhatsApp, phone, or email) to review details within 24-48 hours.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold shrink-0 mt-0.5">•</span>
                      <span>
                        <strong>Physical Verification &amp; Custody Hold:</strong> The product must be shipped or delivered to PakRaffle for physical authentication and will be held in secure escrow custody until the raffle is either completed or officially cancelled.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold shrink-0 mt-0.5">•</span>
                      <span>
                        <strong>Cancellation &amp; 8% Platform Fee:</strong> If you choose to cancel your raffle after launch, all sold tickets will be refunded 100% to buyers, and you agree to pay PakRaffle the 8% platform fee before your product is returned.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold shrink-0 mt-0.5">•</span>
                      <span>
                        <strong>3-Month Maximum Duration:</strong> The raffle must complete within 3 months (90 days). If not completed within 3 months, PakRaffle will cancel the raffle, refund all ticket buyers in full, charge/deduct the 8% platform fee, and return your product.
                      </span>
                    </li>
                  </ul>

                  <label className="flex items-start gap-3 pt-2 border-t border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreeTerms}
                      onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <span className="text-xs font-semibold text-slate-800 leading-relaxed">
                      I have read, understood, and solemnly accept all the seller agreement terms above, including physical custody hold until completion or cancellation, 100% buyer refunds + 8% platform fee if cancelled, and the 3-month completion limit.
                    </span>
                  </label>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-13 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Product for Raffle Listing</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                  <p className="text-center text-[11px] text-slate-500 mt-2.5">
                    Zero upfront cost • Response guaranteed within 24 hours on WhatsApp
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge className="bg-emerald-100 text-emerald-900 px-3 py-1 text-xs mb-2">FAQ</Badge>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Frequently Asked Questions by Sellers
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isOpen ? "rotate-180 text-emerald-600" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
