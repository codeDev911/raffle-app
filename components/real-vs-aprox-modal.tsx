"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Scale,
  Sparkles,
  Ticket,
  Target,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Coins,
  Percent,
} from "lucide-react"

interface RealData {
  revenue: number
  profit: number
  percentage: number
  entries: number
}

interface AproxData {
  revenue: number
  profit: number
  percentage: number
  entries: number
}

interface RealVsAproxModalProps {
  realData: RealData
  aproxData: AproxData
  originalPrice: number
  pricePerEntry: number
}

export function RealVsAproxModal({
  realData,
  aproxData,
  originalPrice,
  pricePerEntry,
}: RealVsAproxModalProps) {
  const [open, setOpen] = useState(false)

  // Calculations
  const revenueProgress =
    aproxData.revenue > 0
      ? Math.min(200, Math.round((realData.revenue / aproxData.revenue) * 100))
      : 0
  const entriesProgress =
    aproxData.entries > 0
      ? Math.min(200, Math.round((realData.entries / aproxData.entries) * 100))
      : 0
  const profitProgress =
    aproxData.profit > 0
      ? Math.round((realData.profit / aproxData.profit) * 100)
      : realData.profit > 0
        ? 100
        : 0

  const revenueDiff = realData.revenue - aproxData.revenue
  const profitDiff = realData.profit - aproxData.profit
  const entriesDiff = realData.entries - aproxData.entries
  const marginDiff = realData.percentage - aproxData.percentage

  // Break-even calculation
  const totalCostPaisa = aproxData.revenue - aproxData.profit
  const breakEvenTickets =
    pricePerEntry > 0 ? Math.ceil(totalCostPaisa / pricePerEntry) : 0
  const isPastBreakEven = realData.entries >= breakEvenTickets

  // Unit economics
  const revenuePerSoldTicket = pricePerEntry
  const costPerSoldTicket =
    realData.entries > 0 ? Math.round(totalCostPaisa / realData.entries) : 0
  const profitPerSoldTicket =
    realData.entries > 0 ? Math.round(realData.profit / realData.entries) : 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs min-h-[38px] shadow-2xs"
        >
          <Scale className="mr-1.5 h-4 w-4 text-emerald-600" />
          Projections vs Real Audit
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-5 sm:p-7 border-slate-200 shadow-2xl">
        <DialogHeader className="space-y-1 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Real vs. Target Projections
                <Badge
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    isPastBreakEven
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {isPastBreakEven ? "Profitable / Cost-Covered" : "Breakeven In Progress"}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Live performance comparison between confirmed actuals and 100% capacity targets
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-3">
          {/* Top 3 KPI Comparative Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Revenue */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
                  Gross Revenue
                </span>
                <span className="font-mono font-bold text-slate-900">{revenueProgress}%</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
                {formatCurrency(realData.revenue)}
              </p>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(revenueProgress, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span>Target: {formatCurrency(aproxData.revenue)}</span>
                <span
                  className={
                    revenueDiff >= 0 ? "text-emerald-600 font-semibold" : "text-slate-500"
                  }
                >
                  {revenueDiff >= 0 ? "+" : ""}
                  {formatCurrency(revenueDiff)}
                </span>
              </div>
            </div>

            {/* Net Profit */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
                  Net Real Profit
                </span>
                <Badge
                  className={`text-[10px] px-1.5 py-0 font-bold border-0 ${
                    realData.profit >= 0
                      ? "bg-blue-100 text-blue-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {realData.percentage}% ROI
                </Badge>
              </div>
              <p
                className={`text-xl sm:text-2xl font-bold font-mono ${
                  realData.profit >= 0 ? "text-blue-700" : "text-rose-600"
                }`}
              >
                {formatCurrency(realData.profit)}
              </p>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    realData.profit >= 0 ? "bg-blue-600" : "bg-rose-500"
                  }`}
                  style={{ width: `${Math.max(0, Math.min(profitProgress, 100))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span>Target: {formatCurrency(aproxData.profit)}</span>
                <span
                  className={
                    profitDiff >= 0 ? "text-emerald-600 font-semibold" : "text-rose-600"
                  }
                >
                  {profitDiff >= 0 ? "+" : ""}
                  {formatCurrency(profitDiff)}
                </span>
              </div>
            </div>

            {/* Entries Capacity */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
                  Ticket Sales
                </span>
                <span className="font-mono font-bold text-slate-900">{entriesProgress}%</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
                {realData.entries}{" "}
                <span className="text-xs font-normal text-slate-500">tickets</span>
              </p>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(entriesProgress, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span>Capacity: {aproxData.entries}</span>
                <span>{Math.max(0, aproxData.entries - realData.entries)} left</span>
              </div>
            </div>
          </div>

          {/* Tabbed In-Depth Comparison */}
          <Tabs defaultValue="matrix" className="w-full">
            <TabsList className="bg-slate-100 p-1 rounded-xl h-auto mb-4">
              <TabsTrigger
                value="matrix"
                className="rounded-lg px-3.5 py-1.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-2xs"
              >
                <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                Comparison Matrix
              </TabsTrigger>
              <TabsTrigger
                value="breakeven"
                className="rounded-lg px-3.5 py-1.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-2xs"
              >
                <Target className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                Break-Even Analysis
              </TabsTrigger>
              <TabsTrigger
                value="unit"
                className="rounded-lg px-3.5 py-1.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-2xs"
              >
                <Ticket className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                Ticket Unit Economics
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: COMPARATIVE MATRIX TABLE */}
            <TabsContent value="matrix" className="mt-0 space-y-3">
              <div className="rounded-2xl border border-slate-200/80 overflow-hidden bg-white shadow-2xs">
                <Table className="w-full min-w-[600px]">
                  <TableHeader className="bg-slate-50/75">
                    <TableRow className="border-slate-200">
                      <TableHead className="font-semibold text-xs text-slate-700">Financial Metric</TableHead>
                      <TableHead className="font-semibold text-xs text-slate-700">Projected (100% Target)</TableHead>
                      <TableHead className="font-semibold text-xs text-slate-700">Real Actual</TableHead>
                      <TableHead className="font-semibold text-xs text-slate-700">Variance Gap</TableHead>
                      <TableHead className="text-right font-semibold text-xs text-slate-700">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-slate-100 hover:bg-slate-50/50">
                      <TableCell className="font-medium text-xs text-slate-900">Gross Ticket Revenue</TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">{formatCurrency(aproxData.revenue)}</TableCell>
                      <TableCell className="font-mono text-xs font-bold text-slate-900">{formatCurrency(realData.revenue)}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">
                        {revenueDiff >= 0 ? "+" : ""}{formatCurrency(revenueDiff)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {revenueProgress}%
                        </Badge>
                      </TableCell>
                    </TableRow>

                    <TableRow className="border-slate-100 hover:bg-slate-50/50">
                      <TableCell className="font-medium text-xs text-slate-900">Prize Asset Base Cost</TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">{formatCurrency(originalPrice)}</TableCell>
                      <TableCell className="font-mono text-xs font-bold text-slate-900">{formatCurrency(originalPrice)}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-400">Rs. 0</TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-slate-100 text-slate-700 text-[10px] border-0">Fixed</Badge>
                      </TableCell>
                    </TableRow>

                    <TableRow className="border-slate-100 hover:bg-slate-50/50">
                      <TableCell className="font-medium text-xs text-slate-900">Total Campaign Outflow</TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">{formatCurrency(totalCostPaisa)}</TableCell>
                      <TableCell className="font-mono text-xs font-bold text-slate-900">{formatCurrency(totalCostPaisa)}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-400">Rs. 0</TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-slate-100 text-slate-700 text-[10px] border-0">Ledger</Badge>
                      </TableCell>
                    </TableRow>

                    <TableRow className="border-slate-100 hover:bg-slate-50/50">
                      <TableCell className="font-medium text-xs text-slate-900">Net Profit Margin</TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-emerald-700">{formatCurrency(aproxData.profit)}</TableCell>
                      <TableCell
                        className={`font-mono text-xs font-bold ${
                          realData.profit >= 0 ? "text-emerald-700" : "text-rose-600"
                        }`}
                      >
                        {formatCurrency(realData.profit)}
                      </TableCell>
                      <TableCell
                        className={`font-mono text-xs font-semibold ${
                          profitDiff >= 0 ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {profitDiff >= 0 ? "+" : ""}{formatCurrency(profitDiff)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          className={`text-[10px] font-bold border-0 ${
                            realData.profit >= 0
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {realData.profit >= 0 ? "Profitable" : "Under Outflow"}
                        </Badge>
                      </TableCell>
                    </TableRow>

                    <TableRow className="border-slate-100 hover:bg-slate-50/50">
                      <TableCell className="font-medium text-xs text-slate-900">Return on Investment (ROI %)</TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">{aproxData.percentage}%</TableCell>
                      <TableCell className="font-mono text-xs font-bold text-slate-900">{realData.percentage}%</TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">
                        {marginDiff >= 0 ? "+" : ""}{marginDiff}%
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {realData.percentage >= 0 ? "Positive" : "Negative"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* TAB 2: BREAK-EVEN & SENSITIVITY */}
            <TabsContent value="breakeven" className="mt-0 space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-slate-50 border border-emerald-200/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-sm text-slate-900">
                      Break-Even Ticket Milestone
                    </span>
                  </div>
                  <Badge
                    className={`text-xs font-bold px-2.5 py-1 ${
                      isPastBreakEven
                        ? "bg-emerald-600 text-white"
                        : "bg-amber-500 text-white"
                    }`}
                  >
                    {isPastBreakEven
                      ? "Cost Covered — Generating Pure Profit"
                      : `${Math.max(0, breakEvenTickets - realData.entries)} Tickets Remaining`}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white/90 border border-emerald-100">
                    <span className="text-[11px] text-slate-500 block">Total Costs to Cover</span>
                    <span className="font-mono font-bold text-slate-900 text-base">
                      {formatCurrency(totalCostPaisa)}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/90 border border-emerald-100">
                    <span className="text-[11px] text-slate-500 block">Break-even Threshold</span>
                    <span className="font-mono font-bold text-slate-900 text-base">
                      {breakEvenTickets} tickets
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/90 border border-emerald-100">
                    <span className="text-[11px] text-slate-500 block">Current Status</span>
                    <span className="font-mono font-bold text-emerald-700 text-base">
                      {realData.entries} / {breakEvenTickets} tickets
                    </span>
                  </div>
                </div>

                {/* Visual Step Bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>0 Tickets (Start)</span>
                    <span className="text-emerald-700 font-bold">
                      Break-Even ({breakEvenTickets} tickets)
                    </span>
                    <span>100% Target ({aproxData.entries} tickets)</span>
                  </div>
                  <div className="relative w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isPastBreakEven ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((realData.entries / Math.max(1, aproxData.entries)) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: TICKET UNIT ECONOMICS */}
            <TabsContent value="unit" className="mt-0 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                    Ticket Price
                  </span>
                  <p className="text-xl font-bold font-mono text-slate-900">
                    {formatCurrency(pricePerEntry)}
                  </p>
                  <span className="text-[11px] text-slate-400">Price paid by customer</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                    Avg Cost Per Sold Ticket
                  </span>
                  <p className="text-xl font-bold font-mono text-slate-900">
                    {formatCurrency(costPerSoldTicket)}
                  </p>
                  <span className="text-[11px] text-slate-400">Prize + operations / sold</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                    Net Profit Per Sold Ticket
                  </span>
                  <p
                    className={`text-xl font-bold font-mono ${
                      profitPerSoldTicket >= 0 ? "text-emerald-700" : "text-rose-600"
                    }`}
                  >
                    {formatCurrency(profitPerSoldTicket)}
                  </p>
                  <span className="text-[11px] text-slate-400">Contribution to bottom line</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
