"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Receipt,
  Loader2,
  TrendingDown,
  Sparkles,
  Ticket,
  DollarSign,
  AlertCircle,
  Tag,
} from "lucide-react"
import { toast } from "sonner"

interface AddExpenseModalProps {
  raffleId: string
  currentExpensesPKR?: number
  currentRevenuePKR?: number
  prizeCostPKR?: number
  ticketPricePKR?: number
  triggerButton?: React.ReactNode
  onSuccess?: () => void
}

export function AddExpenseModal({
  raffleId,
  currentExpensesPKR = 0,
  currentRevenuePKR = 0,
  prizeCostPKR = 0,
  ticketPricePKR = 0,
  triggerButton,
  onSuccess,
}: AddExpenseModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("Marketing")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const quickPresets = [
    { label: "TikTok Ads Boost", amount: "1500", category: "Ads" },
    { label: "Meta Ads / IG", amount: "3000", category: "Ads" },
    { label: "WhatsApp Broadcast", amount: "1000", category: "Marketing" },
    { label: "Influencer Collab", amount: "5000", category: "Influencer" },
    { label: "TCS Courier Shipping", amount: "800", category: "Shipping" },
    { label: "Gift Box Packaging", amount: "500", category: "Operations" },
  ]

  const parsedAmount = parseFloat(amount) || 0
  const projectedTotalExpenses = currentExpensesPKR + parsedAmount
  const currentNetProfit = currentRevenuePKR - (prizeCostPKR + currentExpensesPKR)
  const projectedNetProfit = currentRevenuePKR - (prizeCostPKR + projectedTotalExpenses)
  const extraTicketsNeeded =
    ticketPricePKR > 0 && parsedAmount > 0
      ? Math.ceil(parsedAmount / ticketPricePKR)
      : 0

  const handleApplyPreset = (preset: typeof quickPresets[0]) => {
    setDescription(preset.label)
    setAmount(preset.amount)
    setCategory(preset.category)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) {
      setError("Please enter a short description of the expense.")
      return
    }
    if (parsedAmount <= 0) {
      setError("Expense amount must be greater than 0 PKR.")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/raffles/${raffleId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          amount: parsedAmount,
          category,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to record expense")
      }

      toast.success(
        `Expense of Rs. ${parsedAmount.toLocaleString()} (${description}) logged successfully!`
      )
      setDescription("")
      setAmount("")
      setCategory("Marketing")
      setOpen(false)
      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh()
      }
    } catch (err: any) {
      console.error("Failed to add expense:", err)
      setError(err.message || "Failed to add expense. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button
            size="sm"
            className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-xs min-h-[38px] px-3.5"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Expense
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-lg rounded-3xl p-6 sm:p-7 border-slate-200 shadow-2xl">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-extrabold text-slate-900 tracking-tight">
                Log Campaign Expense
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Record marketing, courier, ad spend or operational costs directly into this raffle's ledger
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {/* Quick Presets Carousel/Chips */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Quick Pakistani eCommerce Presets
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {quickPresets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 border border-transparent transition-colors text-slate-700 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{p.label}</span>
                  <span className="font-mono font-bold text-[10px] text-slate-500">
                    Rs. {Number(p.amount).toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Description Input */}
          <div className="space-y-1.5">
            <Label htmlFor="expense-desc" className="text-xs font-semibold text-slate-700">
              Expense Description *
            </Label>
            <Input
              id="expense-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Meta Ads Boost - Week 2"
              className="rounded-xl border-slate-200 text-sm h-10"
              required
            />
          </div>

          {/* Amount and Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="expense-amount" className="text-xs font-semibold text-slate-700">
                Amount (PKR) *
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  Rs.
                </span>
                <Input
                  id="expense-amount"
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="2500"
                  className="rounded-xl border-slate-200 pl-10 text-sm h-10 font-mono font-semibold"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expense-category" className="text-xs font-semibold text-slate-700">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="expense-category" className="rounded-xl border-slate-200 text-sm h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Ads">Digital Ads (Meta/TikTok/Google)</SelectItem>
                  <SelectItem value="Influencer">Influencer Collaboration</SelectItem>
                  <SelectItem value="Marketing">SMS & WhatsApp Marketing</SelectItem>
                  <SelectItem value="Shipping">Courier & Delivery (TCS/Leopards)</SelectItem>
                  <SelectItem value="Operations">Prize Box & Packaging</SelectItem>
                  <SelectItem value="Platform">Bank & Gateway Fees</SelectItem>
                  <SelectItem value="Other">Other Expenses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Real-Time Financial Impact Simulation */}
          {parsedAmount > 0 && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Live Margin Simulation
              </span>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-slate-400 block text-[11px]">New Total Expenses</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    Rs. {projectedTotalExpenses.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-amber-600 block">
                    (+Rs. {parsedAmount.toLocaleString()})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Break-even Tickets Needed</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    +{extraTicketsNeeded} tickets
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    At Rs. {ticketPricePKR} / entry
                  </span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl border-slate-200 text-slate-700 text-xs h-10 px-4"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs h-10 px-5 shadow-xs"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Save Expense
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
