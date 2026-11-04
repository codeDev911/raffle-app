/**
 * Sanity knowledge-base content tool.
 *
 *   node scripts/sanity-kb.mjs export [--out <file>]
 *        Backup every article document to JSON. Public read, no token needed.
 *   node scripts/sanity-kb.mjs build
 *        Parse content/knowledge-base/*.md and report what would be published. No token needed.
 *   node scripts/sanity-kb.mjs push [--live] [--wipe-existing] [--delete-all --yes]
 *        Publish. Sanity validates without writing unless --live is present.
 *        --delete-all first removes every existing article document (backs up with `export` first).
 *        Requires SANITY_WRITE_TOKEN in .env (a read token cannot mutate).
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

const ROOT = process.cwd()
const CONTENT_DIR = path.join(ROOT, "content", "knowledge-base")
const BACKUP_DIR = path.join(ROOT, ".backups")

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
} else if (command === "push") {
  const live = flag("live")
  describeTarget()
  const articles = loadArticles()
  validateCrossLinks(articles)
  const mutations = []

  if (flag("delete-all")) {
    // Irreversible, so it asks twice: an explicit confirmation and a backup to roll back to.
    if (!flag("yes")) throw new Error("--delete-all removes every article document. Re-run with --yes to confirm.")
    const backups = fs.existsSync(BACKUP_DIR) ? fs.readdirSync(BACKUP_DIR).filter((f) => f.startsWith(`sanity-${DOC_TYPE}-`)).sort() : []
    if (!backups.length && !flag("force")) {
      throw new Error(`Nothing in .backups to roll back to. Run \`node scripts/sanity-kb.mjs export\` first, or pass --force.`)
    }
    const doomed = await groq(`*[_type == $t]._id`, { t: DOC_TYPE })
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
    "Usage:\n  node scripts/sanity-kb.mjs export [--out <file>]\n  node scripts/sanity-kb.mjs build [--emit <file>]\n  node scripts/sanity-kb.mjs push [--live] [--delete-all --yes] [--wipe-existing]\n  node scripts/sanity-kb.mjs restore [--from <file>] [--live]\n\nPublishing needs SANITY_WRITE_TOKEN in .env. Without --live, Sanity validates the mutations and writes nothing.",
  )
}
