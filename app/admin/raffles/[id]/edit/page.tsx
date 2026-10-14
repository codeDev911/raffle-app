"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
  Save,
  Loader2,
  Sparkles,
  Receipt,
  Calendar,
  Ticket,
  Coins,
  Tag,
  Percent,
  AlertCircle,
  Plus,
  X,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Crown,
  Layers,
  ShieldCheck,
  Scale,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Info,
} from "lucide-react"
import { RaffleImageUploader } from "@/components/admin/RaffleImageUploader"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

export interface RaffleExpenseItem {
  id: string
  description: string
  amount: number
  category?: string
}

interface Raffle {
  id: string
  title: string
  description: string
  longDescription?: string
  image?: string
  gallery: string[]
  price: number
  realPrice: number
  totalEntries: number
  currentEntries: number
  category: string
  featured: boolean
  status: string
  endDate: string
  specifications: string[]
  rules: string[]
  expenses?: any
}

export function roundUpTwoDecimals(num: number) {
  return Math.ceil(num * 100) / 100
}

export default function EditRafflePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    longDescription: "",
    image: "",
    gallery: [] as string[],
    price: "",
    realPrice: "",
    budget: "",
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

  // Quick Pakistani expense presets
  const expensePresets = [
    { label: "TikTok Ads Boost", amount: "1500", category: "Ads" },
    { label: "Meta / Instagram Ads", amount: "3000", category: "Ads" },
    { label: "WhatsApp SMS Broadcast", amount: "1000", category: "Marketing" },
    { label: "Influencer Shoutout", amount: "5000", category: "Influencer" },
    { label: "TCS / Leopards Courier", amount: "800", category: "Shipping" },
    { label: "Prize Gift Packaging", amount: "500", category: "Operations" },
  ]

  useEffect(() => {
    const fetchRaffle = async () => {
      try {
        const response = await fetch(`/api/raffles/${params.id}`)
        if (response.ok) {
          const data: Raffle = await response.json()
          setRaffle(data)

          const rawExpenses = data.expenses
          const parsedExpenses: RaffleExpenseItem[] = Array.isArray(rawExpenses)
            ? rawExpenses.filter((e: any) => !e.isBudget)
            : Array.isArray(rawExpenses?.items)
              ? rawExpenses.items
              : []

          const parsedBudget =
            typeof rawExpenses?.budget === "number"
              ? rawExpenses.budget.toString()
              : Array.isArray(rawExpenses)
                ? (rawExpenses.find((e: any) => e.isBudget)?.amount || "").toString()
                : ""

          setFormData({
            title: data.title || "",
            description: data.description || "",
            longDescription: data.longDescription || "",
            image: data.image || "",
            gallery: data.gallery || [],
            price: (data.price / 100).toString(),
            realPrice: (data.realPrice / 100).toString(),
            budget: parsedBudget,
            totalEntries: data.totalEntries.toString(),
            category: data.category || "Electronics",
            featured: data.featured || false,
            status: data.status || "ACTIVE",
            endDate: data.endDate
              ? new Date(data.endDate).toISOString().slice(0, 16)
              : "",
            specifications: data.specifications || [],
            rules: data.rules || [],
            expenses: parsedExpenses,
          })
        } else {
          setError("Failed to load raffle details")
        }
      } catch (err) {
        console.error("Error fetching raffle:", err)
        setError("Network error loading raffle")
      } finally {
        setLoading(false)
      }
    }

    fetchRaffle()
  }, [params.id])

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

  const setQuickEndDate = (days: number) => {
    const target = new Date()
    target.setDate(target.getDate() + days)
    target.setHours(23, 59, 0, 0)
    setFormData((prev) => ({ ...prev, endDate: target.toISOString().slice(0, 16) }))
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

    const grossRevenue = ticketPrice * totalCapacity
    const remainingBudget = allocatedBudget > 0 ? allocatedBudget - loggedExpenses : 0
    const isOverBudget = allocatedBudget > 0 && loggedExpenses > allocatedBudget
    const overBudgetAmount = isOverBudget ? loggedExpenses - allocatedBudget : 0
    const budgetUsedPercent =
      allocatedBudget > 0 ? Math.min(100, Math.round((loggedExpenses / allocatedBudget) * 100)) : 0

    const currentTotalOutflow = prizeRealCost + loggedExpenses
    const currentNetProfit = grossRevenue - currentTotalOutflow
    const currentROI =
      currentTotalOutflow > 0
        ? roundUpTwoDecimals(((grossRevenue - currentTotalOutflow) / currentTotalOutflow) * 100)
        : 0

    const maxBudgetUsed = Math.max(allocatedBudget, loggedExpenses)
    const worstCaseOutflow = prizeRealCost + maxBudgetUsed
    const budgetedNetProfit = grossRevenue - worstCaseOutflow
    const budgetedROI =
      worstCaseOutflow > 0
        ? roundUpTwoDecimals(((grossRevenue - worstCaseOutflow) / worstCaseOutflow) * 100)
        : 0

    const breakEvenTicketsCurrent =
      ticketPrice > 0 ? Math.ceil(currentTotalOutflow / ticketPrice) : 0
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
      breakEvenPercentage,
      isProfitable: currentNetProfit >= 0,
    }
  }, [formData.price, formData.totalEntries, formData.realPrice, formData.budget, formData.expenses])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    if (!formData.title.trim()) {
      setError("Please enter a raffle title.")
      setSubmitting(false)
      return
    }

    if (!formData.price || Number(formData.price) <= 0) {
      setError("Ticket price must be greater than 0.")
      setSubmitting(false)
      return
    }

    if (!formData.totalEntries || Number(formData.totalEntries) <= 0) {
      setError("Total entries capacity must be greater than 0.")
      setSubmitting(false)
      return
    }

    if (!formData.realPrice || Number(formData.realPrice) <= 0) {
      setError("Prize base cost is required.")
      setSubmitting(false)
      return
    }

    if (!formData.endDate) {
      setError("Please specify a raffle end date.")
      setSubmitting(false)
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
        price: Number.parseInt(formData.price) * 100, // in paisa
        realPrice: Number.parseInt(formData.realPrice), // in PKR (API multiplies by 100)
        totalEntries: Number.parseInt(formData.totalEntries),
        category: formData.category,
        featured: formData.featured,
        status: formData.status,
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

      const response = await fetch(`/api/raffles/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Raffle campaign updated successfully!")
        router.push(`/admin/raffles/${params.id}`)
      } else {
        setError(data.error || "Failed to update raffle")
      }
    } catch (err: any) {
      console.error("Submission error:", err)
      setError("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm font-semibold text-slate-600">Loading raffle details...</p>
      </div>
    )
  }

  if (!raffle && !loading) {
    return (
      <div className="text-center py-16 max-w-md mx-auto space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Raffle Not Found</h2>
        <p className="text-sm text-slate-500">
          The requested raffle campaign could not be located or has been deleted.
        </p>
        <Button asChild className="rounded-xl">
          <Link href="/admin/raffles">Back to Raffles</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 min-h-[38px] shadow-2xs"
          >
            <Link href={`/admin/raffles/${params.id}`}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to Details
            </Link>
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Edit Raffle Campaign
              </h1>
              <Badge
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  formData.status === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : formData.status === "COMPLETED"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                {formData.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Refine pricing, campaign photos, budget allocation, specifications & rules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 min-h-[38px]"
          >
            <Link href={`/raffles/${params.id}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Public View
            </Link>
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs min-h-[38px] px-5 shadow-xs"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Form Left (8 cols) + Sticky Live Financial Simulator Right (4 cols) */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          {/* SECTION 1: CAMPAIGN BASICS */}
          <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                Campaign Basics
              </CardTitle>
              <CardDescription className="text-xs">
                Essential customer-facing identifiers, title, and prize overview
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-semibold text-slate-700">
                    Raffle Title *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Brand New iPhone 16 Pro Max 256GB"
                    className="rounded-xl border-slate-200 text-sm font-semibold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs font-semibold text-slate-700">
                    Category *
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(val) => setFormData({ ...formData, category: val })}
                  >
                    <SelectTrigger id="category" className="rounded-xl border-slate-200 text-sm">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Vehicles">Vehicles</SelectItem>
                      <SelectItem value="Jewelry">Jewelry & Gold</SelectItem>
                      <SelectItem value="Gaming">Gaming & Consoles</SelectItem>
                      <SelectItem value="Cash">Cash Prizes</SelectItem>
                      <SelectItem value="Home">Home & Kitchen</SelectItem>
                      <SelectItem value="Fashion">Fashion & Luxury</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-semibold text-slate-700">
                  Short Hook / Card Summary *
                </Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Win an authentic PTA-approved iPhone 16 Pro Max with 1 year Apple official warranty."
                  className="rounded-xl border-slate-200 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="longDescription" className="text-xs font-semibold text-slate-700">
                  Comprehensive Item Details & Story
                </Label>
                <Textarea
                  id="longDescription"
                  value={formData.longDescription}
                  onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                  placeholder="Full specifications, color options, warranty details, and prize delivery terms..."
                  className="rounded-xl border-slate-200 text-sm min-h-[110px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* SECTION 2: TIMELINE & STATUS */}
          <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Schedule, Timeline & Status
              </CardTitle>
              <CardDescription className="text-xs">
                Control active lifecycle, countdown clock, and home page feature flags
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="status" className="text-xs font-semibold text-slate-700">
                    Draw Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => setFormData({ ...formData, status: val })}
                  >
                    <SelectTrigger id="status" className="rounded-xl border-slate-200 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="ACTIVE">ACTIVE (Open for purchases)</SelectItem>
                      <SelectItem value="DRAFT">DRAFT (Hidden preview)</SelectItem>
                      <SelectItem value="COMPLETED">COMPLETED (Draw finished)</SelectItem>
                      <SelectItem value="CANCELLED">CANCELLED (Suspended)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="endDate" className="text-xs font-semibold text-slate-700">
                      End Date & Draw Deadline *
                    </Label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setQuickEndDate(7)}
                        className="text-[10px] text-emerald-600 hover:underline font-semibold"
                      >
                        +7d
                      </button>
                      <span className="text-[10px] text-slate-300">·</span>
                      <button
                        type="button"
                        onClick={() => setQuickEndDate(14)}
                        className="text-[10px] text-emerald-600 hover:underline font-semibold"
                      >
                        +14d
                      </button>
                      <span className="text-[10px] text-slate-300">·</span>
                      <button
                        type="button"
                        onClick={() => setQuickEndDate(30)}
                        className="text-[10px] text-emerald-600 hover:underline font-semibold"
                      >
                        +30d
                      </button>
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
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <Crown className="w-4 h-4 text-amber-600" />
                    Featured Spotlight Campaign
                  </div>
                  <p className="text-[11px] text-amber-700/90">
                    Pins this raffle at the top of the home page banner and recommendations
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

          {/* SECTION 3: TICKET PRICING & CAPACITY */}
          <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-emerald-600" />
                Ticket Pricing & Pool Capacity
              </CardTitle>
              <CardDescription className="text-xs">
                Configure ticket economics, target pool size, and prize acquisition cost
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="price" className="text-xs font-semibold text-slate-700">
                    Ticket Price (PKR) *
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      Rs.
                    </span>
                    <Input
                      id="price"
                      type="number"
                      min="1"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="100"
                      className="rounded-xl border-slate-200 pl-10 text-sm font-mono font-semibold"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="totalEntries" className="text-xs font-semibold text-slate-700">
                    Total Tickets Pool *
                  </Label>
                  <Input
                    id="totalEntries"
                    type="number"
                    min="1"
                    value={formData.totalEntries}
                    onChange={(e) => setFormData({ ...formData, totalEntries: e.target.value })}
                    placeholder="2500"
                    className="rounded-xl border-slate-200 text-sm font-mono font-semibold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="realPrice" className="text-xs font-semibold text-slate-700">
                    Prize Base Asset Cost (PKR) *
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      Rs.
                    </span>
                    <Input
                      id="realPrice"
                      type="number"
                      min="1"
                      value={formData.realPrice}
                      onChange={(e) => setFormData({ ...formData, realPrice: e.target.value })}
                      placeholder="185000"
                      className="rounded-xl border-slate-200 pl-10 text-sm font-mono font-semibold"
                      required
                    />
                  </div>
                </div>
              </div>

              {financials.grossRevenue > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Projected Gross Revenue at 100% capacity:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    Rs. {financials.grossRevenue.toLocaleString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION 4: FINANCIAL ARCHITECTURE, BUDGET & EXPENSES */}
          <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-amber-500" />
                    Financial Architecture & Budget Planning
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Set campaign budget limits and track itemized marketing, ad spend & logistics expenses
                  </CardDescription>
                </div>
                <Badge
                  className={`text-xs font-mono font-bold px-2.5 py-1 ${
                    financials.isOverBudget
                      ? "bg-rose-100 text-rose-700 border border-rose-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {financials.isOverBudget
                    ? `Over Budget by Rs. ${financials.overBudgetAmount.toLocaleString()}`
                    : `Rs. ${financials.remainingBudget.toLocaleString()} Budget Remaining`}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-5">
              {/* Budget Allocation Field */}
              <div className="space-y-1.5">
                <Label htmlFor="budget" className="text-xs font-semibold text-slate-700">
                  Allocated Marketing & Campaign Budget (PKR)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    Rs.
                  </span>
                  <Input
                    id="budget"
                    type="number"
                    min="0"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="e.g. 15000"
                    className="rounded-xl border-slate-200 pl-10 text-sm font-mono font-semibold"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Guarantees safe margin calculation even before all marketing expenses are logged.
                </p>
              </div>

              {/* Quick Expense Presets */}
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Quick Pakistani eCommerce Presets
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {expensePresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => addExpense(preset.label, preset.amount, preset.category)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 border border-transparent transition-colors text-slate-700 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{preset.label}</span>
                      <span className="font-mono font-bold text-[10px] text-slate-500">
                        Rs. {Number(preset.amount).toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Custom Expense Input */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2">
                <div className="sm:col-span-6">
                  <Input
                    value={expenseDesc}
                    onChange={(e) => setExpenseDesc(e.target.value)}
                    placeholder="Custom expense description..."
                    className="rounded-xl border-slate-200 text-xs h-10"
                  />
                </div>
                <div className="sm:col-span-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      Rs.
                    </span>
                    <Input
                      type="number"
                      min="1"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      placeholder="Amount"
                      className="rounded-xl border-slate-200 pl-9 text-xs h-10 font-mono"
                    />
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <Button
                    type="button"
                    onClick={() => addExpense()}
                    className="w-full rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs h-10 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Expense
                  </Button>
                </div>
              </div>

              {/* Itemized Expenses List */}
              {formData.expenses.length > 0 ? (
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Logged Expenses ({formData.expenses.length}):
                  </span>
                  <div className="space-y-1.5">
                    {formData.expenses.map((exp) => (
                      <div
                        key={exp.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          {exp.category && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] bg-slate-200/70 text-slate-700 px-1.5 py-0"
                            >
                              {exp.category}
                            </Badge>
                          )}
                          <span className="font-semibold text-slate-800 truncate">
                            {exp.description}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="font-mono font-bold text-slate-900">
                            Rs. {exp.amount.toLocaleString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeExpense(exp.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-2">
                  No individual expenses logged yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* SECTION 5: MEDIA & IMAGES */}
          <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                Campaign Photos & Cloudinary Gallery
              </CardTitle>
              <CardDescription className="text-xs">
                Pick multiple photos to upload to Cloudinary. The first photo is set as the main cover, and remaining photos render in the interactive details carousel.
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

          {/* SECTION 6: SPECIFICATIONS & RULES BUILDER */}
          <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Specifications & Official Draw Rules
              </CardTitle>
              <CardDescription className="text-xs">
                Bullet points displayed on product tabs to guarantee trust and transparency
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-6">
              {/* Specifications */}
              <div className="space-y-2.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Key Inclusions & Box Specifications
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={newSpec}
                    onChange={(e) => setNewSpec(e.target.value)}
                    placeholder="e.g. 1 Year Official Apple Warranty & PTA Approved"
                    className="rounded-xl border-slate-200 text-xs h-10"
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
                    className="rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs h-10 px-4 shrink-0"
                  >
                    Add
                  </Button>
                </div>
                {formData.specifications.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.specifications.map((spec, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-xs text-slate-700"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {spec}
                        <button
                          type="button"
                          onClick={() => removeSpecification(i)}
                          className="text-slate-400 hover:text-rose-600 ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Rules */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <Label className="text-xs font-semibold text-slate-700">
                  Official Terms & Fairness Rules
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    placeholder="e.g. Winner will be drawn live on YouTube once 100% tickets are sold."
                    className="rounded-xl border-slate-200 text-xs h-10"
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
                    className="rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs h-10 px-4 shrink-0"
                  >
                    Add
                  </Button>
                </div>
                {formData.rules.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {formData.rules.map((rule, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs text-slate-700"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <span>{rule}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeRule(i)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Column 2: Sticky Live Financial Simulator (4 cols on lg) */}
        <div className="lg:col-span-4 sticky top-6 space-y-4">
          <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm bg-white overflow-hidden">
            <CardHeader className="p-4 sm:p-5 border-b border-slate-100 bg-slate-900 text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  Live Profit Simulator
                </CardTitle>
                <Badge
                  className={`text-[10px] font-bold px-2 py-0.5 border-0 ${
                    financials.isProfitable
                      ? "bg-emerald-500 text-white"
                      : "bg-rose-500 text-white"
                  }`}
                >
                  {financials.isProfitable ? "Profitable" : "Loss Risk"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-4 text-xs">
              {/* Projected Net Profit Metric */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-center space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Projected Net Profit (100% Sellout)
                </span>
                <p
                  className={`text-2xl sm:text-3xl font-extrabold font-mono ${
                    financials.isProfitable ? "text-emerald-700" : "text-rose-600"
                  }`}
                >
                  Rs. {financials.currentNetProfit.toLocaleString()}
                </p>
                <span className="text-[11px] font-semibold text-slate-500 block">
                  ROI: {financials.currentROI}%
                </span>
              </div>

              {/* Financial Architecture Breakdown */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Gross Target Revenue:</span>
                  <span className="font-mono font-bold text-slate-900">
                    Rs. {financials.grossRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Base Prize Asset Cost:</span>
                  <span className="font-mono font-bold text-slate-900">
                    -Rs. {financials.prizeRealCost.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Logged Expenses:</span>
                  <span className="font-mono font-bold text-amber-700">
                    -Rs. {financials.loggedExpenses.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Break-Even Tickets:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {financials.breakEvenTicketsCurrent} / {financials.totalCapacity} (
                    {financials.breakEvenPercentage}%)
                  </span>
                </div>
              </div>

              {/* Budget consumption gauge */}
              {financials.allocatedBudget > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-semibold">Budget Consumption</span>
                    <span className="font-mono font-bold text-slate-900">
                      {financials.budgetUsedPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
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
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Rs. {financials.loggedExpenses.toLocaleString()} spent</span>
                    <span>Rs. {financials.allocatedBudget.toLocaleString()} cap</span>
                  </div>
                </div>
              )}

              {/* Primary Action Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm h-11 shadow-xs"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save & Update Raffle
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
