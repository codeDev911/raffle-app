import type { Metadata } from "next"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import MerchantsAdminClient from "./MerchantsAdminClient"

export const metadata: Metadata = {
  title: "Merchant Connect · Admin",
}

export default function AdminMerchantsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-red-600" />
        </div>
      }
    >
      <MerchantsAdminClient />
    </Suspense>
  )
}
