"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Trophy, Shield, CreditCard, Smartphone, Plus, Minus, Wallet } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Raffle {
  id: string
  title: string
  price: number
  totalEntries: number
  currentEntries: number
}

interface EnterRaffleModalProps {
  raffle: Raffle
  isOpen: boolean
  onClose: () => void
}

export function EnterRaffleModal({ raffle, isOpen, onClose }: EnterRaffleModalProps) {
  const [entries, setEntries] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("CARD")
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const totalCost = (raffle.price * entries) / 100

  const handleSubmit = async () => {
    if (raffle.currentEntries + entries > raffle.totalEntries) {
      alert("Not enough entries available!")
      return
    }

    setSubmitting(true)
    try {
      console.log("Sending payment data:", {
        raffleId: raffle.id,
        quantity: entries,
        method: paymentMethod, // Make sure we're sending 'method' not 'paymentMethod'
      })

      const response = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raffleId: raffle.id,
          quantity: entries,
          method: paymentMethod, // Changed from paymentMethod to method
        }),
      })

      const data = await response.json()
      console.log("Payment response:", data)

      if (response.ok) {
        // Redirect to Paymob payment page
        window.location.href = data.paymentUrl
      } else {
        console.error("Payment error:", data)
        alert(data.error || "Payment initiation failed")
      }
    } catch (error) {
      console.error("Network error:", error)
      alert("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Trophy className="mr-2 h-5 w-5 text-green-500" />
            Enter This Raffle
          </DialogTitle>
          <DialogDescription>
            Select number of entries and payment method for <strong>{raffle.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Entry Count */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Number of Entries</Label>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setEntries(Math.max(1, entries - 1))}
                className="rounded-2xl"
                disabled={entries <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <Input
                  type="number"
                  value={entries}
                  onChange={(e) => setEntries(Math.max(1, Number.parseInt(e.target.value) || 1))}
                  className="text-center text-lg font-bold rounded-2xl"
                  min="1"
                  max="10"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setEntries(Math.min(10, entries + 1))}
                className="rounded-2xl"
                disabled={entries >= 10}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-500">Maximum 10 entries per person</p>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Payment Method</Label>
            <RadioGroup className="grid md:grid-cols-2 grid-cols-2" value={paymentMethod} onValueChange={setPaymentMethod}>
              
              <div className="flex items-center space-x-3 p-4 border rounded-2xl hover:bg-gray-50 transition-colors">
                <RadioGroupItem value="EASYPAISA" id="easypaisa" />
                <Label htmlFor="easypaisa" className="flex items-center space-x-3 cursor-pointer flex-1">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">EasyPaisa</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border rounded-2xl hover:bg-gray-50 transition-colors">
                <RadioGroupItem value="JAZZCASH" id="jazzcash" />
                <Label htmlFor="jazzcash" className="flex items-center space-x-3 cursor-pointer flex-1">
                  <Wallet className="h-5 w-5 text-orange-600" />
                  <div>
                    <div className="font-medium">JazzCash</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border rounded-2xl hover:bg-gray-50 transition-colors">
                <RadioGroupItem value="CARD" id="card" />
                <Label htmlFor="card" className="flex items-center space-x-3 cursor-pointer flex-1">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="font-medium">Card</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Total Cost */}
          <div className="bg-green-50 p-4 rounded-2xl">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Total Cost:</span>
              <span className="text-2xl font-bold text-green-500">PKR {totalCost.toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {entries} {entries === 1 ? "entry" : "entries"} × {formatCurrency(raffle.price)} each
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1 rounded-2xl py-6" disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-2xl py-6 font-medium"
            >
              <Shield className="mr-2 h-4 w-4" />
              {submitting ? "Processing..." : `Pay PKR ${totalCost.toLocaleString()}`}
            </Button>
          </div>

          <div className="flex items-center justify-center text-sm text-gray-500">
            <Shield className="w-4 h-4 mr-1" />
            Powered by Paymob - 100% Secure Payment
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
