import Link from "next/link"
import type { MouseEvent, ReactNode } from "react"
import { ArrowRight, Check, ChevronDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Shared visual language for the public marketing pages (home, merchants, sell, partner).
 *
 * The direction is "kinetic light": a porcelain canvas, a drifting gradient mesh behind the
 * hero, glass panels with hairline borders, ticket perforations, a display face for headlines
 * and tabular monospace for every number. Everything here is server-safe — the motion pieces
 * live in ./motion so a server page can reveal on scroll without shipping its whole tree.
 */

export const SHELL =
  "relative isolate min-h-screen overflow-x-clip bg-[#f8f9f6] text-slate-900 antialiased selection:bg-emerald-500 selection:text-white"

export const CONTAINER = "mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8"

export const PANEL =
  "rounded-3xl border border-slate-900/5 bg-white/75 shadow-[0_24px_70px_-52px_rgba(4,47,34,0.6)] backdrop-blur-xl"

export const INK_PANEL =
  "rounded-3xl border border-emerald-400/15 bg-[#07130f] text-white shadow-[0_40px_120px_-60px_rgba(4,120,87,0.9)]"

const TONES = {
  emerald: ["bg-emerald-300/45", "bg-teal-200/45", "bg-amber-200/35"],
  sky: ["bg-sky-300/45", "bg-cyan-200/40", "bg-emerald-200/35"],
  amber: ["bg-amber-300/40", "bg-orange-200/35", "bg-emerald-200/30"],
  violet: ["bg-violet-300/40", "bg-indigo-200/35", "bg-emerald-200/30"],
} as const

export type Tone = keyof typeof TONES

/** Drifting gradient mesh + hairline grid. Sits inside a `relative overflow-hidden` parent. */
export function Mesh({ tone = "emerald", className }: { tone?: Tone; className?: string }) {
  const [a, b, c] = TONES[tone]
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <div className={cn("absolute -left-24 -top-32 h-[26rem] w-[26rem] rounded-full blur-3xl animate-drift", a)} />
      <div
        className={cn(
          "absolute -right-20 top-10 h-[22rem] w-[22rem] rounded-full blur-3xl animate-drift [animation-delay:-6s]",
          b,
        )}
      />
      <div
        className={cn(
          "absolute bottom-[-14rem] left-1/3 h-[24rem] w-[32rem] rounded-full blur-3xl animate-drift [animation-delay:-11s]",
          c,
        )}
      />
      <div className="absolute inset-0 grid-veil opacity-70" />
    </div>
  )
}

/** Small uppercase label with a short rule — used above every section headline. */
export function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700", className)}>
      <span aria-hidden className="h-px w-6 bg-emerald-600/50" />
      {children}
    </p>
  )
}

export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-slate-900/10 bg-white/70 px-3 py-1 text-[11px] font-semibold tracking-wide text-slate-700 backdrop-blur",
        className,
      )}
    >
      {children}
    </span>
  )
}

export function LiveDot({ className }: { className?: string }) {
  return (
    <span className={cn("relative flex h-2 w-2 shrink-0", className)}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
    </span>
  )
}

type CtaProps = {
  href: string
  children: ReactNode
  variant?: "primary" | "ink" | "ghost" | "light"
  className?: string
  arrow?: boolean
  /** Passed straight through — used to open a portal's own record in a second tab. */
  target?: string
  /**
   * Optional side effect, used by the live-chat launcher: the href stays a real link so the
   * button still works when the third-party script never loaded. The handler decides whether
   * to cancel navigation by calling preventDefault() itself.
   */
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
}

export function Cta({ href, children, variant = "primary", className, arrow = false, target, onClick }: CtaProps) {
  const base =
    "group inline-flex min-h-[46px] items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold transition duration-200"
  const styles = {
    primary:
      "bg-emerald-600 text-white shadow-[0_14px_34px_-16px_rgba(5,150,105,0.9)] hover:-translate-y-0.5 hover:bg-emerald-500",
    ink: "bg-slate-900 text-white shadow-[0_14px_34px_-18px_rgba(2,6,23,0.9)] hover:-translate-y-0.5 hover:bg-slate-800",
    ghost: "border border-slate-900/10 bg-white/70 text-slate-800 backdrop-blur hover:-translate-y-0.5 hover:bg-white",
    light: "border border-white/20 bg-white/10 text-white backdrop-blur hover:-translate-y-0.5 hover:bg-white/20",
  }[variant]
  const external = href.startsWith("http")

  const body = (
    <>
      {children}
      {arrow && <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />}
    </>
  )

  // Off-site links (WhatsApp, payment pages) have always opened in a new tab; keep that default
  // and let callers opt out or set the target on an internal link.
  const linkTarget = target ?? (external ? "_blank" : undefined)

  if (external) {
    return (
      <a
        href={href}
        target={linkTarget}
        rel={linkTarget === "_blank" ? "noopener noreferrer" : undefined}
        onClick={onClick}
        className={cn(base, styles, className)}
      >
        {body}
      </a>
    )
  }

  return (
    <Link href={href} target={target} onClick={onClick} className={cn(base, styles, className)}>
      {body}
    </Link>
  )
}

