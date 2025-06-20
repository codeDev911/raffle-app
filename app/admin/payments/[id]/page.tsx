import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  CreditCard,
  User,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Smartphone,
  Mail,
  Phone,
} from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { notFound } from "next/navigation"
import { UpdatePaymentStatus } from "@/components/update-payment-status"
import { ReceiptModal } from "@/components/receipt-modal"

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
            },
          },
        },
      },
    },
  })

  if (!payment) {
    notFound()
  }

  return {
    ...payment,
    raffleName: payment.entries[0]?.raffle?.title || (payment.metadata as any)?.raffleName || "Unknown Raffle",
    raffleId: payment.entries[0]?.raffle?.id || null,
    entries: (payment.metadata as any)?.quantity || 1,
  }
}

export default async function PaymentDetailsPage({ params }: { params: { id: string } }) {
  const payment = await getPaymentDetails(params.id)

  const canUpdateStatus = !["COMPLETED", "REFUNDED"].includes(payment.status)

  return (
    <div className="space-y-8">
      {/* Header */}
      <Button asChild variant="outline" size="sm" className="rounded-2xl">
        <Link href="/admin/payments">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Payments
        </Link>
      </Button>
      <div className="md:flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Details</h1>
            <p className="text-gray-600 mt-2">Payment ID: {payment.id}</p>
          </div>
        </div>
        <Badge
          className={`rounded-2xl text-lg px-4 py-2 ${
            payment.status === "COMPLETED"
              ? "bg-green-100 text-green-700"
              : payment.status === "PENDING"
                ? "bg-yellow-100 text-yellow-700"
                : payment.status === "PROCESSING"
                  ? "bg-blue-100 text-blue-700" 
                    : "bg-red-100 text-red-700"
          }`}
        >
          {payment.status === "COMPLETED" && <CheckCircle className="w-4 h-4 mr-2" />}
          {payment.status === "PENDING" && <Clock className="w-4 h-4 mr-2" />}
          {payment.status === "PROCESSING" && <AlertTriangle className="w-4 h-4 mr-2" />}
          {payment.status === "FAILED" && <XCircle className="w-4 h-4 mr-2" />}
          {payment.status}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Payment Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5 text-red-500" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Amount</label>
                  <div className="text-3xl font-bold text-green-500 mt-1">{formatCurrency(payment.amount)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Entries</label>
                  <div className="text-3xl font-bold text-blue-500 mt-1">{payment.entries}</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Payment Method</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Smartphone className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{payment.method}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Transaction ID</label>
                  <div className="font-medium mt-1">{payment.transactionId || "N/A"}</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Created At</label>
                  <div className="font-medium mt-1">{formatDateTime(new Date(payment.createdAt))}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Updated At</label>
                  <div className="font-medium mt-1">{formatDateTime(new Date(payment.updatedAt))}</div>
                </div>
              </div>

              {payment.metadata && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Additional Information</label>
                  <div className="bg-gray-50 p-4 rounded-lg mt-1">
                    <pre className="text-sm text-gray-700">{JSON.stringify(payment.metadata, null, 2)}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Raffle Information */}
          {payment.entries[0]?.raffle && (
            <Card className="rounded-2xl shadow-lg border-0">
              <CardHeader>
                <CardTitle>Raffle Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <img
                    src={payment.entries[0].raffle.image || "/placeholder.svg?height=80&width=80"}
                    alt={payment.entries[0].raffle.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{payment.entries[0].raffle.title}</h3>
                    <p className="text-gray-600">entries[0] Price: {formatCurrency(payment.entries[0].raffle.price)}</p>
                    <Button asChild variant="outline" size="sm" className="mt-2 rounded-2xl">
                      <Link href={`/admin/raffles/${payment.entries[0].raffle.id}`}>View Raffle Details</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Customer Information & Actions */}
        <div className="space-y-6">
          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5 text-red-500" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <div className="font-medium mt-1">{payment.user.name}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{payment.user.email}</span>
                </div>
              </div>
              {payment.user.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{payment.user.phone}</span>
                  </div>
                </div>
              )}
              {payment.user.city && (
                <div>
                  <label className="text-sm font-medium text-gray-600">City</label>
                  <div className="font-medium mt-1">{payment.user.city}</div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">Member Since</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{formatDateTime(new Date(payment.user.createdAt))}</span>
                </div>
              </div>
              <Button asChild variant="outline" className="w-full rounded-2xl">
                <Link href={`/admin/customers/${payment.user.id}`}>View Customer Details</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Payment Actions */}
          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle>Payment Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {canUpdateStatus && (
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Update Payment Status</label>
                  <UpdatePaymentStatus paymentId={payment.id} currentStatus={payment.status} />
                </div>
              )}

              {!canUpdateStatus && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    This payment cannot be modified as it is already {payment.status.toLowerCase()}.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <ReceiptModal
                  payment={{
                    id: payment.id,
                    amount: payment.amount,
                    status: payment.status,
                    method: payment.method,
                    transactionId: payment.transactionId,
                    createdAt: payment.createdAt.toISOString(),
                    entries: payment.entries,
                    raffleName: payment.raffleName,
                    user: {
                      name: payment.user.name,
                      email: payment.user.email,
                      phone: payment.user.phone ?? undefined,
                      city: payment.user.city ?? undefined,
                    },
                  }}
                />
                <Button variant="outline" className="w-full rounded-2xl">
                  Contact Customer
                </Button>
                {payment.status === "COMPLETED" && (
                  <Button variant="destructive" className="w-full rounded-2xl">
                    Process Refund
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
