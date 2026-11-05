/**
 * Knowledge-base cover art generator.
 *
 *   node scripts/kb-cover-art.mjs [--force] [--only slugA,slugB]
 *
 * Writes one 21:9 SVG per article into content/knowledge-base/images/<slug>.svg, drawn from the
 * palette the marketing pages already use (ink navy, emerald/teal blooms, violet counter-light and
 * a faint grid veil) so a cover reads as PakRaffle without needing a photographer or a model.
 *
 * Deterministic on purpose: same slug, same motif, same colours. Re-running after editing a title
 * changes nothing, and `node scripts/sanity-kb.mjs covers --live` uploads only the files whose bytes
 * actually changed. Motifs are geometric — no letterforms — because a rasterised title in the cover
 * goes stale the moment the article is re-titled.
 */
import fs from "node:fs"
import path from "node:path"

const ROOT = process.cwd()
const CONTENT_DIR = path.join(ROOT, "content", "knowledge-base")
const IMAGE_DIR = path.join(CONTENT_DIR, "images")
const W = 1600
const H = 672
const CX = W / 2
const CY = H / 2

const args = process.argv.slice(2)
const only = args.includes("--only") ? args[args.indexOf("--only") + 1].split(",").map((s) => s.trim()).filter(Boolean) : null
const force = args.includes("--force")

// ─────────────────────────────────────────────── primitives (motif space) ───────────────────────────────────────────────
// Every motif is authored inside a 480x480 box centred on (0,0), then scaled into the canvas.

/** Rounded outline. `width` is a real parameter, not an appended attribute: a duplicate
 *  stroke-width would make the file invalid XML and Sanity would refuse to process it. */
const rrect = (x, y, w, h, r, width = SW) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="none" stroke="url(#ink)" stroke-width="${width}" stroke-linejoin="round"/>`
const disc = (cx, cy, r, fill = "url(#ink)") => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`
const ring = (cx, cy, r, width = SW, dash = "") =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#ink)" stroke-width="${width}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`
const dot = (cx, cy, r = 11) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#5eead4"/>`
const stroke = (d, width = SW, cap = "round") =>
  `<path d="${d}" fill="none" stroke="url(#ink)" stroke-width="${width}" stroke-linecap="${cap}" stroke-linejoin="round"/>`
const line = (x1, y1, x2, y2, width = SW) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="url(#ink)" stroke-width="${width}" stroke-linecap="round"/>`
const poly = (points, fill = "url(#ink)") => `<polygon points="${points}" fill="${fill}"/>`
/** A dashed circular orbit, used as the "connected / polling" cue. */
const orbit = (cx, cy, r, dash = "4 26") => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#34d399" stroke-opacity=".55" stroke-width="5" stroke-dasharray="${dash}" stroke-linecap="round"/>`
/** Circular arrow: an arc swept `sweep` degrees from `from`, closed by a head at the far end. */
function arcArrow(cx, cy, r, from, sweep, head = 34) {
  const rad = (deg) => (deg * Math.PI) / 180
  const pt = (deg, radius) => [cx + radius * Math.cos(rad(deg)), cy + radius * Math.sin(rad(deg))]
  const [x1, y1] = pt(from, r)
  const [x2, y2] = pt(from + sweep, r)
  const large = Math.abs(sweep) > 180 ? 1 : 0
  const dir = sweep > 0 ? 1 : 0
  // The tangent of a circle at `from + sweep` is that radius turned a quarter-circle along the sweep.
  const tan = from + sweep + (sweep > 0 ? 90 : -90)
  const apex = [x2 + head * Math.cos(rad(tan)), y2 + head * Math.sin(rad(tan))]
  const wingA = [x2 + head * 0.72 * Math.cos(rad(tan + 142)), y2 + head * 0.72 * Math.sin(rad(tan + 142))]
  const wingB = [x2 + head * 0.72 * Math.cos(rad(tan - 142)), y2 + head * 0.72 * Math.sin(rad(tan - 142))]
  const f = (n) => n.toFixed(1)
  return (
    `<path d="M ${f(x1)} ${f(y1)} A ${r} ${r} 0 ${large} ${dir} ${f(x2)} ${f(y2)}" fill="none" stroke="url(#ink)" stroke-width="${SW}" stroke-linecap="round"/>` +
    `<polygon points="${f(apex[0])},${f(apex[1])} ${f(wingA[0])},${f(wingA[1])} ${f(wingB[0])},${f(wingB[1])}" fill="#5eead4"/>`
  )
}
/** Ticket shape: rounded body with two punched notches, the site's core object. */
const ticket = (x, y, w, h, notch = 16) =>
  rrect(x, y, w, h, 26) +
  `<circle cx="${x}" cy="${y + h / 2}" r="${notch}" fill="#0a1020"/><circle cx="${x + w}" cy="${y + h / 2}" r="${notch}" fill="#0a1020"/>` +
  `<line x1="${x + w * 0.66}" y1="${y + 14}" x2="${x + w * 0.66}" y2="${y + h - 14}" stroke="#34d399" stroke-opacity=".6" stroke-width="4" stroke-dasharray="10 12"/>`
