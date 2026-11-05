/**
 * Sanity knowledge-base content tool.
 *
 *   node scripts/sanity-kb.mjs export [--out <file>]
 *        Backup every article document to JSON. Public read, no token needed.
 *   node scripts/sanity-kb.mjs unpack [--live-dir <path>] [--overwrite]
 *        Write the published documents back into content/knowledge-base/<slug>.md so the repo
 *        mirrors the dataset. Skips a slug whose file already exists unless --overwrite.
 *   node scripts/sanity-kb.mjs build
 *        Parse content/knowledge-base/*.md and report what would be published. No token needed.
 *   node scripts/sanity-kb.mjs push [--live] [--only slugA,slugB] [--wipe-existing] [--delete-all --yes]
 *        Publish. Sanity validates without writing unless --live is present.
 *        --only limits the publish to the named slugs, which keeps every other article untouched.
 *        --delete-all first removes every existing article document (backs up with `export` first).
 *        Requires SANITY_WRITE_TOKEN in .env (a read token cannot mutate).
 *
 *   node scripts/sanity-kb.mjs covers [--live] [--only slugA,slugB]
 *        Upload content/knowledge-base/images/<slug>.<png|jpg|webp|svg> to Sanity and point that
 *        document's coverImage at it. Touches nothing else on the document, so an article body is
 *        never rewritten by a cover change. Re-uploads only when the bytes changed.
 *
 *   node scripts/sanity-kb.mjs restore [--from <file>] [--live]
 *        Roll a backup written by `export` straight back into the dataset.
 *
 * Config is read from .env: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
 * SANITY_API_VERSION, SANITY_KB_DOC_TYPE. Document ids are deterministic (`kb-<slug>`), so a
 * re-run updates the same article instead of creating a duplicate.
 */
import fs from "node:fs"
import path from "node:path"
import { createHash } from "node:crypto"

const ROOT = process.cwd()
const CONTENT_DIR = path.join(ROOT, "content", "knowledge-base")
const IMAGE_DIR = path.join(CONTENT_DIR, "images")
const BACKUP_DIR = path.join(ROOT, ".backups")
/** slug -> { hash, assetId } so `covers` never uploads the same bytes twice. */
const ASSET_MAP = path.join(BACKUP_DIR, "kb-assets.json")

/* ------------------------------------------------------------------------ env */

function readEnvFile() {
  const file = path.join(ROOT, ".env")
  const out = {}
  if (!fs.existsSync(file)) return out
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/i.exec(line)
    if (!m) continue
    out[m[1]] = m[2].trim().replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1")
  }
  return out
}

const E = { ...readEnvFile(), ...process.env }
const PROJECT = (E.NEXT_PUBLIC_SANITY_PROJECT_ID || "").trim()
const DATASET = (E.NEXT_PUBLIC_SANITY_DATASET || "production").trim()
const API_VERSION = (E.SANITY_API_VERSION || "2025-02-19").trim().replace(/^v/, "")
const DOC_TYPE = (E.SANITY_KB_DOC_TYPE || "blogPost").trim()
// Either name is accepted: SANITY_API_KEY is what the Sanity dashboard calls it, SANITY_WRITE_TOKEN
// is the more explicit spelling. A token needs Write or Editor grants; a read-only token cannot mutate.
const TOKEN = (E.SANITY_WRITE_TOKEN || E.SANITY_API_KEY || "").trim()

if (!PROJECT) {
  console.error("ERROR: NEXT_PUBLIC_SANITY_PROJECT_ID is missing from .env")
  process.exit(1)
}

const QUERY_URL = `https://${PROJECT}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}`
const MUTATE_URL = `https://${PROJECT}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}`
// Sanity's asset endpoint: the file bytes are the body and a `sanity.imageAsset` document is the reply.
// `auto=format` is deliberately NOT an upload parameter — the CDN transform is applied at read time by
// sanityImageUrl() in lib/sanity.ts.
const IMAGES_URL = `https://${PROJECT}.api.sanity.io/v${API_VERSION}/assets/images/${DATASET}`

const IMAGE_TYPES = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml" }

/** Sanity document ids may only contain letters, digits, dot, dash, underscore, apostrophe. */
function docId(slug) {
  return `kb-${slug}`.replace(/[^A-Za-z0-9._'-]/g, "-").slice(0, 120)
}

/* ------------------------------------------------------------------ markdown */

const INLINE = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\))/