type SectionHeadProps = {
  kicker?: ReactNode
  title: ReactNode
  body?: ReactNode
  action?: ReactNode
  index?: string
  align?: "left" | "center"
  className?: string
}

export function SectionHead({ kicker, title, body, action, index, align = "left", className }: SectionHeadProps) {
  const centered = align === "center"
  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        centered ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl", centered && "mx-auto")}>
        {(kicker || index) && (
          <div className={cn("flex items-center gap-3", centered && "justify-center")}>
            {index && <span className="font-mono text-[11px] tabular-nums text-slate-400">{index}</span>}
            {kicker && <Kicker>{kicker}</Kicker>}
          </div>
        )}
        <h2 className="mt-3 font-display text-[1.75rem] font-semibold leading-[1.06] tracking-tight text-slate-900 sm:text-4xl lg:text-[2.6rem]">
          {title}
        </h2>
        {body && <p className="mt-3 text-[15px] leading-relaxed text-slate-600 sm:text-base">{body}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

/** Card with a perforated left/right edge, like a torn ticket. Mask keeps the border honest. */
export function TicketCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("ticket-edge relative overflow-hidden rounded-[26px] border border-slate-900/10 bg-white", className)}>{children}</div>
}

/* ------------------------------------------------------------------ icon weight
 *
 * The heroes needed more visual weight than a bare 16px glyph beside a sentence,
 * and each service page needed icons that belong to *that* service — a cart and a
 * webhook on Merchant Connect, a camera and a wallet on Listing, a share link on
 * Partners. `IconTile` puts the glyph in a tinted, ringed tile; `FlowRail` strings
 * them into a numbered pipeline with a dashed connector. Both take a tone so a page
 * can carry its own accent instead of borrowing the previous page's.
 */

const TILE_TONES = {
  emerald: "border-emerald-600/15 from-emerald-50 to-white text-emerald-700",
  sky: "border-sky-600/15 from-sky-50 to-white text-sky-700",
  amber: "border-amber-600/15 from-amber-50 to-white text-amber-700",
  violet: "border-violet-600/15 from-violet-50 to-white text-violet-700",
  slate: "border-slate-900/10 from-slate-100 to-white text-slate-600",
  ink: "border-slate-900/20 from-slate-700 to-slate-900 text-white",
} as const

export type TileTone = keyof typeof TILE_TONES

const TILE_SIZES = { sm: "h-9 w-9 rounded-[10px]", md: "h-11 w-11 rounded-xl", lg: "h-14 w-14 rounded-2xl" } as const
const TILE_GLYPH = { sm: "h-4 w-4", md: "h-[18px] w-[18px]", lg: "h-6 w-6" } as const

