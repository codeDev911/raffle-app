"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import Link from "next/link"

export default function PaymentCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading")
  const [message, setMessage] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get all search params and convert to object
        const params: Record<string, string> = {}
        searchParams.forEach((value, key) => {
          params[key] = value
        })

        const response = await fetch("/api/payments/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        })

        const data = await response.json()

        if (data.success) {
          setStatus("success")
          setMessage(data.message || "Payment successful! Your entries have been added.")
        } else {
          setStatus("failed")
          setMessage(data.message || "Payment failed. Please try again.")
        }
      } catch (error) {
        setStatus("failed")
        setMessage("An error occurred while processing your payment.")
      }
    }

    processCallback()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md rounded-2xl shadow-lg border-0">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === "loading" && (
              <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center">
                <Clock className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            )}
            {status === "success" && (
              <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            )}
            {status === "failed" && (
              <div className="bg-red-100 w-16 h-16 rounded-2xl flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {status === "loading" && "Processing Payment..."}
            {status === "success" && "Payment Successful!"}
            {status === "failed" && "Payment Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-gray-600">{message}</p>

          <div className="space-y-3">
            {status === "success" && (
              <>
                <Button asChild className="w-full bg-green-500 hover:bg-green-600 text-white rounded-2xl">
                  <Link href="/raffles">Browse More Raffles</Link>
                </Button>
                <Button asChild variant="outline" className="w-full rounded-2xl">
                  <Link href="/profile">View My Entries</Link>
                </Button>
              </>
            )}

            {status === "failed" && (
              <>
                <Button asChild className="w-full bg-red-500 hover:bg-red-600 text-white rounded-2xl">
                  <Link href="/raffles">Try Again</Link>
                </Button>
                <Button asChild variant="outline" className="w-full rounded-2xl">
                  <Link href="/contact">Contact Support</Link>
                </Button>
              </>
            )}

            {status === "loading" && (
              <div className="text-sm text-gray-500">Please wait while we process your payment...</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
