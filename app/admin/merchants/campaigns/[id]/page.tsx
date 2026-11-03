import type { Metadata } from "next"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import CampaignDetailClient from "./CampaignDetailClient"

export const metadata: Metadata = {
  title: "Campaign detail · Admin",
  description: "Full merchant campaign record: rule, prize, ticket ledger, invoices and draw control.",
}

export default function AdminMerchantCampaignDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-red-600" />
        </div>
      }
    >
      <CampaignDetailClient params={params} />
    </Suspense>
  )
}
