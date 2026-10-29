"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Tag,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  ShieldCheck,
  User,
  Calculator,
  ExternalLink,
  MessageCircle,
  Save,
  Trash2,
  Gift,
  Share2,
  Sparkles,
  Smartphone,
  Bike,
  Gamepad2,
  Laptop,
  Copy,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

interface ProductRequest {
  id: string
  productType: string
  productName: string
  description: string
  phone: string
  email: string
  fullNameCnic: string
  cnicNumber?: string | null
  city?: string | null
  marketPrice: number
  ticketPrice: number
  totalTickets: number
  totalRevenue: number
  platformFee: number
  sellerPayout: number
  condition?: string | null
  images: string[]
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED"
  adminNotes?: string | null
  secureToken?: string | null
  raffleId?: string | null
  createdAt: string
  updatedAt: string
}

export default function AdminRequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [request, setRequest] = useState<ProductRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingNotes, setSavingNotes] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [notes, setNotes] = useState("")
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)
  const [copiedDetailsLink, setCopiedDetailsLink] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const fetchDetail = async (showLoading = true) => {
    if (!id) return
    if (showLoading) setLoading(true)
    try {
      const res = await fetch(`/api/listing-requests/${encodeURIComponent(id)}?_t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "x-admin-request": "true",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })
      const data = await res.json()
      if (data.success && data.request) {
        setRequest(data.request)
        setNotes(data.request.adminNotes || "")
      } else {
        setMessage({ text: data.error || "Request not found", type: "error" })
      }
    } catch (err) {
      console.error("Error fetching request details:", err)
      setMessage({ text: "Network error loading details", type: "error" })
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchDetail(true)
    }
  }, [id])

  const handleUpdateStatus = async (newStatus: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED") => {
    if (!request) return
    setUpdatingStatus(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/listing-requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        setRequest((prev) => (prev ? { ...prev, status: newStatus } : null))
        setMessage({ text: `Request status successfully changed to ${newStatus}`, type: "success" })
        // Immediately fetch fresh state from server to guarantee persistence
        await fetchDetail(false)
      } else {
        setMessage({ text: data.error || "Failed to update status", type: "error" })
      }
    } catch (err) {
      console.error(err)
      setMessage({ text: "Network error updating status", type: "error" })
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!request) return
    setSavingNotes(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/listing-requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: notes }),
      })
      const data = await res.json()
      if (data.success) {
        setRequest((prev) => (prev ? { ...prev, adminNotes: notes } : null))
        setMessage({ text: "Admin notes saved successfully", type: "success" })
      } else {
        setMessage({ text: data.error || "Failed to save notes", type: "error" })
      }
    } catch (err) {
      console.error(err)
      setMessage({ text: "Network error saving notes", type: "error" })
    } finally {
      setSavingNotes(false)
    }
  }

  const handleDeleteRequest = async () => {
    if (!request) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/listing-requests/${request.id}`, {
        method: "DELETE",
        headers: { "x-admin-request": "true" },
      })
      const data = await res.json()
      if (data.success) {
        router.push("/admin/requests?deleted=true")
      } else {
        setMessage({ text: data.error || "Failed to delete request", type: "error" })
        setShowDeleteConfirm(false)
        setDeleting(false)
      }
    } catch (err) {
      console.error(err)
      setMessage({ text: "Network error deleting request", type: "error" })
      setShowDeleteConfirm(false)
      setDeleting(false)
    }
  }

  const cleanPhone = request?.phone?.replace(/\D/g, "") || ""
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=Assalam-o-Alaikum%20${encodeURIComponent(
    request?.fullNameCnic || ""
  )},%20this%20is%20the%20PakRaffle%20Verification%20Desk%20regarding%20your%20listing%20request%20(${request?.id})%20for%20${encodeURIComponent(
    request?.productName || ""
  )}.`

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-600 border-t-transparent mx-auto mb-3" />
        <p className="text-sm font-semibold">Loading product request details...</p>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Request Not Found</h2>
        <p className="text-sm text-slate-500">The requested listing request does not exist or has been removed.</p>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/admin/requests">Back to Requests</Link>
        </Button>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-bold px-3 py-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Review</span>
          </Badge>
        )
      case "UNDER_REVIEW":
        return (
          <Badge className="bg-blue-100 text-blue-900 border-blue-300 font-bold px-3 py-1 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>Under Active Review</span>
          </Badge>
        )
      case "APPROVED":
        return (
          <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 font-bold px-3 py-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Approved &amp; Ready for Launch</span>
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge className="bg-red-100 text-red-900 border-red-300 font-bold px-3 py-1 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Rejected</span>
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="rounded-xl h-10 px-3 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          >
            <Link href="/admin/requests">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Back to Requests</span>
            </Link>
          </Button>

          <span className="text-slate-300">|</span>

          <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg">
            {request.id}
          </span>
        </div>

        {/* Quick Contact & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Chat on WhatsApp</span>
          </a>

          <Button
            asChild
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold h-9 gap-1.5 shadow-sm"
          >
            <Link
              href={`/application/details/${request.id}?token=${request.secureToken || ""}`}
              target="_blank"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Partner Dashboard</span>
              <ExternalLink className="w-3 h-3 text-emerald-200" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl text-xs font-semibold h-9 gap-1.5"
          >
            <Link
              href={`/application/status/${request.id}?token=${request.secureToken || ""}`}
              target="_blank"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Status</span>
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUpdateStatus("UNDER_REVIEW")}
            disabled={updatingStatus || request.status === "UNDER_REVIEW"}
            className="rounded-xl text-xs font-semibold h-9"
          >
            Mark Under Review
          </Button>

          <Button
            size="sm"
            onClick={() => handleUpdateStatus("APPROVED")}
            disabled={updatingStatus || request.status === "APPROVED"}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold h-9"
          >
            Approve Listing
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUpdateStatus("REJECTED")}
            disabled={updatingStatus || request.status === "REJECTED"}
            className="text-amber-700 border-amber-300 hover:bg-amber-50 rounded-xl text-xs font-semibold h-9"
          >
            Reject
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 rounded-xl text-xs font-bold h-9 gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Generated Partner Dashboard Link Box (Always visible for admin) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white shadow-md border border-emerald-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <h3 className="text-base font-extrabold text-white">
                Partner Revenue &amp; Analytics Dashboard Link
              </h3>
              {request.status === "APPROVED" ? (
                <Badge className="bg-emerald-600 text-white border-emerald-400 text-[10px]">
                  Live &amp; Active
                </Badge>
              ) : (
                <Badge className="bg-amber-500/30 text-amber-200 border-amber-400/40 text-[10px]">
                  {request.status} (Preview Link)
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-300">
              Provide this private dashboard link to the seller so they can monitor their real-time revenue, tickets sold, and net payout.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              asChild
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs h-9 rounded-xl gap-1.5"
            >
              <Link
                href={`/application/details/${request.id}?token=${request.secureToken || ""}`}
                target="_blank"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Dashboard</span>
              </Link>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                const url = `${typeof window !== "undefined" ? window.location.origin : ""}/application/details/${request.id}?token=${request.secureToken || ""}`
                if (navigator?.clipboard?.writeText) {
                  await navigator.clipboard.writeText(url)
                }
                setCopiedDetailsLink(true)
                setTimeout(() => setCopiedDetailsLink(false), 2500)
              }}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold h-9 rounded-xl gap-1.5"
            >
              {copiedDetailsLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-amber-300" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/20 font-mono text-xs text-emerald-400 break-all select-all flex items-center justify-between gap-3">
          <span>
            {typeof window !== "undefined" ? window.location.origin : ""}/application/details/{request.id}?token={request.secureToken || ""}
          </span>
        </div>
      </div>

      {/* Delete Confirmation Modal Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 max-w-md w-full space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Delete Product Request?</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Are you sure you want to permanently delete application <span className="font-mono font-bold text-slate-900">#{request.id}</span> ({request.productName})? This request and its tracking history will be permanently deleted from the database.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="rounded-xl text-xs font-semibold h-10 px-4"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDeleteRequest}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold h-10 px-4 gap-1.5"
              >
                {deleting ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete Request</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Status Alert Banner */}
      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-between ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <span>{message.text}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-slate-500 hover:text-slate-800 text-xs font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Request Header Banner */}
      <Card className="rounded-3xl border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  {request.productType} Listing Request
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-xs text-slate-300">
                  Submitted{" "}
                  {new Date(request.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {request.productName}
              </h1>
            </div>

            <div>{getStatusBadge(request.status)}</div>
          </div>
        </div>
      </Card>

      {/* 2-Column Content Grid */}
      <div className="grid lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column (8 cols): Product & Financial Info */}
        <div className="lg:col-span-7 space-y-6">
          {/* Product Specifications Card */}
          <Card className="rounded-2xl border-slate-200/90 shadow-2xs">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  <span>Product Information</span>
                </h2>
                {request.condition && (
                  <Badge variant="outline" className="text-xs font-semibold">
                    {request.condition}
                  </Badge>
                )}
              </div>

              {/* Photo preview if available */}
              {request.images && request.images.length > 0 && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 relative aspect-video">
                  <img
                    src={request.images[0]}
                    alt={request.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Product Description &amp; Specifications:
                </span>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {request.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-slate-500 block">Category:</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{request.productType}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-slate-500 block">Handover City:</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{request.city || "Not Specified"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & 8% Platform Fee Card */}
          <Card className="rounded-2xl border-emerald-500/30 bg-gradient-to-br from-emerald-50/40 via-teal-50/20 to-white shadow-2xs">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
                <h2 className="text-sm font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-700" />
                  <span>Financial &amp; 8% Platform Fee Audit</span>
                </h2>
                <Badge className="bg-emerald-600 text-white font-bold text-xs">
                  8% Platform Commission
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
                  <span className="text-slate-500 block">Seller Market Price:</span>
                  <span className="font-mono font-bold text-slate-900 text-base mt-0.5 block">
                    Rs. {request.marketPrice.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Desired payout</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
                  <span className="text-slate-500 block">Ticket Price:</span>
                  <span className="font-mono font-bold text-amber-600 text-base mt-0.5 block">
                    Rs. {request.ticketPrice.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Per raffle entry</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs col-span-2 sm:col-span-1">
                  <span className="text-slate-500 block">Total Tickets Cap:</span>
                  <span className="font-mono font-bold text-emerald-700 text-base mt-0.5 block">
                    {request.totalTickets.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Entries to issue</span>
                </div>
              </div>

              {/* Total Revenue & 8% Fee Breakdown */}
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span>Gross Campaign Target:</span>
                  <span className="font-mono font-bold text-white text-sm">
                    Rs. {request.totalRevenue.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-red-300 pb-2 border-b border-slate-800">
                  <span>PakRaffle Platform Fee (8%):</span>
                  <span className="font-mono font-bold text-red-400">
                    - Rs. {request.platformFee.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase block tracking-wider">
                      Net Payout to Seller (92%):
                    </span>
                    <span className="text-[10px] text-slate-400">Disbursed via bank transfer upon draw</span>
                  </div>
                  <span className="font-mono text-xl font-extrabold text-emerald-400">
                    Rs. {request.sellerPayout.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operational Policy & 3-Month Expiry Compliance Card */}
          <Card className="rounded-2xl border-slate-200/90 shadow-2xs">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Escrow Custody &amp; 3-Month Expiry Policy</span>
                </h2>
                <Badge variant="outline" className="text-[10px] font-bold text-amber-800 border-amber-300 bg-amber-50">
                  Operational Checklist
                </Badge>
              </div>

              <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">1. Verified Contact Outreach</span>
                    <span className="text-[11px] text-slate-600 block mt-0.5">
                      Review team must contact seller via verified WhatsApp ({request.phone}) or email ({request.email}) before approval.
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">2. Physical Verification &amp; Custody Hold</span>
                    <span className="text-[11px] text-slate-600 block mt-0.5">
                      Item must be shipped or delivered to PakRaffle and held in custody until the raffle is either completed or officially cancelled.
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-950 block">3. Seller Cancellation Clause</span>
                    <span className="text-[11px] text-amber-900 block mt-0.5">
                      If seller requests cancellation: 100% of sold tickets must be refunded to buyers, and seller must pay the 8% platform fee (Rs. {request.platformFee.toLocaleString()}) before the product is released.
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-950 block">4. 3-Month (90-Day) Expiry Deadline</span>
                    <span className="text-[11px] text-amber-900 block mt-0.5">
                      Raffle must complete within 3 months of launch date. If incomplete after 3 months, PakRaffle will cancel the raffle, refund all ticket buyers, charge/deduct the 8% fee, and return the item.
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (5 cols): Seller Legal Details & Admin Notes */}
        <div className="lg:col-span-5 space-y-6">
          {/* Legal Seller Verification Card */}
          <Card className="rounded-2xl border-slate-200/90 shadow-2xs">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>CNIC Legal Seller Details</span>
                </h2>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  NADRA Check
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Full Name (as per CNIC):</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                    {request.fullNameCnic}
                  </span>
                </div>

                {request.cnicNumber && (
                  <div>
                    <span className="text-slate-500 block">CNIC Number:</span>
                    <span className="font-mono font-bold text-slate-800 text-xs sm:text-sm mt-0.5 block">
                      {request.cnicNumber}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-mono font-semibold">{request.phone}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a
                      href={`mailto:${request.email}`}
                      className="hover:text-emerald-700 truncate underline"
                    >
                      {request.email}
                    </a>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{request.city || "City Not Specified"}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 font-bold text-xs transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-700" />
                    <span>Open WhatsApp Chat with Seller</span>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Review Notes Card */}
          <Card className="rounded-2xl border-slate-200/90 shadow-2xs">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span>Internal Admin Notes</span>
                </h2>
                <span className="text-[10px] text-slate-400">Private</span>
              </div>

              <div className="space-y-2">
                <Textarea
                  rows={5}
                  placeholder="Record verification notes, physical inspection details, PTA verification, or handover dates..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="text-xs rounded-xl"
                />
              </div>

              <Button
                type="button"
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="w-full rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white h-10 gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingNotes ? "Saving Notes..." : "Save Admin Notes"}</span>
              </Button>
            </CardContent>
          </Card>

          {/* Convert to Live Raffle Action */}
          <Card className="rounded-2xl border-slate-200/90 bg-gradient-to-br from-slate-50 to-emerald-50/30 shadow-2xs">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Gift className="w-4 h-4 text-red-600" />
                  <span>Official Raffle Campaign</span>
                </div>
                {request.raffleId && (
                  <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                    Launched &amp; Linked
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {request.raffleId
                  ? "This client application asset has been converted into an official live PakRaffle campaign. Real buyer entries and ticket sales are synced directly to the partner dashboard."
                  : "Once physical inspection and custody agreement are completed, click to create a live campaign in the official Raffles Catalog with prefilled specifications and pricing."}
              </p>
              {request.raffleId ? (
                <div className="space-y-2 pt-1">
                  <Button asChild className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold h-10 gap-2">
                    <Link href={`/admin/raffles/${request.raffleId}`}>
                      <span>View Admin Raffle Details (#{request.raffleId})</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full rounded-xl text-xs font-bold h-9">
                    <Link href={`/raffles/${request.raffleId}`} target="_blank">
                      <span>Preview Public Catalog Page</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <Button asChild className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold h-10">
                  <Link
                    href={`/admin/raffles/create?listingRequestId=${encodeURIComponent(
                      request.id
                    )}&title=${encodeURIComponent(request.productName)}&price=${request.ticketPrice}&totalEntries=${
                      request.totalTickets
                    }&realPrice=${request.marketPrice}&category=${encodeURIComponent(
                      request.productType
                    )}&description=${encodeURIComponent(request.description)}`}
                  >
                    Create Raffle from this Asset →
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
