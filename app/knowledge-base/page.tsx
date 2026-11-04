import type { Metadata } from "next"
import Link from "next/link"
import { BookOpen, Compass, FileText, MessagesSquare, Sparkles } from "lucide-react"
import { CONTAINER, Cta, IconTile, JsonLd, PANEL, SectionHead, StatTile } from "@/components/marketing/kit"
import { LIVE_CHAT_URL } from "@/lib/support-links"
import {
  ArticleCard,
  CategoryRail,
  KbHero,
  KbShell,
  SupportRail,
  UnavailableNotice,
  relativeAge,
  sectionAnchor,
} from "./_shared"
import { describeSanityError, groupArticles, isSanityConfigured, listArticles, sanitySetupHint, type KbArticle } from "@/lib/sanity"

/**
 * Steady-state API cost: one Sanity request per hour per server instance, and only if someone
 * actually visits. Route HTML regenerates on this 1-hour clock, and the list itself is memoised for
 * 30 minutes inside lib/sanity.ts, which also keeps serving the last good copy if Sanity misbehaves.
 */
export const revalidate = 3600

export const metadata: Metadata = {
  title: "Knowledge Base — Every PakRaffle Answer in One Library",
  description:
    "PakRaffle knowledge base: how draws work, ticket payments and receipts via JazzCash, Easypaisa, Raast or bank transfer, live draw fairness, winner verification, prize delivery, refunds and Merchant Connect guides.",
  keywords: [
    "PakRaffle knowledge base",
    "raffle help articles Pakistan",
    "lucky draw payment help",
    "PakRaffle support articles",
    "merchant connect guide",
  ],
  robots: "index, follow",
  alternates: { canonical: "https://pakraffle.com/knowledge-base" },
  openGraph: {
    title: "PakRaffle Knowledge Base",
    description: "Every help-desk answer in one searchable library — payments, draws, prizes, refunds and merchant guides.",
    url: "https://pakraffle.com/knowledge-base",
    siteName: "PakRaffle",
    type: "website",
    locale: "en_PK",
  },
  twitter: {
    card: "summary",
    title: "PakRaffle Knowledge Base",
    description: "Searchable articles on draws, payments, prizes and refunds.",
  },
}

type LoadResult = { ok: true; articles: KbArticle[] } | { ok: false; message: string }

async function load(): Promise<LoadResult> {
  try {
    return { ok: true, articles: await listArticles() }
  } catch (err) {
    return { ok: false, message: describeSanityError(err).message }
  }
}

export default async function KnowledgeBasePage() {
  const data = await load()
  const articles = data.ok ? data.articles : []
  const groups = data.ok ? groupArticles(articles) : []
  const newest = articles.reduce((latest, article) => (article.updated > latest ? article.updated : latest), "")
  const featured = articles.filter((article) => article.featured).slice(0, 1)

  return (
    <KbShell>
      <KbHero
        title="The PakRaffle knowledge base"
        body="Every answer the team has written up, in one searchable library. No account, no queue — read it and get back to the draw."
        meta={
          data.ok && articles.length > 0 ? (
            <>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-3.5 py-1.5 text-[12px] font-semibold text-slate-700 backdrop-blur">
                <FileText className="h-3.5 w-3.5 text-emerald-600" /> {articles.length} articles
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-3.5 py-1.5 text-[12px] font-semibold text-slate-700 backdrop-blur">
                <Compass className="h-3.5 w-3.5 text-emerald-600" /> {groups.length} {groups.length === 1 ? "section" : "sections"}
              </span>
              {newest && (
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-3.5 py-1.5 text-[12px] font-semibold text-slate-700 backdrop-blur">
                  <BookOpen className="h-3.5 w-3.5 text-emerald-600" /> Updated {relativeAge(newest)}
                </span>
              )}
            </>
          ) : null
        }
      />

      <main className={CONTAINER}>
        {data.ok ? (
          articles.length === 0 ? (
            <EmptyLibrary />
          ) : (
            <>
              <div className="grid gap-3 py-10 sm:grid-cols-3 sm:py-12">
                <StatTile label="Articles published" value={articles.length} hint="Written and edited in Sanity" accent />
                <StatTile
                  label="Sections"
                  value={groups.length}
                  hint={groups[0]?.name === "All articles" ? "One flat library for now" : groups.map((group) => group.name).slice(0, 3).join(" · ")}
                />
                <StatTile label="Last update" value={newest ? relativeAge(newest) : "—"} hint="Publishing in Sanity lands here on its own" />
              </div>

              {featured.length > 0 && (
                <section className="pb-4">
                  <SectionHead kicker="Pinned by the team" title="Start here" />
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {featured.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                </section>
              )}

              <CategoryRail groups={groups} />

              {groups.map((group, index) => (
                <section key={group.name} id={sectionAnchor(group.name)} className="scroll-mt-24 pt-12">
                  <SectionHead
                    index={String(index + 1).padStart(2, "0")}
                    kicker={`${group.articles.length} ${group.articles.length === 1 ? "article" : "articles"}`}
                    title={group.name}
                  />
                  <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {group.articles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                </section>
              ))}

              <div className="pt-16">
                <div className={`${PANEL} flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8`}>
                  <div className="flex items-start gap-4">
                    <IconTile icon={MessagesSquare} tone="emerald" size="lg" />
                    <div>
                      <h2 className="font-display text-lg font-semibold tracking-tight text-slate-900">Nothing matched? Ask a human.</h2>
                      <p className="mt-1 text-[14px] leading-relaxed text-slate-600">
                        Support reads every message and replies in about 15 minutes, around the clock.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    <Cta href="/contact" variant="ghost" arrow>
                      Contact desk
                    </Cta>
                    <Cta href={LIVE_CHAT_URL} variant="primary">
                      <MessagesSquare className="h-4 w-4" /> Live chat
                    </Cta>
                  </div>
                </div>
              </div>
            </>
          )
        ) : (
          <div className="py-14">
            <UnavailableNotice reason={data.message} hint={sanitySetupHint()} />
          </div>
        )}
      </main>

      <SupportRail />

      <JsonLd
        id="kb-breadcrumb"
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "PakRaffle", item: "https://pakraffle.com/" },
            { "@type": "ListItem", position: 2, name: "Help Centre", item: "https://pakraffle.com/help" },
            { "@type": "ListItem", position: 3, name: "Knowledge Base", item: "https://pakraffle.com/knowledge-base" },
          ],
        }}
      />
    </KbShell>
  )
}

function EmptyLibrary() {
  return (
    <section className="py-14">
      <div className={`${PANEL} p-8 text-center sm:p-12`}>
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-700">
          <Sparkles className="h-6 w-6" />
        </span>
        <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight text-slate-900">The library is open but empty</h2>
        <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-slate-600">
          No article has been published to Sanity yet, so there is nothing to read here. The{" "}
          <Link href="/help" className="font-semibold text-emerald-700 underline underline-offset-2">
            Help Centre
          </Link>{" "}
          answers the questions customers ask most, and live chat is staffed around the clock.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2.5">
          <Cta href="/help" variant="primary" arrow>
            Browse the Help Centre
          </Cta>
          <Cta href={LIVE_CHAT_URL} variant="ghost">
            <MessagesSquare className="h-4 w-4" /> Chat with support
          </Cta>
        </div>
        {!isSanityConfigured() && process.env.NODE_ENV !== "production" && (
          <p className="mx-auto mt-8 max-w-lg rounded-xl bg-slate-900/5 px-4 py-3 text-left font-mono text-[11px] leading-relaxed text-slate-600">
            {sanitySetupHint()}
          </p>
        )}
      </div>
    </section>
  )
}
