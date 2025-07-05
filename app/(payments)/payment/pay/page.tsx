"use client"

import type React from "react"

import { Copy, Upload, Ticket, CheckCircle, ArrowRight, Dot, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import Link from "next/link"

// Payment methods data
const paymentMethods = {
  easypaisa: {
    name: "EasyPaisa",
    icon: "https://crystalpng.com/wp-content/uploads/2024/10/Easypaisa-logo.png",
    gradient: "from-green-500 to-green-600",
    bgGradient: "from-green-50 to-green-100",
    accountNumber: "03001234567",
    accountName: "Raffle Management Services",
    iban: "PK36EASY0000001234567890",
  },
  nayapay: {
    name: "NayaPay",
    icon: "https://vectorseek.com/wp-content/uploads/2023/09/NayaPay-Icon-Logo-Vector.svg-.png",
    gradient: "from-orange-500 to-orange-600",
    bgGradient: "from-orange-50 to-orange-100",
    accountNumber: "03009876543",
    accountName: "Raffle Management Services",
    iban: "PK24NAYA0000009876543210",
  },
  jazzcash: {
    name: "JazzCash",
    icon: "https://crystalpng.com/wp-content/uploads/2024/12/new-Jazzcash-logo.png",
    gradient: "from-red-500 to-red-600",
    bgGradient: "from-red-50 to-red-100",
    accountNumber: "03005555555",
    accountName: "Raffle Management Services",
    iban: "PK12JAZZ0000005555555555",
  },
}

function PaymentPageContent() {
  const searchParams = useSearchParams()

  // Extract all query parameters
  const paymentMethod = searchParams.get("method") || "easypaisa"
  const orderId = searchParams.get("orderId") || ""
  const quantity = Number.parseInt(searchParams.get("q") || "1")
  const raffleId = searchParams.get("refId") || ""
  const totalAmount = Number.parseFloat(searchParams.get("tam") || "0")
  const raffleTitle = searchParams.get("refTit") || "Premium Electronics Giveaway"
  const endDate = searchParams.get("endDate") || ""
  const processingFee = Number.parseFloat(searchParams.get("procFee") || "0")

  const selectedMethod = paymentMethods[paymentMethod as keyof typeof paymentMethods] || paymentMethods.easypaisa
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [uploadProgress, setUploadProgress] = useState(0)

  // Calculate entry fee (total - processing fee)
  const entryFee = totalAmount - processingFee

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "TBD"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopiedField(fieldName)
      setTimeout(() => setCopiedField(null), 2000)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file (PNG, JPG, JPEG)")
        return
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        return
      }
      setSelectedFile(file)
      setSubmitStatus("idle") // Reset status when new file is selected
      setUploadProgress(0)
    }
  }

  const triggerFileInput = () => {
    document.getElementById("file-input")?.click()
  }

  const handleSubmitPayment = async () => {
    if (!selectedFile) return

    setIsSubmitting(true)
    setSubmitStatus("idle")
    setUploadProgress(0)

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append("receipt", selectedFile)
      formData.append("orderId", orderId)
      formData.append("raffleId", raffleId)
      formData.append("paymentMethod", paymentMethod)
      formData.append("totalAmount", totalAmount.toString())
      formData.append("quantity", quantity.toString())

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Make API call to submit payment
      const response = await fetch("/api/payments/make", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setSubmitStatus("success")
        // Redirect to thank you page with order and raffle details
        setTimeout(() => {
          window.location.href = `/payment/thank-you?orderId=${orderId}&raffleId=${raffleId}&paymentMethod=${paymentMethod}`
        }, 2000)
      } else {
        throw new Error(result.message || "Payment submission failed")
      }
    } catch (error) {
      console.error("Payment submission error:", error)
      setSubmitStatus("error")
      setUploadProgress(0)
      alert("Failed to submit payment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getButtonContent = () => {
    if (isSubmitting) {
      return (
        <>
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Uploading Receipt... {uploadProgress}%
        </>
      )
    }

    if (submitStatus === "success") {
      return (
        <>
          <CheckCircle className="h-5 w-5 mr-2" />
          Payment Submitted Successfully!
        </>
      )
    }

    if (!selectedFile) {
      return "Select Receipt First"
    }

    return "Confirm Payment & Submit Entry"
  }

  const getButtonClassName = () => {
    const baseClass = "w-full mt-4 font-semibold py-3 rounded-2xl shadow-lg transition-all duration-200"

    if (submitStatus === "success") {
      return `${baseClass} bg-green-600 hover:bg-green-700 text-white`
    }

    if (isSubmitting || !selectedFile) {
      return `${baseClass} bg-gray-400 text-white cursor-not-allowed`
    }

    return `${baseClass} bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white`
  }

  return (
    <div className="min-h-screen  bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <div className={`bg-gradient-to-r ${selectedMethod.gradient} px-6 py-16`}>
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Ticket className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Almost There!</h1>
          <p className="text-xl text-white/90 mb-2">Complete your payment with {selectedMethod.name}</p>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
            Order #{orderId}
          </Badge>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 -mt-8 relative z-10">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Payment Details - 3 columns */}
          <div className="lg:col-span-3 space-y-8">
            {/* Payment Method Card */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border-0">
              <div className="flex items-center gap-6 mb-8">
                <div className={`w-16 h-16 rounded-2xl p-2 bg-white flex items-center justify-center shadow-lg`}>
                  <img src={selectedMethod.icon || "/placeholder.svg"} alt={selectedMethod.name} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedMethod.name}</h2>
                  <p className="text-gray-600">Mobile Wallet Payment</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Account Number */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Account Number</label>
                  <div className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors p-5 rounded-2xl">
                    <span className="text-2xl font-mono font-bold text-gray-900">{selectedMethod.accountNumber}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(selectedMethod.accountNumber, "accountNumber")}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl"
                    >
                      {copiedField === "accountNumber" ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Account Name */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Account Name</label>
                  <div className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors p-5 rounded-2xl">
                    <span className="text-lg font-semibold text-gray-900">{selectedMethod.accountName}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(selectedMethod.accountName, "accountName")}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl"
                    >
                      {copiedField === "accountName" ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* IBAN */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">IBAN</label>
                  <div className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors p-5 rounded-2xl">
                    <span className="text-lg font-mono font-semibold text-gray-900">{selectedMethod.iban}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(selectedMethod.iban, "iban")}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl"
                    >
                      {copiedField === "iban" ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions Flow */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                How to Complete Payment
              </h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold shadow-lg">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Send Payment</h4>
                    <p className="text-gray-700">
                      Transfer <span className="font-bold text-green-600">Rs. {totalAmount.toLocaleString()}</span> to
                      the {selectedMethod.name} account above
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-green-500 mt-2" />
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold shadow-lg">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Take Screenshot</h4>
                    <p className="text-gray-700">Capture your payment confirmation screen</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-green-500 mt-2" />
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold shadow-lg">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Upload & Confirm</h4>
                    <p className="text-gray-700">Submit your receipt to activate your raffle entry</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Amount Due */}
            <div className="bg-white rounded-3xl shadow-xl p-6 text-center">
              <p className="text-gray-600 mb-2">Amount to Pay</p>
              <p className="text-4xl font-bold text-green-600 mb-4">Rs. {totalAmount.toLocaleString()}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Entry Fee ({quantity}x)</span>
                  <span>Rs. {entryFee.toLocaleString()}</span>
                </div>
                {processingFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processing Fee</span>
                    <span>Rs. {processingFee.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Entry Info */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Entry Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Raffle</p>
                  <p className="font-semibold">{raffleTitle}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="font-semibold">
                    {quantity} {quantity === 1 ? "Entry" : "Entries"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Draw Date</p>
                  <p className="font-semibold">{formatDate(endDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Raffle ID</p>
                  <p className="font-semibold">#{raffleId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge
                    className={`${submitStatus === "success" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"} hover:bg-current`}
                  >
                    {submitStatus === "success" ? "Payment Submitted" : "Pending Payment"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Upload Receipt */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Upload Payment Receipt</h3>
                <p className="text-sm text-gray-600">Submit your payment screenshot</p>
              </div>

              <input id="file-input" type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

              <div
                onClick={triggerFileInput}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group ${
                  submitStatus === "success"
                    ? "border-green-300 bg-green-50/50"
                    : "border-gray-300 hover:border-orange-400 hover:bg-orange-50/50"
                }`}
              >
                <div className="space-y-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto transition-colors ${
                      submitStatus === "success" ? "bg-green-100" : "bg-orange-100 group-hover:bg-orange-200"
                    }`}
                  >
                    {submitStatus === "success" ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Upload className="h-5 w-5 text-orange-500" />
                    )}
                  </div>
                  <div>
                    {selectedFile ? (
                      <>
                        <p className="font-medium text-gray-900 text-sm">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-gray-900 text-sm">Click to upload</p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload Progress Bar */}
              {isSubmitting && uploadProgress > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleSubmitPayment}
                disabled={!selectedFile || isSubmitting || submitStatus === "success"}
                className={getButtonClassName()}
              >
                {getButtonContent()}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex text-gray-500 text-sm space-x-4 w-full justify-center items-center pt-16 pb-10">
        <Link href={"/terms?via=paymentFooter"} className="flex items-center ">
          <Dot className="w-5" />
          <span>Terms</span>
        </Link>
        <Link href={"/privacy?via=paymentFooter"} className="flex items-center ">
          <Dot className="w-5" />
          <span>Privacy</span>
        </Link>
        <Link href={"/refund?via=paymentFooter"} className="flex items-center ">
          <Dot className="w-5" />
          <span>Refund policy</span>{" "}
        </Link>
      </div>
    </div>
  )
}

export default function Component() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payment details...</p>
          </div>
        </div>
      }
    >
      <PaymentPageContent />
    </Suspense>
  )
}