const barSet = (x, y, n, len = 150, gap = 30, width = 12) =>
  Array.from({ length: n }, (_, i) => line(x, y + i * gap, x + len - i * 26, y + i * gap, width)).join("")

const SW = 15

// ─────────────────────────────────────────────────────────── motifs ───────────────────────────────────────────────────

const MOTIFS = {
  "how-to-set-up-shopify": () =>
    stroke("M -120 -46 L -104 116 Q -102 142 -76 142 L 76 142 Q 102 142 104 116 L 120 -46 Z") +
    stroke("M -62 -46 Q -62 -126 0 -126 Q 62 -126 62 -46") +
    orbit(0, 20, 210, "5 30") +
    dot(-196, -58) + dot(188, 44) + dot(-40, 208, 8),
  "how-to-create-your-first-campaign": () =>
    ring(0, 0, 196, 5, "3 34") + ring(0, 0, 140, 6, "3 22") + ticket(-92, -56, 184, 112) +
    line(-62, -20, 40, -20, 12) + line(-62, 14, 4, 14, 12) + dot(196, -150, 9) + poly("0,-236 26,-186 -26,-186"),
  "how-to-pay-your-merchant-invoice": () =>
    rrect(-186, -150, 232, 300, 26) + barSet(-146, -92, 4, 150, 46, 11) +
    rrect(-16, -74, 214, 132, 22) + `<rect x="26" y="-40" width="52" height="38" rx="8" fill="#34d399" fill-opacity=".8"/>` +
    line(-2, 26, 156, 26, 10) + disc(126, 132, 40, "url(#ink)") +
    stroke("M 108 132 L 121 146 L 146 118", 12, "round"),
  "how-refunds-work-for-merchants": () =>
    arcArrow(0, 0, 168, 210, 300) + ticket(-88, -50, 176, 100, 14) +
    line(-56, -14, 34, -14, 11) + line(-56, 18, 6, 18, 11) + dot(0, -168, 9),
  "merchant-connect-for-shopify-stores": () =>
    ring(-152, 0, 96, SW) + ring(152, 0, 96, SW) +
    line(-56, -34, 56, -34, 10) + line(-56, 34, 56, 34, 10) +
    stroke("M -152 -40 L -152 22 M -176 22 L -128 22", 11) +
    poly("-152,-70 -130,-30 -174,-30", "#5eead4") +
    disc(152, -18, 22, "url(#ink)") + stroke("M 130 24 Q 152 4 174 24", 11),
  "checking-a-store-ticket": () =>
    ticket(-170, -70, 250, 140) + ring(104, 44, 78, 16) + line(160, 100, 214, 154, 18) +
    line(-126, -14, 22, -14, 11) + line(-126, 22, -34, 22, 11),
  "affiliate-partner-programme-rates-payouts": () =>
    ring(-160, 0, 52, 13) + line(-108, -14, 96, -104, 10) + line(-108, 14, 96, 104, 10) +
    ring(140, -120, 46, 12) + ring(140, 120, 46, 12) +
    stroke("M 140 -140 L 140 -100 M 120 -120 L 160 -120", 9) + disc(-160, 0, 18, "#5eead4"),
  "contacting-support-and-response-times": () =>
    rrect(-190, -140, 300, 210, 44) + poly("-120,66 -120,140 -56,66") +
    ring(64, 40, 74, 13) + line(64, 40, 64, -8, 10) + line(64, 40, 100, 58, 10) + dot(64, 40, 8),
  "how-a-pakraffle-draw-works": () =>
    ring(0, -20, 150, SW) + stroke("M -150 -20 A 150 150 0 0 0 150 -20", 10) +
    disc(-58, -74, 26, "url(#ink)") + disc(28, -102, 22, "#5eead4") + disc(72, -34, 18, "#34d399") +
    disc(-8, 8, 24, "url(#ink)") + rrect(-64, 138, 128, 56, 14, 10),
  "how-to-enter-your-first-draw": () =>
    stroke("M -176 176 L -176 -50 A 176 176 0 0 1 176 -50 L 176 176", 14) +
    ticket(-80, 8, 160, 92, 13) + line(0, -180, 0, -108, 12) + poly("-22,-124 22,-124 0,-158") + dot(-176, 176, 10) + dot(176, 176, 10),
  "how-to-spot-a-raffle-scam": () =>
    stroke("M 0 -186 L 156 -128 L 156 40 Q 156 140 0 190 Q -156 140 -156 40 L -156 -128 Z") +
    stroke("M -86 6 Q 0 -74 86 6 Q 0 86 -86 6 Z", 12) + disc(0, 6, 26, "url(#ink)") + disc(0, 6, 11, "#0a1020"),
  "i-paid-but-my-tickets-are-not-showing": () =>
    rrect(-190, -150, 190, 300, 20) + barSet(-158, -96, 3, 120, 40, 10) +
    stroke("M -190 118 L -158 140 L -126 118 L -94 140 L -62 118 L -30 140", 10, "butt") +
    line(10, 0, 76, 0, 12) + poly("60,-22 100,0 60,22") +
    rrect(116, -76, 74, 152, 16, 9) + rrect(-4, 96, 74, 40, 12, 8),
  "if-you-win-verification-and-prize-handover": () =>
    stroke("M -150 -60 L 0 -140 L 150 -60 L 150 70 L 0 150 L -150 70 Z") +
    line(-150, -60, 0, 20, 10) + line(150, -60, 0, 20, 10) + line(0, 20, 0, 150, 10) +
    disc(96, -120, 46, "url(#ink)") + stroke("M 76 -120 L 92 -104 L 118 -136", 12),
  "listing-your-product-as-a-raffle": () =>
    rrect(-104, -168, 208, 150, 18) + line(-104, -96, 104, -96, 10) +
    stroke("M -170 40 L -120 -18 L 120 -18 L 170 40 Z", 12) + line(-210, 120, 210, 120, 14) +
    stroke("M -60 -168 Q 0 -230 60 -168", 11) + dot(0, 168, 10),
  "live-draws-and-how-winners-are-selected": () =>
    rrect(-196, -140, 392, 240, 30) + poly("-34,-58 66,20 -34,98") +
    arcArrow(0, 120, 190, 190, 60, 26) + dot(-196, -140, 9) + dot(196, -140, 9) + line(-120, 150, 120, 150, 8),
  "payment-methods-and-your-transaction-id": () =>
    rrect(-190, -90, 250, 190, 30) + stroke("M -190 -40 L -110 -40 L -96 -12 L -190 -12", 11) +
    disc(100, 12, 44, "url(#ink)") +
    rrect(96, -160, 130, 260, 24) + line(120, -130, 200, -130, 8) +
    barSet(126, 40, 3, 74, 26, 9),
  "refunds-and-entry-finality": () =>
    ring(0, -20, 140, 12) + ring(0, -20, 108, 6, "6 18") +
    stroke("M -52 -20 L -12 26 L 60 -58", 20) + rrect(-120, 132, 240, 44, 22, 10),
  "your-account-profile-and-personal-data": () =>
    rrect(-200, -130, 400, 260, 30) + disc(-120, -30, 52, "url(#ink)") +
    stroke("M -160 60 Q -120 6 -80 60", 12) + line(-24, -46, 140, -46, 11) + line(-24, 0, 100, 0, 11) +
    rrect(96, 44, 96, 78, 14, 10) + stroke("M 120 44 L 120 24 A 24 24 0 0 1 168 24 L 168 44", 10),
  "your-ticket-receipt-and-proof-of-entry": () =>
    ticket(-186, -104, 240, 150, 15) +
    `<g transform="rotate(-8 60 60)">` + ticket(-40, -20, 240, 150, 15) + `</g>` +
    barSet(-146, -56, 2, 120, 34, 10) + stroke("M 60 40 L 90 74 L 150 6", 13),
}

