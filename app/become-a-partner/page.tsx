"use client"

import React, { useState } from "react"
import {
  TrendingUp,
  DollarSign,
  Handshake,
  ArrowRight,
  Zap,
  Wallet,
  Clock,
  Flame,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  ExternalLink,
  Calculator,
  ShieldCheck,
  BarChart3,
  Sparkles,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

const WHATSAPP_INTL = "923377155722"

export default function PartnerPage() {
  // Partner app URL from environment
  const partnerAppUrl = process.env.NEXT_PUBLIC_PARTNER_APP_URL || ""

  // Calculator states
  const [dailyTickets, setDailyTickets] = useState<number>(25)
  const [ticketPrice, setTicketPrice] = useState<number>(300)

  // FAQ open item
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // Calculations
  const monthlyTickets = dailyTickets * 30
  const grossMonthlyVolume = monthlyTickets * ticketPrice
  
  // Commission calculation based on volume
  let commissionRate = 0.15
  let tierName = "Starter Partner"
  let milestoneBonus = 0

  if (monthlyTickets >= 250) {
    commissionRate = 0.25
    tierName = "Elite VIP Partner"
    milestoneBonus = 50000
  } else if (monthlyTickets >= 75) {
    commissionRate = 0.20
    tierName = "Pro Growth Partner"
    milestoneBonus = 15000
  }

  const commissionEarnings = Math.round(grossMonthlyVolume * commissionRate)
  const totalEstimatedMonthly = commissionEarnings + milestoneBonus

  // Fallback target for partner platform redirect
  const redirectHref = partnerAppUrl || `https://wa.me/${WHATSAPP_INTL}?text=Hi%20PakRaffle!%20I%20am%20ready%20to%20access%20the%20Partner%20Platform.`

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Urgency / Ticker Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white text-xs sm:text-sm py-2.5 px-4 border-b border-emerald-800/40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-emerald-400">PAKRAFFLE AFFILIATE NETWORK:</span>
            <span className="text-slate-300 hidden sm:inline">2,410+ Pakistani Affiliates Earning Daily</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-amber-300 font-medium flex items-center gap-1">
              <Zap className="h-3 w-3 fill-amber-300" />
              Min. Payout: Only Rs. 500
            </span>
            <span className="text-slate-300 hidden md:inline">|</span>
            <span className="text-emerald-300 hidden md:inline">Instant JazzCash / Easypaisa Transfers</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-emerald-50/30 to-slate-50 pt-12 pb-20 lg:pt-16 lg:pb-28">
        {/* Glow ambient background elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-emerald-300/20 to-teal-200/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-semibold mb-6 shadow-xs animate-fade-in">
              <Flame className="h-4 w-4 text-emerald-600 fill-emerald-500" />
              <span>Highest Paying Pakistani Raffle Affiliate Program</span>
              <span className="bg-emerald-600 text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full">Zero Cost</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
              Turn Your WhatsApp & Socials Into A{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600">
                Daily Income Machine
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Earn <span className="font-bold text-slate-900">generous lifetime commissions</span> promoting luxury raffles (iPhones, Cars, Gold, Cash). 
              No investment, no inventory, and zero headache. Get instant daily payouts directly to your <span className="font-semibold text-emerald-700">JazzCash, Easypaisa, or Pakistani Bank</span>.
            </p>

            {/* CTA Group with Partner Platform Redirect */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <a
                href={redirectHref}
                target={partnerAppUrl ? "_blank" : undefined}
                rel={partnerAppUrl ? "noopener noreferrer" : undefined}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-lg shadow-emerald-600/25 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <Handshake className="h-5 w-5" />
                <span>Go to Partner Platform</span>
                {partnerAppUrl ? (
                  <ExternalLink className="h-4 w-4 ml-0.5" />
                ) : (
                  <ArrowRight className="h-5 w-5 ml-0.5" />
                )}
              </a>

              <a
                href={`https://wa.me/${WHATSAPP_INTL}?text=Hi%20PakRaffle%20Team!%20I%20want%20to%20join%20the%20Affiliate%20Program%20and%20start%20earning%20commissions.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-base px-7 py-4 rounded-2xl border-2 border-emerald-300 transition-all duration-200"
              >
                <MessageCircle className="h-5 w-5 text-emerald-600 fill-emerald-600/20" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {/* 4 Core Zero-Headache Pillars */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto text-left pt-4">
              <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">Zero Investment</h4>
                  <p className="text-[11px] text-slate-500">Free forever. Start with Rs. 0</p>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-3">
                <div className="p-2 rounded-xl bg-teal-100 text-teal-700 shrink-0">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">Daily Payouts</h4>
                  <p className="text-[11px] text-slate-500">JazzCash & Easypaisa</p>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700 shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">30-Day Cookie</h4>
                  <p className="text-[11px] text-slate-500">Tag user once, earn forever</p>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">Live Portal</h4>
                  <p className="text-[11px] text-slate-500">Real-time stats & tracking</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Social Proof Payout Ticker */}
      <section className="bg-white border-y border-slate-200 py-4">
        <div className="max-w-7xl mx-auto px-4 overflow-hidden">
          <div className="flex items-center gap-3 mb-2 sm:mb-0">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md shrink-0 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live Activity
            </span>
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-1 text-xs text-slate-600">
              <span className="whitespace-nowrap font-medium flex items-center gap-1.5">
                <span className="font-bold text-slate-900">Usman A. (Lahore)</span> withdrew{" "}
                <span className="text-emerald-600 font-bold">Rs. 18,500</span> via JazzCash{" "}
                <span className="text-slate-400 text-[10px]">(3 mins ago)</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="whitespace-nowrap font-medium flex items-center gap-1.5">
                <span className="font-bold text-slate-900">Zubair K. (Karachi)</span> made{" "}
                <span className="text-emerald-600 font-bold">Rs. 4,200</span> commission on iPhone 16 draw{" "}
                <span className="text-slate-400 text-[10px]">(7 mins ago)</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="whitespace-nowrap font-medium flex items-center gap-1.5">
                <span className="font-bold text-slate-900">Ayesha M. (Islamabad)</span> reached{" "}
                <span className="text-purple-600 font-bold">Pro Partner Status</span>{" "}
                <span className="text-slate-400 text-[10px]">(14 mins ago)</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="whitespace-nowrap font-medium flex items-center gap-1.5">
                <span className="font-bold text-slate-900">Hamza R. (Faisalabad)</span> withdrew{" "}
                <span className="text-emerald-600 font-bold">Rs. 32,400</span> via Raast{" "}
                <span className="text-slate-400 text-[10px]">(22 mins ago)</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live Earnings Calculator */}
      <section id="calculator" className="py-16 lg:py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
              <Calculator className="h-3.5 w-3.5" />
              Live Income Estimator
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Calculate Your Potential Earnings
            </h2>
            <p className="text-slate-600 text-base sm:text-lg mt-3">
              See what sharing just a few raffle tickets per day can bring to your bank account. No guesswork.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="grid md:grid-cols-12">
              {/* Sliders Input Column */}
              <div className="md:col-span-7 p-6 sm:p-8 space-y-8 border-b md:border-b-0 md:border-r border-slate-100">
                {/* Slider 1: Daily Tickets */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="daily-tickets" className="text-sm font-bold text-slate-800">
                      Raffle Tickets Sold Via Your Link
                    </Label>
                    <span className="text-emerald-700 font-mono font-bold text-base px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200">
                      {dailyTickets} tickets / day
                    </span>
                  </div>
                  <input
                    id="daily-tickets"
                    type="range"
                    min="2"
                    max="100"
                    step="1"
                    value={dailyTickets}
                    onChange={(e) => setDailyTickets(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                    <span>2 tickets (Just WhatsApp status)</span>
                    <span>50 tickets</span>
                    <span>100+ (TikTok / Reels)</span>
                  </div>
                </div>

                {/* Slider 2: Average Ticket Price */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="ticket-price" className="text-sm font-bold text-slate-800">
                      Average Ticket Price (PKR)
                    </Label>
                    <span className="text-slate-900 font-mono font-bold text-base px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200">
                      Rs. {ticketPrice}
                    </span>
                  </div>
                  <input
                    id="ticket-price"
                    type="range"
                    min="100"
                    max="1000"
                    step="50"
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                    <span>Rs. 100 (Budget Raffles)</span>
                    <span>Rs. 500 (iPhone Raffles)</span>
                    <span>Rs. 1,000 (Cars & Bikes)</span>
                  </div>
                </div>

                {/* Monthly Volume Preview */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Estimated Monthly Ticket Sales:</span>
                    <span className="font-bold text-slate-900">{monthlyTickets.toLocaleString()} tickets</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Total Ticket Volume:</span>
                    <span className="font-bold text-slate-900">Rs. {grossMonthlyVolume.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 items-center pt-1 border-t border-slate-200">
                    <span>Projected Commission Rate:</span>
                    <Badge className="bg-emerald-600 text-white font-bold">{tierName} ({(commissionRate * 100)}%)</Badge>
                  </div>
                </div>
              </div>

              {/* Dynamic Earnings Display Column */}
              <div className="md:col-span-5 p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white flex flex-col justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold block mb-1">
                    Your Projected Monthly Income
                  </span>
                  <div className="text-4xl sm:text-5xl font-extrabold text-white font-mono tracking-tight my-2">
                    Rs. {totalEstimatedMonthly.toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-300">
                    Paid directly to your JazzCash / Easypaisa on your schedule.
                  </p>

                  <div className="mt-6 pt-6 border-t border-slate-800 space-y-2.5 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Base Commission ({(commissionRate * 100)}%):</span>
                      <span className="font-bold text-emerald-400 font-mono">Rs. {commissionEarnings.toLocaleString()}</span>
                    </div>
                    {milestoneBonus > 0 && (
                      <div className="flex justify-between text-amber-300">
                        <span className="flex items-center gap-1">
                          <Sparkles className="h-3.5 w-3.5" /> Growth Milestone Bonus:
                        </span>
                        <span className="font-bold font-mono">+Rs. {milestoneBonus.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-300">
                      <span>Daily Passive Average:</span>
                      <span className="font-bold text-white font-mono">
                        Rs. {Math.round(totalEstimatedMonthly / 30).toLocaleString()} / day
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <a
                    href={redirectHref}
                    target={partnerAppUrl ? "_blank" : undefined}
                    rel={partnerAppUrl ? "noopener noreferrer" : undefined}
                    className="w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm py-3.5 px-4 rounded-xl shadow-md transition-colors"
                  >
                    <span>Go to Partner Platform</span>
                    {partnerAppUrl ? (
                      <ExternalLink className="h-4 w-4" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                  </a>
                  <p className="text-[11px] text-center text-slate-400 mt-2">
                    Quick Access • Real-Time Portal
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dedicated Partner Platform Redirection Callout Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white/5 border border-emerald-500/30 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-2xl">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span>Official PakRaffle Partner Portal</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                Ready to Join? Access The Partner Platform
              </h2>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                Manage your affiliate links, monitor clicks in real-time, view live ticket purchase commissions, and withdraw directly to your Pakistani bank account or mobile wallet.
              </p>

              {/* 3 Portal Features */}
              <div className="grid sm:grid-cols-3 gap-4 pt-4 text-left">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <BarChart3 className="h-5 w-5 text-emerald-400 mb-2" />
                  <h4 className="font-bold text-sm text-white">Live Tracking</h4>
                  <p className="text-xs text-slate-300 mt-1">Instant view of referral link clicks & ticket sales.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <Wallet className="h-5 w-5 text-teal-400 mb-2" />
                  <h4 className="font-bold text-sm text-white">Instant Withdrawals</h4>
                  <p className="text-xs text-slate-300 mt-1">Cash out directly to JazzCash, Easypaisa, or Raast.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <ShieldCheck className="h-5 w-5 text-blue-400 mb-2" />
                  <h4 className="font-bold text-sm text-white">30-Day Attribution</h4>
                  <p className="text-xs text-slate-300 mt-1">Never lose a commission with smart cookie tracking.</p>
                </div>
              </div>

              {/* Direct Redirect Button */}
              <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={redirectHref}
                  target={partnerAppUrl ? "_blank" : undefined}
                  rel={partnerAppUrl ? "noopener noreferrer" : undefined}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-base px-8 py-4 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5"
                >
                  <Handshake className="h-5 w-5" />
                  <span>Launch Partner Platform</span>
                  {partnerAppUrl ? (
                    <ExternalLink className="h-4 w-4" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </a>

                <a
                  href={`https://wa.me/${WHATSAPP_INTL}?text=Hi%20PakRaffle!%20I%20have%20questions%20about%20the%20Partner%20Platform.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-base px-7 py-4 rounded-2xl border border-white/20 transition-all"
                >
                  <MessageCircle className="h-5 w-5 text-emerald-400" />
                  <span>VIP WhatsApp Support</span>
                </a>
              </div>

              {partnerAppUrl && (
                <p className="text-xs text-emerald-400/80 font-mono">
                  Destination: {partnerAppUrl}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Headaches Comparison Section */}
      <section className="py-16 lg:py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Why PakRaffle Is 100% Headache-Free
            </h2>
            <p className="text-slate-600 text-base sm:text-lg mt-3">
              Traditional ways of earning online in Pakistan are full of roadblocks. Here is how PakRaffle fixes everything.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* The Old Headache Way */}
            <div className="bg-red-50/50 border-2 border-red-200/80 rounded-3xl p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-red-200">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                  ✕
                </div>
                <div>
                  <h3 className="font-bold text-lg text-red-950">Other Methods (Dropshipping, Amazon, Freelancing)</h3>
                  <p className="text-xs text-red-700">Massive headaches and delayed payments</p>
                </div>
              </div>

              <ul className="space-y-3.5 text-sm text-red-900">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold mt-0.5">✕</span>
                  <span><strong>Heavy upfront money:</strong> Needs Rs. 50,000 to 200,000+ for ad spend or inventory.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold mt-0.5">✕</span>
                  <span><strong>Customer complaints & returns:</strong> Angry buyers messaging you at 2:00 AM about delayed courier delivery.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold mt-0.5">✕</span>
                  <span><strong>Account bans & PayPal issues:</strong> Blocked accounts, high foreign fees, and complex verifications.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold mt-0.5">✕</span>
                  <span><strong>High technical skills required:</strong> You have to build websites, configure pixels, and write ad copy.</span>
                </li>
              </ul>
            </div>

            {/* The PakRaffle Zero-Headache Way */}
            <div className="bg-emerald-50/70 border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 space-y-5 relative shadow-sm">
              <div className="absolute -top-3.5 right-6">
                <Badge className="bg-emerald-600 text-white font-bold px-3 py-1 shadow-xs">The Easy Way</Badge>
              </div>

              <div className="flex items-center gap-3 pb-3 border-b border-emerald-200">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-bold text-lg text-emerald-950">PakRaffle Affiliate Program</h3>
                  <p className="text-xs text-emerald-700">Pure profit with zero operational stress</p>
                </div>
              </div>

              <ul className="space-y-3.5 text-sm text-emerald-950">
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Rs. 0 Required:</strong> 100% free to join forever. No registration fee, no renewal costs.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Zero Customer Handling:</strong> PakRaffle manages tickets, live draws, prize verification, and courier delivery.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Direct Pakistani Payouts:</strong> Get money straight in your JazzCash, Easypaisa, or bank account whenever you want.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Instant Platform Access:</strong> Direct link to partner portal with live metrics and automated payouts.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Top Earning Pakistani Affiliates (Social Proof) */}
      <section className="py-16 lg:py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Meet Top Pakistani Affiliates Earning Weekly
            </h2>
            <p className="text-slate-600 text-base sm:text-lg mt-3">
              From university students to full-time creators, see how real affiliates make money with PakRaffle.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Story 1 */}
            <Card className="rounded-3xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="h-2 bg-emerald-500 w-full" />
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xl flex items-center justify-center mx-auto shadow-inner">
                  AH
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Ahmed Hassan</h3>
                  <p className="text-xs text-slate-500">Tech Reviewer • Islamabad</p>
                </div>
                <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                  <span className="text-xs text-emerald-700 block font-medium">Last Month's Earnings</span>
                  <span className="text-2xl font-extrabold text-emerald-700 font-mono">Rs. 485,750</span>
                </div>
                <p className="text-xs text-slate-600 italic">
                  "I just post 2 Instagram stories whenever an iPhone or bike draw opens. The commission comes automatically to my Meezan bank."
                </p>
                <div className="text-[11px] font-semibold text-emerald-600 flex items-center justify-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" /> Payout verified via Meezan Bank
                </div>
              </CardContent>
            </Card>

            {/* Story 2 */}
            <Card className="rounded-3xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="h-2 bg-blue-500 w-full" />
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-800 font-extrabold text-xl flex items-center justify-center mx-auto shadow-inner">
                  SF
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Sarah Fatima</h3>
                  <p className="text-xs text-slate-500">University Student • Karachi</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100">
                  <span className="text-xs text-blue-700 block font-medium">Last Month's Earnings</span>
                  <span className="text-2xl font-extrabold text-blue-700 font-mono">Rs. 184,200</span>
                </div>
                <p className="text-xs text-slate-600 italic">
                  "I pay my entire semester university fee just by sharing raffle links in my university hostel WhatsApp groups. Zero stress!"
                </p>
                <div className="text-[11px] font-semibold text-blue-600 flex items-center justify-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" /> Payout verified via JazzCash
                </div>
              </CardContent>
            </Card>

            {/* Story 3 */}
            <Card className="rounded-3xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="h-2 bg-purple-500 w-full" />
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-800 font-extrabold text-xl flex items-center justify-center mx-auto shadow-inner">
                  BT
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Bilal Tariq</h3>
                  <p className="text-xs text-slate-500">TikTok Creator • Lahore</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100">
                  <span className="text-xs text-purple-700 block font-medium">Last Month's Earnings</span>
                  <span className="text-2xl font-extrabold text-purple-700 font-mono">Rs. 342,000</span>
                </div>
                <p className="text-xs text-slate-600 italic">
                  "TikTok reels get huge organic views in Pakistan. PakRaffle converts like crazy because tickets are only Rs. 100."
                </p>
                <div className="text-[11px] font-semibold text-purple-600 flex items-center justify-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" /> Payout verified via Raast
                </div>
              </CardContent>
            </Card>

            {/* Story 4 */}
            <Card className="rounded-3xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="h-2 bg-amber-500 w-full" />
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 font-extrabold text-xl flex items-center justify-center mx-auto shadow-inner">
                  AN
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Ayesha Noor</h3>
                  <p className="text-xs text-slate-500">Stay-at-home Mom • Rawalpindi</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100">
                  <span className="text-xs text-amber-700 block font-medium">Last Month's Earnings</span>
                  <span className="text-2xl font-extrabold text-amber-700 font-mono">Rs. 92,500</span>
                </div>
                <p className="text-xs text-slate-600 italic">
                  "I don't have many followers, just family WhatsApp groups. Whenever relatives buy entries, I get commission directly on Easypaisa."
                </p>
                <div className="text-[11px] font-semibold text-amber-600 flex items-center justify-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" /> Payout verified via Easypaisa
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Payout Methods Supported */}
      <section className="py-14 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Direct & Instant Pakistani Payouts
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Receive Your Hard-Earned Rupees Exactly How You Want
            </h3>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto mt-2">
              No overseas fees, no complex currency conversions. Withdraw anytime once your balance reaches Rs. 500.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 max-w-4xl mx-auto">
            {["JazzCash", "Easypaisa", "Raast (Instant)", "Meezan Bank", "HBL", "Bank Alfalah"].map((method) => (
              <div
                key={method}
                className="bg-slate-800/80 border border-slate-700 px-5 py-3 rounded-2xl flex items-center gap-2.5 text-sm font-bold text-slate-200 shadow-sm"
              >
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span>{method}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 lg:py-24 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Everything you need to know to start earning without doubts.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Do I need a large following or expensive camera to start?",
                a: "Absolutely not! Over 60% of our successful affiliates are students, housewives, and everyday individuals who simply share links on their personal WhatsApp status or family groups. Even referring 3-5 ticket buyers a day earns you a solid passive monthly income.",
              },
              {
                q: "How and when do I get paid?",
                a: "You can request a withdrawal directly through your partner platform dashboard or via WhatsApp to our Affiliate Manager. Payouts are sent within 2 to 6 hours directly to your JazzCash, Easypaisa, Raast, or any Pakistani Bank Account.",
              },
              {
                q: "Is there any cost, deposit, or subscription fee to join?",
                a: "No! PakRaffle Affiliate Program is 100% completely free to join and will always remain free. You never have to pay a single rupee to earn commissions.",
              },
              {
                q: "What if someone clicks my link today but buys a ticket 2 weeks later?",
                a: "We use a 30-day tracking cookie! If someone clicks your link today and decides to purchase tickets anytime within the next 30 days, you will automatically receive full commission credit for that sale.",
              },
              {
                q: "What is the minimum amount I can withdraw?",
                a: "The minimum payout threshold is just Rs. 500! As soon as you earn Rs. 500 from your first few referrals, you can immediately transfer it to your mobile wallet.",
              },
              {
                q: "Who handles customer support, ticket delivery, and winner verification?",
                a: "PakRaffle handles 100% of the customer support, ticket issuance, random draw transparency, and winner prize courier delivery. You only share your link and collect your profits.",
              },
            ].map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base hover:bg-slate-100/60"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5 text-emerald-600 shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-200/60 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Final Irresistible CTA */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <Badge className="bg-white/20 text-white font-bold border-0 px-4 py-1 text-xs">
            Start Today • Get Paid Tomorrow
          </Badge>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
            Ready to Build Your Passive Income Stream?
          </h2>

          <p className="text-emerald-100 text-base sm:text-lg max-w-2xl mx-auto">
            Join thousands of smart Pakistanis who turned their idle WhatsApp and phone screen time into real cash every single week.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href={redirectHref}
              target={partnerAppUrl ? "_blank" : undefined}
              rel={partnerAppUrl ? "noopener noreferrer" : undefined}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-emerald-900 hover:bg-slate-100 font-extrabold text-base px-8 py-4 rounded-2xl shadow-xl transition-all"
            >
              <Handshake className="h-5 w-5 text-emerald-600" />
              <span>Go to Partner Platform</span>
              {partnerAppUrl ? (
                <ExternalLink className="h-4 w-4" />
              ) : (
                <ArrowRight className="h-5 w-5" />
              )}
            </a>

            <a
              href={`https://wa.me/${WHATSAPP_INTL}?text=Hi%20PakRaffle!%20I%20am%20ready%20to%20start%20as%20an%20affiliate%20partner.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-800/80 hover:bg-emerald-800 text-white font-bold text-base px-7 py-4 rounded-2xl border border-emerald-400/40"
            >
              <MessageCircle className="h-5 w-5 text-emerald-300" />
              <span>Talk to Affiliate VIP Manager</span>
            </a>
          </div>

          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-emerald-200">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-300" /> No Registration Fees
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-300" /> Instant Platform Access
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-300" /> WhatsApp Payout Support
            </span>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Quick Action Button */}
      <a
        href={`https://wa.me/${WHATSAPP_INTL}?text=Hi%20PakRaffle!%20I%20have%20a%20question%20about%20the%20affiliate%20partner%20program.`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-full shadow-2xl border-2 border-white transition-all transform hover:scale-105"
        title="Chat with Affiliate VIP Support on WhatsApp"
      >
        <MessageCircle className="h-5 w-5 fill-white text-emerald-600" />
        <span className="text-xs sm:text-sm font-bold hidden sm:inline">Affiliate WhatsApp Help</span>
      </a>
    </div>
  )
}