/**
 * Inline markdown -> Portable Text spans, collecting link markDefs into `defs`.
 * A link whose target is not http(s)/mailto/relative is emitted as plain text, so a
 * malformed or scripted href can never reach the renderer.
 */
function inline(text, defs, keyBase) {
  const spans = []
  let rest = text
  let n = 0
  const push = (value, marks) => {
    if (!value) return
    spans.push({ _type: "span", _key: `${keyBase}-s${n++}`, text: value, marks })
  }

  while (rest) {
    const m = INLINE.exec(rest)
    if (!m) {
      push(rest, [])
      break
    }
    push(rest.slice(0, m.index), [])
    if (m[2]) push(m[2], ["strong"])
    else if (m[3]) push(m[3], ["em"])
    else if (m[4]) push(m[4], ["code"])
    else if (m[5]) {
      const href = m[6]
      if (/^(https?:\/\/|mailto:|\/)/i.test(href)) {
        const key = `${keyBase}-link${defs.length}`
        defs.push({ _type: "link", _key: key, href })
        push(m[5], [key])
      } else {
        push(`${m[5]} (${href})`, [])
      }
    }
    rest = rest.slice(m.index + m[0].length)
  }
  return spans
}

/**
 * Block markdown -> Portable Text. `##/###/####` become h2–h4, `>` a blockquote,
 * `- `/`1. ` list items (the renderer groups consecutive ones into ul/ol).
 */
function portableText(body, keyBase) {
  const blocks = []
  let key = 0
  const nextKey = () => `${keyBase}-b${key++}`

  const emit = (style, text, list) => {
    const defs = []
    const children = inline(text, defs, nextKey())
    if (!children.length) return
    blocks.push({
      _type: "block",
      _key: nextKey(),
      style,
      ...(list ? { list } : {}),
      markDefs: defs,
      children,
    })
  }

  let para = []
  const flush = () => {
    if (para.length) emit("normal", para.join(" "))
    para = []
  }

  for (const raw of body.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trim()
    if (!line) {
      flush()
      continue
    }
    const heading = /^(#{2,4})\s+(.*)$/.exec(line)
    if (heading) {
      flush()
      emit({ 2: "h2", 3: "h3", 4: "h4" }[heading[1].length], heading[2])
      continue
    }
    const quote = /^>\s?(.*)$/.exec(line)
    if (quote) {
      flush()
      emit("blockquote", quote[1])
      continue
    }
    const bullet = /^[-*+]\s+(.*)$/.exec(line)
    if (bullet) {
      flush()
      emit("normal", bullet[1], "bullet")
      continue
    }
    const numbered = /^\d+[.)]\s+(.*)$/.exec(line)
    if (numbered) {
      flush()
      emit("normal", numbered[1], "number")
      continue
    }
    para.push(line)
  }
  flush()
  return blocks
}

/** Front matter: `key: value`, `key: [a, b, c]`, booleans. */
function parseFrontMatter(text, file) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text)
  if (!m) throw new Error(`${file}: missing front matter block`)
  const meta = {}
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line.trim())
    if (!kv) continue
    const key = kv[1]
    const value = kv[2].trim()
    if (value.startsWith("[") && value.endsWith("]")) {
      meta[key] = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean)
    } else if (value === "true" || value === "false") {
      meta[key] = value === "true"
    } else {
      meta[key] = value.replace(/^["']|["']$/g, "")
    }
  }
  return { meta, body: m[2] }
}

/**
 * Reads the tag→section map straight out of lib/sanity.ts so the check below can never drift from
 * what the site actually does. If the parse finds nothing, the warning is simply skipped — a publish
 * is never blocked over a cosmetic label check.
 */
let sectionsCache = null
function sectionsOf() {
  if (sectionsCache) return sectionsCache
  const map = new Map()
  try {
    const src = fs.readFileSync(path.join(ROOT, "lib", "sanity.ts"), "utf8")
    const block = /export const KB_SECTIONS[\s\S]*?\n\]/.exec(src)
    if (block) {
      for (const entry of block[0].matchAll(/\{\s*name:\s*"([^"]+)",\s*tags:\s*\[([^\]]*)\]/g)) {
        for (const tag of entry[2].matchAll(/"([^"]+)"/g)) map.set(tag[1], entry[1])
      }
    }
  } catch {
    /* ignore */
  }
  sectionsCache = {
    deriveSection: (tags) => {
      for (const tag of tags) {
        const hit = map.get(String(tag).trim().toLowerCase())
        if (hit) return hit
      }
      return ""
    },
  }
  return sectionsCache
}

