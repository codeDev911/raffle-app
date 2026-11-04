import type { Metadata } from "next"
import Link from "next/link"
import { BookOpen, MessagesSquare, Search, Sparkles } from "lucide-react"
import { CONTAINER, Cta, PANEL, SectionHead } from "@/components/marketing/kit"
import { LIVE_CHAT_URL } from "@/lib/support-links"
import { ArticleCard, KbHero, KbShell, SupportRail, UnavailableNotice, KB_PATH, KB_SEARCH_PATH } from "../_shared"
import { describeSanityError, listArticles, sanitySetupHint, searchArticles, type KbArticle } from "@/lib/sanity"

/**
 * This route reads `searchParams`, so Next renders it per request rather than serving static HTML.
 * That is deliberate and still costs Sanity nothing: the article list comes from the same 30-minute
 * memo the index page warms, so searching never opens a connection.
 */
export const metadata: Metadata = {
  title: "Search the PakRaffle Knowledge Base",
  description:
    "Search every PakRaffle knowledge-base article: payments, receipts, live draws, prize delivery, refunds and Merchant Connect guides.",
  // Generated queries stay out of the index so crawl budget goes to the articles themselves.
  robots: "noindex, follow",
  alternates: { canonical: "https://pakraffle.com/knowledge-base" },
}

const freshest = (articles: KbArticle[]) =>
  [...articles].sort((a, b) => (b.updated || b.date).localeCompare(a.updated || a.date)).slice(0, 12)

/** Wraps matched words in <mark>. Children stay text nodes, so the query can never inject markup. */
function highlight(text: string, term: string) {
  const tokens = term.toLowerCase().split(/\s+/).filter((token) => token.length > 1)
  if (!tokens.length) return text
  const pattern = new RegExp(`(${tokens.map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi")
  return text.split(pattern).map((part, index) =>
    index % 2 === 1 ? (
      <mark key={index} className="rounded bg-emerald-100 px-0.5 text-emerald-900">
        {part}
      </mark>
    ) : (
      <span key={index}>{part}</span>
    ),
  )
}

export default async function KnowledgeBaseSearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = (searchParams.q || "").trim()

  let state: { kind: "ok"; articles: KbArticle[] } | { kind: "error"; message: string }
  try {
    state = { kind: "ok", articles: query ? await searchArticles(query) : freshest(await listArticles()) }
  } catch (err) {
    state = { kind: "error", message: describeSanityError(err).message }
  }

  return (
    <KbShell>
      <KbHero
        kicker={query ? "Search results" : "Recently updated"}
        title={query ? `“${query}”` : "Freshest answers"}
        body={
          query
            ? "Titles, topics and summaries are all matched. If nothing fits, the help desk replies in about 15 minutes."
            : "Nothing searched yet — here is the most recently touched material."
        }
        query={query}
      />

      <main className={CONTAINER}>
        {state.kind === "error" ? (
          <div className="py-14">
            <UnavailableNotice reason={state.message} hint={sanitySetupHint()} />
          </div>
        ) : state.articles.length === 0 ? (
          <section className="py-14">
            <div className={`${PANEL} p-8 text-center sm:p-12`}>
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/5 text-slate-500">
                <Search className="h-6 w-6" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight text-slate-900">
                No article matches “{query}”
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-slate-600">
                Try one word — &quot;receipt&quot;, &quot;Raast&quot;, &quot;winner&quot; — or ask a person. If this is a question we
                have not written up, the team will add it to the library.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-2.5">
                <Cta href={KB_PATH} variant="ghost" arrow>
                  <BookOpen className="h-4 w-4" /> Browse all articles
                </Cta>
                <Cta href={LIVE_CHAT_URL} variant="primary">
                  <MessagesSquare className="h-4 w-4" /> Ask support
                </Cta>
              </div>
            </div>
          </section>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4 py-10 sm:py-12">
              <SectionHead
                kicker={query ? `${state.articles.length} ${state.articles.length === 1 ? "match" : "matches"}` : `${state.articles.length} articles`}
                title={query ? "Matching articles" : "Recently touched"}
                body={query ? "Ranked by title, then topic tags, then summary." : undefined}
              />
              <Link href={KB_PATH} className="text-[12.5px] font-semibold text-emerald-700 transition hover:text-emerald-600">
                ← All articles
              </Link>
            </div>

            <ul className="grid gap-3 pb-4 sm:grid-cols-2 lg:grid-cols-3">
              {state.articles.map((article) =>
                query ? (
                  <li
                    key={article.id}
                    className={`${PANEL} group flex h-full flex-col gap-2.5 px-5 py-5 transition hover:-translate-y-0.5 hover:border-emerald-600/25`}
                  >
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-slate-900/10 bg-white/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      <Sparkles className="h-3 w-3 text-emerald-600" />
                      {article.category || (article.readingTime ? `${article.readingTime} min read` : "Article")}
                    </span>
                    <Link
                      href={`${KB_PATH}/${encodeURIComponent(article.slug)}`}
                      className="font-display text-[15px] font-semibold leading-snug tracking-tight text-slate-900 group-hover:text-emerald-800"
                    >
                      {highlight(article.title, query)}
                    </Link>
                    {article.excerpt && <span className="line-clamp-2 text-[13px] leading-relaxed text-slate-600">{highlight(article.excerpt, query)}</span>}
                    <span className="mt-auto pt-1 text-[11px] font-semibold text-emerald-700">Open article →</span>
                  </li>
                ) : (
                  <li key={article.id}>
                    <ArticleCard article={article} />
                  </li>
                ),
              )}
            </ul>

            <p className="pb-10 text-[12px] text-slate-500">
              Not seeing it?{" "}
              <Link href={`${KB_SEARCH_PATH}?q=`} className="font-semibold text-emerald-700 underline underline-offset-2">
                Clear the search
              </Link>{" "}
              and browse the whole library.
            </p>
          </>
        )}
      </main>

      <SupportRail />
    </KbShell>
  )
}
