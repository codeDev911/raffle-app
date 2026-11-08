import Link from "next/link"
import { ArrowRight, BookOpen, Clock, LifeBuoy, MessagesSquare, Search } from "lucide-react"
import { CONTAINER, Cta, Mesh, PANEL, SectionHead, SHELL } from "@/components/marketing/kit"
import { KNOWLEDGE_BASE_URL, LIVE_CHAT_URL, SUPPORT_EMAIL } from "@/lib/support-links"
import { sanityImageUrl, type KbArticle } from "@/lib/sanity"

/**
 * Building blocks for the two knowledge-base routes plus its search page. Everything here is a
 * Server Component: the search box is a native GET form and the section rail uses plain anchors, so
 * the help centre works with JavaScript switched off — the same rule /help follows.
 */

export const KB_PATH = "/knowledge-base"
export const KB_SEARCH_PATH = "/knowledge-base/search"

export function KbShell({ children }: { children: React.ReactNode }) {
  return <div className={SHELL}>{children}</div>
}

export function KbHero({
  title,
  body,
  kicker = "Knowledge base",
  query = "",
  meta,
}: {
  title: string
  body: string
  kicker?: string
  query?: string
  meta?: React.ReactNode
}) {
  return (
    <section className="relative overflow-hidden border-b border-slate-900/5">
      <Mesh tone="sky" />
      <div className={`${CONTAINER} relative pb-10 pt-24 sm:pb-12 sm:pt-28`}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="flex items-center justify-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
            <span aria-hidden className="h-px w-6 bg-emerald-600/50" />
            {kicker}
            <span aria-hidden className="h-px w-6 bg-emerald-600/50" />
          </p>
          <h1 className="mt-4 font-display text-[2rem] font-semibold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:text-base">{body}</p>

          <form action={KB_SEARCH_PATH} method="GET" className="mx-auto mt-7 flex max-w-xl items-stretch gap-2">
            <label className="relative flex-1">
              <span className="sr-only">Search articles</span>
              <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Search: receipt, Raast, winner…"
                className="h-[52px] w-full rounded-2xl border border-slate-900/10 bg-white/85 pl-11 pr-4 text-sm text-slate-900 outline-none backdrop-blur transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </label>
            <button
              type="submit"
              className="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-[0_14px_34px_-16px_rgba(5,150,105,0.9)] transition hover:bg-emerald-500"
            >
              Search
            </button>
          </form>

          {meta && <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">{meta}</div>}
        </div>
      </div>
    </section>
  )
}

export function ArticleCard({ article }: { article: KbArticle }) {
  const cover = article.cover?.url ? sanityImageUrl(article.cover.url, { width: 240 }) : ""
  const dimensions = article.cover?.url ? dimensionsForCard(article.cover.url) : null

  return (
    <Link
      href={`${KB_PATH}/${encodeURIComponent(article.slug)}`}
      className={`${PANEL} group flex h-full gap-4 px-5 py-5 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-600/25 hover:shadow-[0_28px_70px_-48px_rgba(4,47,34,0.75)]`}
    >
      {cover && (
        // A plain <img>: cdn.sanity.io is not in next/image's remote allow-list, and the CDN URL is
        // already resized by sanityImageUrl.
        <img
          src={cover}
          alt=""
          aria-hidden
          width={dimensions?.width}
          height={dimensions?.height}
          loading="lazy"
          className="hidden h-[64px] w-[64px] shrink-0 rounded-xl border border-slate-900/10 object-cover sm:block"
        />
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          {article.category && <span className="text-emerald-700">{article.category}</span>}
          {article.date && <span>{formatDate(article.date)}</span>}
          {article.readingTime && <span>{article.readingTime} min read</span>}
        </span>
        <span className="font-display text-[15px] font-semibold leading-snug tracking-tight text-slate-900 group-hover:text-emerald-800">
          {article.title}
        </span>
        {article.excerpt && <span className="line-clamp-2 text-[13px] leading-relaxed text-slate-600">{article.excerpt}</span>}
        <span className="mt-auto flex items-center gap-1.5 pt-1 text-[11px] font-semibold text-emerald-700">
          Read article
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </span>
    </Link>
  )
}

/**
 * Native anchor jumps, so the section rail needs no script. The list page gives each section the
 * matching `id`, which is why the transform lives here rather than being written twice.
 */
export function sectionAnchor(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "section"
}

export function CategoryRail({ groups }: { groups: { name: string; articles: KbArticle[] }[] }) {
  if (groups.length < 2) return null
  return (
    <nav aria-label="Knowledge base sections" className="flex flex-wrap gap-2">
      {groups.map((group) => (
        <a
          key={group.name}
          href={`#${sectionAnchor(group.name)}`}
          className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-3.5 py-1.5 text-[12px] font-semibold text-slate-700 backdrop-blur transition hover:-translate-y-0.5 hover:border-emerald-600/30 hover:text-emerald-800"
        >
          {group.name}
          <span className="font-mono text-[10px] tabular-nums text-slate-400">{group.articles.length}</span>
        </a>
      ))}
    </nav>
  )
}

/**
 * Rendered when Sanity cannot be reached. Visitors get a way forward, never a stack trace or an
 * environment variable name — setup detail only appears outside production.
 */
export function UnavailableNotice({ reason, hint }: { reason: string; hint?: string }) {
  return (
    <div className={`${PANEL} p-6 sm:p-8`}>
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700">
          <Clock className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold tracking-tight text-slate-900">The article library is reloading</h2>
          <p className="mt-1.5 text-[14px] leading-relaxed text-slate-600">
            PakRaffle&apos;s article library is momentarily unreachable. The{" "}
            <Link href="/help" className="font-semibold text-emerald-700 underline underline-offset-2">
              Help Centre
            </Link>{" "}
            covers the same ground — payments, draws, prizes and refunds — and support replies in about 15 minutes.
          </p>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-400">Reason: {reason}</p>
          {hint && process.env.NODE_ENV !== "production" && (
            <p className="mt-2 rounded-xl bg-slate-900/5 px-3 py-2 font-mono text-[11px] leading-relaxed text-slate-600">{hint}</p>
          )}
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Cta href="/help" variant="primary" arrow>
              Open the Help Centre
            </Cta>
            <Cta href={LIVE_CHAT_URL} variant="ghost">
              <MessagesSquare className="h-4 w-4" /> Live chat
            </Cta>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SupportRail() {
  return (
    <section className="border-t border-slate-900/5 bg-white/50">
      <div className={`${CONTAINER} py-14 sm:py-16`}>
        <SectionHead
          kicker="Still hunting?"
          title="A human answers in about 15 minutes"
          body="The knowledge base is the fast route. When it is not enough, the help desk is one message away — no ticket number to remember."
        />
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Cta href={LIVE_CHAT_URL} variant="primary" className="justify-center">
            <MessagesSquare className="h-4 w-4" /> Chat with support
          </Cta>
          <Cta href="/contact" variant="ghost" className="justify-center">
            <LifeBuoy className="h-4 w-4" /> Contact the help desk
          </Cta>
          <Cta href={`mailto:${SUPPORT_EMAIL}`} variant="ghost" className="justify-center">
            <BookOpen className="h-4 w-4" /> {SUPPORT_EMAIL}
          </Cta>
        </div>
        <p className="mt-6 text-[12px] leading-relaxed text-slate-500">
          Prefer the hosted help centre?{" "}
          <a href={KNOWLEDGE_BASE_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-700 underline underline-offset-2">
            PakRaffle Help Center
          </a>{" "}
          stays online even when this site is not.
        </p>
      </div>
    </section>
  )
}

/** `04 Nov 2025`; Sanity dates arrive as `YYYY-MM-DD` and stamps as ISO. */
export function formatDate(value: string): string {
  if (!value) return ""
  const date = new Date(value.length === 10 ? `${value}T00:00:00Z` : value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

export function relativeAge(value: string): string {
  if (!value) return ""
  const date = new Date(value.length === 10 ? `${value}T00:00:00Z` : value)
  if (Number.isNaN(date.getTime())) return ""
  const days = Math.max(0, Math.round((Date.now() - date.getTime()) / 86_400_000))
  if (days <= 0) return "today"
  if (days === 1) return "yesterday"
  if (days < 30) return `${days} days ago`
  const months = Math.round(days / 30)
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`
  const years = Math.round(months / 12)
  return `${years} year${years === 1 ? "" : "s"} ago`
}

const dimensionsForCard = (url: string) => {
  const match = /-(\d{2,5})x(\d{2,5})\.[a-z0-9]+(?:$|\?)/i.exec(url || "")
  return match ? { width: 64, height: Math.round((Number(match[2]) / Number(match[1])) * 64) } : null
}
