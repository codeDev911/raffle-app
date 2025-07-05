"use client"

import { CheckCircle, FileText, Clock, ArrowRight, Ticket, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"

function ThankYouContent() {
  const searchParams = useSearchParams()

  const orderId = searchParams.get("orderId") || ""
  const raffleId = searchParams.get("raffleId") || ""
  const paymentMethod = searchParams.get("paymentMethod") || "easypaisa"

  // Payment method configurations with gradients and icons
  const paymentMethodConfig = {
    easypaisa: {
      name: "EasyPaisa",
      icon: "https://crystalpng.com/wp-content/uploads/2024/10/Easypaisa-logo.png",
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100",
    },
    nayapay: {
      name: "NayaPay",
      icon: "https://vectorseek.com/wp-content/uploads/2023/09/NayaPay-Icon-Logo-Vector.svg-.png",
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50 to-orange-100",
    },
    jazzcash: {
      name: "JazzCash",
      icon: "https://crystalpng.com/wp-content/uploads/2024/12/new-Jazzcash-logo.png",
      gradient: "from-red-800 to-red-600",
      bgGradient: "from-red-50 to-red-100",
    },
  }

  const selectedMethod =
    paymentMethodConfig[paymentMethod as keyof typeof paymentMethodConfig] || paymentMethodConfig.easypaisa

  return (
    <div className={`min-h-screen bg-gradient-to-br ${selectedMethod.bgGradient}`}>
      {/* Success Header */}
      <div className={`bg-gradient-to-r ${selectedMethod.gradient} px-4 lg:px-6 py-8 lg:py-16`}>
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-4 lg:mb-6 flex h-16 w-16 lg:h-24 lg:w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <CheckCircle className="h-8 w-8 lg:h-12 lg:w-12 text-white" />
          </div>
          <h1 className="text-2xl lg:text-4xl font-bold text-white mb-2 lg:mb-4">Thank You!</h1>
          <p className="text-lg lg:text-xl text-white/90 mb-4 lg:mb-6">Your payment has been submitted successfully</p>
          <Badge
            variant="secondary"
            className="bg-white/20 text-white border-white/30 px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-lg"
          >
            Order #{orderId}
          </Badge>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 lg:px-6 -mt-6 lg:-mt-8 relative z-10">
        {/* Main Content Card */}
        <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl p-4 lg:p-8 mb-6 lg:mb-8">
          <div className="text-center mb-6 lg:mb-8">
            <div
              className={`w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r ${selectedMethod.gradient} rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-3 lg:mb-4 shadow-lg`}
            >
              <FileText className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Payment Under Review</h2>
            <p className="text-sm lg:text-base text-gray-600 max-w-2xl mx-auto">
              We have received your payment details and uploaded documents. Our team will review your submission and
              confirm your raffle entry within 30 minutes.
            </p>
          </div>

          {/* Status Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div className="text-center">
              <div
                className={`w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r ${selectedMethod.gradient} rounded-full flex items-center justify-center mx-auto mb-2 lg:mb-3 shadow-lg`}
              >
                <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm lg:text-base">Payment Submitted</h3>
              <p className="text-xs lg:text-sm text-gray-600">Your {selectedMethod.name} payment has been received</p>
            </div>

            <div className="text-center">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2 lg:mb-3 shadow-lg">
                <Clock className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm lg:text-base">Under Review</h3>
              <p className="text-xs lg:text-sm text-gray-600">We're verifying your payment receipt</p>
            </div>

            <div className="text-center">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2 lg:mb-3">
                <Ticket className="h-5 w-5 lg:h-6 lg:w-6 text-gray-500" />
              </div>
              <h3 className="font-semibold text-gray-500 mb-1 text-sm lg:text-base">Entry Confirmed</h3>
              <p className="text-xs lg:text-sm text-gray-400">You'll receive confirmation soon</p>
            </div>
          </div>

          {/* Payment Method Display */}
          <div
            className={`bg-gradient-to-r ${selectedMethod.bgGradient} rounded-xl lg:rounded-2xl p-4 lg:p-6 mb-6 lg:mb-8`}
          >
            <div className="flex items-center gap-3 lg:gap-4 mb-3 lg:mb-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl p-2 bg-white flex items-center justify-center shadow-lg">
                <img
                  src={selectedMethod.icon || "/placeholder.svg"}
                  alt={selectedMethod.name}
                  className="w-6 h-6 lg:w-8 lg:h-8 object-contain"
                />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm lg:text-base">Payment Method</h3>
                <p className="text-gray-600 text-xs lg:text-sm">{selectedMethod.name} Mobile Wallet</p>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-xl lg:rounded-2xl p-4 lg:p-6 mb-6 lg:mb-8">
            <h3 className="font-bold text-gray-900 mb-3 lg:mb-4 text-sm lg:text-base">Submission Details</h3>
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              <div>
                <p className="text-xs lg:text-sm text-gray-600">Order ID</p>
                <p className="font-semibold text-sm lg:text-base">#{orderId}</p>
              </div>
              <div>
                <p className="text-xs lg:text-sm text-gray-600">Payment Method</p>
                <p className="font-semibold text-sm lg:text-base">{selectedMethod.name}</p>
              </div>
              <div>
                <p className="text-xs lg:text-sm text-gray-600">Raffle ID</p>
                <p className="font-semibold text-sm lg:text-base">#{raffleId}</p>
              </div>
              <div>
                <p className="text-xs lg:text-sm text-gray-600">Submitted At</p>
                <p className="font-semibold text-sm lg:text-base">{new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div
            className={`bg-gradient-to-r ${selectedMethod.bgGradient} rounded-xl lg:rounded-2xl p-4 lg:p-6 mb-6 lg:mb-8`}
          >
            <h3 className="font-bold text-gray-900 mb-3 lg:mb-4 flex items-center gap-2 text-sm lg:text-base">
              <Clock
                className={`h-4 w-4 lg:h-5 lg:w-5 ${paymentMethod === "easypaisa" ? "text-green-500" : paymentMethod === "nayapay" ? "text-orange-500" : "text-red-500"}`}
              />
              What Happens Next?
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 lg:w-6 lg:h-6 bg-gradient-to-r ${selectedMethod.gradient} rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5`}
                >
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm lg:text-base">Payment Verification</p>
                  <p className="text-xs lg:text-sm text-gray-600">
                    We'll verify your payment receipt within 30 minutes
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 lg:w-6 lg:h-6 bg-gradient-to-r ${selectedMethod.gradient} rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5`}
                >
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm lg:text-base">Entry Confirmation</p>
                  <p className="text-xs lg:text-sm text-gray-600">You'll receive an email confirmation once approved</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 lg:w-6 lg:h-6 bg-gradient-to-r ${selectedMethod.gradient} rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5`}
                >
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm lg:text-base">Raffle Participation</p>
                  <p className="text-xs lg:text-sm text-gray-600">Your entry will be active for the upcoming draw</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center">
            <Link href={`/raffle/${raffleId}`}>
              <Button
                className={`w-full sm:w-auto bg-gradient-to-r ${selectedMethod.gradient} hover:opacity-90 text-white px-6 lg:px-8 py-2 lg:py-3 rounded-xl lg:rounded-2xl shadow-lg flex items-center gap-2 text-sm lg:text-base`}
              >
                <Eye className="h-4 w-4 lg:h-5 lg:w-5" />
                Go to Raffle
                <ArrowRight className="h-3 w-3 lg:h-4 lg:w-4" />
              </Button>
            </Link>

            <Link href="/dashboard">
              <Button
                variant="outline"
                className="w-full sm:w-auto border-2 border-gray-300 hover:border-gray-400 px-6 lg:px-8 py-2 lg:py-3 rounded-xl lg:rounded-2xl flex items-center gap-2 bg-transparent text-sm lg:text-base"
              >
                <FileText className="h-4 w-4 lg:h-5 lg:w-5" />
                View My Entries
              </Button>
            </Link>
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl p-4 lg:p-6 mb-6 lg:mb-8">
          <div className="text-center">
            <div
              className={`w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r ${selectedMethod.gradient} rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-3 lg:mb-4 shadow-lg`}
            >
              <Ticket className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2 text-sm lg:text-base">Need Help?</h3>
            <p className="text-gray-600 mb-3 lg:mb-4 text-xs lg:text-sm">
              If you have any questions about your payment or entry, our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center">
              <Link href="/contact">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-gray-300 hover:border-gray-400 px-4 lg:px-6 py-2 rounded-lg lg:rounded-xl bg-transparent text-xs lg:text-sm"
                >
                  Contact Support
                </Button>
              </Link>
              <Link href="/faq">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-gray-300 hover:border-gray-400 px-4 lg:px-6 py-2 rounded-lg lg:rounded-xl bg-transparent text-xs lg:text-sm"
                >
                  View FAQ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 lg:py-8 text-gray-500 text-xs lg:text-sm">
        <p>© 2024 Raffle Platform. All rights reserved.</p>
      </div>
    </div>
  )
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading confirmation...</p>
          </div>
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  )
}
