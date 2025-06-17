import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Eye, Lock, Database, UserCheck } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="bg-green-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600">
            Your privacy is important to us. Learn how we protect your information.
          </p>
        </div>

        <div className="space-y-8">
          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Database className="mr-3 h-6 w-6 text-green-500" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-600">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Personal Information</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Name and contact information</li>
                    <li>Mobile phone number for payment verification</li>
                    <li>Email address for communications</li>
                    <li>Address for prize delivery</li>
                    <li>Age verification for eligibility</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Payment Information</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>EasyPaisa/JazzCash transaction details</li>
                    <li>Payment timestamps and amounts</li>
                    <li>Transaction reference numbers</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Usage Data</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Website interaction and navigation patterns</li>
                    <li>Device information and browser type</li>
                    <li>IP address and location data</li>
                    <li>Raffle participation history</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Eye className="mr-3 h-6 w-6 text-green-500" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-600">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Service Delivery</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Process raffle entries and payments</li>
                    <li>Conduct fair and transparent draws</li>
                    <li>Deliver prizes to winners</li>
                    <li>Provide customer support</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Communication</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Send raffle updates and results</li>
                    <li>Notify winners of their prizes</li>
                    <li>Share promotional offers (with consent)</li>
                    <li>Provide important service announcements</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Legal Compliance</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Verify age and identity requirements</li>
                    <li>Maintain transaction records as required by law</li>
                    <li>Prevent fraud and ensure fair play</li>
                    <li>Comply with Pakistani regulations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Lock className="mr-3 h-6 w-6 text-green-500" />
                Data Protection & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-600">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Security Measures</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>SSL encryption for all data transmission</li>
                    <li>Secure servers with regular security updates</li>
                    <li>Limited access to personal information</li>
                    <li>Regular security audits and monitoring</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Data Retention</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Personal data retained only as long as necessary</li>
                    <li>Transaction records kept for legal compliance</li>
                    <li>Account data deleted upon user request (where legally permitted)</li>
                    <li>Automatic deletion of inactive accounts after 3 years</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Third-Party Sharing</h4>
                  <p>We do not sell, trade, or share your personal information with third parties except:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Payment processors (EasyPaisa/JazzCash) for transaction processing</li>
                    <li>Delivery partners for prize shipment</li>
                    <li>Legal authorities when required by law</li>
                    <li>Service providers under strict confidentiality agreements</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <UserCheck className="mr-3 h-6 w-6 text-green-500" />
                Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-600">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Access & Control</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Request access to your personal data</li>
                    <li>Update or correct your information</li>
                    <li>Delete your account and associated data</li>
                    <li>Opt-out of promotional communications</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Data Portability</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Download your raffle participation history</li>
                    <li>Export your account information</li>
                    <li>Receive data in a machine-readable format</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Complaints</h4>
                  <p>
                    If you have concerns about how we handle your data, you can contact our privacy team at
                    privacy@pakraffle.com or file a complaint with relevant Pakistani data protection authorities.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg border-0 bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Privacy Questions or Concerns?</h3>
                <p className="text-green-700 mb-4">
                  Our privacy team is here to help with any questions about your data.
                </p>
                <p className="text-green-600">Email: privacy@pakraffle.com | Phone: +92 300 1234567</p>
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
