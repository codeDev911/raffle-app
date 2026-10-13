import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  CreditCard,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Smartphone,
  Mail,
  Phone,
  FileIcon,
  ExternalLink,
  Ticket,
  Copy,
  Receipt,
  Gift,
  ShieldCheck,
  Building,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils"
import { notFound } from "next/navigation"
import { UpdatePaymentStatus } from "@/components/update-payment-status"
import { ReceiptModal } from "@/components/receipt-modal"
import _Button from "./_Button"

async function getPaymentDetails(id: string) {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          city: true,
          createdAt: true,
        },
      },
      entries: {
        include: {
          raffle: {
            select: {
              id: true,
              title: true,
              image: true,
              price: true,
              category: true,
              status: true,
            },
          },
        },
      },
    },
  })

  if (!payment) {
    notFound()
  }

  const firstEntry = payment.entries[0]
  const metaObj =
    payment.metadata && typeof payment.metadata === "object" && !Array.isArray(payment.metadata)
      ? (payment.metadata as Record<string, any>)
      : {}

  return {
    ...payment,
    metadataObj: metaObj,
    raffleName: firstEntry?.raffle?.title || metaObj.raffleName || "PakRaffle Campaign",
    raffleId: firstEntry?.raffle?.id || metaObj.raffleId || null,
    raffle: firstEntry?.raffle || null,
    entriesCount:
      firstEntry?.quantity ||
      (typeof metaObj.quantity === "number" ? metaObj.quantity : 1),
  }
}

