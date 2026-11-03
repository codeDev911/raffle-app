import type { Metadata } from "next"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import InvoiceDetailClient from "./InvoiceDetailClient"

export const metadata: Metadata = {
  title: "Settlement detail · Admin",
  description: "Merchant batch invoice: evidence, ledger lines, pay-in accounts and admin notes.",
}

export default function AdminMerchantInvoiceDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-red-600" />
        </div>
      }
    >
      <InvoiceDetailClient params={params} />
    </Suspense>
  )
}
