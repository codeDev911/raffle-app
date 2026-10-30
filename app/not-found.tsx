import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { BrandMark } from "@/components/brand"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl border border-gray-200/80 shadow-xs">
        <BrandMark className="mx-auto h-16 w-16 rounded-3xl" />
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-gray-900">404</h1>
          <h2 className="text-lg font-bold text-gray-800">Page Not Found</h2>
          <p className="text-xs text-gray-500">
            The lucky draw page or resource you are looking for does not exist or has been moved.
          </p>
        </div>
        <div className="pt-2">
          <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-11 px-6 shadow-xs">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Homepage
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
