"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { EnterRaffleModal } from "@/components/enter-raffle-modal"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { formatCurrency } from "@/lib/utils"
import {
  ArrowLeft,
  CheckCircle,
  CheckCircleIcon,
  Clock,
  Clock10Icon,
  ShieldCheck,
  Trophy,
  Truck,
  Sparkles,
  Share2,
  Copy,
  Check,
  Gift,
  Users,
  Video,
  Award,
  ChevronRight,
  Info,
} from "lucide-react"

interface Raffle {
  id: string
  title: string
  description: string
  longDescription?: string
  image?: string
  gallery: string[]
  price: number
  realPrice: number
  totalEntries: number
  currentEntries: number
  category: string
  entries: any[]
  featured: boolean
  endDate: string
  status: "ACTIVE" | "COMPLETED" | "CANCELLED"
  specifications: string[]
  rules: string[]
  winners?: any[]
}

const WHATSAPP_COMMUNITY_URL = "https://chat.whatsapp.com/invite/pakraffle-official"
const WHATSAPP_SUPPORT_NUMBER = "+92 337 7155722"
const WHATSAPP_PHONE_CLEAN = "923377155722"

function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.507 14.307l-.009.075c-.238-.12-1.406-.694-1.624-.774-.219-.079-.378-.12-.538.12-.158.239-.617.774-.757.933-.138.16-.279.179-.517.06-.239-.12-1.008-.372-1.92-1.185-.709-.633-1.188-1.415-1.328-1.654-.139-.239-.015-.368.105-.487.108-.107.239-.279.359-.418.119-.14.159-.239.239-.399.08-.159.04-.299-.02-.418-.06-.12-.538-1.296-.737-1.774-.194-.467-.393-.404-.539-.412l-.46-.008c-.159 0-.418.06-.637.299-.22.239-.837.817-.837 1.993 0 1.176.857 2.311.976 2.471.12.16 1.687 2.576 4.088 3.613.571.247 1.018.395 1.366.506.574.183 1.096.157 1.509.095.46-.069 1.406-.575 1.605-1.131.199-.557.199-1.035.139-1.135-.059-.1-.219-.16-.458-.279zM12.023 2C6.49 2 2 6.48 2 12c0 1.979.578 3.824 1.579 5.378L2.094 22l4.802-1.436C8.36 21.435 10.134 22 12.023 22c5.534 0 10.024-4.48 10.024-10S17.557 2 12.023 2zm0 18.25c-1.644 0-3.18-.49-4.475-1.332l-.321-.21-2.852.853.865-2.784-.23-.332A8.196 8.196 0 013.78 12c0-4.545 3.697-8.243 8.243-8.243 4.545 0 8.243 3.698 8.243 8.243 0 4.545-3.698 8.25-8.243 8.25z" />
    </svg>
  )
}

