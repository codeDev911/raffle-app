import type { ReactNode } from "react"
import { dimensionsFromSanityUrl, sanityImageUrl, type PtBlock, type PtMarkDef, type PtSpan } from "@/lib/sanity"

/**
 * A small Portable Text renderer, written by hand instead of pulling in `@portabletext/react`: the
 * knowledge base is server-rendered, so this costs the visitor no JavaScript and adds no dependency.
 *
 * It covers exactly what Sanity's blog schema produces — blocks with `style` (h1–h4, blockquote,
 * normal), list items carrying `list` ("bullet" | "number"), spans with `strong` / `em` / `code` marks
 * and link mark definitions, and image blocks. Anything unrecognised still renders its text rather
 * than vanishing, because losing a sentence of a help article is worse than losing its formatting.
 */

const BLOCK_ELEMENT: Record<string, "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "blockquote"> = {
  normal: "p",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  blockquote: "blockquote",
}

/** Only web-safe schemes: a pasted `javascript:` href must never reach an anchor. */
function safeHref(href: string | undefined): string | null {
  const value = (href || "").trim()
  if (!value) return null
  if (/^(javascript|data|vbscript):/i.test(value)) return null
  if (value.startsWith("#") || value.startsWith("/")) return value
  if (!/^https?:\/\//i.test(value) && !/^mailto:/i.test(value) && !/^tel:/i.test(value)) return null
  return value
}

const isExternal = (href: string) => /^https?:\/\//i.test(href) || /^mailto:/i.test(href) || /^tel:/i.test(href)

/** Sanity stores line breaks inside a span's text, so they have to come back out as <br />. */
function withLineBreaks(text: string, keyPrefix: string): ReactNode {
  const lines = text.split("\n")
  if (lines.length === 1) return text
  return lines.flatMap((line, index) => (index === 0 ? [line] : [<br key={`${keyPrefix}-br-${index}`} />, line]))
}

function renderSpan(span: PtSpan, markDefs: PtMarkDef[], index: number): ReactNode {
  if (span._type !== "span" && span.text === undefined) return null
  let node: ReactNode = withLineBreaks(span.text ?? "", `s${index}`)

  for (const mark of span.marks ?? []) {
    const definition = markDefs.find((candidate) => candidate._key === mark)
    if (mark === "strong" || mark === "b") {
      node = <strong>{node}</strong>
    } else if (mark === "em" || mark === "i") {
      node = <em>{node}</em>
    } else if (mark === "code") {
      node = <code>{node}</code>
    } else if (definition?._type === "link") {
      const href = safeHref(definition.href)
      // A rejected href still keeps the words; only the anchor is dropped.
      node = href ? (
        <a href={href} rel="noopener noreferrer" target={isExternal(href) ? "_blank" : undefined}>
          {node}
        </a>
      ) : node
    }
  }

  return node
}

function renderImage(block: PtBlock, index: number): ReactNode {
  const url = (block.url || "").trim()
  if (!url) return null
  const sized = sanityImageUrl(url, { width: 1100 })
  const natural = dimensionsFromSanityUrl(url)
  const width = natural?.width || block.w || undefined
  const height = natural?.height || block.h || undefined
  const alt = (block.alt || block.caption || "").trim()

  const image = <img src={sized} alt={alt} width={width} height={height} loading="lazy" className="h-auto w-full rounded-2xl border border-slate-900/10" />

  if (!block.caption) return <figure key={block._key ?? `image-${index}`}>{image}</figure>
  return (
    <figure key={block._key ?? `image-${index}`}>
      {image}
      <figcaption className="mt-2 text-[12.5px] leading-relaxed text-slate-500">{block.caption}</figcaption>
    </figure>
  )
}

/** A block's children, wrapped per span so marks nest without React complaining about keys. */
function blockChildren(block: PtBlock, index: number): ReactNode[] {
  return (block.children ?? []).map((span, spanIndex) => (
    <span key={span._key ?? `c${index}-${spanIndex}`}>{renderSpan(span, block.markDefs ?? [], spanIndex)}</span>
  ))
}

/** An unknown style still renders as a paragraph, so no sentence of an article is ever dropped. */
function renderBlock(block: PtBlock, index: number): ReactNode {
  const children = blockChildren(block, index)
  if (!children.length) return null
  const Tag = BLOCK_ELEMENT[block.style || "normal"] || "p"
  return <Tag key={block._key ?? `b${index}`}>{children}</Tag>
}

/**
 * Consecutive list items become one real <ul>/<ol>. Sanity stores a list as flat blocks with a `list`
 * flag, so without this grouping a ten-step procedure arrives as ten unnumbered paragraphs.
 */
function renderList(items: PtBlock[], type: string, start: number): ReactNode {
  const children = items.map((block, i) => {
    const inner = blockChildren(block, start + i)
    return <li key={block._key ?? `li${start}-${i}`}>{inner}</li>
  })
  const classes = "my-4 space-y-2 pl-6 " + (type === "number" ? "list-decimal" : "list-disc")
  return type === "number" ? (
    <ol className={classes} key={`ol${start}`}>
      {children}
    </ol>
  ) : (
    <ul className={classes} key={`ul${start}`}>
      {children}
    </ul>
  )
}

export function PortableText({ blocks, className }: { blocks: PtBlock[] | undefined; className?: string }) {
  const source = blocks ?? []
  const nodes: ReactNode[] = []

  for (let index = 0; index < source.length; index++) {
    const block = source[index]
    if (block._type === "image") {
      nodes.push(renderImage(block, index))
      continue
    }
    if (block.list) {
      // Absorb the whole run of same-kind items so numbering restarts per list, not per block.
      const items: PtBlock[] = []
      while (index < source.length && source[index].list === block.list && source[index]._type === "block") {
        items.push(source[index])
        index++
      }
      index--
      nodes.push(renderList(items, block.list, index - items.length + 1))
      continue
    }
    nodes.push(renderBlock(block, index))
  }

  return <div className={className}>{nodes}</div>
}

/** Flattens the same blocks to plain text, for meta descriptions and search. */
export function portableTextToText(blocks: PtBlock[] | undefined): string {
  return (blocks ?? [])
    .map((block) => (block.children ?? []).map((span) => span.text ?? "").join(" "))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
}
