import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Trophy,
  Calendar,
  MapPin,
  CheckCircle,
  Star,
  Phone,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Gift,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const WHATSAPP_NUMBER = "+92 337 7155722"
const WHATSAPP_CLEAN = "923377155722"
const WHATSAPP_COMMUNITY_URL = "https://chat.whatsapp.com/invite/pakraffle-official"

function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.507 14.307l-.009.075c-.238-.12-1.406-.694-1.624-.774-.219-.079-.378-.12-.538.12-.158.239-.617.774-.757.933-.138.16-.279.179-.517.06-.239-.12-1.008-.372-1.92-1.185-.709-.633-1.188-1.415-1.328-1.654-.139-.239-.015-.368.105-.487.108-.107.239-.279.359-.418.119-.14.159-.239.239-.399.08-.159.04-.299-.02-.418-.06-.12-.538-1.296-.737-1.774-.194-.467-.393-.404-.539-.412l-.46-.008c-.159 0-.418.06-.637.299-.22.239-.837.817-.837 1.993 0 1.176.857 2.311.976 2.471.12.16 1.687 2.576 4.088 3.613.571.247 1.018.395 1.366.506.574.183 1.096.157 1.509.095.46-.069 1.406-.575 1.605-1.131.199-.557.199-1.035.139-1.135-.059-.1-.219-.16-.458-.279zM12.023 2C6.49 2 2 6.48 2 12c0 1.979.578 3.824 1.579 5.378L2.094 22l4.802-1.436C8.36 21.435 10.134 22 12.023 22c5.534 0 10.024-4.48 10.024-10S17.557 2 12.023 2zm0 18.25c-1.644 0-3.18-.49-4.475-1.332l-.321-.21-2.852.853.865-2.784-.23-.332A8.196 8.196 0 013.78 12c0-4.545 3.697-8.243 8.243-8.243 4.545 0 8.243 3.698 8.243 8.243 0 4.545-3.698 8.25-8.243 8.25z" />
    </svg>
  )
}

// Verified winners data with direct raffle links
const winnersData = [
  {
    id: 1,
    raffleId: "raffle-1",
    name: "Ahmed Hassan",
    city: "Karachi",
    prizeTitle: "iPhone 16 Pro Max 256GB",
    prizeValue: 420000,
    drawnAt: "2025-01-18",
    testimonial:
      "Alhamdulillah! I couldn't believe it when I got the call from PakRaffle. Delivered my iPhone within 2 days with full PTA registration and warranty!",
    proofImage: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
    profileImage: "/placeholder.svg?height=80&width=80",
    featured: true,
    verified: true,
  },
  {
    id: 2,
    raffleId: "raffle-4",
    name: "Zain Iqbal",
    city: "Islamabad",
    prizeTitle: "Cash Prize ₨100,000",
    prizeValue: 100000,
    drawnAt: "2025-01-15",
    testimonial:
      "Won ₨100,000 cash! The money was transferred straight to my JazzCash account within minutes after video verification. Thank you PakRaffle!",
    proofImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80",
    profileImage: "/placeholder.svg?height=80&width=80",
    featured: true,
    verified: true,
  },
  {
    id: 3,
    raffleId: "raffle-2",
    name: "Muhammad Ali",
    city: "Rawalpindi",
    prizeTitle: "Honda CG 125 Special Edition",
    prizeValue: 285000,
    drawnAt: "2025-01-16",
    testimonial:
      "My dream bike is now parked at my house! Transparent live draw on Facebook and WhatsApp video call handover. Highly recommended!",
    proofImage: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80",
    profileImage: "/placeholder.svg?height=80&width=80",
    featured: true,
    verified: true,
  },
  {
    id: 4,
    raffleId: "raffle-3",
    name: "Sara Khan",
    city: "Lahore",
    prizeTitle: "PlayStation 5 Slim 1TB Bundle",
    prizeValue: 175000,
    drawnAt: "2025-01-14",
    testimonial:
      "PS5 Slim delivered safe and sealed in Lahore! Excellent support from the PakRaffle WhatsApp team.",
    proofImage: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80",
    profileImage: "/placeholder.svg?height=50&width=50",
    featured: false,
    verified: true,
  },
  {
    id: 5,
    raffleId: "raffle-1",
    name: "Hassan Ahmed",
    city: "Faisalabad",
    prizeTitle: "Cash Prize ₨200,000",
    prizeValue: 200000,
    drawnAt: "2025-01-05",
    testimonial: "Used the prize money to expand my retail shop. PakRaffle really changes lives for real Pakistani families!",
    proofImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80",
    profileImage: "/placeholder.svg?height=50&width=50",
    featured: false,
    verified: true,
  },
  {
    id: 6,
    raffleId: "raffle-1",
    name: "Ayesha Malik",
    city: "Lahore",
    prizeTitle: "Samsung Galaxy S24 Ultra",
    prizeValue: 280000,
    drawnAt: "2025-01-03",
    testimonial: "Amazing phone with all accessories in original seal box. TCS courier delivery was super quick!",
    proofImage: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80",
    profileImage: "/placeholder.svg?height=50&width=50",
    featured: false,
    verified: true,
  },
]

