"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface DeleteRaffleButtonProps {
  raffleId: string
}

export function DeleteRaffleButton({ raffleId }: DeleteRaffleButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this raffle?")) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/raffles/${raffleId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert("Failed to delete raffle")
      }
    } catch (error) {
      alert("Error deleting raffle")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="rounded-2xl text-red-600 hover:text-red-700"
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
