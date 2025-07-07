"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Receipt, Mail, Download, CheckCircle, Calendar, CreditCard, User, Trophy } from "lucide-react"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

interface ReceiptModalProps {
  payment: {
    id: string
    amount: number
    status: string
    method: string
    transactionId: string | null
    createdAt: string
    entries: number
    raffleName: string
    user: {
      name: string
      email: string
      phone?: string
      city?: string
    }
  }
  trigger?: React.ReactNode
}

export function ReceiptModal({ payment, trigger }: ReceiptModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const handleSendEmail = async () => {
    setIsSending(true)
    try {
      const response = await fetch("/api/receipts/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: payment.id }),
      })

      if (response.ok) {
        toast({
          title: "Receipt Sent",
          description: `Receipt has been sent to ${payment.user.email}`,
        })
        setIsOpen(false)
      } else {
        throw new Error("Failed to send receipt")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send receipt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleDownload = () => {
    // Create a printable version
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt - ${payment.id}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #dc2626; }
            .receipt-details { margin: 20px 0; }
            .row { display: flex; justify-content: space-between; margin: 10px 0; }
            .total { font-size: 18px; font-weight: bold; border-top: 2px solid #e5e7eb; padding-top: 10px; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
            .completed { background: #dcfce7; color: #166534; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🎟️ Pakistan Raffle</div>
            <h2>Payment Receipt</h2>
          </div>
          <div class="receipt-details">
            <div class="row"><span>Receipt #:</span><span>${payment.id.slice(0, 8).toUpperCase()}</span></div>
            <div class="row"><span>Date:</span><span>${formatDateTime(new Date(payment.createdAt))}</span></div>
            <div class="row"><span>Customer:</span><span>${payment.user.name}</span></div>
            <div class="row"><span>Email:</span><span>${payment.user.email}</span></div>
            <div class="row"><span>Raffle:</span><span>${payment.raffleName}</span></div>
            <div class="row"><span>Entries:</span><span>${payment.entries}</span></div>
            <div class="row"><span>Payment Method:</span><span>${payment.method}</span></div>
            <div class="row"><span>Transaction ID:</span><span>${payment.transactionId || "N/A"}</span></div>
            <div class="row"><span>Status:</span><span class="status completed">${payment.status}</span></div>
            <div class="row total"><span>Total Amount:</span><span>${formatCurrency(payment.amount)}</span></div>
          </div>
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  // Handle click from dropdown menu
  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(true)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          <div onClick={handleTriggerClick} className="flex items-center w-full cursor-pointer">
            {trigger}
          </div>
        ) : (
          <Button variant="outline" className="rounded-2xl">
            <Receipt className="h-4 w-4 mr-2" />
            Send Receipt
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Receipt className="h-5 w-5 mr-2 text-red-500" />
            Payment Receipt
          </DialogTitle>
        </DialogHeader>

        {/* Receipt Design */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-8 space-y-6">
          {/* Header */}
          <div className="text-center border-b-2 border-gray-200 pb-6">
            <div className="text-3xl font-bold text-red-600 mb-2">🎟️ Pakistan Raffle</div>
            <h2 className="text-xl font-semibold text-gray-800">Payment Receipt</h2>
            <p className="text-gray-600 mt-2">Thank you for your purchase!</p>
          </div>

          {/* Receipt Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Receipt Number</label>
                <div className="font-mono text-lg font-bold text-gray-900">#{payment.id.slice(0, 8).toUpperCase()}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Date & Time</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{formatDateTime(new Date(payment.createdAt))}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Customer Information */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Customer Information
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{payment.user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{payment.user.email}</span>
                </div>
                {payment.user.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{payment.user.phone}</span>
                  </div>
                )}
                {payment.user.city && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">City:</span>
                    <span className="font-medium">{payment.user.city}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Purchase Details */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Trophy className="h-4 w-4 mr-2" />
                Purchase Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{payment.raffleName}</div>
                    <div className="text-sm text-gray-600">{payment.entries} entries</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{formatCurrency(payment.amount)}</div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(payment.amount / payment.entries)} per entry
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Payment Information */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Payment Information
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">{payment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono text-sm">{payment.transactionId || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <Badge
                    className={`${
                      payment.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    } rounded-2xl`}
                  >
                    {payment.status === "COMPLETED" && <CheckCircle className="w-3 h-3 mr-1" />}
                    {payment.status}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Total */}
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">Total Amount Paid:</span>
                <span className="text-2xl font-bold text-red-600">{formatCurrency(payment.amount)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-200">
              <p>This is an official receipt for your raffle entry purchase.</p>
              <p className="mt-1">For support, contact us at support@pakraffle.com</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleDownload} className="rounded-2xl">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button
            onClick={handleSendEmail}
            disabled={isSending}
            className="bg-red-600 hover:bg-red-700 text-white rounded-2xl"
          >
            <Mail className="h-4 w-4 mr-2" />
            {isSending ? "Sending..." : "Send Email"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
