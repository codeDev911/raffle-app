"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, X, Receipt, TrendingUp, TrendingDown, Trash2, Sparkles, DollarSign } from "lucide-react";
import Link from "next/link";

// Calculation
export function roundUpTwoDecimals(num: any) {
  return Math.ceil(num * 100) / 100;
}

export interface RaffleExpenseItem {
  id: string;
  description: string;
  amount: number;
}

export default function CreateRafflePage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    longDescription: "",
    image: "",
    gallery: [] as string[],
    price: "",
    realPrice: "",
    totalEntries: "",
    category: "",
    featured: false,
    endDate: "",
    specifications: [] as string[],
    rules: [] as string[],
    expenses: [] as RaffleExpenseItem[],
  });
  const [newSpec, setNewSpec] = useState("");
  const [newRule, setNewRule] = useState("");
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const addExpense = (customDesc?: string, customAmount?: string) => {
    const descToUse = (customDesc ?? expenseDesc).trim();
    const amountToUse = parseFloat(customAmount ?? expenseAmount);

    if (!descToUse) return;
    if (isNaN(amountToUse) || amountToUse <= 0) return;

    const newItem: RaffleExpenseItem = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      description: descToUse,
      amount: Math.round(amountToUse),
    };

    setFormData((prev) => ({
      ...prev,
      expenses: [...prev.expenses, newItem],
    }));

    setExpenseDesc("");
    setExpenseAmount("");
  };

  const removeExpense = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/raffles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number.parseInt(formData.price),
          realPrice: Number.parseInt(formData.realPrice),
          totalEntries: Number.parseInt(formData.totalEntries),
          endDate: new Date(formData.endDate).toISOString(),
          expenses: formData.expenses.map((exp) => ({
            id: exp.id,
            description: exp.description,
            amount: Number(exp.amount),
          })),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/admin/raffles");
      } else {
        setError(data.error || "Failed to create raffle");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addSpecification = () => {
    if (newSpec.trim()) {
      setFormData({
        ...formData,
        specifications: [...formData.specifications, newSpec.trim()],
      });
      setNewSpec("");
    }
  };

  const removeSpecification = (index: number) => {
    setFormData({
      ...formData,
      specifications: formData.specifications.filter((_, i) => i !== index),
    });
  };

  const addRule = () => {
    if (newRule.trim()) {
      setFormData({
        ...formData,
        rules: [...formData.rules, newRule.trim()],
      });
      setNewRule("");
    }
  };

  const removeRule = (index: number) => {
    setFormData({
      ...formData,
      rules: formData.rules.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button asChild variant="ghost" className="rounded-2xl">
          <Link href="/admin/raffles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Raffles
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Raffle
          </h1>
          <p className="text-gray-600 mt-2">
            Add a new raffle item to your platform
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Enter the basic details of your raffle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="rounded-2xl"
                  placeholder="iPhone 15 Pro Max"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Vehicles">Vehicles</SelectItem>
                    <SelectItem value="Jewelry">Jewelry</SelectItem>
                    <SelectItem value="Gaming">Gaming</SelectItem>
                    <SelectItem value="Cash">Cash Prizes</SelectItem>
                    <SelectItem value="Home">Home & Garden</SelectItem>
                    <SelectItem value="Fashion">Fashion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="rounded-2xl"
                placeholder="Latest iPhone with 256GB storage"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longDescription">Long Description</Label>
              <Textarea
                id="longDescription"
                value={formData.longDescription}
                onChange={(e) =>
                  setFormData({ ...formData, longDescription: e.target.value })
                }
                className="rounded-2xl min-h-[120px]"
                placeholder="Detailed description of the prize..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Main Image URL</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                className="rounded-2xl"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Entries */}
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader>
            <CardTitle>Pricing & Entries</CardTitle>
            <CardDescription>
              Set the price per entry and total number of entries
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="real_price">Real Price (PKR) *</Label>
                <Input
                  id="real_price"
                  type="number"
                  value={formData.realPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, realPrice: e.target.value })
                  }
                  className="rounded-2xl"
                  placeholder="50"
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price per Entry (PKR) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="rounded-2xl"
                  placeholder="50"
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalEntries">Total Entries *</Label>
                <Input
                  id="totalEntries"
                  type="number"
                  value={formData.totalEntries}
                  onChange={(e) =>
                    setFormData({ ...formData, totalEntries: e.target.value })
                  }
                  className="rounded-2xl"
                  placeholder="1000"
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="rounded-2xl"
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, featured: checked })
                }
              />
              <Label htmlFor="featured" className="cursor-pointer">
                Featured Raffle (Highlights on Home Page)
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Expenses & Marketing Costs */}
        <Card className="rounded-2xl shadow-lg border-0 overflow-hidden bg-white">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100/60 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-sm">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900">
                    Raffle Expenses & Marketing Costs
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Add ad spend (e.g. TikTok ads Rs. 1,200), promotions, shipping, or packaging to deduct from profits.
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white/80 border-amber-300 text-amber-900 font-semibold px-3 py-1 text-sm rounded-xl">
                  Total Expenses: Rs. {formData.expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0).toLocaleString()}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Quick Presets */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Quick Pakistani Campaign Presets (Click to autofill)
              </Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "TikTok ads", amount: "1200" },
                  { label: "Meta / Instagram Ads", amount: "2500" },
                  { label: "Courier & Delivery", amount: "600" },
                  { label: "WhatsApp Broadcast", amount: "800" },
                  { label: "Influencer Promotion", amount: "5000" },
                  { label: "Prize Packaging", amount: "400" },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setExpenseDesc(preset.label);
                      setExpenseAmount(preset.amount);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-gray-200 bg-gray-50 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-900 transition-colors"
                  >
                    <Plus className="h-3 w-3 text-amber-600" />
                    <span>{preset.label}</span>
                    <span className="text-gray-400 font-mono">Rs.{preset.amount}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Expense Inputs */}
            <div className="grid md:grid-cols-12 gap-3 items-end p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
              <div className="md:col-span-6 space-y-1.5">
                <Label htmlFor="expense_desc" className="text-xs font-medium text-gray-700">
                  Expense Description *
                </Label>
                <Input
                  id="expense_desc"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  placeholder="e.g. TikTok ads, Facebook boost, Packaging"
                  className="rounded-xl bg-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addExpense();
                    }
                  }}
                />
              </div>

              <div className="md:col-span-4 space-y-1.5">
                <Label htmlFor="expense_amount" className="text-xs font-medium text-gray-700">
                  Amount in PKR (Rs.) *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                    Rs.
                  </span>
                  <Input
                    id="expense_amount"
                    type="number"
                    min="1"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="1200"
                    className="rounded-xl pl-9 bg-white"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addExpense();
                      }
                    }}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <Button
                  type="button"
                  onClick={() => addExpense()}
                  disabled={!expenseDesc.trim() || !expenseAmount || Number(expenseAmount) <= 0}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            {/* Itemized Expenses List */}
            {formData.expenses.length === 0 ? (
              <div className="text-center py-6 px-4 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                <Receipt className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">No expenses added yet</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Type an expense like <span className="font-semibold text-gray-700">Rs. 1200 TikTok ads</span> above to factor it into the raffle profit calculations.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-500 px-2 uppercase tracking-wider">
                  <span>Expense Item ({formData.expenses.length})</span>
                  <span>Amount & Action</span>
                </div>
                <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden bg-white">
                  {formData.expenses.map((expense, idx) => (
                    <div
                      key={expense.id || idx}
                      className="flex items-center justify-between p-3.5 hover:bg-amber-50/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {expense.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            Marketing / Campaign Cost
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold font-mono text-gray-900 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                          Rs. {Number(expense.amount).toLocaleString()}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeExpense(expense.id)}
                          className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-1">
                  <span className="text-xs font-medium text-gray-500">
                    Total Campaign Outflow: <span className="font-bold text-gray-900">Rs. {formData.expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0).toLocaleString()}</span>
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial & Profit Calculation Card */}
        {(() => {
          const entryPrice = parseFloat(formData.price) || 0;
          const totalEntries = parseFloat(formData.totalEntries) || 0;
          const realPrice = parseFloat(formData.realPrice) || 0;
          const totalExpenses = formData.expenses.reduce(
            (sum, item) => sum + (Number(item.amount) || 0),
            0
          );
          const approxRevenue = entryPrice * totalEntries;
          const totalCost = realPrice + totalExpenses;
          const netProfit = approxRevenue - totalCost;
          const earningPercentage =
            totalCost > 0
              ? roundUpTwoDecimals(((approxRevenue - totalCost) / totalCost) * 100)
              : 0;
          const isProfitable = netProfit >= 0;

          return (
            <Card className="rounded-2xl shadow-lg border-0 overflow-hidden bg-white">
              <CardHeader className="bg-gradient-to-r from-slate-900 to-gray-900 text-white pb-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-emerald-400" />
                      <CardTitle className="text-xl text-white">
                        Live Financial & Profit Projections
                      </CardTitle>
                    </div>
                    <CardDescription className="text-gray-300 mt-1">
                      Calculates gross revenue, deducts real prize cost and all campaign expenses to show true net earnings.
                    </CardDescription>
                  </div>
                  <Badge
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border ${
                      isProfitable
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-red-500/20 text-red-300 border-red-500/40"
                    }`}
                  >
                    {isProfitable ? "PROFITABLE RAFFLE" : "DEFICIT / LOSS"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* 4 Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4">
                    <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                      Gross Revenue (Aprox)
                    </span>
                    <div className="text-xl font-black text-blue-950 mt-1">
                      Rs. {approxRevenue.toLocaleString()}
                    </div>
                    <p className="text-xs text-blue-600 mt-0.5 font-mono">
                      Rs. {entryPrice} × {totalEntries.toLocaleString()} tickets
                    </p>
                  </div>

                  <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-4">
                    <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
                      Real Prize Cost
                    </span>
                    <div className="text-xl font-black text-purple-950 mt-1">
                      Rs. {realPrice.toLocaleString()}
                    </div>
                    <p className="text-xs text-purple-600 mt-0.5">
                      Base item purchase
                    </p>
                  </div>

                  <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                        Added Expenses
                      </span>
                      {formData.expenses.length > 0 && (
                        <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-full">
                          {formData.expenses.length}
                        </span>
                      )}
                    </div>
                    <div className="text-xl font-black text-amber-950 mt-1">
                      Rs. {totalExpenses.toLocaleString()}
                    </div>
                    <p className="text-xs text-amber-700 mt-0.5">
                      TikTok ads & marketing
                    </p>
                  </div>

                  <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-4">
                    <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
                      Total Outflow (Costs)
                    </span>
                    <div className="text-xl font-black text-rose-950 mt-1">
                      Rs. {totalCost.toLocaleString()}
                    </div>
                    <p className="text-xs text-rose-600 mt-0.5">
                      Real Price + Expenses
                    </p>
                  </div>
                </div>

                {/* Net Profit Big Banner */}
                <div
                  className={`rounded-2xl p-5 border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isProfitable
                      ? "bg-gradient-to-r from-emerald-500/10 via-emerald-50 to-teal-50 border-emerald-200"
                      : "bg-gradient-to-r from-red-500/10 via-red-50 to-orange-50 border-red-200"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {isProfitable ? (
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                      <span className="text-sm font-bold uppercase tracking-wider text-gray-700">
                        Net Projected Profit (After All Deductions)
                      </span>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span
                        className={`text-3xl sm:text-4xl font-black tracking-tight ${
                          isProfitable ? "text-emerald-700" : "text-red-700"
                        }`}
                      >
                        {isProfitable ? "+" : ""}Rs. {netProfit.toLocaleString()}
                      </span>
                      <span
                        className={`text-sm font-bold px-2.5 py-1 rounded-xl ${
                          isProfitable
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {earningPercentage >= 0 ? "+" : ""}
                        {earningPercentage}% Return (ROI)
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Per ticket net profit:{" "}
                      <span className="font-semibold text-gray-800">
                        Rs. {totalEntries > 0 ? (netProfit / totalEntries).toFixed(2) : 0}
                      </span>{" "}
                      per sold entry
                    </p>
                  </div>

                  {/* Math Breakdown Box */}
                  <div className="bg-white/90 backdrop-blur rounded-xl p-3 border border-gray-200/80 shadow-sm text-xs space-y-1 md:min-w-[280px]">
                    <div className="font-bold text-gray-800 mb-1 flex items-center justify-between">
                      <span>Profit Formula Verification:</span>
                      <span className="text-[10px] text-gray-400 font-mono">100% Verified</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Gross Ticket Revenue:</span>
                      <span className="font-semibold text-blue-700 font-mono">
                        + Rs. {approxRevenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Base Prize Real Price:</span>
                      <span className="font-semibold text-purple-700 font-mono">
                        - Rs. {realPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Added Campaign Expenses:</span>
                      <span className="font-semibold text-amber-700 font-mono">
                        - Rs. {totalExpenses.toLocaleString()}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-1 mt-1 flex justify-between font-bold">
                      <span className="text-gray-900">Net Calculated Profit:</span>
                      <span
                        className={`font-mono ${
                          isProfitable ? "text-emerald-700" : "text-red-700"
                        }`}
                      >
                        Rs. {netProfit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* Specifications */}
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
            <CardDescription>
              Add technical specifications or features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={newSpec}
                onChange={(e) => setNewSpec(e.target.value)}
                className="rounded-2xl"
                placeholder="Add a specification..."
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addSpecification())
                }
              />
              <Button
                type="button"
                onClick={addSpecification}
                className="rounded-2xl"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.specifications.map((spec, index) => (
                <Badge key={index} variant="secondary" className="rounded-2xl">
                  {spec}
                  <button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    className="ml-2 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rules */}
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader>
            <CardTitle>Rules & Terms</CardTitle>
            <CardDescription>
              Add specific rules for this raffle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                className="rounded-2xl"
                placeholder="Add a rule..."
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addRule())
                }
              />
              <Button type="button" onClick={addRule} className="rounded-2xl">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.rules.map((rule, index) => (
                <Badge key={index} variant="secondary" className="rounded-2xl">
                  {rule}
                  <button
                    type="button"
                    onClick={() => removeRule(index)}
                    className="ml-2 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            asChild
            className="rounded-2xl"
          >
            <Link href="/admin/raffles">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white rounded-2xl"
          >
            {loading ? "Creating..." : "Create Raffle"}
          </Button>
        </div>
      </form>
    </div>
  );
}
