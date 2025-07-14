"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trophy, Shield, CreditCard,  Plus, Minus, Wallet } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select"
import EasypaisaIcon  from "@/public/assets/easypaisa-logo.png"
import NayapayIcon  from "@/public/assets/nayapay.png"
import JAzzcashIcon  from "@/public/assets/jazzcash-logo.png"
import Image from "next/image"
interface Raffle {
  id: string
  title: string
  price: number
  totalEntries: number
  currentEntries: number
}

interface EnterRaffleModalProps {
  raffle: Raffle
  referralLinkId:string | boolean,
  isOpen: boolean
  onClose: () => void
}

const paymentMethods = [
  {
    id:"EASYPAISA",
    icon:EasypaisaIcon,
    title:"Easypaisa",
    disabled :false
  },
  {
    id:"NAYAPAY",
    icon:NayapayIcon,
    title:"Nayapay",
    disabled :false
  },
  {
    id:"JAZZCASH",
    icon:JAzzcashIcon,
    title:"Jazzcash",
    disabled :false
  }, 
]

export function EnterRaffleModal({ raffle, isOpen, onClose,referralLinkId }: EnterRaffleModalProps) {
  const [entries, setEntries] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("EASYPAISA")
  const [submitting, setSubmitting] = useState(false)

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

      const response = await fetch(`/api/payments/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raffleId: raffle.id,
          quantity: entries,
          referralLinkId:referralLinkId,
          method: paymentMethod, // Changed from paymentMethod to method
        }),
      })

      const data = await response.json()

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
                  className="text-center  text-lg font-bold rounded-2xl"
                  min="1"
                  autoFocus={false}
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
            <Select  value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="w-full">
                <Image
                  src={
                    typeof paymentMethods.filter((method: any) => method.id == paymentMethod)[0].icon === "string"
                      ? paymentMethods.filter((method: any) => method.id == paymentMethod)[0].icon
                      : (paymentMethods.filter((method: any) => method.id == paymentMethod)[0].icon as { src: string }).src
                  }
                  alt={
                    paymentMethods.filter((method: any) => method.id == paymentMethod)[0].title
                  }
                  width={24}
                  height={15}
                  className="w-24"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>E-walltes</SelectLabel>
                  {paymentMethods.map((method:any,index:React.Key)=>(
                    <SelectItem key={index} value={method.id}>
                      <span className="flex items-center gap-2">
                      {method.icon && (
                        <img
                        src={typeof method.icon === "string" ? method.icon : (method.icon.src || "")}
                        alt={method.title}
                        className="w-24 h-15 object-contain"
                        />
                      )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Debit/Credit Card</SelectLabel>
                    <SelectItem disabled value="CARD">Card (not  active right now)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            
             
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
            100% Secure Payment
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
