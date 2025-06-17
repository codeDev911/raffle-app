"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Crown, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

interface WinnerSelectionDialogProps {
  raffleId: string
  totalEntries: number
}

export function WinnerSelectionDialog({ raffleId, totalEntries }: WinnerSelectionDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentNumber, setCurrentNumber] = useState(1)
  const [selectedWinner, setSelectedWinner] = useState<number | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const router = useRouter()

  const startSelection = async () => {
    setIsSelecting(true)
    setIsAnimating(true)
    setSelectedWinner(null)

    // Animation: rapidly change numbers for 3-5 seconds
    const animationDuration = 3000 + Math.random() * 2000 // 3-5 seconds
    const intervalSpeed = 50 // Change number every 50ms
    const totalSteps = animationDuration / intervalSpeed

    let step = 0
    const interval = setInterval(() => {
      setCurrentNumber(Math.floor(Math.random() * totalEntries) + 1)
      step++

      if (step >= totalSteps) {
        clearInterval(interval)
        // Final selection
        const finalWinner = Math.floor(Math.random() * totalEntries) + 1
        setCurrentNumber(finalWinner)
        setSelectedWinner(finalWinner)
        setIsAnimating(false)

        // Create winner in database
        createWinner(finalWinner)
      }
    }, intervalSpeed)
  }

  const createWinner = async (entryNumber: number) => {
    try {
      const response = await fetch(`/api/raffles/${raffleId}/select-winner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryNumber }),
      })

      if (response.ok) {
        // Winner created successfully
        console.log("Winner selected successfully")
      } else {
        console.error("Failed to create winner")
      }
    } catch (error) {
      console.error("Error creating winner:", error)
    }
  }

  const viewWinner = () => {
    setIsOpen(false)
    router.push(`/admin/raffles/${raffleId}/winner`)
    router.refresh()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-green-500 hover:bg-green-600 text-white rounded-2xl">
          <Crown className="mr-2 h-4 w-4" />
          Choose a Winner
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center text-2xl">
            <Crown className="mr-2 h-6 w-6 text-yellow-500" />
            Winner Selection
          </DialogTitle>
          <DialogDescription className="text-center">
            Click the button below to randomly select a winner from {totalEntries} entries
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-8 py-8">
          {/* Number Display */}
          <div className="relative">
            <div
              className={`w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-4xl font-bold text-white shadow-2xl transition-all duration-200 ${
                isAnimating ? "animate-pulse scale-110" : "scale-100"
              }`}
            >
              {currentNumber}
            </div>
            {isAnimating && (
              <div className="absolute -inset-4 rounded-full bg-yellow-400 opacity-30 animate-ping"></div>
            )}
            {selectedWinner && (
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-8 w-8 text-yellow-500 animate-bounce" />
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="text-center space-y-4">
            {!isSelecting && !selectedWinner && (
              <Button
                onClick={startSelection}
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-white rounded-full px-12 py-6 text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Click to Select!
              </Button>
            )}

            {isAnimating && (
              <div className="space-y-2">
                <div className="text-lg font-semibold text-gray-700">Selecting Winner...</div>
                <div className="text-sm text-gray-500">Please wait while we pick a random entry</div>
              </div>
            )}

            {selectedWinner && !isAnimating && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-yellow-600">🎉 Winner Selected! 🎉</div>
                  <div className="text-lg text-gray-700">Entry #{selectedWinner} has been chosen as the winner!</div>
                </div>
                <Button
                  onClick={viewWinner}
                  size="lg"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-2xl px-8 py-3"
                >
                  <Crown className="mr-2 h-5 w-5" />
                  View Winner
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
