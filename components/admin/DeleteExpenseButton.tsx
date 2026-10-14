"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface DeleteExpenseButtonProps {
  raffleId: string
  expenseId: string
  expenseDesc: string
}

export function DeleteExpenseButton({
  raffleId,
  expenseId,
  expenseDesc,
}: DeleteExpenseButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`Are you sure you want to remove "${expenseDesc}"?`)) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch(
        `/api/raffles/${raffleId}/expenses?expenseId=${encodeURIComponent(expenseId)}`,
        { method: "DELETE" }
      )
      if (!res.ok) {
        throw new Error("Failed to delete expense")
      }
      toast.success(`Removed expense "${expenseDesc}"`)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Failed to remove expense")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-amber-700/60 hover:text-rose-600 transition-colors p-0.5 rounded hover:bg-rose-50"
      title="Delete expense"
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin text-rose-500" />
      ) : (
        <Trash2 className="w-3 h-3" />
      )}
    </button>
  )
}
