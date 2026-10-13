"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ButtonProps {
  paymentId: string | null
  quantity: number | null
  raffleId: string | null
  status: string | null
  referralLinkId: any
}

const VerifyPaymentButton = ({
  paymentId,
  quantity,
  raffleId,
  status,
  referralLinkId,
}: ButtonProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const verifyPayment = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/payments/callback", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId,
          status: "COMPLETED",
          quantity,
          raffleId,
          referralLinkId,
        }),
      })

      if (res.ok) {
        toast.success("Payment verified and marked as COMPLETED successfully!")
        router.refresh()
      } else {
        const errorData = await res.json().catch(() => ({}))
        toast.error(errorData.error || "Failed to verify payment")
      }
    } catch (error) {
      console.error("Payment verification error:", error)
      toast.error("An error occurred during verification. Please check console.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={verifyPayment}
      disabled={isLoading}
      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl h-10 shadow-xs transition-colors flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Verifying Transaction...</span>
        </>
      ) : (
        <>
          <CheckCircle2 className="w-4 h-4" />
          <span>Verify & Approve Payment</span>
        </>
      )}
    </Button>
  )
}

export default VerifyPaymentButton