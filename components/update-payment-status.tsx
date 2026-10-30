"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface UpdatePaymentStatusProps {
  paymentId: string
  currentStatus: string
}

const OPEN_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
]

export function UpdatePaymentStatus({ paymentId, currentStatus }: UpdatePaymentStatusProps) {
  const [status, setStatus] = useState(currentStatus)
  const [isLoading, setIsLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const router = useRouter()

  // Once money has been verified, the only meaningful move left is handing it back.
  const isVerified = currentStatus === "COMPLETED"
  const statusOptions = isVerified
    ? [
        { value: "COMPLETED", label: "Completed (verified)" },
        { value: "REFUNDED", label: "Refunded" },
      ]
    : OPEN_OPTIONS

  const selectStatus = (value: string) => {
    setConfirming(false)
    setStatus(value)
  }

  const handleUpdateStatus = async () => {
    if (status === currentStatus) return

    // Refunding deletes the customer's raffle entry, so it takes a second click.
    if (status === "REFUNDED" && !confirming) {
      setConfirming(true)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/payments/${paymentId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast.success(
          status === "REFUNDED"
            ? "Payment refunded — the customer's raffle entry has been withdrawn"
            : "Payment status updated successfully",
        )
        setConfirming(false)
        router.refresh()
      } else {
        const payload = await response.json().catch(() => null)
        toast.error(payload?.error || "Failed to update payment status")
      }
    } catch (error) {
      toast.error("An error occurred while updating payment status")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Select value={status} onValueChange={selectStatus}>
        <SelectTrigger className="rounded-2xl">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isVerified && (
        <p className="text-[11px] leading-relaxed text-slate-500">
          This payment is already verified. It can be refunded, but not moved back to an open state.
        </p>
      )}

      {status === "REFUNDED" && (
        <div className="space-y-1.5 rounded-xl border border-rose-200 bg-rose-50 p-3">
          <p className="text-xs font-bold text-rose-800">
            {confirming ? "Click again to confirm the refund" : "Refunding removes the customer from the draw"}
          </p>
          <p className="text-[11px] leading-relaxed text-rose-700">
            The raffle entry is deleted and the raffle&apos;s ticket counter is adjusted. The merchant refund is the
            ticket price minus the gateway charge of <strong>2.9% + Rs. 30</strong>.
          </p>
        </div>
      )}

      <Button
        onClick={handleUpdateStatus}
        disabled={status === currentStatus || isLoading}
        className={`w-full rounded-2xl ${
          status === "REFUNDED" && confirming
            ? "bg-rose-600 hover:bg-rose-700"
            : "bg-red-500 hover:bg-red-600"
        }`}
      >
        {isLoading
          ? "Updating..."
          : status === "REFUNDED"
            ? confirming
              ? "Confirm refund"
              : "Refund payment"
            : "Update Status"}
      </Button>
    </div>
  )
}
