/**
 * Sanity content read, over plain HTTP — no `@sanity/client`, no Sanity Studio, no build-time code
 * generation. One documented endpoint does everything this site needs:
 *
 *   POST https://{projectId}.apicdn.sanity.io/{apiVersion}/data/query/{dataset}
 *   body: { "query": "<GROQ>", "params": { "slug": "…" } }
 *
 * Why this shape:
 *  - `apicdn` is Sanity's edge-cached host, so the CDN absorbs reads even before our own cache does.
 *  - POST keeps slug values out of the query string, so nothing visitor-supplied is ever pasted into
 *    GROQ — it travels as a named `$slug` parameter and Sanity escapes it for us.
 *  - `returnQuery=false` stops Sanity echoing the query back in every response body.
 *  - The default perspective on this API version is `published`, so drafts cannot reach visitors.
 *
 * Reads are unauthenticated, which works because the dataset is public. If it is ever made private,
 * set SANITY_READ_TOKEN (a read-only Sanity token — server-side only, never NEXT_PUBLIC) and the
 * module will send it as a Bearer header.
 */

export type SanityDocType = string

export interface SanityConfig {
  configured: boolean
  projectId: string
  dataset: string
  apiVersion: string
  useCdn: boolean
  token: string
  /** The Sanity document type that holds knowledge-base articles. */
  docType: SanityDocType
  endpoint: string
}

const DEFAULTS = {
  apiVersion: "v2025-02-19",
  dataset: "production",
  docType: "blogPost",
} as const

export function sanityConfig(): SanityConfig {
  const projectId = (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "").trim()
  const dataset = (process.env.NEXT_PUBLIC_SANITY_DATASET || DEFAULTS.dataset).trim()
  const useCdn = (process.env.SANITY_USE_CDN || "true").trim().toLowerCase() !== "false"
  const apiVersion = (process.env.SANITY_API_VERSION || DEFAULTS.apiVersion).trim().replace(/^v/, "")
  const host = useCdn ? "apicdn.sanity.io" : "api.sanity.io"
  return {
    configured: Boolean(projectId),
    projectId,
    dataset,
    apiVersion,
    useCdn,
    token: (process.env.SANITY_READ_TOKEN || "").trim(),
    docType: (process.env.SANITY_KB_DOC_TYPE || DEFAULTS.docType).trim(),
    endpoint: projectId ? `https://${projectId}.${host}/v${apiVersion}/data/query/${dataset}` : "",
  }
}

export function isSanityConfigured(): boolean {
  return sanityConfig().configured
}

/** Operator-facing hint for the degraded state. Never contains the token. */
export function sanitySetupHint(): string {
  const cfg = sanityConfig()
  if (!cfg.configured) {
    return "NEXT_PUBLIC_SANITY_PROJECT_ID is not set. Add it (and optionally NEXT_PUBLIC_SANITY_DATASET) to .env."
  }
  return `Sanity is configured (project ${cfg.projectId}, dataset ${cfg.dataset}, type ${cfg.docType}) — the failure below came from the query.`
}

export type SanityErrorCode = "NOT_CONFIGURED" | "API" | "NETWORK"

export class SanityError extends Error {
  code: SanityErrorCode
  constructor(message: string, code: SanityErrorCode = "API") {
    super(message)
    this.name = "SanityError"
    this.code = code
  }
}

// ─────────────────────────────────────────── portable text ───────────────────────────────────────────

export interface PtSpan {
  _key?: string
  _type: string
  text?: string
  marks?: string[]
}

export interface PtMarkDef {
  _key?: string
  _type: string
  href?: string
}

export interface PtBlock {
  _key?: string
  _type: string
  style?: string
  /** Set on list items ("bullet" | "number"); the renderer groups consecutive ones into ul/ol. */
  list?: string
  children?: PtSpan[]
  markDefs?: PtMarkDef[]
  /** Only on image blocks. */
  alt?: string | null
  caption?: string | null
  url?: string | null
  w?: number | null
  h?: number | null
}

// ─────────────────────────────────────────── documents ───────────────────────────────────────────

export interface KbAuthor {
  name: string
  bio: string
  profession: string
  avatar: string
}

export interface KbCover {
  url: string
  alt: string
}

