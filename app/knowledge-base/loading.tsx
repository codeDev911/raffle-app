import { CONTAINER } from "@/components/marketing/kit"

/** Suspense fallback for client-side navigation into the help centre. Mirrors the hero and card grid. */
export default function KnowledgeBaseLoading() {
  return (
    <div className="relative isolate min-h-screen bg-[#f8f9f6]">
      <div className="border-b border-slate-900/5 bg-white/40">
        <div className={`${CONTAINER} py-24 sm:py-28`}>
          <div className="mx-auto max-w-2xl space-y-5 text-center">
            <div className="mx-auto h-3 w-40 rounded-full bg-slate-900/[0.06]" />
            <div className="mx-auto h-10 w-full max-w-md rounded-2xl bg-slate-900/[0.06]" />
            <div className="mx-auto h-4 w-full max-w-sm rounded-full bg-slate-900/[0.05]" />
            <div className="mx-auto h-[52px] w-full max-w-xl rounded-2xl bg-slate-900/[0.05]" />
          </div>
        </div>
      </div>
      <div className={`${CONTAINER} grid gap-3 py-14 sm:grid-cols-2 lg:grid-cols-3`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-44 rounded-3xl border border-slate-900/5 bg-white/60" />
        ))}
      </div>
      <p className="pb-16 text-center text-[12px] font-medium text-slate-500">Loading articles…</p>
    </div>
  )
}