const ClientSide = ({ raffle }: { raffle: Raffle }) => {
  const searchParams = useSearchParams()
  const openEnModal = searchParams.get("openEnModal") || 0
  const referralLinkId = searchParams.get("lnk") || false

  const [user, setUser] = useState<any>(null)
  const [isUserPurchased, setIsUserPurchased] = useState(false)
  const [showModal, setShowModal] = useState(openEnModal === "1")
  const [paymentUnderReview, setPaymentUnderReview] = useState<any>()
  const [selectedImage, setSelectedImage] = useState<string>(raffle?.image || "")
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedPhone, setCopiedPhone] = useState(false)

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
    isEnded: boolean
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: false })

  useEffect(() => {
    if (!raffle?.endDate) return

    const calculateTimeLeft = () => {
      const difference = new Date(raffle.endDate).getTime() - new Date().getTime()
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true })
        return
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isEnded: false,
      })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [raffle?.endDate])

  const getMe = async () => {
    try {
      const userResponse = await fetch("/api/auth/me")
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData)

        const py = Array.isArray(userData?.payments)
          ? userData.payments.find(
              (payment: any) =>
                payment.metadata?.raffleId === raffle?.id ||
                payment.metadata?.["raffleId"] === raffle?.id,
            )
          : undefined

        setPaymentUnderReview(py)

        const hasPurchased = Array.isArray(raffle?.entries)
          ? raffle.entries.some((entry: any) => entry.userId === userData.id)
          : false
        setIsUserPurchased(hasPurchased)
      }
    } catch (e) {
      console.error("Failed to fetch user:", e)
    }
  }

  useEffect(() => {
    if (referralLinkId && typeof window !== "undefined") {
      const client_browse_id = localStorage.getItem("client_browse_id")
      if (process.env.NEXT_PUBLIC_PARTNER_APP_URL) {
        fetch(`${process.env.NEXT_PUBLIC_PARTNER_APP_URL}/api/partner/links/click-event`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": process.env.NEXT_PUBLIC_API_KEY_TO_PARTNER || "",
          },
          body: JSON.stringify({ referralLinkId, client_browse_id }),
        }).catch((err) => console.log(err))
      }
    }
    getMe()
  }, [raffle?.id, referralLinkId])

  const handleEnterRaffle = () => {
    if (!user) {
      location.assign(
        `/auth/login?comback=/raffles/${raffle.id}&openEnModal=1&lnk=${referralLinkId || ""}`,
      )
      return
    }
    setShowModal(true)
  }

  const copyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const copyWhatsAppNumber = () => {
    navigator.clipboard.writeText(WHATSAPP_SUPPORT_NUMBER)
    setCopiedPhone(true)
    setTimeout(() => setCopiedPhone(false), 2000)
  }

  if (!raffle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Raffle Not Found</h1>
          <p className="text-sm text-gray-500 mb-6">The raffle you are looking for does not exist or has expired.</p>
          <Link href="/raffles">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-5">
              Browse All Raffles
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const allImages = [raffle.image, ...(raffle.gallery || [])].filter(Boolean) as string[]
  const currentImage = selectedImage || raffle.image || "/placeholder.jpg"

  const totalEntries = raffle.totalEntries || 1000
  const currentEntries = Math.min(raffle.currentEntries || 0, totalEntries)
  const remainingEntries = Math.max(totalEntries - currentEntries, 0)
  const percentFilled = Math.min(Math.round((currentEntries / totalEntries) * 100), 100)

  const waInquiryUrl = `https://wa.me/${WHATSAPP_PHONE_CLEAN}?text=${encodeURIComponent(
    `Salam PakRaffle! I have an inquiry about the "${raffle.title}" draw (Ticket: ${formatCurrency(
      raffle.price,
    )}). Please guide me.`,
  )}`

  return (
    <div className="min-h-screen bg-gray-50 pb-28 lg:pb-16 text-gray-900">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
          <Button asChild variant="ghost" size="sm" className="rounded-xl text-gray-600 hover:text-gray-900 -ml-2 h-10 px-3">
            <Link href="/raffles" className="flex items-center text-xs sm:text-sm font-medium">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              All Raffles
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={copyShareLink}
            className="rounded-xl border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs h-10 px-3"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 mr-1 text-green-600" /> : <Share2 className="w-3.5 h-3.5 mr-1" />}
            {copiedLink ? "Copied" : "Share"}
          </Button>
        </div>

        {/* Responsive Grid Layout */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* ======================================================== */}
          {/* LEFT COLUMN: IMAGES + PRODUCT DETAILS RIGHT BELOW THEM   */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 space-y-6">
            {/* Image Gallery Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-2.5 sm:p-4 shadow-xs">
              <div className="relative aspect-square sm:aspect-[4/3] w-full rounded-xl overflow-hidden bg-gray-100">
                <Image
                  src={currentImage}
                  alt={raffle.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 700px"
                  className="object-cover"
                />
                {raffle.featured && (
                  <div className="absolute top-2.5 left-2.5 bg-green-600 text-white text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Featured
                  </div>
                )}
                <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-xs text-gray-800 text-[11px] sm:text-xs font-medium px-2.5 py-1 rounded-md shadow-xs border border-gray-200">
                  {raffle.category}
                </div>
              </div>

              {/* Thumbnails row */}
              {allImages.length > 1 && (
                <div className="flex gap-2 sm:gap-3 mt-3 overflow-x-auto pb-1 no-scrollbar touch-pan-x">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                        currentImage === img ? "border-green-600 ring-2 ring-green-100" : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <Image src={img} alt={`Thumb ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile-Only Summary Block Inserted for immediate pricing visibility */}
            <div className="block lg:hidden bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs space-y-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                  <span>{raffle.category}</span>
                  <span>·</span>
                  <span className="text-green-600 font-medium">Draw Active</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
                  {raffle.title}
                </h1>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                  <span className="text-[11px] text-gray-500 block">Entry Fee</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(raffle.price)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-gray-500 block">Market Value</span>
                  <span className="text-base font-semibold text-gray-400 line-through">
                    {formatCurrency(raffle.realPrice)}
                  </span>
                </div>
              </div>

              {/* Tickets Progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-gray-700">
                    Sold: <strong className="text-gray-900 font-mono">{currentEntries}</strong> / {totalEntries}
                  </span>
                  <span className="text-emerald-600 font-bold font-mono">
                    {percentFilled}% ({remainingEntries} left)
                  </span>
                </div>
                <Progress value={percentFilled} className="h-2 bg-gray-100" />
              </div>

              {/* Mobile Direct Action Button */}
              <div>
                {isUserPurchased && raffle.status === "ACTIVE" ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                    <span className="text-xs font-semibold text-emerald-800 flex items-center justify-center gap-1.5">
                      <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                      You Are In This Draw!
                    </span>
                    <button
                      onClick={handleEnterRaffle}
                      className="text-xs text-emerald-700 underline font-semibold mt-1"
                    >
                      Buy More Tickets
                    </button>
                  </div>
                ) : paymentUnderReview ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                    <span className="text-xs font-semibold text-amber-800 flex items-center justify-center gap-1.5">
                      <Clock10Icon className="w-4 h-4 text-amber-600" />
                      Receipt Under Review
                    </span>
                  </div>
                ) : (
                  <Button
                    onClick={handleEnterRaffle}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-base rounded-xl shadow-sm"
                  >
                    <Gift className="w-5 h-5 mr-2" />
                    Buy Ticket for {formatCurrency(raffle.price)}
                  </Button>
                )}
              </div>
            </div>

            {/* PRODUCT DETAILS (RIGHT BELOW IMAGES) */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-xs">
              <div className="border-b border-gray-100 pb-3 mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Info className="w-5 h-5 text-green-600" />
                  Product Details & Specifications
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Complete technical details, package inclusions, and official draw guidelines.
                </p>
              </div>

              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid grid-cols-3 bg-gray-100 p-1 rounded-xl mb-5">
                  <TabsTrigger value="description" className="rounded-lg text-xs sm:text-sm font-medium py-2">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="specifications" className="rounded-lg text-xs sm:text-sm font-medium py-2">
                    Specs & Box
                  </TabsTrigger>
                  <TabsTrigger value="rules" className="rounded-lg text-xs sm:text-sm font-medium py-2">
                    Draw Rules
                  </TabsTrigger>
                </TabsList>

                {/* Tab 1: Prize Overview */}
                <TabsContent value="description" className="space-y-4 pt-1">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2">About This Item</h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                      {raffle.longDescription || raffle.description}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-semibold text-gray-900">Genuine & Official Stock</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                        100% brand new, authentic, sealed with official manufacturer warranty. PTA approved for mobile phones.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 2: Specifications */}
                <TabsContent value="specifications" className="space-y-3 pt-1">
                  <h3 className="text-sm font-bold text-gray-900">Key Features & Inclusions</h3>
                  {raffle.specifications && raffle.specifications.length > 0 ? (
                    <div className="grid sm:grid-cols-2 gap-2.5">
                      {raffle.specifications.map((spec, index) => (
                        <div key={index} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                          <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                          <span className="text-xs text-gray-700 font-medium">{spec}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">Standard factory specifications and official warranty apply.</p>
                  )}
                </TabsContent>

                {/* Tab 3: Official Rules */}
                <TabsContent value="rules" className="space-y-3 pt-1">
                  <h3 className="text-sm font-bold text-gray-900">Terms & Fairness Conditions</h3>
                  {raffle.rules && raffle.rules.length > 0 ? (
                    <div className="space-y-2">
                      {raffle.rules.map((rule, index) => (
                        <div key={index} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                          <span className="w-4 h-4 rounded-full bg-green-100 text-green-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-xs text-gray-600 leading-relaxed">{rule}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-5">
                      <li>Draw is broadcast live on YouTube & Facebook.</li>
                      <li>Valid Pakistani CNIC required for delivery verification.</li>
                      <li>Doorstep courier delivery is 100% free nationwide.</li>
                    </ul>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Trust Badges Section */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3.5">
                PakRaffle Trust Guarantees
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2.5">
                  <Video className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Live Video Draw</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">Streamed public draw with certified randomizer.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Sealed & PTA Paid</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">100% original stock with official brand warranty.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2.5">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Free TCS Courier</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">Tracked, insured delivery to your doorstep.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2.5">
                  <Award className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Verified Winner</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">Delivery proof published on our winners page.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Accordion */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Frequently Asked Questions</h3>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="faq-1" className="border-b border-gray-100">
                  <AccordionTrigger className="text-xs sm:text-sm font-semibold text-gray-800 py-3 hover:no-underline">
                    How is the winner picked fairly?
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-gray-600 leading-relaxed pb-3">
                    Draws are held live on social media using a verified cryptographic random number generator. The full recording remains published for public inspection.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-2" className="border-b border-gray-100">
                  <AccordionTrigger className="text-xs sm:text-sm font-semibold text-gray-800 py-3 hover:no-underline">
                    How do I submit payment?
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-gray-600 leading-relaxed pb-3">
                    Tap "Buy Ticket", choose your mobile wallet (EasyPaisa, JazzCash, NayaPay, SadaPay, or Bank), send the fee, and upload the payment screenshot.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-3">
                  <AccordionTrigger className="text-xs sm:text-sm font-semibold text-gray-800 py-3 hover:no-underline">
                    Is shipping really free across Pakistan?
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-gray-600 leading-relaxed pb-3">
                    Yes! All shipping, transit insurance, and delivery charges are 100% covered by PakRaffle.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN (DESKTOP BUY BOX + WHATSAPP COMMUNITY)      */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-6">
            {/* Desktop Pricing & Buy Box */}
            <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-5">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                  <span>{raffle.category}</span>
                  <span>·</span>
                  <span>Raffle #{raffle.id}</span>
                  <span>·</span>
                  <span className="text-green-600 font-medium">Draw Active</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 leading-snug">
                  {raffle.title}
                </h1>
                <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">
                  {raffle.description}
                </p>
              </div>

              {/* Price Grid */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                  <span className="text-[11px] text-gray-500 block">Ticket Price</span>
                  <div className="text-2xl font-bold text-green-600 font-mono">
                    {formatCurrency(raffle.price)}
                  </div>
                  <span className="text-[10px] text-gray-500">Per lucky draw entry</span>
                </div>

                <div className="border-l border-gray-200 pl-3.5">
                  <span className="text-[11px] text-gray-500 block">Market Value</span>
                  <div className="text-lg font-semibold text-gray-400 line-through font-mono">
                    {formatCurrency(raffle.realPrice)}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium">99%+ savings chance</span>
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Draw Closes In:
                  </span>
                  <span className="text-[11px] text-amber-700">
                    {new Date(raffle.endDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 text-center">
                  <div className="bg-white rounded-lg py-1.5 border border-amber-100">
                    <div className="text-base font-bold text-gray-900 font-mono">
                      {String(timeLeft.days).padStart(2, "0")}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-gray-500">Days</div>
                  </div>
                  <div className="bg-white rounded-lg py-1.5 border border-amber-100">
                    <div className="text-base font-bold text-gray-900 font-mono">
                      {String(timeLeft.hours).padStart(2, "0")}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-gray-500">Hours</div>
                  </div>
                  <div className="bg-white rounded-lg py-1.5 border border-amber-100">
                    <div className="text-base font-bold text-gray-900 font-mono">
                      {String(timeLeft.minutes).padStart(2, "0")}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-gray-500">Mins</div>
                  </div>
                  <div className="bg-white rounded-lg py-1.5 border border-amber-100">
                    <div className="text-base font-bold text-gray-900 font-mono">
                      {String(timeLeft.seconds).padStart(2, "0")}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-gray-500">Secs</div>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-gray-700">
                    Sold: <strong className="text-gray-900 font-mono">{currentEntries}</strong> / {totalEntries}
                  </span>
                  <span className="text-emerald-600 font-bold font-mono">
                    {percentFilled}% ({remainingEntries} left)
                  </span>
                </div>
                <Progress value={percentFilled} className="h-2 bg-gray-100" />
              </div>

              {/* Buy Actions */}
              <div>
                {isUserPurchased && raffle.status === "ACTIVE" ? (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1.5">
                    <div className="text-xs font-semibold text-emerald-800 flex items-center justify-center gap-1.5">
                      <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                      You Are In This Draw!
                    </div>
                    <button onClick={handleEnterRaffle} className="text-xs text-emerald-700 underline font-semibold">
                      Buy Additional Tickets
                    </button>
                  </div>
                ) : paymentUnderReview ? (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
                    <span className="text-xs font-semibold text-amber-800 flex items-center justify-center gap-1.5">
                      <Clock10Icon className="w-4 h-4 text-amber-600" />
                      Receipt Under Review
                    </span>
                  </div>
                ) : (
                  <Button
                    onClick={handleEnterRaffle}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-base rounded-xl shadow-xs"
                  >
                    <Gift className="w-5 h-5 mr-2" />
                    Buy Ticket for {formatCurrency(raffle.price)}
                  </Button>
                )}
              </div>
            </div>

            {/* Official WhatsApp Card (Visible on Both Mobile & Desktop) */}
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white p-4 sm:p-5 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="bg-[#25D366] text-white p-2 rounded-xl shadow-xs shrink-0">
                  <WhatsAppIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 leading-tight">
                    Official WhatsApp Community
                  </h4>
                  <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                    25,000+ Pakistani members active
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                Join our WhatsApp channel to get direct YouTube live stream links on draw day, instant winner announcements, and 24/7 payment support.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <a
                  href={WHATSAPP_COMMUNITY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold shadow-xs transition-colors whitespace-nowrap min-h-[44px]"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  Join Channel
                </a>

                <a
                  href={waInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-semibold transition-colors whitespace-nowrap min-h-[44px]"
                >
                  Direct Support
                </a>
              </div>

              <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-[11px] text-gray-500">
                <span>Helpline: {WHATSAPP_SUPPORT_NUMBER}</span>
                <button
                  onClick={copyWhatsAppNumber}
                  className="text-emerald-700 hover:text-emerald-900 font-semibold inline-flex items-center gap-1"
                >
                  {copiedPhone ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedPhone ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* Quick 4 Steps Guide */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                How It Works
              </h3>
              <div className="grid grid-cols-2 gap-2.5 text-center">
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-5 h-5 rounded-full bg-green-100 text-green-700 text-[11px] font-bold flex items-center justify-center mx-auto mb-1">
                    1
                  </div>
                  <h5 className="text-xs font-bold text-gray-800">Buy Ticket</h5>
                  <p className="text-[10px] text-gray-500">Mobile Wallet</p>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center justify-center mx-auto mb-1">
                    2
                  </div>
                  <h5 className="text-xs font-bold text-gray-800">Get Ticket ID</h5>
                  <p className="text-[10px] text-gray-500">Receipt Verified</p>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold flex items-center justify-center mx-auto mb-1">
                    3
                  </div>
                  <h5 className="text-xs font-bold text-gray-800">Watch Live</h5>
                  <p className="text-[10px] text-gray-500">YouTube Draw</p>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[11px] font-bold flex items-center justify-center mx-auto mb-1">
                    4
                  </div>
                  <h5 className="text-xs font-bold text-gray-800">Doorstep Gift</h5>
                  <p className="text-[10px] text-gray-500">Free TCS Courier</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MOBILE STICKY BOTTOM ACTION BAR (Touch-First UX)          */}
      {/* ======================================================== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-3.5 py-2.5 shadow-lg flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-500 font-medium">Ticket Price</span>
          <div className="text-lg font-bold text-green-600 font-mono leading-none">
            {formatCurrency(raffle.price)}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium mt-0.5">
            {remainingEntries} tickets left
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={waInquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-xs shrink-0"
            title="Chat on WhatsApp"
          >
            <WhatsAppIcon className="w-5 h-5" />
          </a>

          <Button
            onClick={handleEnterRaffle}
            className="h-11 px-5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm shadow-xs flex items-center gap-1.5"
          >
            <Gift className="w-4 h-4" />
            Buy Ticket
          </Button>
        </div>
      </div>

      {/* Enter Raffle Modal */}
      {raffle && (
        <EnterRaffleModal
          raffle={raffle}
          referralLinkId={referralLinkId}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

export default ClientSide