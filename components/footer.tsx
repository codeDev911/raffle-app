import Link from "next/link"
import { BrandMark } from "@/components/brand"
import { Facebook } from "lucide-react"

const EXPLORE = [
  { label: "All Active Raffles", href: "/raffles" },
  { label: "Recent Winners Gallery", href: "/winners" },
  { label: "Smartphones & Gadgets", href: "/raffles?category=Electronics" },
  { label: "Motorcycles & Cars", href: "/raffles?category=Vehicles" },
  { label: "Cash & Gold Drops", href: "/raffles?category=Cash" },
  { label: "List Your Product", href: "/list-product" },
  { label: "Merchant Connect (Shopify)", href: "/merchants" },
  { label: "Store Ticket Lookup", href: "/lookup/store-ticket" },
  { label: "Free Draws at Stores You Shop", href: "/lookup/store" },
  { label: "Earn with Us (Affiliates)", href: "/become-a-partner" },
]

const LEGAL = [
  { label: "About PakRaffle", href: "/about" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Refund & Cancellation Policy", href: "/refund" },
  { label: "Contact Support", href: "/contact" },
]

const SOCIALS = [
  {
    href: "https://www.facebook.com/profile.php?id=61578036305307",
    label: "Facebook",
    icon: <Facebook className="h-4 w-4" />,
  },
  {
    href: "https://www.tiktok.com/@pak.raffle",
    label: "TikTok",
    icon: (
      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.35 22a6.33 6.33 0 0 0 6.34-6.32V9.32a8.27 8.27 0 0 0 4.84 1.57V7.45a4.86 4.86 0 0 1-.94-.76z" />
      </svg>
    ),
  },
  {
    href: "https://x.com/PakRaffle",
    label: "X (Twitter)",
    icon: (
      <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    href: "https://whatsapp.com/channel/0029VbB0CzJ8fewyBXpXy210",
    label: "WhatsApp Channel",
    icon: (
      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden>
        <path d="M17.507 14.307l-.009.075c-.238-.12-1.406-.694-1.624-.774-.219-.079-.378-.12-.538.12-.158.239-.617.774-.757.933-.138.16-.279.179-.517.06-.239-.12-1.008-.372-1.92-1.185-.709-.633-1.188-1.415-1.328-1.654-.139-.239-.015-.368.105-.487.108-.107.239-.279.359-.418.119-.14.159-.239.239-.399.08-.159.04-.299-.02-.418-.06-.12-.538-1.296-.737-1.774-.194-.467-.393-.404-.539-.412l-.46-.008c-.159 0-.418.06-.637.299-.22.239-.837.817-.837 1.993 0 1.176.857 2.311.976 2.471.12.16 1.687 2.576 4.088 3.613.571.247 1.018.395 1.366.506.574.183 1.096.157 1.509.095.46-.069 1.406-.575 1.605-1.131.199-.557.199-1.035.139-1.135-.059-.1-.219-.16-.458-.279zM12.023 2C6.49 2 2 6.48 2 12c0 1.979.578 3.824 1.579 5.378L2.094 22l4.802-1.436C8.36 21.435 10.134 22 12.023 22c5.534 0 10.024-4.48 10.024-10S17.557 2 12.023 2zm0 18.25c-1.644 0-3.18-.49-4.475-1.332l-.321-.21-2.852.853.865-2.784-.23-.332A8.196 8.196 0 013.78 12c0-4.545 3.697-8.243 8.243-8.243 4.545 0 8.243 3.698 8.243 8.243 0 4.545-3.698 8.25-8.243 8.25z" />
      </svg>
    ),
  },
]

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-5 pb-6 pt-10 sm:px-6 sm:pb-8 lg:px-8">
      {/* Same shell as the closing band on the marketing pages: dark, rounded, lit from two corners. */}
      <div className="relative overflow-hidden rounded-[32px] bg-[#0a1020] px-6 py-10 text-white sm:px-10 sm:py-12">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-violet-500/25 blur-3xl" />
          <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-emerald-500/25 blur-3xl" />
          <div className="absolute inset-0 grid-veil opacity-40" />
        </div>

        <div className="relative">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr_0.95fr] lg:gap-8">
            {/* Brand */}
            <div>
              <Link href="/" className="inline-flex items-center gap-2.5">
                <BrandMark />
                <span className="text-lg font-semibold tracking-tight text-white">PakRaffle</span>
              </Link>
              <p className="mt-4 max-w-xs text-[12.5px] leading-relaxed text-white/55">
                Pakistan&apos;s verified digital lucky draw platform. Provably fair draws, native Pakistani payment
                clearing, and free doorstep delivery.
              </p>

              <div className="mt-5 flex items-center gap-2">
                {SOCIALS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    title={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white/60 transition-colors hover:border-emerald-400/40 hover:text-emerald-300"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Explore */}
            <nav aria-label="Explore draws">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
                Explore draws
              </h3>
              <ul className="mt-4 space-y-2.5">
                {EXPLORE.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-[12.5px] text-white/55 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Trust & legal */}
            <nav aria-label="Trust and legal">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
                Trust &amp; legal
              </h3>
              <ul className="mt-4 space-y-2.5">
                {LEGAL.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[12.5px] text-white/55 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <a
                    href="https://blog.pakraffle.com?utm=pakraffle&medium=footer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12.5px] text-white/55 transition-colors hover:text-white"
                  >
                    Official Blog
                  </a>
                </li>
              </ul>
            </nav>

            {/* Help desk */}
            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
                Official help desk
              </h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <a
                    href="https://whatsapp.com/channel/0029VbB0CzJ8fewyBXpXy210"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-[12.5px] font-semibold text-white transition-colors hover:text-emerald-300"
                  >
                    WhatsApp Channel
                  </a>
                  <span className="mt-0.5 block text-[11px] text-white/40">Live draw updates &amp; 24/7 support</span>
                </li>
                <li>
                  <a
                    href="mailto:support@pakraffle.com"
                    className="block text-[12.5px] text-white/75 transition-colors hover:text-white"
                  >
                    support@pakraffle.com
                  </a>
                  <span className="mt-0.5 block text-[11px] text-white/40">Audits &amp; official queries</span>
                </li>
                <li>
                  <span className="block text-[12.5px] text-white/75">Lahore &amp; Islamabad</span>
                  <span className="mt-0.5 block text-[11px] text-white/40">Physical prize handover desks</span>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="inline-flex items-center text-[12.5px] font-semibold text-emerald-300 underline-offset-4 transition-colors hover:text-emerald-200 hover:underline"
                  >
                    Submit an inquiry
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-5 text-[11px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} PakRaffle. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span>Made in Pakistan</span>
              <span aria-hidden className="text-white/20">
                ·
              </span>
              <span>100% target ticket policy</span>
              <span aria-hidden className="text-white/20">
                ·
              </span>
              <span>Zero hidden fees</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                RNG engine operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
