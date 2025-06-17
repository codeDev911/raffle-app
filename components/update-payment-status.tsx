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

export function UpdatePaymentStatus({ paymentId, currentStatus }: UpdatePaymentStatusProps) {
  const [status, setStatus] = useState(currentStatus)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleUpdateStatus = async () => {
    if (status === currentStatus) return

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
        toast.success("Payment status updated successfully")
        router.refresh()
      } else {
        toast.error("Failed to update payment status")
      }
    } catch (error) {
      toast.error("An error occurred while updating payment status")
    } finally {
      setIsLoading(false)
    }
  }

  const statusOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "PROCESSING", label: "Processing" },
    { value: "COMPLETED", label: "Completed" },
    { value: "FAILED", label: "Failed" },
    { value: "REFUNDED", label: "Refunded" },
  ]

  return (
    <div className="space-y-3">
      <Select value={status} onValueChange={setStatus}>
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
      <Button
        onClick={handleUpdateStatus}
        disabled={status === currentStatus || isLoading}
        className="w-full rounded-2xl bg-red-500 hover:bg-red-600"
      >
        {isLoading ? "Updating..." : "Update Status"}
      </Button>
    </div>
  )
}