export interface KbArticle {
  id: string
  slug: string
  title: string
  excerpt: string
  date: string
  updated: string
  readingTime: number | null
  featured: boolean
  tags: string[]
  /** Sanity's starter schema has no category documents, so this is usually absent and the reader
   * falls back to one flat list. Add a `category` field to the schema and grouping turns itself on. */
  category: string
  cover: KbCover | null
  author: KbAuthor | null
}

export interface KbArticleDetail extends KbArticle {
  content: PtBlock[]
}

/**
 * Both reads share the same field list. `category` is optional because this schema has no category
 * documents yet; `coalesce` keeps GROQ quiet either way. Cover dimensions are read back out of the
 * CDN URL (`…-1536x1024.png`) because asset metadata is not populated on this dataset.
 */
const FIELDS = `
  "id": _id,
  "slug": slug.current,
  title,
  "excerpt": coalesce(excerpt, ""),
  "date": coalesce(date, ""),
  "updated": coalesce(_updatedAt, _createdAt, ""),
  readingTime,
  "featured": coalesce(featured, false),
  "tags": coalesce(tags, []),
  "category": coalesce(category.name, category, ""),
  "cover": {
    "url": coalesce(coverImage.asset->url, ""),
    "alt": coalesce(coverImage.alt, "")
  },
  "author": {
    "name": coalesce(author->name, ""),
    "bio": coalesce(author->bio, ""),
    "profession": coalesce(author->professioon, author->profession, ""),
    "avatar": coalesce(author->avatar.asset->url, "")
  }
`

const LIST_QUERY = `*[_type == $docType]|order(date desc, _updatedAt desc)[0...500]{${FIELDS}}`

const DETAIL_QUERY = `*[_type == $docType && slug.current == $slug][0]{${FIELDS},
  "content": content[]{
    _key,
    _type,
    style,
    list,
    markDefs,
    "children": children[]{_key, _type, text, marks},
    "alt": coalesce(alt, ""),
    "caption": coalesce(caption, ""),
    "url": coalesce(asset->url, ""),
    "w": coalesce(asset->metadata.width, 0),
    "h": coalesce(asset->metadata.height, 0)
  }
}`

// ─────────────────────────────────────────── cache ───────────────────────────────────────────

const TTL = {
  /** The list is what every page reads; 30 minutes keeps a busy site at ~2 calls an hour. */
  list: 30 * 60_000,
  /** Bodies change far less often than the index order. */
  detail: 6 * 60 * 60_000,
  /** After a failed refresh, retry the network soon — but not once per page view. */
  staleRetry: 60_000,
} as const

interface Entry<T> {
  value: T
  expiresAt: number
}

const cache = new Map<string, Entry<unknown>>()
const inflight = new Map<string, Promise<unknown>>()

/**
 * TTL memo with stale-if-error and single-flight. If Sanity errors or times out after a good read,
 * the last good response keeps serving: a help centre showing an article from an hour ago beats one
 * showing nothing.
 */
async function memoize<T>(key: string, ttl: number, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key) as Entry<T> | undefined
  if (hit && hit.expiresAt > Date.now()) return hit.value

  const running = inflight.get(key) as Promise<T> | undefined
  if (running) return running

  const task = (async () => {
    try {
      const value = await load()
      cache.set(key, { value, expiresAt: Date.now() + ttl })
      return value
    } catch (err) {
      if (hit) {
        cache.set(key, { value: hit.value, expiresAt: Date.now() + TTL.staleRetry })
        console.warn(`[KnowledgeBase] Sanity refresh failed for "${key}"; serving the cached copy:`, err)
        return hit.value
      }
      throw err
    } finally {
      inflight.delete(key)
    }
  })()

  inflight.set(key, task)
  return task
}

/** Drops the memo; used by tests and by anyone who wants a forced re-read. */
export function clearSanityCache(): void {
  cache.clear()
  inflight.clear()
}

// ─────────────────────────────────────────── the call ───────────────────────────────────────────

const TIMEOUT_MS = 10_000

