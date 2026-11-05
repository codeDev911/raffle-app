import Link from "next/link"
import { ArrowRight, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Guide {
  slug: string
  label: string
  blurb: string
}

/**
 * The operational guides written for this dashboard.
 *
 * Slugs are the deterministic document ids the knowledge-base pipeline publishes (`kb-<slug>`), so a
 * link here only breaks if an article is deliberately renamed — re-titling an article leaves these
 * links working. Each destination is a public, indexable page: the merchant does not have to be
 * logged in to read it, and neither does their staff member.
 */
export const GUIDES: Record<"shopify" | "campaign" | "invoice" | "refunds", Guide> = {
  shopify: { slug: "how-to-set-up-shopify", label: "Set up Shopify", blurb: "topics, secret, widget" },
  campaign: { slug: "how-to-create-your-first-campaign", label: "First campaign", blurb: "rule, cap, test order" },
  invoice: { slug: "how-to-pay-your-merchant-invoice", label: "Paying an invoice", blurb: "checkout or transfer" },
  refunds: { slug: "how-refunds-work-for-merchants", label: "Refunds and returns", blurb: "void, credit, payout" },
}

/** One-line prompt toward the guides, placed where the merchant is about to do the thing. */
export function GuideStrip({
  guides,
  title = "Related guides",
  className,
}: {
  guides: Guide[]
  title?: string
  className?: string
}) {
  if (guides.length === 0) return null
  return (
    <div className={cn("flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3", className)}>
      <span className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        <BookOpen className="h-3.5 w-3.5" /> {title}
      </span>
      <ul className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-1.5">
        {guides.map((guide) => (
          <li key={guide.slug}>
            <Link
              href={`/knowledge-base/${guide.slug}`}
              className="group inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 transition hover:text-emerald-800"
            >
              {guide.label}
              <span className="hidden font-normal text-slate-400 sm:inline">· {guide.blurb}</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