function loadArticles() {
  if (!fs.existsSync(CONTENT_DIR)) throw new Error(`no content directory at ${CONTENT_DIR}`)
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((file) => {
      const slug = file.replace(/\.md$/, "")
      const { meta, body } = parseFrontMatter(fs.readFileSync(path.join(CONTENT_DIR, file), "utf8"), file)
      if (!meta.title) throw new Error(`${file}: front matter needs a title`)
      if (!meta.excerpt) throw new Error(`${file}: front matter needs an excerpt (used on cards and in search results)`)

      // The first tag is what the site's section map buckets the article into.
      const tags = Array.isArray(meta.tags) ? meta.tags : []
      const { deriveSection } = sectionsOf()
      if (tags.length && !deriveSection(tags)) {
        console.warn(`  ! ${file}: no tag maps to a library section — it will sit in "All articles".`)
      }

      const content = portableText(body, slug)
      const words = body.replace(/[#>*`_[\]()-]/g, " ").split(/\s+/).filter(Boolean).length
      const today = new Date().toISOString().slice(0, 10)

      const doc = {
        _type: DOC_TYPE,
        _id: docId(slug),
        title: meta.title,
        slug: { _type: "slug", current: slug },
        excerpt: meta.excerpt,
        tags,
        featured: meta.featured === true,
        // The list page orders by date, so an unstamped article is dated the day it is published.
        date: meta.date || today,
        // The real documents store readingTime as a number and date as YYYY-MM-DD; keep that shape.
        readingTime: Number(meta.readingTime) || Math.max(1, Math.round(words / 200)),
        content,
      }
      if (meta.author) doc.author = { _type: "reference", _ref: meta.author }
      return { file, slug, doc, words }
    })
}

/**
 * Every article cross-links to the next one. A link to a slug that does not exist would 404 in
 * production, so it fails the build instead.
 */
function validateCrossLinks(articles) {
  const slugs = new Set(articles.map((a) => a.slug))
  const problems = []
  for (const a of articles) {
    for (const block of a.doc.content) {
      for (const def of block.markDefs || []) {
        const href = String(def.href || "")
        const internal = /^\/knowledge-base\/([A-Za-z0-9-]+)$/.exec(href)
        if (internal && !slugs.has(internal[1])) problems.push(`${a.file} -> ${href} (no such file in content/knowledge-base)`)
      }
    }
  }
  if (problems.length) throw new Error(`Broken internal links:\n  ${problems.join("\n  ")}`)
}

/* ------------------------------------------------------------- reverse: PT -> md */

/** Rebuild one block's inline markdown from its spans and markDefs (the inverse of `inline`). */
function blockToInline(block) {
  const defs = new Map((block.markDefs || []).map((d) => [d._key, d]))
  let out = ""
  for (const child of block.children || []) {
    if (child._type !== "span" || !child.text) continue
    let text = child.text
    const marks = child.marks || []
    if (marks.includes("code")) text = `\`${text}\``
    if (marks.includes("strong")) text = `**${text}**`
    if (marks.includes("em")) text = `*${text}*`
    const link = marks.map((mark) => defs.get(mark)).find((d) => d?._type === "link")
    if (link?.href) text = `[${text}](${link.href})`
    out += text
  }
  return out.trim()
}

/**
 * Portable Text back into the exact markdown subset `portableText()` reads, so `unpack | push` is a
 * round trip. Anything outside that subset (inline images, annotations we do not emit) is reported
 * rather than silently dropped in place of the reader.
 */
function blocksToMarkdown(blocks, slug) {
  const lines = []
  let numbering = 0
  for (const block of blocks || []) {
    if (block._type !== "block") {
      console.warn(`    ! ${slug}: skipped a content node of type "${block._type}" — it has no markdown form`)
      continue
    }
    const text = blockToInline(block)
    if (!text) continue
    if (block.list === "number") {
      numbering += 1
      lines.push(`${numbering}. ${text}`)
      continue
    }
    numbering = 0
    if (block.list === "bullet") lines.push(`- ${text}`)
    else if (block.style === "blockquote") lines.push(`> ${text}`)
    else if (/^h[234]$/.test(block.style || "")) lines.push(`${"#".repeat(Number(block.style[1]))} ${text}`)
    else lines.push(text)
    lines.push("")
  }
  // Collapse the blank line that follows every block, except where a list needs its own spacing.
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()
}

function frontMatterFor(doc) {
  const tags = Array.isArray(doc.tags) && doc.tags.length ? `[${doc.tags.join(", ")}]` : "[]"
  return [
    "---",
    `title: ${doc.title}`,
    `excerpt: ${doc.excerpt || ""}`,
    `tags: ${tags}`,
    doc.date ? `date: ${String(doc.date).slice(0, 10)}` : null,
    doc.readingTime ? `readingTime: ${doc.readingTime}` : null,
    doc.featured ? "featured: true" : null,
    "---",
    "",
  ]
    .filter(Boolean)
    .join("\n")
}

/* ------------------------------------------------------------------- thumbnails */

/** `<slug>.png|jpg|jpeg|webp|svg` in content/knowledge-base/images, first match wins. */
function findImageFor(slug) {
  if (!fs.existsSync(IMAGE_DIR)) return null
  for (const [ext, contentType] of Object.entries(IMAGE_TYPES)) {
    const file = path.join(IMAGE_DIR, `${slug}${ext}`)
    if (fs.existsSync(file)) return { file, contentType }
  }
  return null
}

function readAssetMap() {
  try {
    return JSON.parse(fs.readFileSync(ASSET_MAP, "utf8"))
  } catch {
    return {}
  }
}

function writeAssetMap(map) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true })
  fs.writeFileSync(ASSET_MAP, JSON.stringify(map, null, 2), "utf8")
}