const statsData = [
  { label: "Total Winners", value: "2,847+", icon: Trophy },
  { label: "Prizes Delivered", value: "₨45.2M+", icon: CheckCircle },
  { label: "Cities Reached", value: "32+ Cities", icon: MapPin },
  { label: "Happy Families", value: "2,400+", icon: Star },
]

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("PKR", "₨")
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export const metadata = {
  title: "Verified Winners & Live Draw Results - PakRaffle",
  description: "Meet the verified lucky winners of PakRaffle across Pakistan! See proof of prize delivery, video draw recordings, and official draw certificates.",
}

export default function WinnersPage() {
  const featuredWinners = winnersData.filter((winner) => winner.featured)
  const recentWinners = winnersData.filter((winner) => !winner.featured)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-3 sm:px-6 lg:px-8 text-gray-900">
      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-14">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            100% Genuine & Verified Proof
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight">
            Our Happy Winners
          </h1>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            Real people, real prizes, verified deliveries. Every winner is selected live on social media with public transparency.
          </p>
        </div>

        {/* PROMINENT WHATSAPP HELPLINE CARD */}
        <div className="rounded-3xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-xs shrink-0">
                <WhatsAppIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Official WhatsApp Support
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-gray-900">
                  Contact Us on WhatsApp: <span className="font-mono text-emerald-700">{WHATSAPP_NUMBER}</span>
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-xl">
                  Have questions about draw results, prize delivery proof, or upcoming draws? Chat directly with our team or join our WhatsApp community of 25,000+ members.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-2.5 w-full md:w-auto shrink-0">
              <a
                href={`https://wa.me/${WHATSAPP_CLEAN}?text=${encodeURIComponent(
                  "Salam PakRaffle! I am checking the winners hall of fame. Please share live draw verification details and upcoming lucky draws.",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1caa52] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors whitespace-nowrap min-h-[44px]"
              >
                <WhatsAppIcon className="w-4 h-4" />
                Chat on WhatsApp
              </a>

              <a
                href={`tel:${WHATSAPP_CLEAN}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap min-h-[44px]"
              >
                <Phone className="w-4 h-4" />
                Call Helpline
              </a>

              <a
                href={WHATSAPP_COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-semibold transition-colors whitespace-nowrap min-h-[44px]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Join Alerts Group
              </a>
            </div>
          </div>
        </div>

        {/* High-Level Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {statsData.map((stat, index) => (
            <Card key={index} className="text-center rounded-2xl border border-gray-200 bg-white shadow-2xs">
              <CardContent className="p-4 sm:p-6 space-y-2">
                <div className="bg-emerald-50 w-11 h-11 rounded-xl flex items-center justify-center mx-auto text-emerald-600">
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="text-xl sm:text-3xl font-black text-gray-900">{stat.value}</div>
                <div className="text-xs sm:text-sm text-gray-500 font-medium">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Featured Winners Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Featured Mega Winners</h2>
              <p className="text-xs sm:text-sm text-gray-500">Verified handovers with official video proof</p>
            </div>
            <Button asChild size="sm" className="rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs">
              <Link href="/raffles">
                Enter Next Draw <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredWinners.map((winner) => (
              <Card key={winner.id} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="relative aspect-[16/10] w-full bg-gray-100">
                    <Image
                      src={winner.proofImage || "/placeholder.jpg"}
                      alt={`${winner.name} with ${winner.prizeTitle}`}
                      fill
                      className="object-cover"
                    />
                    <Badge className="absolute top-3 left-3 bg-amber-500 text-white rounded-xl text-[10px] font-bold">
                      <Star className="w-3 h-3 mr-1" />
                      Grand Prize Winner
                    </Badge>
                    <Badge className="absolute top-3 right-3 bg-emerald-600 text-white rounded-xl text-[10px] font-bold">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      CNIC Verified
                    </Badge>
                  </div>

                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{winner.name}</h3>
                        <div className="flex items-center text-xs text-gray-500 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          {winner.city}, Pakistan
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-black text-green-700 font-mono">
                          {formatCurrency(winner.prizeValue)}
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase font-semibold">Prize Worth</div>
                      </div>
                    </div>

                    <div className="bg-emerald-50/70 border border-emerald-100 p-3.5 rounded-xl space-y-1">
                      <div className="font-bold text-xs text-emerald-900">Won: {winner.prizeTitle}</div>
                      <p className="text-xs text-emerald-800 italic line-clamp-3">"{winner.testimonial}"</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(winner.drawnAt)}
                      </span>
                      <span className="text-emerald-700 font-semibold">Doorstep Delivery Done</span>
                    </div>
                  </CardContent>
                </div>

                <div className="p-5 pt-0">
                  <Button asChild className="w-full rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs py-2.5 min-h-[42px]">
                    <Link href={`/raffles/${winner.raffleId}/winner`}>
                      View Official Draw Certificate →
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Winners Grid */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Recent Winners</h2>
            <p className="text-xs sm:text-sm text-gray-500">More happy Pakistanis who won in recent weekly draws</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentWinners.map((winner) => (
              <Card key={winner.id} className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="relative aspect-[16/10] w-full bg-gray-100">
                    <Image
                      src={winner.proofImage || "/placeholder.jpg"}
                      alt={`${winner.name} with ${winner.prizeTitle}`}
                      fill
                      className="object-cover"
                    />
                    <Badge className="absolute top-3 right-3 bg-emerald-600 text-white rounded-xl text-[10px] font-bold">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>

                  <CardContent className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-base">{winner.name}</h3>
                        <div className="flex items-center text-xs text-gray-500 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 mr-1" />
                          {winner.city}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-700 font-mono text-sm">
                          {formatCurrency(winner.prizeValue)}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-xl space-y-1">
                      <div className="font-semibold text-xs text-gray-900">Prize: {winner.prizeTitle}</div>
                      <p className="text-xs text-gray-600 italic line-clamp-2">"{winner.testimonial}"</p>
                    </div>
                  </CardContent>
                </div>

                <div className="p-4 sm:p-5 pt-0">
                  <Button asChild variant="outline" className="w-full rounded-xl text-xs py-2.5 min-h-[40px]">
                    <Link href={`/raffles/${winner.raffleId}/winner`}>
                      View Winner Details & Proof
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Trust & Guarantee Banner */}
        <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-green-50 to-white p-8 sm:p-12 text-center shadow-xs">
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-sm">
              <Trophy className="w-7 h-7" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-emerald-950">
              Ready to Be Our Next Lucky Winner?
            </h2>
            <p className="text-sm sm:text-base text-emerald-800 leading-relaxed">
              Every draw is held live on video with a certified randomizer. All tickets are tracked, receipts are issued immediately, and delivery is 100% free nationwide.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <Badge className="bg-emerald-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold">
                ✓ 100% Genuine Sealed Products
              </Badge>
              <Badge className="bg-emerald-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold">
                ✓ Instant Cash Prize Transfers
              </Badge>
              <Badge className="bg-emerald-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold">
                ✓ Verified Live Draws
              </Badge>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-6 text-sm shadow-sm w-full sm:w-auto">
                <Link href="/raffles">
                  Explore Active Raffles & Enter
                </Link>
              </Button>
              <a
                href={`https://wa.me/${WHATSAPP_CLEAN}?text=${encodeURIComponent(
                  "Salam PakRaffle! I would like to know how to enter the next live lucky draw.",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-xs sm:text-sm transition-colors w-full sm:w-auto"
              >
                <WhatsAppIcon className="w-4 h-4" />
                Ask Us on WhatsApp ({WHATSAPP_NUMBER})
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
