import Link from "next/link"
import { BrandMark } from "@/components/brand"
import { Facebook } from "lucide-react"
import { KNOWLEDGE_BASE_URL, LIVE_CHAT_URL, SUPPORT_EMAIL } from "@/lib/support-links"

type FooterLink = { label: string; href: string; external?: boolean; note?: string; emphasis?: boolean }

/**
 * Link groups by what the visitor is trying to do, rather than by which page was written first:
 * a shopper looking for a draw, a store owner, someone who needs help, someone reading the rules and
 * someone deciding whether the company is real. The in-app knowledge base is the primary help route
 * because it is searchable, indexable and ours; Tawk's hosted centre is kept as the offline fallback.
 */
const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Draws & prizes",
    links: [
      { label: "All active raffles", href: "/raffles" },
      { label: "Recent winners gallery", href: "/winners" },
      { label: "Smartphones & gadgets", href: "/raffles?category=Electronics" },
      { label: "Motorcycles & cars", href: "/raffles?category=Vehicles" },
      { label: "Cash & gold drops", href: "/raffles?category=Cash" },
      { label: "How a draw works", href: "/knowledge-base/how-a-pakraffle-draw-works" },
    ],
  },
  {
    title: "Merchants & sellers",
    links: [
      { label: "Merchant Connect (Shopify)", href: "/merchants" },
      { label: "Merchant dashboard", href: "/merchants/dashboard" },
      { label: "Free draws at stores you shop", href: "/lookup/store" },
      { label: "Store ticket lookup", href: "/lookup/store-ticket" },
      { label: "List your product", href: "/list-product" },
      { label: "Earn with us (affiliates)", href: "/become-a-partner" },
    ],
  },
  {
    title: "Help & support",
    links: [
      { label: "Knowledge base", href: "/knowledge-base", emphasis: true, note: "Every answer, searchable" },
      { label: "Help centre & FAQs", href: "/help" },
      { label: "Contact support", href: "/contact" },
      { label: "Make a complaint", href: "/make-complaint" },
      { label: "Live chat · ~15 min", href: LIVE_CHAT_URL, external: true },
      { label: "WhatsApp channel", href: "https://whatsapp.com/channel/0029VbB0CzJ8fewyBXpXy210", external: true },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms & conditions", href: "/terms" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Refund & cancellation", href: "/refund" },
      { label: "Merchant Connect terms", href: "/terms#merchant-connect" },
      { label: "Merchant privacy", href: "/privacy#merchant-connect" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About PakRaffle", href: "/about" },
      { label: "Official blog", href: "https://blog.pakraffle.com?utm=pakraffle&medium=footer", external: true },
      { label: "Hosted help centre", href: KNOWLEDGE_BASE_URL, external: true, note: "Readable when this site is down" },
      { label: SUPPORT_EMAIL, href: `mailto:${SUPPORT_EMAIL}`, note: "Audits & official queries" },
    ],
  },
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

/** Internal links go through next/link; anything off-site opens in a new tab, never followed. */
function FooterLinkItem({ link }: { link: FooterLink }) {
  const className = link.emphasis
    ? "text-[12.5px] font-semibold text-emerald-300 transition-colors hover:text-emerald-200"
    : "text-[12.5px] text-white/55 transition-colors hover:text-white"

  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
        {link.label}
      </a>
    )
  }
  return (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  )
}

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-7xl px-5 pb-6 pt-10 sm:px-6 sm:pb-8 lg:px-8">
      {/* Same shell as the closing band on the marketing pages: dark, rounded, lit from two corners. */}
      <div className="relative overflow-hidden rounded-[32px] bg-[#0a1020] px-6 py-10 text-white sm:px-10 sm:py-12">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-violet-500/25 blur-3xl" />
          <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-emerald-500/25 blur-3xl" />
          <div className="absolute inset-0 grid-veil opacity-40" />
        </div>

        <div className="relative">
          <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 xl:grid-cols-[1.5fr_repeat(5,minmax(0,1fr))] xl:gap-6">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-3 xl:col-span-1">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <BrandMark />
                <span className="text-lg font-semibold tracking-tight text-white">PakRaffle</span>
              </Link>
              <p className="mt-4 max-w-xs text-[12.5px] leading-relaxed text-white/55">
                Pakistan&apos;s verified digital lucky draw platform. Provably fair draws, native Pakistani payment
                clearing, and free doorstep delivery.
              </p>

              <p className="mt-4 text-[11.5px] leading-relaxed text-white/40">
                Prize handover desks in Lahore &amp; Islamabad · support@pakraffle.com
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

            {/* One column per intent, so the right link is where the eye already is. */}
            {COLUMNS.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300/80">{column.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.href + link.label}>
                      <FooterLinkItem link={link} />
                      {link.note && <span className="mt-0.5 block text-[10.5px] leading-snug text-white/35">{link.note}</span>}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
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
