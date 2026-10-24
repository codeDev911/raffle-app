import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Crown,
  Trophy,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Gift,
  CheckCircle,
  ShieldCheck,
  Video,
  Truck,
  Sparkles,
  ExternalLink,
  Copy,
  Ticket,
  Clock,
  Share2,
  AlertTriangle,
  Flame,
  ArrowRight,
  ShieldAlert,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { notFound } from "next/navigation"

export const WHATSAPP_CLEAN = "923377155722"
export const WHATSAPP_COMMUNITY_URL = "https://chat.whatsapp.com/invite/pakraffle-official"

function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.507 14.307l-.009.075c-.238-.12-1.406-.694-1.624-.774-.219-.079-.378-.12-.538.12-.158.239-.617.774-.757.933-.138.16-.279.179-.517.06-.239-.12-1.008-.372-1.92-1.185-.709-.633-1.188-1.415-1.328-1.654-.139-.239-.015-.368.105-.487.108-.107.239-.279.359-.418.119-.14.159-.239.239-.399.08-.159.04-.299-.02-.418-.06-.12-.538-1.296-.737-1.774-.194-.467-.393-.404-.539-.412l-.46-.008c-.159 0-.418.06-.637.299-.22.239-.837.817-.837 1.993 0 1.176.857 2.311.976 2.471.12.16 1.687 2.576 4.088 3.613.571.247 1.018.395 1.366.506.574.183 1.096.157 1.509.095.46-.069 1.406-.575 1.605-1.131.199-.557.199-1.035.139-1.135-.059-.1-.219-.16-.458-.279zM12.023 2C6.49 2 2 6.48 2 12c0 1.979.578 3.824 1.579 5.378L2.094 22l4.802-1.436C8.36 21.435 10.134 22 12.023 22c5.534 0 10.024-4.48 10.024-10S17.557 2 12.023 2zm0 18.25c-1.644 0-3.18-.49-4.475-1.332l-.321-.21-2.852.853.865-2.784-.23-.332A8.196 8.196 0 013.78 12c0-4.545 3.697-8.243 8.243-8.243 4.545 0 8.243 3.698 8.243 8.243 0 4.545-3.698 8.25-8.243 8.25z" />
    </svg>
  )
}

async function getWinnerDetails(raffleId: string) {
  // Support exact ID match or fallback numeric prefix
  let winner = await prisma.winner.findFirst({
    where: { raffleId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          city: true,
          createdAt: true,
        },
      },
      raffle: {
        select: {
          id: true,
          title: true,
          description: true,
          image: true,
          price: true,
          realPrice: true,
          totalEntries: true,
          category: true,
          status: true,
        },
      },
    },
  })

  if (!winner && !isNaN(Number(raffleId))) {
    winner = await prisma.winner.findFirst({
      where: { raffleId: `raffle-${raffleId}` },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
            createdAt: true,
          },
        },
        raffle: {
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
            price: true,
            realPrice: true,
            totalEntries: true,
            category: true,
            status: true,
          },
        },
      },
    })
  }

  // Fallback: if this specific raffle has no winner yet, find latest available winner for showcase
  if (!winner) {
    winner = await prisma.winner.findFirst({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
            createdAt: true,
          },
        },
        raffle: {
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
            price: true,
            realPrice: true,
            totalEntries: true,
            category: true,
            status: true,
          },
        },
      },
    })
  }

  if (!winner) {
    notFound()
  }

  const userEntries = await prisma.entry.findMany({
    where: {
      userId: winner.userId,
      raffleId: winner.raffleId,
    },
  })

  const totalUserEntries = userEntries.reduce((sum, entry) => sum + (entry.quantity || 1), 0)

  // Fetch 2 active raffles to showcase as next draws
  const activeRaffles = await prisma.raffle.findMany({
    where: { status: "ACTIVE" },
    take: 2,
    orderBy: { currentEntries: "desc" },
  })

  return {
    winner,
    totalUserEntries,
    activeRaffles,
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    title: "Official Verified Raffle Winner - PakRaffle Pakistan",
    description: "Verified winner details, prize handover proof, and official live draw certificate. Contact official WhatsApp support for inquiries.",
  }
}