export default async function PaymentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string }
}) {
  const resolvedParams = await Promise.resolve(params)
  const payment = await getPaymentDetails(resolvedParams.id)

  const canUpdateStatus = !["COMPLETED", "REFUNDED"].includes(payment.status)
  const receiptUrl = payment.metadataObj?.receiptUrl as string | undefined
  const referralLinkId = payment.metadataObj?.referralLinkId ?? null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="rounded-xl px-3 py-1 font-semibold text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            COMPLETED
          </Badge>
        )
      case "PENDING":
        return (
          <Badge className="rounded-xl px-3 py-1 font-semibold text-xs bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
            PENDING VERIFICATION
          </Badge>
        )
      case "PROCESSING":
        return (
          <Badge className="rounded-xl px-3 py-1 font-semibold text-xs bg-blue-50 text-blue-700 border border-blue-200">
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            PROCESSING
          </Badge>
        )
      default:
        return (
          <Badge className="rounded-xl px-3 py-1 font-semibold text-xs bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
            {status}
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-12">
      {/* Back button & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="rounded-xl min-h-[38px] w-fit border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs"
        >
          <Link href="/admin/payments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Payments
          </Link>
        </Button>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {getStatusBadge(payment.status)}
        </div>
      </div>

      {/* Main Payment Banner Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Payment Transaction
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                {formatCurrency(payment.amount)}
              </h1>
              <span className="text-sm text-slate-400 font-medium">PKR</span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-1 break-all">
              Reference ID: <span className="font-semibold text-slate-700">{payment.id}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {receiptUrl && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-xl min-h-[40px] border-slate-200 font-semibold"
              >
                <Link href={receiptUrl} target="_blank" rel="noopener noreferrer">
                  <FileIcon className="w-4 h-4 mr-1.5 text-blue-600" />
                  View Uploaded Receipt
                </Link>
              </Button>
            )}

            <ReceiptModal
              payment={{
                id: payment.id,
                amount: payment.amount,
                status: payment.status,
                method: payment.method,
                transactionId: payment.transactionId,
                createdAt: payment.createdAt.toISOString(),
                entries: payment.entriesCount,
                raffleName: payment.raffleName,
                user: {
                  name: payment.user.name,
                  email: payment.user.email,
                  phone: payment.user.phone ?? undefined,
                  city: payment.user.city ?? undefined,
                },
              }}
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl min-h-[40px] border-slate-200 font-semibold text-slate-700"
                >
                  <Receipt className="w-4 h-4 mr-1.5 text-slate-600" />
                  Send Official Receipt
                </Button>
              }
            />
          </div>
        </div>

        {/* Quick details pill strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium block">Payment Method</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
              <Smartphone className="w-4 h-4 text-slate-400" />
              <span>{payment.method}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium block">Tickets Bought</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
              <Ticket className="w-4 h-4 text-slate-400" />
              <span>{payment.entriesCount} Entries</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium block">Transaction Reference</span>
            <div className="font-mono text-xs font-bold text-slate-800 truncate max-w-[180px]">
              {payment.transactionId || "Direct Deposit"}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium block">Processed On</span>
            <div className="text-xs font-semibold text-slate-800">
              {formatDateTime(new Date(payment.createdAt))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Details (Left) & Actions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Associated Raffle Details */}
          <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Gift className="w-4 h-4 text-red-500" />
                Purchased Raffle Campaign
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {payment.raffle ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative shrink-0">
                      {payment.raffle.image ? (
                        <Image
                          src={payment.raffle.image}
                          alt={payment.raffle.title}
                          fill
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-slate-400">
                          <Gift className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-base hover:text-red-600 transition-colors">
                        <Link href={`/admin/raffles/${payment.raffle.id}`}>
                          {payment.raffle.title}
                        </Link>
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                        <span>Price: <strong className="text-slate-800">{formatCurrency(payment.raffle.price)}</strong> / ticket</span>
                        <span>·</span>
                        <Badge variant="outline" className="text-[11px] py-0 px-2 rounded-md">
                          {payment.raffle.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs font-semibold shrink-0"
                  >
                    <Link href={`/admin/raffles/${payment.raffle.id}`}>
                      View Raffle Page
                      <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-slate-600">
                  <p className="font-medium text-slate-900">{payment.raffleName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Campaign ID: {payment.raffleId || "N/A"}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer / Payer Information */}
          <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                Customer Details
              </CardTitle>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-xs text-slate-600 hover:text-slate-900 h-8"
              >
                <Link href={`/admin/customers/${payment.user.id}`}>
                  View Full Profile
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-base shrink-0">
                  {payment.user.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "U"}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{payment.user.name}</h3>
                  <p className="text-xs text-slate-500">Member since {formatDate(new Date(payment.user.createdAt))}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-slate-400 text-[10px] block">Email</span>
                    <a
                      href={`mailto:${payment.user.email}`}
                      className="font-semibold text-slate-800 hover:text-red-600 truncate block"
                    >
                      {payment.user.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-slate-400 text-[10px] block">Phone</span>
                    {payment.user.phone ? (
                      <a
                        href={`tel:${payment.user.phone}`}
                        className="font-semibold text-slate-800 hover:text-red-600 truncate block"
                      >
                        {payment.user.phone}
                      </a>
                    ) : (
                      <span className="text-slate-400">Not provided</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <Building className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-slate-400 text-[10px] block">City</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {payment.user.city || "Pakistan"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Metadata & Audit */}
          {payment.metadata && (
            <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
              <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-sm font-bold text-slate-800">
                  Gateway & Callback Metadata
                </CardTitle>
                <CardDescription className="text-xs">
                  Raw payload received from checkout or manual receipt submission
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <pre className="text-xs font-mono bg-slate-900 text-slate-200 p-4 rounded-xl overflow-x-auto max-h-60">
                  {JSON.stringify(payment.metadata, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Actions & Verification */}
        <div className="space-y-6">
          <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Administrative Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {/* Payment Verification Button */}
              {payment.status !== "COMPLETED" && (
                <div className="space-y-2 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
                  <span className="text-xs font-bold text-emerald-900 block">
                    Fast Verification
                  </span>
                  <p className="text-xs text-emerald-700">
                    Verify the sender screenshot and credit tickets directly to the user:
                  </p>
                  <_Button
                    referralLinkId={referralLinkId}
                    paymentId={payment.id}
                    quantity={payment.entriesCount}
                    raffleId={payment.raffleId}
                    status="COMPLETED"
                  />
                </div>
              )}

              {/* Status Update Component */}
              {canUpdateStatus ? (
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Change Payment Status
                  </label>
                  <UpdatePaymentStatus paymentId={payment.id} currentStatus={payment.status} />
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  This transaction is locked as <strong className="text-slate-900 uppercase">{payment.status}</strong>.
                </div>
              )}

              {/* Direct Link to Uploaded Receipt */}
              {receiptUrl && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-xl text-xs font-semibold h-10 border-slate-200"
                >
                  <Link href={receiptUrl} target="_blank" rel="noopener noreferrer">
                    <FileIcon className="w-4 h-4 mr-2 text-blue-600" />
                    Open Receipt Image
                  </Link>
                </Button>
              )}

              {/* Contact Customer Links */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                {payment.user.phone && (
                  <Button
                    asChild
                    variant="outline"
                    className="w-full rounded-xl text-xs font-semibold h-10 border-slate-200"
                  >
                    <a href={`https://wa.me/${payment.user.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer">
                      <Smartphone className="w-4 h-4 mr-2 text-emerald-600" />
                      Chat on WhatsApp
                    </a>
                  </Button>
                )}

                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-xl text-xs font-semibold h-10 border-slate-200"
                >
                  <a href={`mailto:${payment.user.email}`}>
                    <Mail className="w-4 h-4 mr-2 text-slate-600" />
                    Send Customer Email
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
