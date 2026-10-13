"use client"

import React, { Suspense, useState, useId } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Copy,
  CheckCircle2,
  Upload,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  HelpCircle,
  FileText,
  AlertCircle,
  Eye,
  Trash2,
  Lock,
  Sparkles,
  Trophy,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const WHATSAPP_SUPPORT_NUMBER = "+92 337 7155722"
const WHATSAPP_PHONE_CLEAN = "923377155722"

// Pakistani Payment Methods Config
const paymentMethodsConfig: Record<
  string,
  {
    name: string
    shortName: string
    typeLabel: string
    icon: string
    fallbackBg: string
    brandGradient: string
    borderAccent: string
    pillBg: string
    accountNumber: string
    accountName: string
    iban: string
  }
> = {
  easypaisa: {
    name: "EasyPaisa",
    shortName: "EasyPaisa",
    typeLabel: "Mobile Wallet Account",
    icon: "/assets/easypaisa-logo.png",
    fallbackBg: "bg-emerald-600",
    brandGradient: "from-emerald-700 via-emerald-600 to-teal-700",
    borderAccent: "border-emerald-500",
    pillBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
    accountNumber: process.env.NEXT_PUBLIC_EASYPAISA_ACCOUNT_NUMBER || "03001234567",
    accountName: process.env.NEXT_PUBLIC_EASYPAISA_ACCOUNT_NAME || "PakRaffle Official",
    iban: process.env.NEXT_PUBLIC_EASYPAISA_ACCOUNT_IBN || "PK36EPAY0000000000000000",
  },
  jazzcash: {
    name: "JazzCash",
    shortName: "JazzCash",
    typeLabel: "Mobile Wallet Account",
    icon: "/assets/jazzcash-logo.png",
    fallbackBg: "bg-red-700",
    brandGradient: "from-red-800 via-rose-700 to-red-600",
    borderAccent: "border-red-500",
    pillBg: "bg-red-50 text-red-800 border-red-200",
    accountNumber: process.env.NEXT_PUBLIC_JAZZCASH_ACCOUNT_NUMBER || "03007654321",
    accountName: process.env.NEXT_PUBLIC_JAZZCASH_ACCOUNT_NAME || "PakRaffle Official",
    iban: process.env.NEXT_PUBLIC_JAZZCASH_ACCOUNT_IBN || "PK36JCAS0000000000000000",
  },
  nayapay: {
    name: "NayaPay",
    shortName: "NayaPay",
    typeLabel: "Visa Debit & Digital Wallet",
    icon: "/assets/nayapay.png",
    fallbackBg: "bg-orange-500",
    brandGradient: "from-orange-600 via-orange-500 to-amber-600",
    borderAccent: "border-orange-500",
    pillBg: "bg-orange-50 text-orange-800 border-orange-200",
    accountNumber: process.env.NEXT_PUBLIC_NAYAPAY_ACCOUNT_NUMBER || "03009876543",
    accountName: process.env.NEXT_PUBLIC_NAYAPAY_ACCOUNT_NAME || "PakRaffle Official",
    iban: process.env.NEXT_PUBLIC_NAYAPAY_ACCOUNT_IBN || "PK36NAYA0000000000000000",
  },
  sadapay: {
    name: "SadaPay",
    shortName: "SadaPay",
    typeLabel: "Mastercard & SadaBiz Wallet",
    icon: "https://crystalpng.com/wp-content/uploads/2025/09/Sadapay-Logo-768x768.png",
    fallbackBg: "bg-teal-600",
    brandGradient: "from-teal-700 via-teal-600 to-cyan-700",
    borderAccent: "border-teal-500",
    pillBg: "bg-teal-50 text-teal-800 border-teal-200",
    accountNumber: process.env.NEXT_PUBLIC_SADAPAY_ACCOUNT_NUMBER || "03004567890",
    accountName: process.env.NEXT_PUBLIC_SADAPAY_ACCOUNT_NAME || "PakRaffle Official",
    iban: process.env.NEXT_PUBLIC_SADAPAY_ACCOUNT_IBN || "PK36SADA0000000000000000",
  },
  sayapay: {
    name: "SadaPay",
    shortName: "SadaPay",
    typeLabel: "Mastercard & SadaBiz Wallet",
    icon: "https://crystalpng.com/wp-content/uploads/2025/09/Sadapay-Logo-768x768.png",
    fallbackBg: "bg-teal-600",
    brandGradient: "from-teal-700 via-teal-600 to-cyan-700",
    borderAccent: "border-teal-500",
    pillBg: "bg-teal-50 text-teal-800 border-teal-200",
    accountNumber: process.env.NEXT_PUBLIC_SADAPAY_ACCOUNT_NUMBER || "03004567890",
    accountName: process.env.NEXT_PUBLIC_SADAPAY_ACCOUNT_NAME || "PakRaffle Official",
    iban: process.env.NEXT_PUBLIC_SADAPAY_ACCOUNT_IBN || "PK36SADA0000000000000000",
  },
  mezan: {
    name: "Meezan Bank",
    shortName: "Meezan Bank",
    typeLabel: "Direct Bank Transfer / Raast",
    icon: "https://crystalpng.com/wp-content/uploads/2025/01/meezan-bank-logo-768x768.png",
    fallbackBg: "bg-purple-800",
    brandGradient: "from-purple-900 via-purple-800 to-indigo-900",
    borderAccent: "border-purple-600",
    pillBg: "bg-purple-50 text-purple-800 border-purple-200",
    accountNumber: process.env.NEXT_PUBLIC_MEEZAN_ACCOUNT_NUMBER || "01010101010101",
    accountName: process.env.NEXT_PUBLIC_MEEZAN_ACCOUNT_NAME || "PakRaffle Official",
    iban: process.env.NEXT_PUBLIC_MEEZAN_ACCOUNT_IBAN || "PK36MEZN0000000000000000",
  },
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.77.813 2.796.814 3.183 0 5.768-2.586 5.768-5.766 0-3.18-2.585-5.766-5.768-5.766zm3.376 8.204c-.144.405-.837.774-1.17.824-.312.045-.694.06-2.146-.541-1.854-.769-3.037-2.671-3.13-2.794-.093-.124-.75-1-0.75-1.906s.469-1.353.636-1.54c.167-.187.365-.234.487-.234.122 0 .245.001.352.007.113.006.264-.043.413.315.153.365.523 1.277.568 1.37.045.093.076.202.015.324-.061.122-.092.198-.182.304-.091.106-.192.237-.274.318-.091.091-.186.19-.08.372.106.182.471.777 1.011 1.258.697.621 1.285.813 1.467.904.182.091.289.076.396-.045.106-.122.456-.532.578-.714.122-.182.243-.152.41-.091.167.061 1.058.499 1.24.59.182.091.304.137.35.213.045.076.045.441-.099.846z" />
    </svg>
  )
}