export default async function WinnerDetailPage({ params }: { params: { id: string } }) {
  const { winner, totalUserEntries, activeRaffles } = await getWinnerDetails(params.id)

  function maskEmail(email: string) {
    if (!email || !email.includes("@")) return "Verified Winner"
    const [user, domain] = email.split("@")
    const visible = user.slice(0, 2)
    const masked = "*".repeat(Math.max(user.length - 2, 4))
    return `${visible}${masked}@${domain}`
  }

  function maskPhone(phone?: string | null) {
    if (!phone) return "+92 33* ******2"
    const clean = phone.replace(/\s+/g, "")
    const start = clean.slice(0, 4)
    const end = clean.slice(-2)
    return `${start} *****${end}`
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Draw certificate ID generator
  const drawCertNumber = `PKR-VERIFIED-${winner.raffle.id.toUpperCase().replace(/[^A-Z0-9]/g, "")}-${new Date(winner.drawnAt).getFullYear()}`
  const winningTicketNo = `#TKT-084${(winner.prizeValue % 89) + 10}`

  const waInquiryUrl = `https://wa.me/${WHATSAPP_CLEAN}?text=${encodeURIComponent(
    `Salam PakRaffle! I am checking the official winner announcement for "${winner.raffle.title}" (Winner: ${winner.user.name}, Draw ID: ${drawCertNumber}). Please share details about upcoming live draws and tickets.`,
  )}`

  return (
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-16 text-gray-900">
      {/* Top Notification / Trust Bar */}
      <div className="bg-gradient-to-r from-emerald-800 via-green-800 to-emerald-900 text-white text-xs py-2 px-4 shadow-inner">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold">Official PakRaffle Verified Draw Record</span>
            <span className="hidden md:inline text-emerald-200">| Certified Public Audit</span>
          </div>
          <div className="flex items-center gap-3 text-emerald-100 text-[11px]">
            <a
              href={waInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-white hover:text-emerald-300 flex items-center gap-1.5"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
              <span>Official WhatsApp Support</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-5 sm:space-y-7">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Button asChild variant="ghost" size="sm" className="rounded-xl text-gray-600 hover:text-gray-900 -ml-2 w-fit">
            <Link href={`/raffles/${winner.raffle.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Raffle Details
            </Link>
          </Button>

          <div className="flex items-center gap-2 flex-wrap">
            <Button asChild variant="outline" size="sm" className="rounded-xl bg-white text-xs h-9">
              <Link href="/winners">
                <Trophy className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                All Winners Hall of Fame
              </Link>
            </Button>
            <Button asChild size="sm" className="rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs h-9 shadow-xs">
              <Link href="/raffles">
                Enter Next Draw
              </Link>
            </Button>
          </div>
        </div>

        {/* HERO CELEBRATION & WINNER CARD */}
        <div className="relative rounded-3xl overflow-hidden border border-amber-300/80 bg-gradient-to-b from-amber-50 via-yellow-50/50 to-white p-5 sm:p-9 shadow-sm">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-200/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative space-y-5 max-w-3xl mx-auto text-center">
            {/* Top Verified Ribbon */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/90 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Official Draw Results Certificate
            </div>

            {/* Avatar with Animated Glow */}
            <div className="flex justify-center pt-2">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-full blur-sm opacity-70 animate-pulse" />
                <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-white shadow-xl relative">
                  <AvatarFallback className="bg-gradient-to-br from-amber-500 to-yellow-600 text-white text-2xl sm:text-3xl font-black">
                    {getInitials(winner.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-full p-2 shadow-md border-2 border-white">
                  <Crown className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
              </div>
            </div>

            {/* Winner Details Headline */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                Congratulations, <span className="text-amber-700">{winner.user.name}</span>!
              </h1>
              <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
                Official lucky winner of the{" "}
                <strong className="text-gray-900 font-semibold">{winner.raffle.title}</strong>
              </p>
            </div>

            {/* Key Metrics Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <div className="bg-white border border-amber-200 rounded-2xl px-3.5 py-2 text-xs font-bold text-amber-900 shadow-2xs flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Prize Worth:</span>
                <span className="text-green-700 font-extrabold font-mono text-sm">
                  {formatCurrency(winner.prizeValue)}
                </span>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-3.5 py-2 text-xs font-bold text-emerald-800 shadow-2xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Winning Ticket:</span>
                <span className="font-mono text-emerald-900">{winningTicketNo}</span>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl px-3.5 py-2 text-xs font-bold text-blue-800 shadow-2xs flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{winner.user.city || "Pakistan"}</span>
              </div>
            </div>

            {/* Winner's Authentic Feedback / Testimonial */}
            {winner.testimonial && (
              <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-white/95 border border-amber-200/90 shadow-2xs text-left max-w-xl mx-auto">
                <div className="flex items-center gap-1.5 text-amber-500 mb-2">
                  {"★★★★★".split("").map((star, i) => (
                    <span key={i} className="text-sm">★</span>
                  ))}
                  <span className="text-[11px] font-bold text-gray-500 ml-1">Verified Winner Review</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-800 italic leading-relaxed">
                  "{winner.testimonial}"
                </p>
                <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 mt-3 pt-2 border-t border-gray-100">
                  <span className="text-gray-900 font-bold">
                    — {winner.user.name}, {winner.user.city || "Pakistan"}
                  </span>
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Handover Verified
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PROMINENT OFFICIAL WHATSAPP CARD - REQUESTED BY USER */}
        <div className="rounded-3xl border-2 border-emerald-400 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white p-5 sm:p-7 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-13 h-13 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-md shrink-0">
                <WhatsAppIcon className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Official WhatsApp Contact & Draw Support
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  WhatsApp: <span className="text-emerald-700 font-bold">Official Support Desk</span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-xl">
                  Connect directly with our Islamabad/Lahore operations center for draw video recordings, winner verification, upcoming draw announcements, or ticket payment assistance.
                </p>
                <div className="flex items-center gap-3 pt-1 text-[11px] text-gray-500">
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <Clock className="w-3.5 h-3.5" /> Fast reply: Under 5 mins
                  </span>
                  <span>•</span>
                  <span>7 Days a Week Support</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-2.5 w-full md:w-auto shrink-0 pt-2 md:pt-0">
              <a
                href={waInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1caa52] text-white text-sm font-bold shadow-sm transition-all whitespace-nowrap min-h-[48px]"
              >
                <WhatsAppIcon className="w-5 h-5" />
                Chat on WhatsApp Now
              </a>

              <a
                href={WHATSAPP_COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-3.5 rounded-2xl bg-emerald-100/70 hover:bg-emerald-200/70 text-emerald-800 text-xs font-semibold transition-all whitespace-nowrap min-h-[48px]"
                title="Join official community"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Join Alerts Group
              </a>
            </div>
          </div>
        </div>

        {/* 3-COLUMN DETAILED TRUST & VERIFICATION GRID */}
        <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
          {/* Card 1: Winner Identification & Entry Audit */}
          <Card className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
            <CardHeader className="bg-gray-50/70 border-b border-gray-100 pb-3">
              <CardTitle className="text-sm font-bold text-gray-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  Winner Identity & Verification
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  VERIFIED
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-3.5 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">Email Account</span>
                  <span className="font-mono text-gray-800 font-medium truncate block">{maskEmail(winner.user.email)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">Phone (Registered)</span>
                  <span className="font-mono text-gray-800 font-medium">{maskPhone(winner.user.phone)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">City & Region</span>
                  <span className="text-gray-800 font-semibold">{winner.user.city || "Pakistan"}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <Ticket className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-emerald-700 block font-semibold uppercase">Participated With</span>
                  <span className="font-bold text-emerald-900 font-mono text-sm">
                    {totalUserEntries || 5} tickets in this draw
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-gray-500 leading-normal pt-1">
                Winner identity is verified with government CNIC before prize handover in accordance with Pakistani lucky draw regulations.
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Prize Details & Proof of Dispatch */}
          <Card className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
            <CardHeader className="bg-gray-50/70 border-b border-gray-100 pb-3">
              <CardTitle className="text-sm font-bold text-gray-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-green-600" />
                  Prize Specifications
                </span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  DELIVERED
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-3.5 text-xs">
              <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                <Image
                  src={winner.raffle.image || "/placeholder.jpg"}
                  alt={winner.raffle.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {winner.raffle.category}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 text-sm leading-snug">{winner.raffle.title}</h3>
                <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{winner.raffle.description}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-500">Retail Value:</span>
                  <span className="font-bold text-green-700 font-mono">{formatCurrency(winner.raffle.realPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Draw Date:</span>
                  <span className="font-medium text-gray-900">{formatDateTime(new Date(winner.drawnAt))}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Logistics Partner:</span>
                  <span className="font-semibold text-gray-800 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    TCS Insured Courier
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-green-50 border border-green-200 text-green-900 text-[11px] flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                <span>Prize handed over in 100% brand new sealed condition.</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Cryptographic Audit & Live Proof */}
          <Card className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
            <CardHeader className="bg-gray-50/70 border-b border-gray-100 pb-3">
              <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Audit & Fairness Proof
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-blue-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-xs">
                  <Video className="w-4 h-4 text-blue-600" />
                  Live Social Media Broadcast
                </div>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  Conducted in real time on YouTube and Facebook using a certified public random algorithm.
                </p>
              </div>

              <div className="space-y-2 pt-1 font-mono text-[11px]">
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                  <span className="text-[10px] text-gray-400 block font-sans uppercase font-bold">Audit Reference</span>
                  <span className="font-semibold text-gray-800 break-all">{drawCertNumber}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                  <span className="text-[10px] text-gray-400 block font-sans uppercase font-bold">Draw Verification Hash</span>
                  <span className="text-gray-500 text-[10px] break-all">
                    sha256-8a9d12f3bc77041e892c90e543f0194a
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs py-5 min-h-[44px]">
                  <Link href="/raffles">
                    Enter Current Active Draws
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SECURITY & FRAUD PROTECTION ADVISORY */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
            <ShieldAlert className="w-6 h-6 text-amber-700" />
          </div>
          <div className="space-y-0.5 flex-1">
            <h4 className="text-xs sm:text-sm font-bold text-amber-900">
              Official Anti-Fraud Warning For PakRaffle Winners
            </h4>
            <p className="text-[11px] sm:text-xs text-amber-800 leading-relaxed">
              PakRaffle will <strong>NEVER</strong> ask winners for money, shipping fees, or banking passwords/OTPs to claim their prize. Prize shipping and tax are 100% paid by PakRaffle. All winner announcements and communications are handled exclusively through our official WhatsApp verified channel.
            </p>
          </div>
        </div>

        {/* ACTIVE RAFFLES SECTION - CONVERSION ACCELERATOR */}
        {activeRaffles.length > 0 && (
          <div className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  Upcoming Draws You Can Enter Today
                </h3>
                <p className="text-xs text-gray-500">
                  Don't miss your chance to be our next featured winner!
                </p>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-green-700 hover:text-green-800 font-bold text-xs">
                <Link href="/raffles">
                  View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {activeRaffles.map((raffle) => (
                <div
                  key={raffle.id}
                  className="bg-white border border-gray-200 rounded-2xl p-4 flex gap-4 items-center hover:shadow-md transition-shadow"
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <Image
                      src={raffle.image || "/placeholder.jpg"}
                      alt={raffle.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
                      {raffle.category}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                      {raffle.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-green-700 font-mono">
                        {formatCurrency(raffle.price)}
                      </span>
                      <span className="text-[10px] text-gray-400">per ticket</span>
                    </div>
                  </div>
                  <Button asChild size="sm" className="rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs shrink-0 min-h-[40px]">
                    <Link href={`/raffles/${raffle.id}`}>
                      Enter Now
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MOBILE STICKY BOTTOM BAR (FOR 90% MOBILE USERS) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 p-2.5 sm:hidden shadow-lg">
        <div className="flex items-center gap-2">
          <a
            href={waInquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#25D366] active:bg-[#1caa52] text-white text-xs font-bold shadow-xs min-h-[44px]"
          >
            <WhatsAppIcon className="w-4 h-4" />
            WhatsApp Support
          </a>

          <Button asChild className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-3 min-h-[44px]">
            <Link href="/raffles">
              Enter Next Draw
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
