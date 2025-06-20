"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react"

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

export function RealVsAproxModal({ realData, aproxData, originalPrice, pricePerEntry }: RealVsAproxModalProps) {
  const [open, setOpen] = useState(false)

  // Calculate differences
  const revenueDiff = realData.revenue - aproxData.revenue
  const profitDiff = realData.profit - aproxData.profit
  const percentageDiff = realData.percentage - aproxData.percentage
  const entriesDiff = realData.entries - aproxData.entries

  // Calculate progress percentages
  const revenueProgress = aproxData.revenue > 0 ? (realData.revenue / aproxData.revenue) * 100 : 0
  const profitProgress = aproxData.profit > 0 ? (realData.profit / aproxData.profit) * 100 : 0
  const entriesProgress = aproxData.entries > 0 ? (realData.entries / aproxData.entries) * 100 : 0

  const getDifferenceIcon = (diff: number) => {
    if (diff > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (diff < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const getDifferenceColor = (diff: number) => {
    if (diff > 0) return "text-green-600"
    if (diff < 0) return "text-red-600"
    return "text-gray-600"
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500"
    if (progress >= 75) return "bg-yellow-500"
    if (progress >= 50) return "bg-orange-500"
    return "bg-red-500"
  }

  const getPerformanceBadge = (progress: number) => {
    if (progress >= 100) return <Badge className="bg-green-100 text-green-700">Exceeded</Badge>
    if (progress >= 75) return <Badge className="bg-yellow-100 text-yellow-700">On Track</Badge>
    if (progress >= 50) return <Badge className="bg-orange-100 text-orange-700">Behind</Badge>
    return <Badge className="bg-red-100 text-red-700">Poor</Badge>
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-2xl">
          <BarChart3 className="mr-2 h-4 w-4" />
          Real vs Aprox
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <BarChart3 className="mr-2 h-6 w-6 text-blue-500" />
            Real vs Approximation Analysis
          </DialogTitle>
          <DialogDescription>
            Compare actual performance with projected approximations for this raffle
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-600">Revenue Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold">{Math.round(revenueProgress)}%</span>
                  {getPerformanceBadge(revenueProgress)}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(revenueProgress)}`}
                    style={{ width: `${Math.min(revenueProgress, 100)}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-600">Profit Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold">{Math.round(profitProgress)}%</span>
                  {getPerformanceBadge(profitProgress)}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(profitProgress)}`}
                    style={{ width: `${Math.min(profitProgress, 100)}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-600">Entries Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold">{Math.round(entriesProgress)}%</span>
                  {getPerformanceBadge(entriesProgress)}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(entriesProgress)}`}
                    style={{ width: `${Math.min(entriesProgress, 100)}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Comparison */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Real Data */}
            <Card className="rounded-2xl border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Real Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Total Revenue</span>
                    <span className="text-lg font-bold text-green-700">{formatCurrency(realData.revenue)}</span>
                  </div>
                  <div className="text-xs text-gray-500">From {realData.entries} entries</div>
                </div>

                <div className="bg-white p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Total Profit</span>
                    <span className="text-lg font-bold text-green-700">{formatCurrency(realData.profit)}</span>
                  </div>
                  <div className="text-xs text-gray-500">After {formatCurrency(originalPrice)} expenses</div>
                </div>

                <div className="bg-white p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Profit Margin</span>
                    <span className="text-lg font-bold text-green-700">{realData.percentage}%</span>
                  </div>
                  <div className="text-xs text-gray-500">Current profit percentage</div>
                </div>

                <div className="bg-white p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Entries Sold</span>
                    <span className="text-lg font-bold text-green-700">{realData.entries}</span>
                  </div>
                  <div className="text-xs text-gray-500">Actual entries purchased</div>
                </div>
              </CardContent>
            </Card>

            {/* Approximation Data */}
            <Card className="rounded-2xl border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-800">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Approximation Target
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Target Revenue</span>
                    <span className="text-lg font-bold text-blue-700">{formatCurrency(aproxData.revenue)}</span>
                  </div>
                  <div className="text-xs text-gray-500">From {aproxData.entries} entries</div>
                </div>

                <div className="bg-white p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Target Profit</span>
                    <span className="text-lg font-bold text-blue-700">{formatCurrency(aproxData.profit)}</span>
                  </div>
                  <div className="text-xs text-gray-500">After {formatCurrency(originalPrice)} expenses</div>
                </div>

                <div className="bg-white p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Target Margin</span>
                    <span className="text-lg font-bold text-blue-700">{aproxData.percentage}%</span>
                  </div>
                  <div className="text-xs text-gray-500">Projected profit percentage</div>
                </div>

                <div className="bg-white p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Max Entries</span>
                    <span className="text-lg font-bold text-blue-700">{aproxData.entries}</span>
                  </div>
                  <div className="text-xs text-gray-500">Maximum possible entries</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Difference Analysis */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-purple-500" />
                Difference Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Revenue Gap</span>
                    {getDifferenceIcon(revenueDiff)}
                  </div>
                  <div className={`text-lg font-bold ${getDifferenceColor(revenueDiff)}`}>
                    {revenueDiff >= 0 ? "+" : ""}
                    {formatCurrency(Math.abs(revenueDiff))}
                  </div>
                  <div className="text-xs text-gray-500">{revenueDiff >= 0 ? "Above" : "Below"} target</div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Profit Gap</span>
                    {getDifferenceIcon(profitDiff)}
                  </div>
                  <div className={`text-lg font-bold ${getDifferenceColor(profitDiff)}`}>
                    {profitDiff >= 0 ? "+" : ""}
                    {formatCurrency(Math.abs(profitDiff))}
                  </div>
                  <div className="text-xs text-gray-500">{profitDiff >= 0 ? "Above" : "Below"} target</div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Margin Gap</span>
                    {getDifferenceIcon(percentageDiff)}
                  </div>
                  <div className={`text-lg font-bold ${getDifferenceColor(percentageDiff)}`}>
                    {percentageDiff >= 0 ? "+" : ""}
                    {Math.abs(percentageDiff)}%
                  </div>
                  <div className="text-xs text-gray-500">{percentageDiff >= 0 ? "Above" : "Below"} target</div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Entries Gap</span>
                    {getDifferenceIcon(entriesDiff)}
                  </div>
                  <div className={`text-lg font-bold ${getDifferenceColor(entriesDiff)}`}>
                    {entriesDiff >= 0 ? "+" : ""}
                    {Math.abs(entriesDiff)}
                  </div>
                  <div className="text-xs text-gray-500">{entriesDiff >= 0 ? "Above" : "Below"} target</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50">
            <CardContent className="p-6">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-800">Performance Summary</h3>
                <p className="text-gray-600">
                  This raffle has achieved{" "}
                  <span className="font-bold text-blue-600">{Math.round(revenueProgress)}%</span> of its revenue target
                  and <span className="font-bold text-green-600">{Math.round(entriesProgress)}%</span> of its entry
                  target.
                </p>
                <div className="flex justify-center space-x-4 mt-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Price per Entry</div>
                    <div className="font-semibold">{formatCurrency(pricePerEntry)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Original Cost</div>
                    <div className="font-semibold">{formatCurrency(originalPrice)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
