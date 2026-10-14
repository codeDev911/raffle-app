"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Plus,
  X,
  Receipt,
  TrendingUp,
  TrendingDown,
  Trash2,
  Sparkles,
  DollarSign,
  Calendar,
  Wallet,
  Percent,
  AlertTriangle,
  CheckCircle2,
  Ticket,
  Gift,
  Tag,
  Clock,
  Layers,
  Image as ImageIcon,
  HelpCircle,
  Coins,
  ShieldAlert,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { RaffleImageUploader } from "@/components/admin/RaffleImageUploader"

export interface RaffleExpenseItem {
  id: string
  description: string
  amount: number
  category?: string
}

export function roundUpTwoDecimals(num: number) {
  return Math.ceil(num * 100) / 100
}

export default function CreateRafflePage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    longDescription: "",
    image: "",
    gallery: [] as string[],
    price: "",
    realPrice: "",
    budget: "", // Allocated marketing & campaign budget in PKR
    totalEntries: "",
    category: "",
    featured: false,
    status: "ACTIVE",
    endDate: "",
    specifications: [] as string[],
    rules: [] as string[],
    expenses: [] as RaffleExpenseItem[],
  })

  const [newSpec, setNewSpec] = useState("")
  const [newRule, setNewRule] = useState("")
  const [expenseDesc, setExpenseDesc] = useState("")
  const [expenseAmount, setExpenseAmount] = useState("")
  const [expenseCategory, setExpenseCategory] = useState("Marketing")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Quick Expense Presets for Pakistani eCommerce & Raffles
  const expensePresets = [
    { label: "TikTok Ads Boost", amount: "1500", category: "Ads" },
    { label: "Meta / Instagram Ads", amount: "3000", category: "Ads" },
    { label: "WhatsApp SMS Broadcast", amount: "1000", category: "Marketing" },
    { label: "Influencer Shoutout", amount: "5000", category: "Influencer" },
    { label: "TCS / Leopards Courier", amount: "800", category: "Shipping" },
    { label: "Prize Gift Packaging", amount: "500", category: "Operations" },
  ]

  const addExpense = (customDesc?: string, customAmount?: string, customCategory?: string) => {
    const descToUse = (customDesc ?? expenseDesc).trim()
    const amountToUse = parseFloat(customAmount ?? expenseAmount)
    const categoryToUse = customCategory ?? expenseCategory

    if (!descToUse) return
    if (isNaN(amountToUse) || amountToUse <= 0) return

    const newItem: RaffleExpenseItem = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      description: descToUse,
      amount: Math.round(amountToUse),
      category: categoryToUse,
    }

    setFormData((prev) => ({
      ...prev,
      expenses: [...prev.expenses, newItem],
    }))

    setExpenseDesc("")
    setExpenseAmount("")
  }

  const removeExpense = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }))
  }

  const addSpecification = () => {
    if (newSpec.trim()) {
      setFormData((prev) => ({
        ...prev,
        specifications: [...prev.specifications, newSpec.trim()],
      }))
      setNewSpec("")
    }
  }

  const removeSpecification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }))
  }

  const addRule = () => {
    if (newRule.trim()) {
      setFormData((prev) => ({
        ...prev,
        rules: [...prev.rules, newRule.trim()],
      }))
      setNewRule("")
    }
  }

  const removeRule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }))
  }

  // Quick preset dates (7 days, 14 days, 30 days)
  const setQuickEndDate = (days: number) => {
    const target = new Date()
    target.setDate(target.getDate() + days)
    target.setHours(23, 59, 0, 0)
    const isoString = target.toISOString().slice(0, 16)
    setFormData((prev) => ({ ...prev, endDate: isoString }))
  }

  // Financial & Budget Calculation Engine
  const financials = useMemo(() => {
    const ticketPrice = parseFloat(formData.price) || 0
    const totalCapacity = parseFloat(formData.totalEntries) || 0
    const prizeRealCost = parseFloat(formData.realPrice) || 0
    const allocatedBudget = parseFloat(formData.budget) || 0

    const loggedExpenses = formData.expenses.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    )

    // Projected gross revenue at 100% sellout
    const grossRevenue = ticketPrice * totalCapacity

    // Budget tracking
    const remainingBudget = allocatedBudget > 0 ? allocatedBudget - loggedExpenses : 0
    const isOverBudget = allocatedBudget > 0 && loggedExpenses > allocatedBudget
    const overBudgetAmount = isOverBudget ? loggedExpenses - allocatedBudget : 0
    const budgetUsedPercent =
      allocatedBudget > 0 ? Math.min(100, Math.round((loggedExpenses / allocatedBudget) * 100)) : 0

    // Scenario 1: Profit based on CURRENT logged expenses
    const currentTotalOutflow = prizeRealCost + loggedExpenses
    const currentNetProfit = grossRevenue - currentTotalOutflow
    const currentROI =
      currentTotalOutflow > 0
        ? roundUpTwoDecimals(((grossRevenue - currentTotalOutflow) / currentTotalOutflow) * 100)
        : 0

    // Scenario 2: Guaranteed profit if 100% of the allocated budget is consumed
    const maxBudgetUsed = Math.max(allocatedBudget, loggedExpenses)
    const worstCaseOutflow = prizeRealCost + maxBudgetUsed
    const budgetedNetProfit = grossRevenue - worstCaseOutflow
    const budgetedROI =
      worstCaseOutflow > 0
        ? roundUpTwoDecimals(((grossRevenue - worstCaseOutflow) / worstCaseOutflow) * 100)
        : 0

    // Break-even milestone: tickets needed to cover costs
    const breakEvenTicketsCurrent =
      ticketPrice > 0 ? Math.ceil(currentTotalOutflow / ticketPrice) : 0
    const breakEvenTicketsBudgeted =
      ticketPrice > 0 ? Math.ceil(worstCaseOutflow / ticketPrice) : 0
    const breakEvenPercentage =
      totalCapacity > 0
        ? Math.min(100, Math.round((breakEvenTicketsCurrent / totalCapacity) * 100))
        : 0

    return {
      ticketPrice,
      totalCapacity,
      prizeRealCost,
      allocatedBudget,
      loggedExpenses,
      grossRevenue,
      remainingBudget,
      isOverBudget,
      overBudgetAmount,
      budgetUsedPercent,
      currentTotalOutflow,
      currentNetProfit,
      currentROI,
      budgetedNetProfit,
      budgetedROI,
      worstCaseOutflow,
      breakEvenTicketsCurrent,
      breakEvenTicketsBudgeted,
      breakEvenPercentage,
      isProfitable: currentNetProfit >= 0,
      isBudgetProfitable: budgetedNetProfit >= 0,
    }
  }, [formData.price, formData.totalEntries, formData.realPrice, formData.budget, formData.expenses])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!formData.title.trim()) {
      setError("Please enter a raffle title.")
      setLoading(false)
      return
    }

    if (!formData.category) {
      setError("Please select a category.")
      setLoading(false)
      return
    }

    if (!formData.price || Number(formData.price) <= 0) {
      setError("Ticket price must be greater than 0.")
      setLoading(false)
      return
    }

    if (!formData.totalEntries || Number(formData.totalEntries) <= 0) {
      setError("Total tickets capacity must be greater than 0.")
      setLoading(false)
      return
    }

    if (!formData.realPrice || Number(formData.realPrice) <= 0) {
      setError("Prize base cost is required.")
      setLoading(false)
      return
    }

    if (!formData.endDate) {
      setError("Please specify a raffle end date.")
      setLoading(false)
      return
    }

    try {
      const coverImage =
        formData.image.trim() ||
        (formData.gallery && formData.gallery.length > 0 ? formData.gallery[0] : undefined)

      const fullGallery = Array.from(
        new Set([
          ...(coverImage ? [coverImage] : []),
          ...(formData.gallery || []),
        ])
      )

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        longDescription: formData.longDescription.trim() || undefined,
        image: coverImage,
        gallery: fullGallery,
        price: Number.parseInt(formData.price),
        realPrice: Number.parseInt(formData.realPrice),
        totalEntries: Number.parseInt(formData.totalEntries),
        category: formData.category,
        featured: formData.featured,
        endDate: new Date(formData.endDate).toISOString(),
        specifications: formData.specifications,
        rules: formData.rules,
        expenses: {
          budget: Number(formData.budget) || 0,
          items: formData.expenses.map((exp) => ({
            id: exp.id,
            description: exp.description,
            amount: Number(exp.amount),
            category: exp.category || "Marketing",
          })),
        },
      }

      const response = await fetch("/api/raffles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/admin/raffles")
      } else {
        setError(data.error || "Failed to create raffle")
      }
    } catch (err: any) {
      console.error("Submission error:", err)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 min-h-[38px] shadow-2xs"
          >
            <Link href="/admin/raffles">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Raffles
            </Link>
          </Button>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Create New Raffle Campaign
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Configure prize economics, set authorized marketing budget, and track net profits
            </p>
          </div>
        </div>

        {/* Top Action Button */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl min-h-[42px] px-6 font-bold shadow-xs transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? "Creating Campaign..." : "Publish Raffle"}</span>
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3 animate-in fade-in">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Configuration Forms (7 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          {/* SECTION 1: BASIC INFORMATION */}
          <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Gift className="w-4 h-4 text-red-500" />
                Campaign Basics
              </CardTitle>
              <CardDescription className="text-xs">
                Title, primary category, and campaign description
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-semibold text-slate-700">
                    Raffle Title *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="rounded-xl border-slate-200 focus:bg-white text-sm"
                    placeholder="e.g. iPhone 15 Pro Max 256GB"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs font-semibold text-slate-700">
                    Category *
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="rounded-xl border-slate-200 text-sm">
                      <SelectValue placeholder="Choose Category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Electronics">Electronics & Smartphones</SelectItem>
                      <SelectItem value="Vehicles">Bikes & Motorcars</SelectItem>
                      <SelectItem value="Jewelry">Gold & Diamond Jewelry</SelectItem>
                      <SelectItem value="Gaming">Gaming & PlayStations</SelectItem>
                      <SelectItem value="Cash">Cash Prizes & Savings</SelectItem>
                      <SelectItem value="Watches">Luxury Watches</SelectItem>
                      <SelectItem value="Home">Home & Kitchen Appliances</SelectItem>
                      <SelectItem value="Fashion">Fashion & Lifestyle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-semibold text-slate-700">
                  Short Highlight *
                </Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="rounded-xl border-slate-200 text-sm"
                  placeholder="e.g. Brand New PTA Approved Natural Titanium with 1 Year Warranty"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="longDescription" className="text-xs font-semibold text-slate-700">
                  Full Prize Overview & Details
                </Label>
                <Textarea
                  id="longDescription"
                  value={formData.longDescription}
                  onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                  className="rounded-xl border-slate-200 text-sm min-h-[90px]"
                  placeholder="Describe the prize in full detail, box inclusions, official warranty terms, and delivery timeline..."
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <div className="space-y-0.5">
                  <Label htmlFor="featured" className="text-xs font-bold text-slate-900 cursor-pointer">
                    Feature on Homepage Hero
                  </Label>
                  <p className="text-[11px] text-slate-500">
                    Shows with prominent gold badge on top of public raffle feeds
                  </p>
                </div>
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* SECTION 2: TICKET CAPACITY & TIMELINE */}
          <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-blue-500" />
                Ticket Economics & Timeline
              </CardTitle>
              <CardDescription className="text-xs">
                Ticket price, total ticket capacity, and campaign draw schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="price" className="text-xs font-semibold text-slate-700">
                    Price Per Entry (PKR) *
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      Rs.
                    </span>
                    <Input
                      id="price"
                      type="number"
                      min="1"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="rounded-xl pl-10 border-slate-200 text-sm font-mono font-bold"
                      placeholder="250"
                      required
                    />
                  </div>
                  <span className="text-[11px] text-slate-400">Participant cost for 1 ticket</span>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="totalEntries" className="text-xs font-semibold text-slate-700">
                    Total Tickets Available *
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      #
                    </span>
                    <Input
                      id="totalEntries"
                      type="number"
                      min="1"
                      value={formData.totalEntries}
                      onChange={(e) => setFormData({ ...formData, totalEntries: e.target.value })}
                      className="rounded-xl pl-9 border-slate-200 text-sm font-mono font-bold"
                      placeholder="1000"
                      required
                    />
                  </div>
                  <span className="text-[11px] text-slate-400">Raffle draws when sold or on end date</span>
                </div>
              </div>

              {/* End Date & Quick presets */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <Label htmlFor="endDate" className="text-xs font-semibold text-slate-700">
                    Draw End Date & Time *
                  </Label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400">Quick:</span>
                    {[7, 14, 30].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setQuickEndDate(days)}
                        className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                      >
                        +{days}d
                      </button>
                    ))}
                  </div>
                </div>

                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="rounded-xl border-slate-200 text-sm"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* SECTION 3: PRIZE COST, BUDGET & EXPENSES (THE CORE REQUEST) */}
          <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-5 sm:p-6 border-b border-amber-100/70 bg-gradient-to-r from-amber-50/60 to-orange-50/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-amber-600" />
                    Prize Cost, Campaign Budget & Expenses
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-600 mt-0.5">
                    Set real asset purchase cost and allocate an authorized campaign budget to track remaining funds
                  </CardDescription>
                </div>

                {financials.allocatedBudget > 0 && (
                  <Badge
                    className={`rounded-xl px-2.5 py-1 text-xs font-semibold ${
                      financials.isOverBudget
                        ? "bg-rose-100 text-rose-800 border-rose-300"
                        : "bg-emerald-100 text-emerald-800 border-emerald-300"
                    }`}
                  >
                    {financials.isOverBudget
                      ? `Over Budget by Rs. ${financials.overBudgetAmount.toLocaleString()}`
                      : `Budget Remaining: Rs. ${financials.remainingBudget.toLocaleString()}`}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-6">
              {/* Prize Real Cost & Campaign Budget Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="realPrice" className="text-xs font-bold text-slate-800">
                      Real Prize Acquisition Cost (PKR) *
                    </Label>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      Rs.
                    </span>
                    <Input
                      id="realPrice"
                      type="number"
                      min="1"
                      value={formData.realPrice}
                      onChange={(e) => setFormData({ ...formData, realPrice: e.target.value })}
                      className="rounded-xl pl-10 border-slate-200 text-sm font-mono font-bold bg-white"
                      placeholder="180000"
                      required
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Actual purchase price paid for the prize
                  </span>
                </div>

                {/* THE NEW BUDGET SETTING INPUT */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="budget" className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-amber-600" />
                      Allocated Campaign Budget (PKR)
                    </Label>
                    <Badge variant="outline" className="text-[10px] bg-white text-amber-800 border-amber-300">
                      Target Ceiling
                    </Badge>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-600">
                      Rs.
                    </span>
                    <Input
                      id="budget"
                      type="number"
                      min="0"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="rounded-xl pl-10 border-amber-200 text-sm font-mono font-bold bg-white focus:border-amber-400"
                      placeholder="25000"
                    />
                  </div>
                  <span className="text-[11px] text-amber-900 block">
                    Authorized marketing, ads, and delivery cap
                  </span>
                </div>
              </div>

              {/* Budget Health Bar (If budget is configured) */}
              {financials.allocatedBudget > 0 && (
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-slate-500" />
                      Budget Utilization:{" "}
                      <strong className="text-slate-900">
                        Rs. {financials.loggedExpenses.toLocaleString()} / Rs.{" "}
                        {financials.allocatedBudget.toLocaleString()}
                      </strong>
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        financials.isOverBudget ? "text-rose-600" : "text-emerald-700"
                      }`}
                    >
                      {financials.isOverBudget
                        ? `${financials.budgetUsedPercent}% (OVER BUDGET)`
                        : `${financials.budgetUsedPercent}% used`}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        financials.isOverBudget
                          ? "bg-rose-500"
                          : financials.budgetUsedPercent > 80
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(100, financials.budgetUsedPercent)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>
                      Logged Expenses: <strong>{formData.expenses.length} items</strong>
                    </span>
                    <span
                      className={`font-semibold ${
                        financials.isOverBudget ? "text-rose-600" : "text-emerald-700"
                      }`}
                    >
                      {financials.isOverBudget
                        ? `Exceeds budget by Rs. ${financials.overBudgetAmount.toLocaleString()}`
                        : `Buffer Remaining: Rs. ${financials.remainingBudget.toLocaleString()}`}
                    </span>
                  </div>
                </div>
              )}

              {/* Quick Expense Presets */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Quick Campaign Expense Presets (Click to Add)
                </Label>
                <div className="flex flex-wrap gap-2">
                  {expensePresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => addExpense(preset.label, preset.amount, preset.category)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-900 transition-colors shadow-2xs"
                    >
                      <Plus className="h-3 w-3 text-amber-600" />
                      <span>{preset.label}</span>
                      <span className="text-slate-400 font-mono text-[11px]">Rs. {preset.amount}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Expense Builder Input Row */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="sm:col-span-6 space-y-1">
                  <Label htmlFor="expenseDesc" className="text-xs font-medium text-slate-600">
                    Expense Description
                  </Label>
                  <Input
                    id="expenseDesc"
                    value={expenseDesc}
                    onChange={(e) => setExpenseDesc(e.target.value)}
                    placeholder="e.g. TikTok Ads Campaign, TCS Courier"
                    className="h-9 text-xs rounded-xl bg-white"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addExpense()
                      }
                    }}
                  />
                </div>

                <div className="sm:col-span-4 space-y-1">
                  <Label htmlFor="expenseAmount" className="text-xs font-medium text-slate-600">
                    Amount (PKR)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      Rs.
                    </span>
                    <Input
                      id="expenseAmount"
                      type="number"
                      min="1"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      placeholder="1500"
                      className="h-9 text-xs rounded-xl pl-9 bg-white"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addExpense()
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <Button
                    type="button"
                    onClick={() => addExpense()}
                    disabled={!expenseDesc.trim() || !expenseAmount || Number(expenseAmount) <= 0}
                    className="w-full h-9 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Itemized Expenses Table */}
              {formData.expenses.length === 0 ? (
                <div className="text-center py-6 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <Receipt className="h-7 w-7 text-slate-300 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-slate-700">No Itemized Expenses Logged Yet</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm mx-auto">
                    Add specific marketing spends (ads, delivery, packaging) above to calculate exact profits and track budget utilization.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1 uppercase tracking-wider">
                    <span>Logged Expenses ({formData.expenses.length})</span>
                    <span>Rs. {financials.loggedExpenses.toLocaleString()} Total</span>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                    {formData.expenses.map((expense, idx) => (
                      <div
                        key={expense.id || idx}
                        className="flex items-center justify-between p-3 hover:bg-slate-50/60 transition-colors text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-900">{expense.description}</p>
                            <span className="text-[10px] text-slate-400">
                              {expense.category || "Marketing Spend"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                            Rs. {Number(expense.amount).toLocaleString()}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeExpense(expense.id)}
                            className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION 4: MEDIA & IMAGES */}
          <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-500" />
                Prize Visual Media & Gallery
              </CardTitle>
              <CardDescription className="text-xs">
                Upload multiple campaign photos to Cloudinary. The first image serves as the main featured cover, and additional photos are displayed in the interactive carousel.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6">
              <RaffleImageUploader
                mainImage={formData.image}
                gallery={formData.gallery}
                onChange={({ image, gallery }) =>
                  setFormData((prev) => ({
                    ...prev,
                    image,
                    gallery,
                  }))
                }
              />
            </CardContent>
          </Card>

          {/* SECTION 5: SPECIFICATIONS & RULES */}
          <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                Specifications & Rules
              </CardTitle>
              <CardDescription className="text-xs">
                Item specs and terms for transparency with Pakistani customers
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-5">
              {/* Specs */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">Prize Specifications</Label>
                <div className="flex gap-2">
                  <Input
                    value={newSpec}
                    onChange={(e) => setNewSpec(e.target.value)}
                    placeholder="e.g. 256GB Storage, PTA Approved, Blue Titanium"
                    className="h-9 text-xs rounded-xl"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addSpecification()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={addSpecification}
                    variant="outline"
                    className="h-9 rounded-xl text-xs px-3"
                  >
                    Add
                  </Button>
                </div>

                {formData.specifications.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.specifications.map((spec, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium"
                      >
                        {spec}
                        <button type="button" onClick={() => removeSpecification(i)}>
                          <X className="w-3 h-3 hover:text-red-600" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Rules */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <Label className="text-xs font-semibold text-slate-700">Raffle Rules</Label>
                <div className="flex gap-2">
                  <Input
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    placeholder="e.g. Free delivery anywhere in Pakistan via TCS"
                    className="h-9 text-xs rounded-xl"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addRule()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={addRule}
                    variant="outline"
                    className="h-9 rounded-xl text-xs px-3"
                  >
                    Add
                  </Button>
                </div>

                {formData.rules.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.rules.map((rule, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium"
                      >
                        {rule}
                        <button type="button" onClick={() => removeRule(i)}>
                          <X className="w-3 h-3 hover:text-red-600" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </form>

        {/* RIGHT COLUMN: STICKY REAL-TIME PROFIT & BUDGET COCKPIT (5 cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-6">
          <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md bg-white overflow-hidden">
            {/* Simulator Header */}
            <div className="p-5 sm:p-6 bg-slate-900 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Profit & Budget Simulator</h3>
                </div>
                <Badge
                  className={`text-xs font-bold rounded-lg px-2.5 py-0.5 border ${
                    financials.isProfitable
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                  }`}
                >
                  {financials.isProfitable ? "PROFITABLE" : "IN DEFICIT"}
                </Badge>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Real-time projection factoring ticket sales, prize acquisition, authorized budget, and logged expenses.
              </p>
            </div>

            <CardContent className="p-5 sm:p-6 space-y-6">
              {/* PRIMARY KPI: PROJECTED NET PROFIT */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  financials.isProfitable
                    ? "bg-emerald-50/60 border-emerald-200"
                    : "bg-rose-50/60 border-rose-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    {financials.isProfitable ? (
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-rose-600" />
                    )}
                    Current Net Profit
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      financials.currentROI >= 0
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {financials.currentROI >= 0 ? "+" : ""}
                    {financials.currentROI}% ROI
                  </span>
                </div>

                <div className="mt-2 flex items-baseline gap-2">
                  <span
                    className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${
                      financials.isProfitable ? "text-emerald-700" : "text-rose-600"
                    }`}
                  >
                    {financials.currentNetProfit >= 0 ? "+" : ""}Rs.{" "}
                    {financials.currentNetProfit.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">PKR</span>
                </div>

                <p className="text-xs text-slate-500 mt-1">
                  After prize purchase (Rs. {financials.prizeRealCost.toLocaleString()}) & logged expenses (Rs.{" "}
                  {financials.loggedExpenses.toLocaleString()})
                </p>
              </div>

              {/* SECONDARY SCENARIO: PROFIT IF FULL BUDGET IS SPENT */}
              {financials.allocatedBudget > 0 && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-amber-600" />
                      Guaranteed Profit (Full Budget Used):
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        financials.isBudgetProfitable ? "text-emerald-700" : "text-rose-600"
                      }`}
                    >
                      {financials.budgetedNetProfit >= 0 ? "+" : ""}Rs.{" "}
                      {financials.budgetedNetProfit.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Even if you spend all Rs. {financials.allocatedBudget.toLocaleString()} budget</span>
                    <span className="font-semibold text-slate-700">
                      {financials.budgetedROI >= 0 ? "+" : ""}
                      {financials.budgetedROI}% ROI
                    </span>
                  </div>
                </div>
              )}

              {/* BUDGET HEALTH STATUS BAR */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Campaign Budget Health</span>
                  <span
                    className={`font-bold ${
                      financials.isOverBudget
                        ? "text-rose-600"
                        : financials.allocatedBudget > 0
                          ? "text-emerald-700"
                          : "text-slate-400"
                    }`}
                  >
                    {financials.allocatedBudget > 0
                      ? financials.isOverBudget
                        ? `Exceeded by Rs. ${financials.overBudgetAmount.toLocaleString()}`
                        : `Rs. ${financials.remainingBudget.toLocaleString()} Remaining Buffer`
                      : "No Budget Cap Set"}
                  </span>
                </div>

                {financials.allocatedBudget > 0 ? (
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        financials.isOverBudget ? "bg-rose-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(100, financials.budgetUsedPercent)}%` }}
                    />
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400">
                    Tip: Set an Allocated Budget in Section 3 to ensure ad spend stays within safe margins.
                  </p>
                )}
              </div>

              {/* BREAK-EVEN ANALYSIS MILESTONE */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    Break-Even Milestone
                  </span>
                  <span className="font-mono font-bold text-blue-900">
                    {financials.breakEvenTicketsCurrent.toLocaleString()} /{" "}
                    {financials.totalCapacity.toLocaleString()} Tickets ({financials.breakEvenPercentage}%)
                  </span>
                </div>

                <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${financials.breakEvenPercentage}%` }}
                  />
                </div>

                <p className="text-[11px] text-blue-800 leading-tight">
                  You need to sell <strong>{financials.breakEvenTicketsCurrent} tickets</strong> to 100% cover the prize and marketing costs. Every ticket sold after is <strong>pure profit</strong>.
                </p>
              </div>

              {/* LINE-BY-LINE AUDIT BOX */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-1">
                  Accounting Line Breakdown
                </span>

                <div className="flex justify-between text-slate-600">
                  <span>Gross Ticket Revenue:</span>
                  <span className="font-mono font-bold text-blue-700">
                    + Rs. {financials.grossRevenue.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Prize Acquisition Cost:</span>
                  <span className="font-mono font-bold text-slate-700">
                    - Rs. {financials.prizeRealCost.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Logged Expenses ({formData.expenses.length}):</span>
                  <span className="font-mono font-bold text-amber-700">
                    - Rs. {financials.loggedExpenses.toLocaleString()}
                  </span>
                </div>

                <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                  <span>Net Estimated Profit:</span>
                  <span
                    className={`font-mono ${
                      financials.isProfitable ? "text-emerald-700" : "text-rose-600"
                    }`}
                  >
                    Rs. {financials.currentNetProfit.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* BOTTOM SUBMIT BUTTON */}
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? "Publishing Campaign..." : "Publish Raffle Campaign"}</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
