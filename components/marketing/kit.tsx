import Link from "next/link"
import type { ReactNode } from "react"
import { ArrowRight, Check, ChevronDown } from "lucide-react"
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
}

export function Cta({ href, children, variant = "primary", className, arrow = false }: CtaProps) {
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

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cn(base, styles, className)}>
        {body}
      </a>
    )
  }

  return (
    <Link href={href} className={cn(base, styles, className)}>
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

export function StatTile({
  label,
  value,
  hint,
  accent = false,
  className,
}: {
  label: ReactNode
  value: ReactNode
  hint?: ReactNode
  accent?: boolean
  className?: string
}) {
  return (
    <div className={cn(PANEL, "px-4 py-3.5 sm:px-5 sm:py-4", className)}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p
        className={cn(
          "mt-1.5 font-mono text-xl font-semibold tabular-nums tracking-tight sm:text-[1.6rem]",
          accent ? "text-emerald-700" : "text-slate-900",
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
