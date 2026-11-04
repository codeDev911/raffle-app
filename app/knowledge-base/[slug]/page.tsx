import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, BookOpen, CalendarDays, Clock, MessagesSquare, Tag } from "lucide-react"
import { PortableText } from "@/components/portable-text"
import { CONTAINER, Cta, JsonLd, PANEL, SectionHead } from "@/components/marketing/kit"
import { LIVE_CHAT_URL } from "@/lib/support-links"
import {
  ArticleCard,
  KbShell,
  SupportRail,
  UnavailableNotice,
  KB_PATH,
  KB_SEARCH_PATH,
  formatDate,
} from "../_shared"
import {
  describeSanityError,
  getArticle,
  listArticles,
  relatedArticles,
  sanityImageUrl,
  sanitySetupHint,
  type KbArticle,
  type KbArticleDetail,
} from "@/lib/sanity"

export const revalidate = 3600

/**
 * Body typography is written out as arbitrary child selectors because Tailwind has to see every
 * class in source and the project has no typography plugin. Portable Text emits plain semantic
 * elements, so this is the whole contract between the CMS and the page.
 */
const PROSE =
  "text-[15px] leading-[1.75] text-slate-700 sm:text-base " +
  "[&_a]:font-semibold [&_a]:text-emerald-700 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-emerald-600 " +
  "[&_blockquote]:my-5 [&_blockquote]:border-l-2 [&_blockquote]:border-emerald-600/30 [&_blockquote]:pl-4 [&_blockquote]:text-slate-600 [&_blockquote]:italic " +
  "[&_code]:rounded-md [&_code]:bg-slate-900/5 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] " +
  "[&_figure]:my-6 " +
  "[&_h1]:mt-8 [&_h1]:font-display [&_h1]:text-[1.6rem] [&_h1]:font-semibold [&_h1]:leading-tight [&_h1]:tracking-tight [&_h1]:text-slate-900 " +
  "[&_h2]:mt-9 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:leading-snug [&_h2]:tracking-tight [&_h2]:text-slate-900 " +
  "[&_h3]:mt-7 [&_h3]:font-display [&_h3]:text-[17px] [&_h3]:font-semibold [&_h3]:text-slate-900 " +
  "[&_h4]:mt-6 [&_h4]:text-[15px] [&_h4]:font-semibold [&_h4]:text-slate-900 " +
  "[&_img]:h-auto [&_img]:w-full [&_img]:rounded-2xl [&_img]:border [&_img]:border-slate-900/10 " +
  "[&_li]:marker:text-slate-400 " +
  "[&_p]:my-4 [&_p:first-child]:mt-0"

type Resolved =
  | { kind: "found"; article: KbArticleDetail; related: KbArticle[] }
  | { kind: "missing" }
  | { kind: "error"; message: string }

async function resolve(slug: string): Promise<Resolved> {
  // Reading the list first separates "Sanity is down" from "that slug does not exist". The list is
  // cached, so this costs nothing extra; only an unknown slug skips the detail request entirely.
  let articles
  try {
    articles = await listArticles()
  } catch (err) {
    return { kind: "error", message: describeSanityError(err).message }
  }

  const decoded = safeDecode(slug)
  const match = articles.find((article) => article.slug === decoded)
  if (!match) return { kind: "missing" }

  const detail = await getArticle(decoded).catch(() => null)
  if (!detail) return { kind: "missing" }
  return { kind: "found", article: detail, related: relatedArticles(match, articles) }
}

/** A malformed percent-escape in the URL is a bad path, not a crash. */
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value || "").trim()
  } catch {
    return (value || "").trim()
  }
}

export function generateStaticParams(): Promise<{ slug: string }[]> {
  // Every published article is prerendered at build time. If Sanity is unreachable during the build,
  // the route simply falls back to on-demand rendering under the same 1-hour clock.
  return listArticles()
    .then((articles) => articles.map((article) => ({ slug: article.slug })))
    .catch(() => [])
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const resolved = await resolve(params.slug)
  if (resolved.kind !== "found") {
    return {
      title: resolved.kind === "error" ? "Knowledge base unavailable — PakRaffle" : "Article not found — PakRaffle",
      robots: "noindex, follow",
    }
  }

  const { article } = resolved
  const description = article.excerpt || article.title
  return {
    title: `${article.title} — PakRaffle Knowledge Base`,
    description,
    keywords: article.tags.slice(0, 8),
    robots: "index, follow",
    alternates: { canonical: `https://pakraffle.com${KB_PATH}/${encodeURIComponent(article.slug)}` },
    openGraph: {
      title: article.title,
      description,
      url: `https://pakraffle.com${KB_PATH}/${encodeURIComponent(article.slug)}`,
      siteName: "PakRaffle",
      type: "article",
      locale: "en_PK",
      ...(article.cover?.url ? { images: [{ url: sanityImageUrl(article.cover.url, { width: 1200 }), alt: article.cover.alt }] } : {}),
    },
    twitter: { card: article.cover?.url ? "summary_large_image" : "summary", title: article.title, description },
  }
}