/** Hue pairs per article so the library reads as a set without being monotone. */
const PALETTE = {
  violet: { bloomA: "#10b981", bloomB: "#8b5cf6", ink0: "#a7f3d0", ink1: "#34d399" },
  sky: { bloomA: "#0ea5e9", bloomB: "#10b981", ink0: "#bae6fd", ink1: "#38bdf8" },
  gold: { bloomA: "#f59e0b", bloomB: "#10b981", ink0: "#fde68a", ink1: "#f59e0b" },
}
const PALETTE_OF = {
  "how-to-spot-a-raffle-scam": "gold",
  "how-to-enter-your-first-draw": "sky",
  "live-draws-and-how-winners-are-selected": "sky",
  "payment-methods-and-your-transaction-id": "sky",
  "i-paid-but-my-tickets-are-not-showing": "gold",
  "refunds-and-entry-finality": "violet",
  "affiliate-partner-programme-rates-payouts": "violet",
}

/* --------------------------------------------------------------------- canvas */

function slugTitle(slug) {
  const file = path.join(CONTENT_DIR, `${slug}.md`)
  if (!fs.existsSync(file)) return ""
  const m = /^title:\s*(.+)$/m.exec(fs.readFileSync(file, "utf8"))
  return m ? m[1].trim() : ""
}

