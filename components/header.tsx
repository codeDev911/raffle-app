"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Menu,
  Trophy,
  Gift,
  LogOut,
  Settings,
  HomeIcon,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  LucideUser,
  Tag,
  Search,
  Clock,
  ArrowRight,
  Store,
} from "lucide-react"

export const WHATSAPP_CLEAN = "923377155722"
export const WHATSAPP_COMMUNITY_URL = "https://whatsapp.com/channel/0029VbB0CzJ8fewyBXpXy210"

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.507 14.307l-.009.075c-.238-.12-1.406-.694-1.624-.774-.219-.079-.378-.12-.538.12-.158.239-.617.774-.757.933-.138.16-.279.179-.517.06-.239-.12-1.008-.372-1.92-1.185-.709-.633-1.188-1.415-1.328-1.654-.139-.239-.015-.368.105-.487.108-.107.239-.279.359-.418.119-.14.159-.239.239-.399.08-.159.04-.299-.02-.418-.06-.12-.538-1.296-.737-1.774-.194-.467-.393-.404-.539-.412l-.46-.008c-.159 0-.418.06-.637.299-.22.239-.837.817-.837 1.993 0 1.176.857 2.311.976 2.471.12.16 1.687 2.576 4.088 3.613.571.247 1.018.395 1.366.506.574.183 1.096.157 1.509.095.46-.069 1.406-.575 1.605-1.131.199-.557.199-1.035.139-1.135-.059-.1-.219-.16-.458-.279zM12.023 2C6.49 2 2 6.48 2 12c0 1.979.578 3.824 1.579 5.378L2.094 22l4.802-1.436C8.36 21.435 10.134 22 12.023 22c5.534 0 10.024-4.48 10.024-10S17.557 2 12.023 2zm0 18.25c-1.644 0-3.18-.49-4.475-1.332l-.321-.21-2.852.853.865-2.784-.23-.332A8.196 8.196 0 013.78 12c0-4.545 3.697-8.243 8.243-8.243 4.545 0 8.243 3.698 8.243 8.243 0 4.545-3.698 8.25-8.243 8.25z" />
    </svg>
  )
}

/** Small helper links that live behind the "More" menu, grouped by intent. */
const MORE_LINKS = [
  {
    href: "/list-product",
    title: "List Your Product",
    body: "Sell phones, bikes or electronics with a 92% bank payout.",
    icon: Tag,
    tone: "emerald",
    badge: "8% Fee",
  },
  {
    href: "/merchants",
    title: "Merchant Connect",
    body: "Turn fulfilled Shopify orders into guaranteed prize draws.",
    icon: Store,
    tone: "emerald",
    badge: "Shopify",
  },
  {
    href: "/lookup/store-ticket",
    title: "Store Ticket Lookup",
    body: "Find a draw entry with an order number, ticket or phone.",
    icon: Search,
    tone: "violet",
    badge: null,
  },
  {
    href: "/application/status/req-101",
    title: "Track Application",
    body: "Review progress, inspection and escrow custody hold.",
    icon: Clock,
    tone: "sky",
    badge: null,
  },
  {
    href: "/become-a-partner",
    title: "Partner & Affiliates",
    body: "Earn commission sharing verified draws on social channels.",
    icon: TrendingUp,
    tone: "amber",
    badge: "Earn PKR",
  },
  {
    href: "/#how-it-works",
    title: "How It Works",
    body: "Fair quota mechanism, live draws and insured TCS delivery.",
    icon: ShieldCheck,
    tone: "slate",
    badge: null,
  },
] as const

const TONE_STYLES: Record<string, { tile: string; badge: string }> = {
  emerald: { tile: "bg-emerald-50 text-emerald-700 ring-emerald-200/70", badge: "bg-emerald-600 text-white" },
  violet: { tile: "bg-violet-50 text-violet-700 ring-violet-200/70", badge: "bg-violet-100 text-violet-700" },
  sky: { tile: "bg-sky-50 text-sky-700 ring-sky-200/70", badge: "bg-sky-100 text-sky-700" },
  amber: { tile: "bg-amber-50 text-amber-700 ring-amber-200/70", badge: "bg-amber-100 text-amber-800" },
  slate: { tile: "bg-slate-100 text-slate-700 ring-slate-200", badge: "bg-slate-100 text-slate-700" },
}

