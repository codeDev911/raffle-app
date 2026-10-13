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
import { Badge } from "@/components/ui/badge"
import {
  Menu,
  Trophy,
  Gift,
  Users,
  FileText,
  LogOut,
  Settings,
  HomeIcon,
  TrendingUp,
  Smartphone,
  Bike,
  Banknote,
  Gamepad2,
  Tv,
  ChevronDown,
  ChevronRight,
  Phone,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  LucideUser,
  X,
  Layers,
} from "lucide-react"

export const WHATSAPP_NUMBER = "+92 337 7155722"
export const WHATSAPP_CLEAN = "923377155722"
export const WHATSAPP_COMMUNITY_URL = "https://chat.whatsapp.com/invite/pakraffle-official"

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.507 14.307l-.009.075c-.238-.12-1.406-.694-1.624-.774-.219-.079-.378-.12-.538.12-.158.239-.617.774-.757.933-.138.16-.279.179-.517.06-.239-.12-1.008-.372-1.92-1.185-.709-.633-1.188-1.415-1.328-1.654-.139-.239-.015-.368.105-.487.108-.107.239-.279.359-.418.119-.14.159-.239.239-.399.08-.159.04-.299-.02-.418-.06-.12-.538-1.296-.737-1.774-.194-.467-.393-.404-.539-.412l-.46-.008c-.159 0-.418.06-.637.299-.22.239-.837.817-.837 1.993 0 1.176.857 2.311.976 2.471.12.16 1.687 2.576 4.088 3.613.571.247 1.018.395 1.366.506.574.183 1.096.157 1.509.095.46-.069 1.406-.575 1.605-1.131.199-.557.199-1.035.139-1.135-.059-.1-.219-.16-.458-.279zM12.023 2C6.49 2 2 6.48 2 12c0 1.979.578 3.824 1.579 5.378L2.094 22l4.802-1.436C8.36 21.435 10.134 22 12.023 22c5.534 0 10.024-4.48 10.024-10S17.557 2 12.023 2zm0 18.25c-1.644 0-3.18-.49-4.475-1.332l-.321-.21-2.852.853.865-2.784-.23-.332A8.196 8.196 0 013.78 12c0-4.545 3.697-8.243 8.243-8.243 4.545 0 8.243 3.698 8.243 8.243 0 4.545-3.698 8.25-8.243 8.25z" />
    </svg>
  )
}

export const CATEGORIES_LIST = [
  {
    name: "Electronics",
    slug: "Electronics",
    href: "/raffles?category=Electronics",
    icon: Smartphone,
    description: "iPhone 16 Pro, MacBooks, iPads & Gadgets",
    badge: "Hot",
    badgeColor: "bg-red-500 text-white",
    highlight: "Latest 2025 Flagships",
  },
  {
    name: "Vehicles & Bikes",
    slug: "Vehicles",
    href: "/raffles?category=Vehicles",
    icon: Bike,
    description: "Honda CG 125, YBR 125, Scooters",
    badge: "Popular",
    badgeColor: "bg-blue-600 text-white",
    highlight: "Zero-Meter Delivery",
  },
  {
    name: "Instant Cash",
    slug: "Cash",
    href: "/raffles?category=Cash",
    icon: Banknote,
    description: "Instant JazzCash / EasyPaisa / Bank Transfer",
    badge: "Instant",
    badgeColor: "bg-amber-600 text-white",
    highlight: "15-Min Payout",
  },
  {
    name: "Gaming & Consoles",
    slug: "Gaming",
    href: "/raffles?category=Gaming",
    icon: Gamepad2,
    description: "PlayStation 5 Slim, Consoles & Bundles",
    badge: "Trending",
    badgeColor: "bg-purple-600 text-white",
    highlight: "Sealed Bundles",
  },
  {
    name: "Home Appliances",
    slug: "Appliances",
    href: "/raffles?category=Appliances",
    icon: Tv,
    description: "Smart 4K TVs, Kitchen & Washing Packages",
    badge: "New",
    badgeColor: "bg-teal-600 text-white",
    highlight: "Full Home Packages",
  },
]