function PaymentPageContent() {
  const searchParams = useSearchParams()

  const rawMethod = (searchParams.get("method") || "easypaisa").toLowerCase()
  const orderId = searchParams.get("orderId") || "ORD-PENDING"
  const quantity = Math.max(1, parseInt(searchParams.get("q") || "1", 10))
  const raffleId = searchParams.get("refId") || ""
  const totalAmount = parseFloat(searchParams.get("tam") || "0")
  const raffleTitle = searchParams.get("refTit") || "Official PakRaffle Giveaway"
  const endDate = searchParams.get("endDate") || ""
  const processingFee = parseFloat(searchParams.get("procFee") || "0")
  const referralLinkId = searchParams.get("refLinkId") || ""

  const selectedMethod =
    paymentMethodsConfig[rawMethod] ||
    paymentMethodsConfig.easypaisa

  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [senderNameOrTid, setSenderNameOrTid] = useState("")

  const fileInputId = useId()

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      // Fallback
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
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please select an image file (PNG, JPG, JPEG, WEBP)")
        return
      }
      if (file.size > 8 * 1024 * 1024) {
        setErrorMessage("File size must be under 8MB")
        return
      }
      setErrorMessage(null)
      setSelectedFile(file)
      setSubmitStatus("idle")

      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  const handleSubmitPayment = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select your payment receipt screenshot before submitting.")
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage(null)
    setUploadProgress(10)

    try {
      const formData = new FormData()
      formData.append("receipt", selectedFile)
      formData.append("orderId", orderId)
      formData.append("raffleId", raffleId)
      formData.append("paymentMethod", rawMethod)
      if (referralLinkId) {
        formData.append("referralLinkId", referralLinkId)
      }
      formData.append("totalAmount", totalAmount.toString())
      formData.append("quantity", quantity.toString())
      formData.append("raffleName", raffleTitle)
      if (senderNameOrTid) {
        formData.append("senderInfo", senderNameOrTid)
      }

      // Simulate progress feedback
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => (prev >= 85 ? 85 : prev + 15))
      }, 250)

      const response = await fetch("/api/payments/make", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressTimer)
      setUploadProgress(100)

      const result = await response.json()

      if (response.ok && result.success) {
        setSubmitStatus("success")
        setTimeout(() => {
          const params = new URLSearchParams({
            orderId,
            raffleId,
            paymentMethod: rawMethod,
            amount: totalAmount.toString(),
            quantity: quantity.toString(),
            raffleTitle: raffleTitle || "",
          })
          window.location.href = `/payment/thank-you?${params.toString()}`
        }, 1500)
      } else {
        throw new Error(result.message || "Failed to submit receipt. Please try again.")
      }
    } catch (error: any) {
      console.error("Payment submission error:", error)
      setSubmitStatus("error")
      setErrorMessage(error?.message || "Failed to upload payment receipt. Please retry.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formattedDate = endDate
    ? new Date(endDate).toLocaleDateString("en-PK", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Verified Live Draw"

  const waHelpUrl = `https://wa.me/${WHATSAPP_PHONE_CLEAN}?text=${encodeURIComponent(
    `Salam PakRaffle! I need help with payment for Order #${orderId} (${selectedMethod.name}, Rs. ${totalAmount}).`,
  )}`

  return (
    <div className="min-h-screen bg-gray-50/70 text-gray-900 pb-20">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href={raffleId ? `/raffles/${raffleId}` : "/raffles"}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Raffle</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-mono hidden sm:inline">Order Reference:</span>
            <Badge variant="secondary" className="font-mono text-xs bg-gray-100 text-gray-800 border-gray-200 font-bold">
              #{orderId}
            </Badge>
          </div>
        </div>
      </header>

      {/* Progress Stepper */}
      <div className="bg-white border-b border-gray-100 py-3 px-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2 text-emerald-600">
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
              ✓
            </div>
            <span>Tickets Selected</span>
          </div>
          <div className="h-0.5 w-12 bg-emerald-500 hidden sm:block" />
          <div className="flex items-center gap-2 text-gray-900">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              2
            </div>
            <span className="font-bold">Transfer & Upload</span>
          </div>
          <div className="h-0.5 w-12 bg-gray-200 hidden sm:block" />
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <span>Ticket Confirmation</span>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <section className={`bg-gradient-to-r ${selectedMethod.brandGradient} text-white py-8 sm:py-12 px-4 shadow-sm`}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-2.5 shadow-xl flex items-center justify-center shrink-0">
                {selectedMethod.icon ? (
                  <img
                    src={selectedMethod.icon}
                    alt={selectedMethod.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="font-bold text-gray-900 text-lg">
                    {selectedMethod.shortName.slice(0, 2)}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-white/80">
                    Step 2 of 3
                  </span>
                  <span className="bg-white/20 text-[11px] font-semibold px-2 py-0.5 rounded-full text-white">
                    {selectedMethod.typeLabel}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-0.5">
                  Send Payment via {selectedMethod.name}
                </h1>
                <p className="text-xs sm:text-sm text-white/85 mt-1 line-clamp-1">
                  For &ldquo;{raffleTitle}&rdquo; ({quantity} {quantity === 1 ? "entry" : "entries"})
                </p>
              </div>
            </div>

            {/* Total Highlight Pill */}
            <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-3 sm:p-4 text-left sm:text-right shrink-0">
              <span className="text-[11px] text-white/80 font-medium block">Exact Amount to Transfer</span>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                Rs. {totalAmount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Bank Details & Transfer Instructions (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Account Credentials Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-gray-200/80 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">
                    {selectedMethod.name} Account Credentials
                  </h2>
                  <p className="text-xs text-gray-500">
                    Send funds using your {selectedMethod.name} app or banking app
                  </p>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border ${selectedMethod.pillBg}`}>
                  Verified Account
                </span>
              </div>

              {/* Amount Highlight with Copy */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Amount to Send
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">
                    Rs. {totalAmount.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    Send the exact figure to avoid verification delay
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(totalAmount.toString(), "amount")}
                  className="rounded-xl bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100 shrink-0 text-xs font-semibold h-9"
                >
                  {copiedField === "amount" ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      Copy Amount
                    </>
                  )}
                </Button>
              </div>

              {/* Account Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  Account / Mobile Number
                </label>
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 hover:bg-gray-100/70 transition-colors">
                  <span className="text-base sm:text-lg font-mono font-bold text-gray-900 tracking-wide">
                    {selectedMethod.accountNumber}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(selectedMethod.accountNumber, "accountNumber")}
                    className="text-gray-700 hover:text-emerald-700 hover:bg-white rounded-xl h-8 px-2.5 text-xs font-semibold"
                  >
                    {copiedField === "accountNumber" ? (
                      <span className="text-emerald-600 flex items-center gap-1 font-bold">
                        <Check className="w-3.5 h-3.5" /> Copied
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              {/* Account Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  Account Title (Receiver Name)
                </label>
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 hover:bg-gray-100/70 transition-colors">
                  <span className="text-sm sm:text-base font-semibold text-gray-900">
                    {selectedMethod.accountName}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(selectedMethod.accountName, "accountName")}
                    className="text-gray-700 hover:text-emerald-700 hover:bg-white rounded-xl h-8 px-2.5 text-xs font-semibold"
                  >
                    {copiedField === "accountName" ? (
                      <span className="text-emerald-600 flex items-center gap-1 font-bold">
                        <Check className="w-3.5 h-3.5" /> Copied
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              {/* IBAN */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  IBAN (For Raast & Interbank Transfers)
                </label>
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 hover:bg-gray-100/70 transition-colors gap-2">
                  <span className="text-xs sm:text-sm font-mono font-semibold text-gray-900 break-all">
                    {selectedMethod.iban}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(selectedMethod.iban, "iban")}
                    className="text-gray-700 hover:text-emerald-700 hover:bg-white rounded-xl h-8 px-2.5 text-xs font-semibold shrink-0"
                  >
                    {copiedField === "iban" ? (
                      <span className="text-emerald-600 flex items-center gap-1 font-bold">
                        <Check className="w-3.5 h-3.5" /> Copied
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-200/80 space-y-4">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Simple 3-Step Process
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
                  <div>
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center mb-2">
                      1
                    </div>
                    <h4 className="text-xs font-bold text-gray-900">Transfer Funds</h4>
                    <p className="text-[11px] text-gray-600 mt-1">
                      Open your {selectedMethod.name} app and transfer Rs. {totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
                  <div>
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center mb-2">
                      2
                    </div>
                    <h4 className="text-xs font-bold text-gray-900">Take Screenshot</h4>
                    <p className="text-[11px] text-gray-600 mt-1">
                      Save the payment confirmation screen with visible Transaction ID / TID
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
                  <div>
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center mb-2">
                      3
                    </div>
                    <h4 className="text-xs font-bold text-gray-900">Upload Receipt</h4>
                    <p className="text-[11px] text-gray-600 mt-1">
                      Upload the screenshot on the right to receive your verified ticket number
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Help Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <WhatsAppIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                    Facing any issue during transfer?
                  </h4>
                  <p className="text-[11px] text-gray-600 mt-0.5">
                    Pakistani Support 24/7 on WhatsApp: <span className="font-bold text-emerald-800 font-mono">0337 7155722</span>
                  </p>
                </div>
              </div>

              <a
                href={waHelpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs py-2.5 px-3.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                <span>Chat 0337 7155722</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </a>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary & Receipt Upload Dropzone (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Order Summary Card */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-200/80 space-y-3.5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-emerald-600" />
                  Order Summary
                </h3>
                <Badge variant="outline" className="text-[10px] font-mono text-gray-600">
                  #{orderId}
                </Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-gray-500 block text-[11px]">Raffle Item</span>
                  <span className="font-bold text-gray-900 line-clamp-1">{raffleTitle}</span>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-gray-500">Tickets Quantity</span>
                  <span className="font-semibold text-gray-900 font-mono">
                    {quantity} {quantity === 1 ? "Ticket" : "Tickets"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Draw Date</span>
                  <span className="font-semibold text-gray-900">{formattedDate}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Processing & TCS Fee</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                    FREE
                  </span>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-900">Total Payable</span>
                  <span className="text-xl font-black text-emerald-700 font-mono">
                    Rs. {totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Receipt Upload Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-200/80 space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2 border border-emerald-100">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Upload Payment Receipt</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Attach your screenshot or photo of transaction receipt
                </p>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2 text-red-800 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p>{errorMessage}</p>
                </div>
              )}

              {/* Hidden Native File Input */}
              <input
                id={fileInputId}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Dropzone Area or Preview */}
              {!selectedFile ? (
                <label
                  htmlFor={fileInputId}
                  className="border-2 border-dashed border-gray-300 hover:border-emerald-500 hover:bg-emerald-50/40 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all text-center group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 group-hover:bg-emerald-100 text-gray-500 group-hover:text-emerald-700 flex items-center justify-center transition-colors mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-gray-900">
                    Click to select payment screenshot
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Supports PNG, JPG, JPEG up to 8MB
                  </p>
                </label>
              ) : (
                <div className="border border-emerald-300 bg-emerald-50/30 rounded-2xl p-3.5 space-y-3">
                  <div className="flex items-center gap-3">
                    {previewUrl ? (
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-emerald-200">
                        <img
                          src={previewUrl}
                          alt="Receipt Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to verify
                      </p>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-1">
                        Screenshot Attached
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveFile}
                      disabled={isSubmitting}
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl h-8 w-8 shrink-0"
                      title="Remove screenshot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Optional Reference or Sender Info Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-700 block">
                  Transaction ID / Sender Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. TID 049281948 or Ali Khan"
                  value={senderNameOrTid}
                  onChange={(e) => setSenderNameOrTid(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs bg-gray-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Upload Progress Bar */}
              {isSubmitting && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] font-semibold text-emerald-800">
                    <span>Uploading & verifying receipt...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="button"
                onClick={handleSubmitPayment}
                disabled={!selectedFile || isSubmitting || submitStatus === "success"}
                className={`w-full rounded-2xl h-13 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                  submitStatus === "success"
                    ? "bg-emerald-600 text-white"
                    : !selectedFile
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Receipt ({uploadProgress}%)...</span>
                  </>
                ) : submitStatus === "success" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Payment Submitted! Redirecting...</span>
                  </>
                ) : !selectedFile ? (
                  <span>Attach Receipt to Continue</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit Payment & Issue Tickets</span>
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 pt-1">
                <Lock className="w-3.5 h-3.5 text-gray-400" />
                <span>Manual verification within 5-15 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Links */}
      <footer className="max-w-5xl mx-auto px-4 mt-16 pt-8 border-t border-gray-200 text-center text-xs text-gray-500 space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <Link href="/terms" className="hover:text-gray-900 transition-colors">
            Terms & Conditions
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-gray-900 transition-colors">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/refund" className="hover:text-gray-900 transition-colors">
            Refund Guarantee
          </Link>
          <span>•</span>
          <a
            href={waHelpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-700 font-semibold text-emerald-800 transition-colors"
          >
            WhatsApp Support
          </a>
        </div>
        <p className="text-[11px] text-gray-400">
          PakRaffle © {new Date().getFullYear()} — Pakistan&apos;s Verified Transparent Digital Draws.
        </p>
      </footer>
    </div>
  )
}

export default function Component() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-gray-700">Loading checkout session...</p>
          </div>
        </div>
      }
    >
      <PaymentPageContent />
    </Suspense>
  )
}