export default async function KnowledgeBaseArticlePage({ params }: { params: { slug: string } }) {
  const resolved = await resolve(params.slug)

  if (resolved.kind === "error") {
    return (
      <KbShell>
        <main className={CONTAINER}>
          <div className="py-14">
            <UnavailableNotice reason={resolved.message} hint={sanitySetupHint()} />
          </div>
        </main>
      </KbShell>
    )
  }

  if (resolved.kind === "missing") notFound()

  const { article, related } = resolved
  const cover = article.cover?.url ? sanityImageUrl(article.cover.url, { width: 1200 }) : ""

  return (
    <KbShell>
      <article className={`${CONTAINER} py-10 sm:py-14`}>
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[12px] font-medium text-slate-500">
          <Link href="/" className="transition hover:text-slate-900">PakRaffle</Link>
          <span aria-hidden>/</span>
          <Link href="/help" className="transition hover:text-slate-900">Help Centre</Link>
          <span aria-hidden>/</span>
          <Link href={KB_PATH} className="transition hover:text-slate-900">Knowledge Base</Link>
          {article.category && (
            <>
              <span aria-hidden>/</span>
              <span className="text-slate-700">{article.category}</span>
            </>
          )}
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11.5px] font-medium text-slate-500">
              {article.category && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/20 bg-emerald-50/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-800">
                  <BookOpen className="h-3 w-3" /> {article.category}
                </span>
              )}
              {article.date && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" /> {formatDate(article.date)}
                </span>
              )}
              {article.readingTime && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> {article.readingTime} min read
                </span>
              )}
            </div>

            <h1 className="mt-4 max-w-3xl font-display text-[1.9rem] font-semibold leading-[1.12] tracking-tight text-slate-900 sm:text-[2.4rem]">
              {article.title}
            </h1>

            {article.excerpt && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-600">{article.excerpt}</p>}

            {cover && (
              // Plain <img>: cdn.sanity.io is not in next/image's remote allow-list, and Sanity's own
              // CDN already serves the resized, format-negotiated variant we asked for.
              <img
                src={cover}
                alt={article.cover?.alt || article.title}
                loading="eager"
                className="mt-7 aspect-[21/9] w-full rounded-3xl border border-slate-900/10 object-cover"
              />
            )}

            <div className={`${PANEL} mt-7 px-5 py-6 sm:px-8 sm:py-8`}>
              {article.content.length > 0 ? (
                <PortableText blocks={article.content} className={PROSE} />
              ) : (
                <p className="text-[15px] leading-relaxed text-slate-600">
                  This article has a title and a summary but no body yet — the team is still writing it. Support can
                  answer on live chat in the meantime.
                </p>
              )}
            </div>

            {article.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  <Tag className="h-3 w-3" /> Related topics
                </span>
                {article.tags.slice(0, 6).map((tag) => (
                  <Link
                    key={tag}
                    href={`${KB_SEARCH_PATH}?q=${encodeURIComponent(tag)}`}
                    className="rounded-full border border-slate-900/10 bg-white/70 px-3 py-1 text-[11.5px] font-medium text-slate-600 transition hover:border-emerald-600/30 hover:text-emerald-800"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              <Cta href={KB_PATH} variant="ghost">
                <ArrowLeft className="h-4 w-4" /> All articles
              </Cta>
              {article.author?.name && (
                <span className="inline-flex items-center gap-2.5 text-[12.5px] text-slate-500">
                  {article.author.avatar && (
                    <img src={sanityImageUrl(article.author.avatar, { width: 64 })} alt="" aria-hidden loading="lazy" className="h-7 w-7 rounded-full object-cover" />
                  )}
                  Written by <span className="font-semibold text-slate-700">{article.author.name}</span>
                  {article.author.profession && <span className="text-slate-400">· {article.author.profession}</span>}
                </span>
              )}
            </div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-8 lg:self-start">
            <div className={`${PANEL} p-5`}>
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Need a human?</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
                Support replies in about 15 minutes, 24 hours a day. Quote this article if any of it is out of date.
              </p>
              <Cta href={LIVE_CHAT_URL} variant="primary" className="mt-4 w-full justify-center">
                <MessagesSquare className="h-4 w-4" /> Live chat
              </Cta>
              <Link href="/contact" className="mt-2 block text-center text-[12px] font-semibold text-emerald-700 transition hover:text-emerald-600">
                Or send the desk a message
              </Link>
            </div>

            {article.author?.bio && (
              <div className={`${PANEL} p-5`}>
                <h2 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">About the author</h2>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{article.author.bio}</p>
              </div>
            )}
          </aside>
        </div>
      </article>

      {related.length > 0 && (
        <section className={`${CONTAINER} pb-14`}>
          <SectionHead kicker="Keep reading" title="Related articles" />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ArticleCard key={item.id} article={item} />
            ))}
          </div>
        </section>
      )}

      <SupportRail />

      <JsonLd
        id="kb-article-ld"
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.excerpt || undefined,
            articleSection: article.category || undefined,
            keywords: article.tags.join(", ") || undefined,
            inLanguage: "en-PK",
            datePublished: article.date || article.updated || undefined,
            dateModified: article.updated || undefined,
            timeRequired: article.readingTime ? `PT${article.readingTime}M` : undefined,
            ...(article.cover?.url ? { image: sanityImageUrl(article.cover.url, { width: 1200 }) } : {}),
            ...(article.author?.name ? { author: { "@type": "Person", name: article.author.name } } : {}),
            publisher: { "@type": "Organization", name: "PakRaffle", url: "https://pakraffle.com/" },
            mainEntityOfPage: { "@type": "WebPage", "@id": `https://pakraffle.com${KB_PATH}/${encodeURIComponent(article.slug)}` },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "PakRaffle", item: "https://pakraffle.com/" },
              { "@type": "ListItem", position: 2, name: "Knowledge Base", item: `https://pakraffle.com${KB_PATH}` },
              { "@type": "ListItem", position: 3, name: article.title, item: `https://pakraffle.com${KB_PATH}/${encodeURIComponent(article.slug)}` },
            ],
          },
        ]}
      />
    </KbShell>
  )
}