export function IconTile({
  icon: Icon,
  tone = "emerald",
  size = "md",
  className = "",
}: {
  icon: LucideIcon
  tone?: TileTone
  size?: keyof typeof TILE_SIZES
  className?: string
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center border bg-gradient-to-br shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] ${TILE_TONES[tone]} ${TILE_SIZES[size]} ${className}`}
    >
      <Icon className={TILE_GLYPH[size]} strokeWidth={1.7} />
    </span>
  )
}

// Static class strings only — Tailwind has to see every column count in the source.
const RAIL_COLS = {
  "3": { wrap: "sm:grid-cols-2 lg:grid-cols-3", singleRow: false },
  "4": { wrap: "sm:grid-cols-2 lg:grid-cols-4", singleRow: true },
  "5": { wrap: "sm:grid-cols-2 lg:grid-cols-5", singleRow: true },
  "6": { wrap: "sm:grid-cols-2 lg:grid-cols-3", singleRow: false },
} as const

export function FlowRail({
  steps,
  tone = "emerald",
  cols = "4",
  className = "",
}: {
  steps: { icon: LucideIcon; label: string; caption?: string }[]
  tone?: TileTone
  cols?: keyof typeof RAIL_COLS
  className?: string
}) {
  const rail = RAIL_COLS[cols]

  return (
    <ol className={`relative grid gap-3 ${rail.wrap} ${className}`}>
      {rail.singleRow && steps.length > 1 && (
        // 14px card padding + half of the 44px tile puts the glyph centre at 36px.
        <span
          aria-hidden
          className="absolute left-[36px] right-[36px] top-[36px] hidden border-t border-dashed border-slate-900/15 lg:block"
        />
      )}
      {steps.map((step, index) => (
        <li
          key={step.label}
          className="relative flex items-start gap-3 rounded-2xl border border-slate-900/[0.07] bg-white/80 p-3.5 backdrop-blur"
        >
          <IconTile icon={step.icon} tone={tone} size="md" className="relative z-10" />
          <div className="min-w-0">
            <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] tabular-nums text-slate-400">
              {String(index + 1).padStart(2, "0")}
            </p>
            <p className="mt-0.5 text-[12.5px] font-semibold leading-snug text-slate-900">{step.label}</p>
            {step.caption && <p className="mt-0.5 text-[11.5px] leading-snug text-slate-500">{step.caption}</p>}
          </div>
        </li>
      ))}
    </ol>
  )
}

export function StatTile({
  label,
  value,
  hint,
  accent = false,
  className,
  valueClassName,
}: {
  label: ReactNode
  value: ReactNode
  hint?: ReactNode
  accent?: boolean
  className?: string
  /** Long figures (currency) can shrink on narrow screens instead of pushing past the tile. */
  valueClassName?: string
}) {
  return (
    <div className={cn(PANEL, "px-4 py-3.5 sm:px-5 sm:py-4", className)}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p
        className={cn(
          "mt-1.5 font-mono text-xl font-semibold tabular-nums tracking-tight sm:text-[1.6rem]",
          accent ? "text-emerald-700" : "text-slate-900",
          valueClassName,
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{hint}</p>}
    </div>
  )
}

export function CheckList({
  items,
  className,
  tone = "emerald",
}: {
  items: ReactNode[]
  className?: string
  tone?: "emerald" | "light"
}) {
  return (
    <ul className={cn("space-y-2.5", className)}>
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
          <span
            className={cn(
              "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
              tone === "emerald" ? "bg-emerald-600/10 text-emerald-700" : "bg-white/10 text-emerald-300",
            )}
          >
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
          <span className={tone === "emerald" ? "text-slate-600" : "text-emerald-50/90"}>{item}</span>
        </li>
      ))}
    </ul>
  )
}

/** Infinite ticker. The track holds two identical copies, so -50% is exactly one loop. */
export function Marquee({
  items,
  className,
  speed = "46s",
  tone = "light",
}: {
  items: ReactNode[]
  className?: string
  speed?: string
  tone?: "light" | "ink"
}) {
  const group = (
    <div className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <span key={i} className="flex items-center">
          <span
            className={cn(
              "whitespace-nowrap px-6 text-[13px] font-medium tracking-wide",
              tone === "ink" ? "text-emerald-50/80" : "text-slate-600",
            )}
          >
            {item}
          </span>
          <span aria-hidden className={cn("h-1 w-1 rounded-full", tone === "ink" ? "bg-emerald-400/60" : "bg-slate-300")} />
        </span>
      ))}
    </div>
  )

  return (
    <div className={cn("marquee-mask flex overflow-hidden", className)}>
      <div className="flex w-max animate-marquee" style={{ animationDuration: speed }}>
        {group}
        <div aria-hidden className="flex shrink-0 items-center">
          {group}
        </div>
      </div>
    </div>
  )
}

/** Native <details> so this works from both server and client pages, with no JS state. */
export function FaqList({
  items,
  className,
}: {
  items: { q: string; a: string }[]
  className?: string
}) {
  return (
    <div className={cn("overflow-hidden rounded-3xl border border-slate-900/10 bg-white/80 backdrop-blur", className)}>
      {items.map((item) => (
        <details key={item.q} data-faq className="group border-b border-slate-900/5 last:border-b-0">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-5 py-4 text-left text-sm font-semibold text-slate-900 transition hover:bg-emerald-50/50 sm:px-6 sm:py-5 [&::-webkit-details-marker]:hidden">
            {item.q}
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-open:text-emerald-600" />
          </summary>
          <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600 sm:px-6">{item.a}</p>
        </details>
      ))}
    </div>
  )
}

/** Outlined section numeral used by the process rails. */
export function GhostNumeral({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("font-display text-5xl font-bold leading-none text-outline sm:text-6xl", className)}
    >
      {children}
    </span>
  )
}

export function Rule({ className }: { className?: string }) {
  return <div aria-hidden className={cn("h-px w-full bg-gradient-to-r from-slate-900/10 via-slate-900/5 to-transparent", className)} />
}

/**
 * SEO structured data (schema.org JSON-LD). `JSON.stringify` escapes `<`, `>` and `&`,
 * so a script break-out via content is not possible. Server components only.
 */
export function JsonLd({ data, id }: { data: Record<string, unknown> | Record<string, unknown>[]; id?: string }) {
  return (
    <script
      type="application/ld+json"
      id={id}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
