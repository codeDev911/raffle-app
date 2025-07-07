import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Shield, Users, AlertTriangle } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="bg-green-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
          <p className="text-xl text-gray-600">Please read these terms carefully before participating in our raffles</p>
        </div>

        <div className="space-y-8">
          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Users className="mr-3 h-6 w-6 text-green-500" />
                Eligibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-600">
              <p>To participate in PakRaffle, you must:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Be at least 18 years of age</li>
                <li>Be a resident of Pakistan</li>
                <li>Provide valid identification when required</li>
                <li>Have a valid mobile number for payment verification</li>
                <li>Agree to these terms and conditions</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Shield className="mr-3 h-6 w-6 text-green-500" />
                Raffle Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-600">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Entry Purchase</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Each raffle entry must be purchased separately</li>
                    <li>Maximum 10 entries per person per raffle</li>
                    <li>Payment must be completed through EasyPaisa or JazzCash</li>
                    <li>Entries are non-transferable</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Winner Selection</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Winners are selected using a transparent random number generator</li>
                    <li>The draw will be conducted live when possible</li>
                    <li>Winner will be contacted within 24 hours of the draw</li>
                    <li>Winner must respond within 7 days to claim the prize</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Prize Delivery</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Prizes will be delivered within 7-14 business days</li>
                    <li>Delivery is free within major cities of Pakistan</li>
                    <li>Winner must provide valid ID for prize collection</li>
                    <li>Cash prizes will be transferred to winner's mobile wallet</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <AlertTriangle className="mr-3 h-6 w-6 text-green-500" />
                Important Disclaimers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-600">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">No Refunds</h4>
                  <p>
                    All raffle entries are final. We do not provide refunds under any circumstances once payment is
                    completed.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Fair Play</h4>
                  <p>
                    Any attempt to manipulate the raffle system or use fraudulent payment methods will result in
                    immediate disqualification and potential legal action.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Platform Availability</h4>
                  <p>
                    While we strive for 100% uptime, PakRaffle is not responsible for technical issues that may prevent
                    participation. No compensation will be provided for missed opportunities due to technical problems.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Changes to Terms</h4>
                  <p>
                    PakRaffle reserves the right to modify these terms at any time. Users will be notified of
                    significant changes via email or platform notifications.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg border-0 bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Questions About Our Terms?</h3>
                <p className="text-green-700 mb-4">
                  Contact our support team for clarification on any terms or conditions.
                </p>
                <p className="text-green-600">Email: support@pakraffle.com </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12 text-gray-500">
          <p>Last updated: December 2024</p>
        </div>
      </div>
    </div>
  )
}
