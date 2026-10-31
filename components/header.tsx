"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BrandMark } from "@/components/brand"
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const WHATSAPP_CLEAN = "923377155722"
export const WHATSAPP_COMMUNITY_URL = "https://whatsapp.com/channel/0029VbB0CzJ8fewyBXpXy210"

/**
 * Plain text navigation — no pills, no icon buttons. The bar floats over the hero on the marketing
 * pages and turns solid white as soon as the reader scrolls, so the first impression is the page.
 */
const NAV = [
  { label: "Draws", href: "/raffles" },
  { label: "Winners", href: "/winners" },
  { label: "Merchants", href: "/merchants" },
  { label: "Sell a prize", href: "/list-product" },
  { label: "Partners", href: "/become-a-partner" },
  { label: "About", href: "/about" },
]

/** Routes whose first screen is a hero the bar is meant to sit inside. */
const OVERLAY_ROUTES = ["/about", "/merchants", "/list-product", "/become-a-partner", "/lookup"]
/** Pages that float too, but only at the exact path — their child routes keep the spacer. */
const OVERLAY_EXACT = ["/", "/raffles", "/contact", "/terms", "/refund"]

const SHEET_EXTRAS = [
  { label: "Ticket lookup", href: "/lookup/store-ticket" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Contact", href: "/contact" },
]

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
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          setUser(await response.json())
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Only the first few pixels matter: the bar should commit to a surface as soon as the hero moves.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [pathname])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      setIsOpen(false)
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : Boolean(pathname?.startsWith(href))

  const overlays =
    OVERLAY_EXACT.includes(pathname || "") || OVERLAY_ROUTES.some((route) => pathname?.startsWith(route))
  // Colourless over the hero, white the moment it scrolls — and always white on inner pages.
  const solid = scrolled || !overlays

  const waInquiryUrl = `https://wa.me/${WHATSAPP_CLEAN}?text=${encodeURIComponent(
    "Salam PakRaffle! I have an inquiry about lucky draws and upcoming draws.",
  )}`

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          solid
            ? "border-b border-slate-900/5 bg-white/90 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-5 sm:px-6 lg:h-[72px] lg:px-8">
          {/* Brand */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <BrandMark priority />
            <span className="text-[17px] font-semibold tracking-tight text-slate-900">PakRaffle</span>
          </Link>

          {/* Desktop navigation — ordinary links, nothing else. */}
          <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
            {NAV.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`text-[13px] transition-colors ${
                    active ? "font-semibold text-slate-900" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Account */}
          <div className="flex shrink-0 items-center gap-5">
            {loading ? (
              <span className="hidden h-3 w-14 animate-pulse rounded-full bg-slate-200/70 sm:block" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden max-w-[9rem] truncate text-[13px] font-medium text-slate-700 outline-none transition-colors hover:text-slate-900 sm:block">
                    {user.name.split(" ")[0]}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5">
                  <div className="px-2.5 py-2">
                    <p className="truncate text-[13px] font-semibold text-slate-900">{user.name}</p>
                    <p className="truncate text-[11px] text-slate-500">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer py-2 text-[13px]">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile/entries" className="cursor-pointer py-2 text-[13px]">
                      My tickets
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile/settings" className="cursor-pointer py-2 text-[13px]">
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer py-2 text-[13px] text-rose-600"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden items-center gap-5 sm:flex">
                <Link href="/auth/login" className="text-[13px] text-slate-600 transition-colors hover:text-slate-900">
                  Log in
                </Link>
                <Link
                  href="/auth/register"
                  className="text-[13px] font-semibold text-emerald-700 underline-offset-4 transition-colors hover:text-emerald-800 hover:underline"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button className="text-[13px] font-medium text-slate-700 outline-none transition-colors hover:text-slate-900 lg:hidden">
                  Menu
                </button>
              </SheetTrigger>

              <SheetContent
                side="left"
                className="flex w-[86vw] max-w-sm flex-col border-r border-slate-900/10 bg-[#f8f9f6] p-0 [&>button.absolute]:hidden"
              >
                <div className="flex items-center justify-between gap-3 border-b border-slate-900/5 px-6 py-5">
                  <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5">
                    <BrandMark />
                    <span className="text-[17px] font-semibold tracking-tight text-slate-900">PakRaffle</span>
                  </Link>
                  <SheetClose asChild>
                    <button className="text-[12px] font-medium text-slate-500 transition-colors hover:text-slate-900">
                      Close
                    </button>
                  </SheetClose>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                  <nav aria-label="Mobile" className="flex flex-col">
                    {NAV.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`border-b border-slate-900/5 py-3.5 text-[15px] transition-colors ${
                          isActive(item.href)
                            ? "font-semibold text-slate-900"
                            : "text-slate-700 hover:text-emerald-700"
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                    {SHEET_EXTRAS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="border-b border-slate-900/5 py-3.5 text-[15px] text-slate-500 transition-colors hover:text-emerald-700"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>

                  {user ? (
                    <div className="mt-6 flex flex-col gap-3">
                      <Link
                        href="/profile"
                        onClick={() => setIsOpen(false)}
                        className="text-[14px] font-semibold text-emerald-700"
                      >
                        {user.name}
                      </Link>
                      <Link
                        href="/profile/entries"
                        onClick={() => setIsOpen(false)}
                        className="text-[14px] text-slate-700"
                      >
                        My tickets
                      </Link>
                      <Link
                        href="/profile/settings"
                        onClick={() => setIsOpen(false)}
                        className="text-[14px] text-slate-700"
                      >
                        Settings
                      </Link>
                      <button onClick={handleLogout} className="text-left text-[14px] text-rose-600">
                        Log out
                      </button>
                    </div>
                  ) : (
                    <div className="mt-6 flex flex-col gap-3">
                      <Link
                        href="/auth/login"
                        onClick={() => setIsOpen(false)}
                        className="text-[14px] text-slate-700"
                      >
                        Log in
                      </Link>
                      <Link
                        href="/auth/register"
                        onClick={() => setIsOpen(false)}
                        className="text-[14px] font-semibold text-emerald-700"
                      >
                        Create an account
                      </Link>
                    </div>
                  )}

                  <p className="mt-8 border-t border-slate-900/5 pt-5 text-[11.5px] leading-relaxed text-slate-500">
                    Need help with a ticket?{" "}
                    <a
                      href={waInquiryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-emerald-700 hover:underline"
                    >
                      Message us on WhatsApp
                    </a>
                    .
                  </p>
                </div>

                <div className="border-t border-slate-900/5 px-6 py-4 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">
                  100% target ticket rule
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Inner pages keep their own spacing; hero pages let the bar float. */}
      {!overlays && <div aria-hidden className="h-16 lg:h-[72px]" />}
    </>
  )
}