/**
 * Uploads raw image bytes to Sanity's image endpoint and returns the asset document id, which is what
 * a `coverImage.asset` reference needs. `auto=format` lets the CDN negotiate webp/avif at serve time.
 */
async function uploadImage(file, contentType) {
  if (!TOKEN) throw new Error("Uploading a cover needs SANITY_API_KEY (or SANITY_WRITE_TOKEN) in .env")
  const res = await fetch(IMAGES_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": contentType, Accept: "application/json" },
    body: fs.readFileSync(file),
    signal: AbortSignal.timeout(120_000),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok || body?.error) {
    throw new Error(`Sanity image upload failed (${res.status}) ${body?.error?.description || body?.error?.message || ""}`)
  }
  const asset = body?.document || {}
  if (!asset._id) throw new Error(`Sanity upload reply carried no asset document: ${JSON.stringify(body).slice(0, 200)}`)
  return { assetId: asset._id, url: asset.url || "" }
}

/* -------------------------------------------------------------------- network */

async function groq(query, params = {}) {
  const res = await fetch(`${QUERY_URL}?returnQuery=false`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
    body: JSON.stringify({ query, params }),
    signal: AbortSignal.timeout(20000),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok || body?.error) throw new Error(body?.error?.message || `Sanity query failed (${res.status})`)
  return body.result
}