interface UserType {
  id: string
  name: string
  email: string
  role: string
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(true)
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const navigation = [
    { name: "Home", href: "/", icon: HomeIcon },
    { name: "All Raffles", href: "/raffles", icon: Gift },
    { name: "Winners", href: "/winners", icon: Trophy, badge: "Live" },
    { name: "How It Works", href: "/#how-it-works", icon: FileText },
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

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-xs">
      {/* 1. TOP ANNOUNCEMENT & WHATSAPP BAR (DESKTOP & TABLET) */}
      <div className="bg-gradient-to-r from-emerald-900 via-green-900 to-emerald-950 text-white text-[11px] sm:text-xs py-1.5 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-medium truncate">
              🇵🇰 Pakistan's #1 Transparent Lucky Draw Platform
            </span>
            <span className="hidden lg:inline text-emerald-200">
              • Free Insured TCS Doorstep Delivery Nationwide
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={waInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-bold hover:text-emerald-300 transition-colors"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
              <span className="hidden sm:inline">WhatsApp Support:</span>
              <span className="font-mono">{WHATSAPP_NUMBER}</span>
            </a>
            <span className="hidden md:inline text-emerald-500">|</span>
            <Link
              href="/winners"
              className="hidden md:inline text-emerald-200 hover:text-white transition-colors"
            >
              Verify Winners
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR ROW */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4">
          {/* Left: Brand Logo */}
          <Link href="/" className="flex items-center space-x-2 shrink-0 group">
            <div className="bg-green-600 p-2 rounded-xl group-hover:bg-green-500 transition-colors shadow-xs">
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Pak<span className="text-green-600">Raffle</span>
            </span>
          </Link>

          {/* Center: Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 text-sm font-medium">
            <Link
              href="/"
              className={`px-3 py-2 rounded-xl transition-colors ${
                pathname === "/"
                  ? "text-green-700 bg-green-50 font-bold"
                  : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
              }`}
            >
              Home
            </Link>

            {/* Categories Dropdown Mega-Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors cursor-pointer outline-none ${
                    pathname?.startsWith("/raffles")
                      ? "text-green-700 bg-green-50 font-bold"
                      : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
                  }`}
                >
                  <Layers className="h-4 w-4 text-green-600" />
                  <span>Browse Categories</span>
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400 transition-transform duration-200" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-80 p-2 rounded-2xl shadow-xl border border-gray-200 bg-white"
              >
                <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Prize Categories
                  </span>
                  <Link
                    href="/raffles"
                    className="text-[11px] font-bold text-green-600 hover:text-green-700 hover:underline"
                  >
                    View All Draws →
                  </Link>
                </div>

                <div className="py-1 space-y-0.5">
                  {CATEGORIES_LIST.map((cat) => (
                    <DropdownMenuItem key={cat.slug} asChild className="p-0 cursor-pointer focus:bg-green-50">
                      <Link
                        href={cat.href}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-green-50/80 transition-colors w-full"
                      >
                        <div className="p-2 rounded-xl bg-green-100/70 text-green-700 shrink-0">
                          <cat.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-semibold text-gray-900 text-xs truncate">
                              {cat.name}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cat.badgeColor}`}>
                              {cat.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 truncate mt-0.5">
                            {cat.description}
                          </p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>

                <DropdownMenuSeparator className="my-1" />
                <div className="p-1.5">
                  <Link
                    href="/raffles"
                    className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-colors shadow-2xs"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    Explore All Lucky Draws
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              href="/raffles"
              className={`px-3 py-2 rounded-xl transition-colors ${
                pathname === "/raffles" && !pathname.includes("category")
                  ? "text-green-700 bg-green-50 font-bold"
                  : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
              }`}
            >
              All Draws
            </Link>

            <Link
              href="/winners"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors ${
                pathname?.startsWith("/winners")
                  ? "text-green-700 bg-green-50 font-bold"
                  : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
              }`}
            >
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>Winners</span>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Live
              </span>
            </Link>

            <Link
              href="/#how-it-works"
              className="px-3 py-2 rounded-xl text-gray-700 hover:text-green-600 hover:bg-gray-50 transition-colors"
            >
              How It Works
            </Link>
          </nav>

          {/* Right: Actions & User Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop WhatsApp Direct Action Button */}
            <a
              href={waInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1caa52] text-white text-xs font-bold shadow-2xs transition-colors shrink-0"
              title="Chat with PakRaffle on WhatsApp"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>WhatsApp Help</span>
            </a>

            {/* Auth Buttons / Profile */}
            {loading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full p-0">
                    <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border border-green-300">
                      <AvatarFallback className="bg-green-600 text-white font-bold text-xs sm:text-sm">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-60 rounded-2xl p-1.5" align="end" forceMount>
                  <div className="p-2 border-b border-gray-100">
                    <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                    <p className="truncate text-xs text-gray-500">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 bg-green-50 text-green-700 rounded-md">
                      {user.role}
                    </span>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer py-2 text-xs">
                      <LucideUser className="mr-2 h-4 w-4 text-gray-500" />
                      Profile Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile/entries" className="cursor-pointer py-2 text-xs">
                      <Gift className="mr-2 h-4 w-4 text-green-600" />
                      My Active Tickets
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile/settings" className="cursor-pointer py-2 text-xs">
                      <Settings className="mr-2 h-4 w-4 text-gray-500" />
                      Account Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 py-2 text-xs">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="rounded-xl text-gray-700 hover:text-green-600 hover:bg-green-50 text-xs font-semibold"
                >
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-2xs"
                >
                  <Link href="/auth/register">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile Hamburger Trigger (Opens Comprehensive Sidebar Drawer) */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden rounded-xl h-10 w-10 text-gray-700 hover:bg-gray-100"
                  aria-label="Open Navigation Menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>

              {/* 3. MOBILE SIDEBAR DRAWER (FIT FOR 100% MOBILE & TABLET SCREENS) */}
              <SheetContent
                side="left"
                className="w-[85vw] max-w-sm sm:max-w-md p-0 flex flex-col h-full bg-white border-r border-gray-200"
              >
                {/* Drawer Header */}
                <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-emerald-900 to-green-900 text-white flex items-center justify-between">
                  <Link
                    href="/"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2"
                  >
                    <div className="bg-white/20 p-1.5 rounded-xl">
                      <Trophy className="h-5 w-5 text-amber-300" />
                    </div>
                    <span className="text-xl font-black tracking-tight text-white">
                      Pak<span className="text-emerald-300">Raffle</span>
                    </span>
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] bg-emerald-700 text-emerald-100 font-bold px-2 py-0.5 rounded-full">
                      Pakistan
                    </span>
                  </div>
                </div>

                {/* Drawer Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 divide-y divide-gray-100">
                  {/* User Status / Profile Card in Mobile */}
                  <div className="pt-1">
                    {user ? (
                      <div className="flex items-center justify-between p-3.5 bg-green-50 rounded-2xl border border-green-200/80">
                        <div className="flex items-center space-x-3 min-w-0">
                          <Avatar className="h-10 w-10 border border-green-400 shrink-0">
                            <AvatarFallback className="bg-green-600 text-white font-bold text-xs">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 text-xs truncate">{user.name}</p>
                            <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="text-xs text-green-700 font-bold hover:bg-green-100 rounded-xl"
                        >
                          <Link href="/profile" onClick={() => setIsOpen(false)}>
                            Profile
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          asChild
                          variant="outline"
                          className="rounded-xl border-green-500 text-green-700 hover:bg-green-50 text-xs font-bold h-11"
                        >
                          <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                            Login
                          </Link>
                        </Button>
                        <Button
                          asChild
                          className="rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold h-11 shadow-2xs"
                        >
                          <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                            Sign Up
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* CATEGORIES SECTION (REQUESTED BY USER) */}
                  <div className="pt-4 space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-green-600" />
                        Browse by Category
                      </span>
                      <Link
                        href="/raffles"
                        onClick={() => setIsOpen(false)}
                        className="text-[11px] font-bold text-green-600 hover:text-green-700"
                      >
                        All ({CATEGORIES_LIST.length})
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5 pt-1">
                      {CATEGORIES_LIST.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={cat.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 active:bg-green-50 transition-colors border border-gray-100"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-xl bg-green-50 text-green-700 shrink-0">
                              <cat.icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-gray-900 text-xs truncate">
                                  {cat.name}
                                </span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${cat.badgeColor}`}>
                                  {cat.badge}
                                </span>
                              </div>
                              <span className="text-[10px] text-gray-500 block truncate">
                                {cat.highlight}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* MAIN SITE NAVIGATION IN MOBILE SIDEBAR */}
                  <div className="pt-4 space-y-1">
                    <span className="text-xs font-black text-gray-900 uppercase tracking-wider px-1 block mb-2">
                      Main Navigation
                    </span>

                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                          pathname === item.href
                            ? "bg-green-50 text-green-700 font-bold"
                            : "text-gray-700 hover:bg-gray-50 hover:text-green-600"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-4 w-4 text-gray-500" />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ))}

                    <Link
                      href="https://blog.pakraffle.com?utm=pakraffle&medium=mobile-sidebar"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-green-600"
                    >
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                        <span>News & Draw Blogs</span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                    </Link>

                    <Link
                      href="/become-a-partner"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-green-600"
                    >
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        <span>Earn with Us (Affiliates)</span>
                      </div>
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full">
                        Earn PKR
                      </span>
                    </Link>
                  </div>

                  {/* WHATSAPP HELPLINE SECTION IN MOBILE SIDEBAR */}
                  <div className="pt-4 space-y-2.5">
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-xl bg-[#25D366] text-white shrink-0">
                          <WhatsAppIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                            Direct Support & Alerts
                          </span>
                          <span className="text-xs font-black text-gray-900 block font-mono">
                            {WHATSAPP_NUMBER}
                          </span>
                          <p className="text-[11px] text-gray-600 mt-0.5 leading-tight">
                            Live chat, ticket assistance & live stream links.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <a
                          href={waInquiryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-[#25D366] active:bg-[#1caa52] text-white text-xs font-bold shadow-2xs text-center"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5" />
                          Chat WhatsApp
                        </a>
                        <a
                          href={`tel:${WHATSAPP_CLEAN}`}
                          className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border border-emerald-300 bg-white text-emerald-900 text-xs font-bold text-center"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-700" />
                          Call Direct
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* USER LOGGED IN QUICK ACTIONS */}
                  {user && (
                    <div className="pt-4 space-y-1.5">
                      <Button
                        asChild
                        variant="outline"
                        className="w-full justify-start rounded-xl text-xs font-medium h-10"
                      >
                        <Link href="/profile/entries" onClick={() => setIsOpen(false)}>
                          <Gift className="mr-2 h-4 w-4 text-green-600" />
                          My Tickets & Entries
                        </Link>
                      </Button>
                      <Button
                        onClick={() => {
                          handleLogout()
                          setIsOpen(false)
                        }}
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl text-xs font-medium h-10"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log Out Account
                      </Button>
                    </div>
                  )}
                </div>

                {/* Drawer Footer Trust Indicator */}
                <div className="p-3 bg-gray-50 border-t border-gray-100 text-center text-[10px] text-gray-500">
                  <span>🇵🇰 PakRaffle Pakistan • 100% Transparent Draws</span>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* 4. FAST CATEGORY BAR (SCROLLABLE ON MOBILE, SLEEK ROW ON DESKTOP) */}
      <div className="border-t border-gray-100 bg-gray-50/90 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center gap-2 sm:gap-3 text-xs whitespace-nowrap">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden sm:inline-block pr-1">
            Categories:
          </span>

          <Link
            href="/raffles"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors shrink-0 ${
              pathname === "/raffles" && !pathname.includes("category")
                ? "bg-green-600 text-white shadow-2xs"
                : "bg-white text-gray-700 border border-gray-200 hover:border-green-400 hover:text-green-700"
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>All Draws</span>
          </Link>

          {CATEGORIES_LIST.map((cat) => {
            const isSelected = pathname?.includes(`category=${cat.slug}`)
            return (
              <Link
                key={cat.slug}
                href={cat.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors shrink-0 ${
                  isSelected
                    ? "bg-green-600 text-white shadow-2xs"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-green-400 hover:text-green-700"
                }`}
              >
                <cat.icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
                {cat.badge === "Hot" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                )}
              </Link>
            )
          })}

          <Link
            href="/winners"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors shrink-0 ml-auto"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>Hall of Fame</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