interface UserType {
  id: string
  name: string
  email: string
  role: string
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [trackIdInput, setTrackIdInput] = useState("")
  const [elevated, setElevated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackIdInput.trim()) return
    const cleanId = trackIdInput.trim()
    setIsOpen(false)
    router.push(`/application/status/${encodeURIComponent(cleanId)}`)
  }

  const navigation = [
    { name: "Home", href: "/", icon: HomeIcon, badge: null as string | null },
    { name: "All Draws", href: "/raffles", icon: Gift, badge: null as string | null },
    { name: "Winners", href: "/winners", icon: Trophy, badge: "Live" },
    { name: "Merchants", href: "/merchants", icon: Store, badge: null as string | null },
  ]

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // The bar sits on the page content until the reader scrolls, then lifts on a soft shadow.
  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const waInquiryUrl = `https://wa.me/${WHATSAPP_CLEAN}?text=${encodeURIComponent(
    "Salam PakRaffle! I have an inquiry about lucky draw tickets and upcoming draws.",
  )}`

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : Boolean(pathname?.startsWith(href))

  const isMoreActive = ["/list-product", "/application", "/become-a-partner", "/merchants", "/lookup"].some(
    (prefix) => pathname?.startsWith(prefix),
  )

  return (
    <header className="sticky top-0 z-50">
      {/* Announcement strip */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-emerald-50">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between gap-3 px-4 text-[11px] sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
            </span>
            <span className="truncate font-medium tracking-wide">
              Pakistan&apos;s #1 transparent lucky draw platform
            </span>
            <span className="hidden shrink-0 text-emerald-300/70 lg:inline">·</span>
            <span className="hidden shrink-0 text-emerald-200/80 lg:inline">
              Free insured TCS delivery nationwide
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-3 font-semibold">
            <a
              href={waInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-emerald-300"
            >
              <WhatsAppIcon className="h-3.5 w-3.5 text-[#25D366]" />
              <span className="hidden sm:inline">WhatsApp Support</span>
              <span className="sm:hidden">Support</span>
            </a>
            <span className="hidden h-3 w-px bg-emerald-400/30 md:block" />
            <Link
              href="/winners"
              className="hidden text-emerald-200/90 transition-colors hover:text-white md:inline"
            >
              Verify Winners
            </Link>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div
        className={`border-b bg-white/85 backdrop-blur-xl transition-shadow duration-200 supports-[backdrop-filter]:bg-white/70 ${
          elevated ? "border-slate-200 shadow-sm" : "border-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:h-[70px]">
          {/* Brand */}
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-sm shadow-emerald-600/30 transition-transform group-hover:-translate-y-0.5 sm:h-10 sm:w-10">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-lg font-black tracking-tight text-slate-900 sm:text-xl">
                Pak<span className="text-emerald-600">Raffle</span>
              </span>
              <span className="mt-0.5 hidden text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400 sm:block">
                Verified draws
              </span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-0.5 lg:flex">
            {navigation.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors ${
                    active
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/70"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {item.name === "Winners" && <Trophy className="h-3.5 w-3.5 text-amber-500" />}
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="rounded-full bg-emerald-600 px-1.5 py-px text-[9px] font-extrabold uppercase text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}

            {/* More menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`group flex cursor-pointer items-center gap-1 rounded-full px-3.5 py-2 text-[13px] font-semibold outline-none transition-colors ${
                    isMoreActive
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/70"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>More</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="w-[92vw] max-w-xl space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/5 sm:w-[600px] sm:p-5"
              >
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/70">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-wider text-slate-900">
                        Helpful links &amp; seller services
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Sell, track applications and check our transparency
                      </p>
                    </div>
                  </div>
                  <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 sm:inline">
                    PakRaffle Hub
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {MORE_LINKS.map((link) => {
                    const tone = TONE_STYLES[link.tone]
                    const Icon = link.icon
                    return (
                      <DropdownMenuItem key={link.href + link.title} asChild className="cursor-pointer p-0 focus:bg-transparent">
                        <Link
                          href={link.href}
                          className="group flex w-full items-start gap-3 rounded-2xl border border-slate-200/70 p-3 transition-colors hover:border-emerald-300 hover:bg-emerald-50/40"
                        >
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${tone.tile}`}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center justify-between gap-1.5">
                              <span className="truncate text-xs font-bold text-slate-900">{link.title}</span>
                              {link.badge && (
                                <span className={`shrink-0 rounded-full px-1.5 py-px text-[9px] font-extrabold ${tone.badge}`}>
                                  {link.badge}
                                </span>
                              )}
                            </span>
                            <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">{link.body}</span>
                          </span>
                        </Link>
                      </DropdownMenuItem>
                    )
                  })}
                </div>

                <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                      <Search className="h-3.5 w-3.5 text-emerald-600" />
                      Quick application lookup
                    </span>
                    <span className="text-[10px] text-slate-400">Reference ID</span>
                  </div>
                  <form onSubmit={handleQuickTrack} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. req-1793003835516-456w"
                      value={trackIdInput}
                      onChange={(e) => setTrackIdInput(e.target.value)}
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs font-medium outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      className="h-8 shrink-0 rounded-xl bg-emerald-600 px-3.5 text-xs font-bold text-white hover:bg-emerald-500"
                    >
                      Track
                    </Button>
                  </form>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <a
              href={waInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-2 text-xs font-bold text-white shadow-sm shadow-[#25D366]/30 transition-colors hover:bg-[#20ba59] sm:inline-flex"
              title="Chat with PakRaffle on WhatsApp"
            >
              <WhatsAppIcon className="h-4 w-4" />
              <span className="hidden xl:inline">WhatsApp Help</span>
            </a>

            {loading ? (
              <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 hover:bg-transparent">
                    <Avatar className="h-9 w-9 border-2 border-white ring-2 ring-emerald-200">
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-xs font-bold text-white">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-60 rounded-2xl p-1.5" align="end" forceMount>
                  <div className="border-b border-slate-100 p-2">
                    <p className="text-sm font-bold text-slate-900">{user.name}</p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                    <span className="mt-1 inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                      {user.role}
                    </span>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer py-2 text-xs">
                      <LucideUser className="mr-2 h-4 w-4 text-slate-500" />
                      Profile Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile/entries" className="cursor-pointer py-2 text-xs">
                      <Gift className="mr-2 h-4 w-4 text-emerald-600" />
                      My Active Tickets
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile/settings" className="cursor-pointer py-2 text-xs">
                      <Settings className="mr-2 h-4 w-4 text-slate-500" />
                      Account Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer py-2 text-xs text-rose-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden items-center gap-1.5 sm:flex">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                >
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="rounded-full bg-emerald-600 text-xs font-bold text-white shadow-sm shadow-emerald-600/25 hover:bg-emerald-500"
                >
                  <Link href="/auth/register">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile drawer */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="left"
                className="flex h-full w-[85vw] max-w-sm flex-col border-r border-slate-200 bg-white p-0 sm:max-w-md"
              >
                <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-950 to-emerald-900 p-4 text-white sm:p-5">
                  <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/20">
                      <Trophy className="h-4 w-4 text-amber-300" />
                    </span>
                    <span className="flex flex-col leading-none">
                      <span className="text-lg font-black tracking-tight text-white">
                        Pak<span className="text-emerald-300">Raffle</span>
                      </span>
                      <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-emerald-200/70">
                        Verified draws
                      </span>
                    </span>
                  </Link>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-emerald-100">
                    Pakistan
                  </span>
                </div>

                <div className="flex-1 divide-y divide-slate-100 overflow-y-auto px-4 py-4">
                  {/* Account */}
                  <div className="pb-4">
                    {user ? (
                      <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar className="h-10 w-10 shrink-0 border border-emerald-300">
                            <AvatarFallback className="bg-emerald-600 text-xs font-bold text-white">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-slate-900">{user.name}</p>
                            <p className="truncate text-[11px] text-slate-500">{user.email}</p>
                          </div>
                        </div>
                        <Link
                          href="/profile"
                          onClick={() => setIsOpen(false)}
                          className="shrink-0 rounded-lg px-2 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                        >
                          Profile
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          asChild
                          variant="outline"
                          className="h-11 rounded-xl border-emerald-300 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                        >
                          <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                            Login
                          </Link>
                        </Button>
                        <Button
                          asChild
                          className="h-11 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500"
                        >
                          <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                            Sign Up
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Main navigation */}
                  <div className="space-y-1 py-4">
                    <span className="mb-2 block px-1 text-[11px] font-black uppercase tracking-wider text-slate-400">
                      Navigation
                    </span>
                    {navigation.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
                          isActive(item.href)
                            ? "bg-emerald-50 text-emerald-800"
                            : "text-slate-700 hover:bg-slate-50 hover:text-emerald-700"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <item.icon className="h-4 w-4 text-slate-500" />
                          <span>{item.name}</span>
                        </span>
                        {item.badge ? (
                          <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                            {item.badge}
                          </span>
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                        )}
                      </Link>
                    ))}
                  </div>

                  {/* Seller & support links */}
                  <div className="space-y-1 py-4">
                    <span className="mb-2 block px-1 text-[11px] font-black uppercase tracking-wider text-slate-400">
                      Helpful links
                    </span>
                    {MORE_LINKS.filter((link) => link.href !== "/merchants").map((link) => {
                      const Icon = link.icon
                      return (
                        <Link
                          key={link.href + link.title}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-emerald-700"
                        >
                          <span className="flex items-center gap-3">
                            <Icon className="h-4 w-4 text-slate-500" />
                            <span>{link.title}</span>
                          </span>
                          {link.badge ? (
                            <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                              {link.badge}
                            </span>
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                          )}
                        </Link>
                      )
                    })}

                    <div className="px-1 pt-3">
                      <form onSubmit={handleQuickTrack} className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Application ID (e.g. req-101)"
                          value={trackIdInput}
                          onChange={(e) => setTrackIdInput(e.target.value)}
                          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-mono text-xs font-medium outline-none transition focus:border-emerald-500"
                        />
                        <Button
                          type="submit"
                          size="sm"
                          className="h-8 shrink-0 rounded-xl bg-emerald-600 px-3 text-xs font-bold text-white hover:bg-emerald-500"
                        >
                          Track
                        </Button>
                      </form>
                    </div>
                  </div>

                  {/* Support */}
                  <div className="py-4">
                    <div className="rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 to-teal-50 p-3.5">
                      <div className="flex items-start gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white">
                          <WhatsAppIcon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                            Direct support
                          </p>
                          <p className="text-xs font-bold text-slate-900">Live WhatsApp help desk</p>
                          <p className="mt-0.5 text-[11px] leading-tight text-slate-600">
                            Ticket help, draw alerts and live stream links.
                          </p>
                        </div>
                      </div>
                      <a
                        href={waInquiryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#20ba59]"
                      >
                        <WhatsAppIcon className="h-4 w-4" />
                        Chat on WhatsApp
                      </a>
                    </div>
                  </div>

                  {/* Logged-in shortcuts */}
                  {user && (
                    <div className="space-y-1.5 pt-4">
                      <Link
                        href="/profile/entries"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Gift className="h-4 w-4 text-emerald-600" />
                        My tickets &amp; entries
                        <ArrowRight className="ml-auto h-3.5 w-3.5 text-slate-300" />
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout()
                          setIsOpen(false)
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Log out
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 bg-slate-50 p-3 text-center text-[10px] text-slate-500">
                  🇵🇰 PakRaffle Pakistan · 100% transparent draws
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