async function query<T>(groq: string, params: Record<string, string | boolean> = {}): Promise<T> {
  const cfg = sanityConfig()
  if (!cfg.configured) throw new SanityError("Sanity is not configured", "NOT_CONFIGURED")

  let res: Response
  try {
    res = await fetch(`${cfg.endpoint}?returnQuery=false`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(cfg.token ? { Authorization: `Bearer ${cfg.token}` } : {}),
      },
      body: JSON.stringify({ query: groq, params: { docType: cfg.docType, ...params } }),
      // Our own memo is the cache; Next must not cache an authenticated read in its data cache.
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (err: any) {
    throw new SanityError(`Could not reach Sanity: ${err?.message || err}`, "NETWORK")
  }

  const body: any = await res.json().catch(() => null)
  if (!res.ok) {
    const detail = body?.error?.description || body?.error?.message || body?.message || `HTTP ${res.status}`
    throw new SanityError(`Sanity query failed (${detail})`)
  }
  // Sanity answers a bad GROQ with 200 + an `error` object on some paths, so check both.
  if (body?.error) {
    throw new SanityError(`Sanity query rejected (${body.error.description || body.error.type || "unknown"})`)
  }
  return body?.result as T
}

// ─────────────────────────────────────────── public reads ───────────────────────────────────────────

export async function listArticles(): Promise<KbArticle[]> {
  return memoize("kb:list", TTL.list, async () => {
    const rows = await query<any[]>(LIST_QUERY)
    return (Array.isArray(rows) ? rows : []).map(normaliseArticle).filter((article) => article.slug && article.title)
  })
}

/**
 * One article. The body is not in the list query, so a visitor opening an article costs exactly one
 * extra Sanity call — then it is cached for six hours, and the route's own ISR keeps it in HTML for
 * an hour after that.
 */
export async function getArticle(slug: string): Promise<KbArticleDetail | null> {
  const key = `kb:article:${slug}`
  const cached = cache.get(key) as Entry<KbArticleDetail> | undefined
  if (cached && cached.expiresAt > Date.now()) return cached.value

  const article = await memoize(key, TTL.detail, async () => {
    const row = await query<any>(DETAIL_QUERY, { slug })
    return row ? { ...normaliseArticle(row), content: Array.isArray(row.content) ? row.content : [] } : null
  })

  // An unknown slug legitimately returns null; do not let that poison the memo for six hours, or a
  // mistyped path would keep 404ing long after the article exists.
  if (!article) cache.delete(key)
  return article
}

/**
 * Library sections. The `blogPost` schema has no category field, so sections are derived from tags:
 * an article's FIRST tag that appears below decides its shelf, which keeps one article in exactly one
 * section. A real `category` on a document still overrides all of this if the schema grows one.
 */
export const KB_SECTIONS: { name: string; tags: string[] }[] = [
  { name: "Getting started", tags: ["getting-started", "how-it-works", "entries"] },
  { name: "Payments and tickets", tags: ["payments", "transaction-id", "tid", "receipts", "tickets"] },
  { name: "Draws and winners", tags: ["draws", "winners", "live-stream", "fairness"] },
  { name: "Prizes and delivery", tags: ["delivery", "prize", "verification", "cnic"] },
  { name: "Refunds and money back", tags: ["refunds", "cancellations", "policy"] },
  { name: "Safety and your account", tags: ["safety", "fraud", "account", "privacy", "data"] },
  { name: "Stores and Merchant Connect", tags: ["merchants", "shopify", "merchant-connect", "store-lookup", "widget", "invoices", "shoppers"] },
  { name: "Sellers and payouts", tags: ["sellers", "listing", "escrow", "fees"] },
  { name: "Partners", tags: ["partners", "affiliate", "commission", "payouts"] },
  { name: "Support", tags: ["support", "contact", "response-times", "escalation"] },
]

const SECTION_OF_TAG = new Map(KB_SECTIONS.flatMap((section) => section.tags.map((tag) => [tag, section.name] as const)))

export function deriveSection(tags: string[]): string {
  for (const tag of tags) {
    const hit = SECTION_OF_TAG.get(tag.trim().toLowerCase())
    if (hit) return hit
  }
  return ""
}

function normaliseArticle(row: any): KbArticle {
  const tags = Array.isArray(row?.tags) ? row.tags.map(String).filter(Boolean) : []
  return {
    id: String(row?.id || ""),
    slug: String(row?.slug || ""),
    title: String(row?.title || ""),
    excerpt: String(row?.excerpt || ""),
    date: String(row?.date || ""),
    updated: String(row?.updated || ""),
    readingTime: typeof row?.readingTime === "number" && row.readingTime > 0 ? row.readingTime : null,
    featured: Boolean(row?.featured),
    tags,
    // A `category` could be a plain string or an unresolved reference object, depending on how the
    // schema is written later, so read the name from either and fall back to the derived section.
    category:
      (typeof row?.category === "string" ? row.category : String(row?.category?.name || "")).trim() ||
      deriveSection(tags),
    cover: row?.cover?.url ? { url: String(row.cover.url), alt: String(row.cover.alt || row?.title || "") } : null,
    author: row?.author?.name
      ? {
          name: String(row.author.name),
          bio: String(row.author.bio || ""),
          profession: String(row.author.profession || ""),
          avatar: String(row.author.avatar || ""),
        }
      : null,
  }
}

/**
 * Search runs over the cached list instead of a second Sanity query, so typing in the box never
 * opens another connection. Titles, excerpts, tags and body text are all matched, weighted in that
 * order.
 */
export async function searchArticles(term: string): Promise<KbArticle[]> {
  return rankArticles(term, await listArticles())
}

export function rankArticles(term: string, articles: KbArticle[]): KbArticle[] {
  const needle = (term || "").trim().toLowerCase()
  if (!needle) return articles
  const tokens = needle.split(/\s+/).filter(Boolean)

  return articles
    .map((article) => {
      const haystack = {
        title: article.title.toLowerCase(),
        tags: article.tags.join(" ").toLowerCase(),
        category: article.category.toLowerCase(),
        excerpt: article.excerpt.toLowerCase(),
      }
      let score = haystack.title.includes(needle) ? 8 : 0
      for (const token of tokens) {
        if (haystack.title.includes(token)) score += 4
        if (haystack.tags.includes(token)) score += 3
        if (haystack.category.includes(token)) score += 2
        if (haystack.excerpt.includes(token)) score += 1
      }
      return { article, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.article.date.localeCompare(a.article.date))
    .map((entry) => entry.article)
}

/** Sections appear as soon as the schema carries a category; otherwise one flat list. */
export function groupArticles(articles: KbArticle[]): { name: string; articles: KbArticle[] }[] {
  const groups = new Map<string, KbArticle[]>()
  for (const article of articles) {
    const name = article.category || "All articles"
    const bucket = groups.get(name)
    if (bucket) bucket.push(article)
    else groups.set(name, [article])
  }
  // Known sections keep the order declared above; anything else sorts after them by name.
  const rank = (name: string) => {
    const index = KB_SECTIONS.findIndex((section) => section.name === name)
    return index === -1 ? KB_SECTIONS.length : index
  }
  return Array.from(groups, ([name, items]) => ({ name, articles: items })).sort(
    (a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name),
  )
}

export function relatedArticles(article: Pick<KbArticle, "id" | "slug" | "tags" | "category">, articles: KbArticle[], limit = 4): KbArticle[] {
  const others = articles.filter((item) => item.id !== article.id && item.slug !== article.slug)
  const mine = new Set(article.tags.map((tag) => tag.toLowerCase()))
  return others
    .map((item) => ({ item, shared: item.tags.filter((tag) => mine.has(tag.toLowerCase())).length }))
    .sort((a, b) => b.shared - a.shared || b.item.date.localeCompare(a.item.date))
    .slice(0, limit)
    .map((entry) => entry.item)
}

// ─────────────────────────────────────────── images ───────────────────────────────────────────

const SANITY_CDN = /^https:\/\/cdn\.sanity\.io\/images\//

/**
 * Sanity serves images from cdn.sanity.io with on-the-fly transforms in the query string. Only its
 * own CDN is rewritten, so a hand-pasted absolute URL is left alone.
 */
export function sanityImageUrl(url: string, options: { width?: number; quality?: number } = {}): string {
  if (!url || !SANITY_CDN.test(url)) return url
  let sized = `${url}?auto=format`
  if (options.width) sized += `&fit=max&w=${options.width}`
  if (options.quality) sized += `&q=${options.quality}`
  return sized
}

/** `…/f7d682…-1536x1024.png` carries its own dimensions, which asset metadata does not on this dataset. */
export function dimensionsFromSanityUrl(url: string): { width: number; height: number } | null {
  const match = /-(\d{2,5})x(\d{2,5})\.[a-z0-9]+(?:$|\?)/i.exec(url || "")
  if (!match) return null
  return { width: Number(match[1]), height: Number(match[2]) }
}

export function describeSanityError(err: unknown): { code: SanityErrorCode; message: string } {
  if (err instanceof SanityError) return { code: err.code, message: err.message }
  return { code: "API", message: err instanceof Error ? err.message : "Unknown error" }
}