function svgFor(slug) {
  const motif = MOTIFS[slug]
  if (!motif) return null
  const pal = PALETTE[PALETTE_OF[slug] || "violet"]
  const title = slugTitle(slug) || slug.replace(/-/g, " ")
  const veil = Array.from({ length: 29 }, (_, i) => `<line x1="${i * 58}" y1="0" x2="${i * 58}" y2="${H}" stroke="#ffffff" stroke-opacity=".045" stroke-width="1"/>`).join("")
  const veilH = Array.from({ length: 12 }, (_, i) => `<line x1="0" y1="${i * 58}" x2="${W}" y2="${i * 58}" stroke="#ffffff" stroke-opacity=".045" stroke-width="1"/>`).join("")

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t">
  <title id="t">${title}</title>
  <defs>
    <linearGradient id="base" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0b1424"/><stop offset="0.55" stop-color="#0a1020"/><stop offset="1" stop-color="#060a14"/>
    </linearGradient>
    <radialGradient id="bloomA" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${pal.bloomA}" stop-opacity=".38"/><stop offset="1" stop-color="${pal.bloomA}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="bloomB" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${pal.bloomB}" stop-opacity=".30"/><stop offset="1" stop-color="${pal.bloomB}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="ink" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${pal.ink0}"/><stop offset="1" stop-color="${pal.ink1}"/>
    </linearGradient>
    <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="12" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#base)"/>
  <g>${veil}${veilH}</g>
  <circle cx="330" cy="150" r="470" fill="url(#bloomA)"/>
  <circle cx="1330" cy="560" r="430" fill="url(#bloomB)"/>

  <g transform="translate(${CX} ${CY}) scale(0.92)" filter="url(#glow)" opacity=".96">${motif()}</g>
  <g opacity=".5">${ring(CX - 470, CY, 3, 3)}${ring(CX + 470, CY, 3, 3)}</g>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="#ffffff" stroke-opacity=".07"/>
</svg>
`
}

/**
 * Cheap well-formedness guard. Writing the same attribute twice on one element produces XML that
 * Sanity answers with a bare 422 "Invalid image", so the mistake is caught here instead — at the
 * element that caused it.
 */
function assertWellFormed(svg, slug) {
  for (const tag of svg.match(/<[a-zA-Z]+[^>]*>/g) || []) {
    const names = [...tag.matchAll(/([\w-]+)=/g)].map((m) => m[1])
    const duplicate = names.find((name, index) => names.indexOf(name) !== index)
    if (duplicate) throw new Error(`${slug}: duplicate "${duplicate}" attribute in ${tag.slice(0, 90)}`)
    if (/NaN|undefined/.test(tag)) throw new Error(`${slug}: uncomputed number in ${tag.slice(0, 90)}`)
  }
}

/* ----------------------------------------------------------------------- main */

const slugs = (only && only.length ? only : Object.keys(MOTIFS)).filter((s) => MOTIFS[s])
if (only) {
  const unknown = only.filter((s) => !MOTIFS[s])
  if (unknown.length) console.error(`No motif defined for: ${unknown.join(", ")}`)
}

fs.mkdirSync(IMAGE_DIR, { recursive: true })
let written = 0
let skipped = 0
for (const slug of slugs) {
  const file = path.join(IMAGE_DIR, `${slug}.svg`)
  if (fs.existsSync(file) && !force) {
    skipped += 1
    continue
  }
  const svg = svgFor(slug)
  if (!svg) {
    console.warn(`  ! ${slug}: no motif`)
    continue
  }
  assertWellFormed(svg, slug)
  fs.writeFileSync(file, svg, "utf8")
  written += 1
  console.log(`  wrote ${slug}.svg (${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB)`)
}
console.log(
  `\n${written} cover(s) written to content/knowledge-base/images${skipped ? ` · ${skipped} already present (use --force to redraw)` : ""}.` +
    `\nDefined motifs: ${Object.keys(MOTIFS).length}. Next: node scripts/sanity-kb.mjs covers --live`,
)
