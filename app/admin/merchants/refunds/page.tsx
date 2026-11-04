import type { Metadata } from "next"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import RefundsAdminClient from "./RefundsAdminClient"

export const metadata: Metadata = {
  title: "Merchant refunds · Admin",
}

export default function AdminMerchantRefundsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-red-600" />
        </div>
      }
    >
      <RefundsAdminClient />
    </Suspense>
  )
}