async function mutate(mutations, dryRun) {
  if (!TOKEN) {
    throw new Error(
      "No write token found. Set SANITY_API_KEY (or SANITY_WRITE_TOKEN) in .env — `export` and `build` work without it.",
    )
  }
  const res = await fetch(`${MUTATE_URL}?dryRun=${dryRun}&returnIds=true&visibility=sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ mutations }),
    signal: AbortSignal.timeout(30000),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok || body?.error) {
    // Sanity puts the reason in error.description (and nests a second one in error.error);
    // a bare status code is useless for diagnosis, so surface as much prose as the API gives.
    const err = body?.error ?? {}
    const detail =
      err.description || err.message || err?.error?.description || err?.error?.message || (body ? JSON.stringify(body) : "")
    throw new Error(`Sanity mutation failed (${res.status}) ${String(detail).slice(0, 800)}`)
  }
  return body
}

/* ------------------------------------------------------------------ commands */

const args = process.argv.slice(2)
const command = args[0] || "build"
const flag = (name) => args.includes(`--${name}`)
const value = (name) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : undefined)

/** Masked credential trace — enough to confirm which variable was picked up, never the secret. */
function describeTarget() {
  console.log(`dataset: ${DATASET} · api v${API_VERSION} · type ${DOC_TYPE}`)
  console.log(
    `token: ${TOKEN ? `${TOKEN.slice(0, 4)}… (${TOKEN.length} chars, from ${E.SANITY_WRITE_TOKEN ? "SANITY_WRITE_TOKEN" : "SANITY_API_KEY"})` : "MISSING — writes will be refused"}`,
  )
  console.log(`mutate: ${MUTATE_URL}\n`)
}

if (command === "export") {
  const docs = await groq(`*[_type == $t]{...}`, { t: DOC_TYPE })
  const out =
    value("out") || path.join(BACKUP_DIR, `sanity-${DOC_TYPE}-${new Date().toISOString().slice(0, 10)}.json`)
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, JSON.stringify(docs, null, 2), "utf8")
  const bytes = fs.statSync(out).size
  console.log(`Exported ${docs.length} ${DOC_TYPE} document(s) -> ${path.relative(ROOT, out)} (${(bytes / 1024).toFixed(1)} KB)`)
  for (const d of docs) console.log(`  ${d._id}  ${(d.slug?.current || "(no slug)").slice(0, 52)}`)
} else if (command === "unpack") {
  // The dataset is the source of truth once articles are published; this writes it back out as the
  // markdown the pipeline reads, so the repo can be cloned and re-published without a Studio.
  const docs = await groq(`*[_type == $t]{..., "slug": slug.current, content}`, { t: DOC_TYPE })
  const outDir = value("live-dir") || CONTENT_DIR
  fs.mkdirSync(outDir, { recursive: true })
  let written = 0
  let skipped = 0
  for (const doc of docs.sort((a, b) => String(a.slug).localeCompare(String(b.slug)))) {
    if (!doc.slug) continue
    const file = path.join(outDir, `${doc.slug}.md`)
    if (fs.existsSync(file) && !flag("overwrite")) {
      skipped += 1
      continue
    }
    const body = blocksToMarkdown(doc.content, doc.slug)
    // A blank line after the closing fence, so the file reads as ordinary front matter in any
    // markdown editor as well as in this script's own parser.
    fs.writeFileSync(file, `${frontMatterFor(doc)}\n${body}\n`, "utf8")
    written += 1
    console.log(`  wrote ${doc.slug}.md (${(doc.content || []).length} blocks)`)
  }
  console.log(`\nUnpacked ${written} article(s) into ${path.relative(ROOT, outDir)}${skipped ? ` · ${skipped} existing file(s) left alone (use --overwrite)` : ""}.`)
} else if (command === "build") {
  const articles = loadArticles()
  validateCrossLinks(articles)
  // `--emit` writes the exact documents that would be published, for review or for a render test.
  const emit = value("emit")
  if (emit) {
    fs.mkdirSync(path.dirname(emit), { recursive: true })
    fs.writeFileSync(emit, JSON.stringify(articles.map((a) => a.doc), null, 2), "utf8")
    console.log(`Emitted ${articles.length} document(s) -> ${path.relative(ROOT, emit)}`)
  }
  console.log(`${articles.length} article(s) in content/knowledge-base:\n`)
  for (const a of articles) {
    const marks = new Set()
    for (const b of a.doc.content) for (const c of b.children || []) for (const m of c.marks || []) marks.add(m)
    console.log(
      `  ${a.doc._id.padEnd(46)} ${String(a.doc.content.length).padStart(3)} blocks  ${String(a.words).padStart(4)} words  ${String(a.doc.readingTime).padStart(2)} min  ${a.doc.tags.length} tags${a.doc.featured ? "  [featured]" : ""}`,
    )
  }
  const styles = new Set()
  for (const a of articles) for (const b of a.doc.content) styles.add(`${b.style}${b.list ? ":" + b.list : ""}`)
  console.log(`\nBlock styles produced: ${[...styles].sort().join(", ")}`)
  const withoutCover = articles.filter((a) => !findImageFor(a.slug))
  console.log(
    `Thumbnails: ${articles.length - withoutCover.length}/${articles.length} present in content/knowledge-base/images${
      withoutCover.length ? `\n  missing: ${withoutCover.map((a) => a.slug).join(", ")}` : ""
    }`,
  )
} else if (command === "push") {
  const live = flag("live")
  describeTarget()
  const all = loadArticles()
  validateCrossLinks(all)
  // --only publishes a named subset, so adding one article can never rewrite the other eighteen.
  const only = value("only")
    ? value("only").split(",").map((s) => s.trim()).filter(Boolean)
    : null
  const articles = only ? all.filter((a) => only.includes(a.slug)) : all
  if (only) {
    const unknown = only.filter((slug) => !all.some((a) => a.slug === slug))
    if (unknown.length) throw new Error(`--only names slugs with no file in content/knowledge-base: ${unknown.join(", ")}`)
    console.log(`Publishing ${articles.length} of ${all.length} local article(s): ${articles.map((a) => a.slug).join(", ")}`)
  }
  const mutations = []

  if (flag("delete-all")) {
    // Irreversible, so it asks twice: an explicit confirmation and a backup to roll back to.
    if (!flag("yes")) throw new Error("--delete-all removes every article document. Re-run with --yes to confirm.")
    if (!articles.length) throw new Error("--delete-all with no local markdown would empty the library. Author the files first.")
    const backups = fs.existsSync(BACKUP_DIR) ? fs.readdirSync(BACKUP_DIR).filter((f) => f.startsWith(`sanity-${DOC_TYPE}-`)).sort() : []
    if (!backups.length && !flag("force")) {
      throw new Error(`Nothing in .backups to roll back to. Run \`node scripts/sanity-kb.mjs export\` first, or pass --force.`)
    }
    const doomed = await groq(`*[_type == $t]._id`, { t: DOC_TYPE })
    // Wiping everything and re-creating fewer documents than live would quietly drop the difference.
    if (!flag("force") && articles.length < doomed.length) {
      throw new Error(
        `Refusing --delete-all: ${doomed.length} article(s) live but only ${articles.length} local file(s) would replace them. Publish them all first, or pass --force.`,
      )
    }
    // Probed against this API version: `{delete: {id}}` is accepted, while `{delete: "id"}` fails with
    // `unexpected value of type "string"` and an `eventId` field is rejected as unknown.
    for (const id of doomed) mutations.push({ delete: { id } })
    console.log(`Deleting ALL ${doomed.length} ${DOC_TYPE} document(s). Backup for rollback: ${backups[backups.length - 1] || "--force, none"}`)
  } else if (flag("wipe-existing")) {
    const ids = articles.map((a) => a.doc._id)
    const existing = await groq(`*[_type == $t && _id in $ids]._id`, { t: DOC_TYPE, ids })
    for (const id of existing) mutations.push({ delete: { id } })
    console.log(`Deleting ${existing.length} document(s) with matching ids before re-creating them.`)
  }
  for (const a of articles) mutations.push({ createOrReplace: a.doc })

  const result = await mutate(mutations, !live)
  console.log(
    `\n${live ? "PUBLISHED" : "DRY RUN — nothing written"}: ${mutations.length} mutation(s) against ${DATASET} (api ${API_VERSION}).`,
  )
  if (result?.transactionId) console.log(`transactionId: ${result.transactionId}${live ? "" : " (dry)"}`)
  if (result?.validationError || result?.errors) {
    console.error("VALIDATION PROBLEMS:", JSON.stringify(result.validationError || result.errors, null, 2).slice(0, 2000))
    process.exitCode = 1
  }
} else if (command === "covers") {
  // Covers are patched onto the document rather than re-sent with it: an article body must not be
  // rewritten just because its thumbnail changed.
  const live = flag("live")
  describeTarget()
  const only = value("only")
    ? value("only").split(",").map((s) => s.trim()).filter(Boolean)
    : null
  const docs = await groq(`*[_type == $t]{_id, "slug": slug.current, title, coverImage}`, { t: DOC_TYPE })
  const map = readAssetMap()
  const mutations = []
  const missing = []
  let pending = 0

  for (const doc of docs.sort((a, b) => String(a.slug).localeCompare(String(b.slug)))) {
    if (!doc.slug) continue
    if (only && !only.includes(doc.slug)) continue
    const found = findImageFor(doc.slug)
    if (!found) {
      missing.push(doc.slug)
      continue
    }
    const hash = createHash("sha256").update(fs.readFileSync(found.file)).digest("hex")
    const known = map[doc.slug]
    if (known && known.hash === hash && doc.coverImage?.asset?._ref === known.assetId) {
      console.log(`  up to date      ${doc.slug}`)
      continue
    }
    if (!live) {
      console.log(`  would ${known && known.hash === hash ? "re-point" : "upload + patch"}  ${doc.slug}  (${path.basename(found.file)})`)
      pending += 1
      continue
    }
    let assetId = known && known.hash === hash ? known.assetId : null
    if (!assetId) {
      const uploaded = await uploadImage(found.file, found.contentType)
      assetId = uploaded.assetId
      map[doc.slug] = { hash, assetId, url: uploaded.url, file: path.basename(found.file) }
      // Persisted immediately: an upload that succeeds and a run that then crashes must not lose
      // the asset id, or the next run pays for the same file twice.
      writeAssetMap(map)
      console.log(`  uploaded        ${doc.slug}  ->  ${assetId.slice(4, 16)}…`)
    } else {
      console.log(`  reusing asset   ${doc.slug}`)
    }
    mutations.push({
      // Probed against this API version: the patch operations sit beside `id` (`{patch: {id, set}}`),
      // not nested in a second `patch` object — the nested form is refused with "Unknown field".
      patch: {
        id: doc._id,
        set: {
          coverImage: {
            _type: "image",
            alt: `${doc.title} — PakRaffle guide cover`,
            asset: { _type: "reference", _ref: assetId },
          },
        },
      },
    })
  }

  if (live) {
    writeAssetMap(map)
    if (!mutations.length) console.log("\nEvery cover already matches its file — nothing to write.")
    else {
      const result = await mutate(mutations, false)
      console.log(`\nPUBLISHED ${mutations.length} cover patch(es). transactionId: ${result.transactionId || "n/a"}`)
      if (result?.validationError || result?.errors) {
        console.error("VALIDATION PROBLEMS:", JSON.stringify(result.validationError || result.errors, null, 2).slice(0, 2000))
        process.exitCode = 1
      }
    }
  } else {
    console.log(`\nDRY RUN — nothing uploaded or written. ${pending} cover(s) to change, ${missing.length} article(s) without an image file.`)
  }
  if (missing.length) {
    console.log(`Missing thumbnails:\n  ${missing.join("\n  ")}`)
    if (live) process.exitCode = 1
  }
} else if (command === "restore") {
  // Writes a previous `export` back verbatim — the rollback path if --delete-all went too far.
  const from =
    value("from") ||
    (fs.existsSync(BACKUP_DIR)
      ? fs.readdirSync(BACKUP_DIR).filter((f) => f.startsWith(`sanity-${DOC_TYPE}-`)).sort().pop()
      : undefined)
  if (!from) throw new Error("No backup in .backups to restore. Pass --from <file>.")
  const file = path.isAbsolute(from) ? from : path.join(BACKUP_DIR, from)
  const docs = JSON.parse(fs.readFileSync(file, "utf8"))
  // Server-managed fields are stripped: a stale _rev would turn a restore into a conflict.
  const mutations = docs.map((doc) => {
    const { _rev, _createdAt, _updatedAt, ...clean } = doc
    return { createOrReplace: clean }
  })
  const result = await mutate(mutations, !flag("live"))
  console.log(
    `${flag("live") ? "RESTORED" : "DRY RUN — nothing written"} ${docs.length} document(s) from ${path.relative(ROOT, file)}. transactionId: ${result.transactionId || "n/a"}`,
  )
} else {
  console.log(
    "Usage:\n  node scripts/sanity-kb.mjs export [--out <file>]\n  node scripts/sanity-kb.mjs unpack [--overwrite]\n  node scripts/sanity-kb.mjs build [--emit <file>]\n  node scripts/sanity-kb.mjs push [--live] [--only slugA,slugB] [--delete-all --yes] [--wipe-existing]\n  node scripts/sanity-kb.mjs covers [--live] [--only slugA,slugB]\n  node scripts/sanity-kb.mjs restore [--from <file>] [--live]\n\nPublishing needs SANITY_WRITE_TOKEN in .env. Without --live, Sanity validates the mutations and writes nothing.",
  )
}
