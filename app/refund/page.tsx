import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle, AlertTriangle, Shield, Phone } from "lucide-react"

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="bg-red-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Refund Policy</h1>
          <p className="text-xl text-gray-600">Important information about our no-refund policy</p>
        </div>

        <div className="space-y-8">
          {/* Main Policy */}
          <Card className="rounded-2xl shadow-lg border-0 bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-red-800">
                <AlertTriangle className="mr-3 h-6 w-6 text-red-600" />
                No Refund Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-100 p-6 rounded-2xl border border-red-200">
                <h3 className="text-lg font-bold text-red-800 mb-3">WE DO NOT PROVIDE REFUNDS</h3>
                <p className="text-red-700 text-lg leading-relaxed">
                  All raffle entries are final and non-refundable. Once payment is completed through EasyPaisa or
                  JazzCash, no refunds will be issued under any circumstances.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Why No Refunds */}
          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Shield className="mr-3 h-6 w-6 text-green-500" />
                Why We Have This Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-600">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Fair Play Guarantee</h4>
                  <p>
                    Our no-refund policy ensures that all participants are committed to their entries, maintaining the
                    integrity and fairness of every raffle draw.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Transparent Operations</h4>
                  <p>
                    This policy allows us to operate transparently with fixed entry counts and guaranteed prize
                    distributions, ensuring every raffle proceeds as advertised.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Legal Compliance</h4>
                  <p>
                    Our policy complies with Pakistani gaming and lottery regulations, ensuring we operate within legal
                    boundaries while protecting all participants.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What This Means */}
          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <AlertTriangle className="mr-3 h-6 w-6 text-orange-500" />
                What This Means for You
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-600">
              <div className="space-y-4">
                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-2">Before You Purchase</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-orange-700">
                    <li>Carefully read all raffle details and rules</li>
                    <li>Ensure you understand the prize and draw date</li>
                    <li>Verify your payment amount before confirming</li>
                    <li>Make sure you meet all eligibility requirements</li>
                  </ul>
                </div>

                <div className="bg-red-50 p-4 rounded-2xl border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">After Purchase</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-red-700">
                    <li>Your entry is immediately confirmed and cannot be cancelled</li>
                    <li>No refunds will be provided for any reason</li>
                    <li>You cannot transfer your entry to another person</li>
                    <li>You cannot change your entry to a different raffle</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2">Special Circumstances</h4>
                  <p className="text-gray-700">
                    Even in cases of technical issues, payment errors, or personal emergencies, we cannot provide
                    refunds. Please ensure you are certain about your purchase before proceeding.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exceptions */}
          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Shield className="mr-3 h-6 w-6 text-blue-500" />
                Limited Exceptions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-600">
              <p className="text-lg font-medium text-gray-800 mb-4">
                The only circumstances where we may consider compensation (not refunds):
              </p>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Platform Error</h4>
                    <p>
                      If our system incorrectly charges you multiple times for the same entry, we may provide credit for
                      future raffles.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Cancelled Raffle</h4>
                    <p>
                      If we cancel a raffle due to insufficient entries or other operational issues, participants will
                      receive credit for future raffles.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Fraudulent Activity</h4>
                    <p>
                      If we determine that fraudulent activity affected a raffle, we may provide compensation to
                      affected legitimate participants.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 mt-6">
                <p className="text-blue-800 font-medium">
                  Note: Even in these exceptional cases, compensation will be in the form of raffle credits, not cash
                  refunds.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="rounded-2xl shadow-lg border-0 bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="text-center">
                <Phone className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">Questions About This Policy?</h3>
                <p className="text-green-700 mb-4">
                  While we cannot provide refunds, our support team is here to help with any questions or concerns.
                </p>
                <div className="space-y-2 text-green-600">
                  <p>Email: support@pakraffle.com</p>
                  <p>Phone: +92 300 1234567</p>
                  <p>Hours: 9 AM - 9 PM (Monday to Sunday)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12 text-gray-500">
          <p>Last updated: December 2024</p>
          <p className="mt-2 text-sm">This policy is effective immediately and applies to all raffle purchases.</p>
        </div>
      </div>
    </div>
  )
}
