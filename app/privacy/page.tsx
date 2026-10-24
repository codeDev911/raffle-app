import { Shield, Eye, Lock, Database, UserCheck, ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Privacy Policy — Official Data Protection & Privacy Standards | PakRaffle",
  description:
    "Learn how PakRaffle collects, secures, and protects user data, transaction records, and prize delivery details in Pakistan.",
  keywords: ["PakRaffle privacy", "data protection", "Pakistan lucky draw privacy", "user confidentiality"],
  robots: "index, follow",
  openGraph: {
    title: "Privacy Policy - PakRaffle Pakistan",
    description: "Understand our data protection standards and how your personal and payment details are safeguarded.",
    url: "https://pakraffle.com/privacy",
    siteName: "PakRaffle",
    type: "website",
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-3 pb-2">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
            <Shield className="w-4 h-4 text-emerald-700" />
            <span>Official Data Protection & Privacy Standards</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">
            Privacy <span className="text-emerald-700">Policy</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Your privacy and trust are paramount. This policy details how PakRaffle collects, stores, protects, and handles your information when you participate in our lucky draws.
          </p>
          <div className="flex items-center justify-center gap-3 text-xs text-gray-500 pt-1">
            <span>Last Updated: 2025</span>
            <span>•</span>
            <span>Applicable across Pakistan</span>
          </div>
        </div>

        {/* SECTION 1: INFORMATION WE COLLECT */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">1. Information We Collect</h3>
              <p className="text-xs text-gray-500">Data gathered to facilitate lucky draw entries and verified prize fulfillment</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-gray-600 leading-relaxed">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">A. Account & Identification Information</h4>
              <p className="mb-2">When you create an account, purchase tickets, or claim prizes, we collect:</p>
              <ul className="space-y-1.5 list-none">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Your full name matching your government-issued identification (CNIC).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Email address for transaction receipts, draw result alerts, and ticket confirmations.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Mobile phone number associated with your mobile wallet (EasyPaisa/JazzCash) for draw alerts and cash prize disbursements.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Residential delivery city and postal address for insured TCS doorstep shipping of physical goods.</span>
                </li>
              </ul>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-1">B. Payment & Verification Records</h4>
              <p>
                To allocate entries, we log payment reference numbers (Transaction IDs / TIDs), transaction timestamps, paid amounts in PKR, and uploaded receipt images. We do <strong>NOT</strong> collect or store your banking PINs, OTPs, or debit/credit card CVV codes.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: HOW WE USE INFORMATION */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">2. How We Use Your Information</h3>
              <p className="text-xs text-gray-500">Purposes for processing participant data</p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
            <p>
              <strong>Ticket Allocation & Draw Management:</strong> Verifying transaction proof and generating uniquely numbered raffle ticket entries tied to your verified profile.
            </p>
            <p>
              <strong>Live Draw Notification:</strong> Alerting ticket holders via WhatsApp and SMS when 100% of target tickets are sold and the live stream draw schedule is confirmed.
            </p>
            <p>
              <strong>Prize Delivery & Handover:</strong> Coordinating with courier partners (TCS, Leopards) or dealership networks to ensure zero-cost delivery of motorcycles, phones, and appliances.
            </p>
            <p>
              <strong>Anti-Fraud & Integrity Monitoring:</strong> Detecting duplicate accounts, fraudulent receipts, and maintaining institutional audit records in compliance with Pakistani financial regulations.
            </p>
          </div>
        </div>

        {/* SECTION 3: DATA PROTECTION & SECURITY */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">3. Data Protection, Encryption & Storage</h3>
              <p className="text-xs text-gray-500">How we safeguard your personal data from unauthorized access</p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
            <p>
              <strong>256-Bit SSL/TLS Encryption:</strong> All data transmitted between your browser and our servers is secured using modern TLS encryption protocols, preventing interception or unauthorized eavesdropping.
            </p>
            <p>
              <strong>Encrypted Password Storage:</strong> Passwords are cryptographically hashed using salted bcrypt algorithms and are never stored or accessible in plain text.
            </p>
            <p>
              <strong>Strict Role-Based Access:</strong> Only authorized operations personnel have supervised access to participant contact details, exclusively for prize verification and customer support.
            </p>
            <p>
              <strong>No Selling of Personal Data:</strong> PakRaffle does <strong>not</strong> sell, rent, or trade participant phone numbers or personal records to marketing agencies or third parties.
            </p>
          </div>
        </div>

        {/* SECTION 4: THIRD-PARTY DISCLOSURE */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">4. Third-Party Disclosures & Courier Partners</h3>
              <p className="text-xs text-gray-500">Controlled sharing exclusively for service execution</p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
            <p>We share limited participant details only with certified partners strictly required to deliver our service:</p>
            <ul className="space-y-2 list-none">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Courier & Logistics Services:</strong> Winner contact names, delivery addresses, and phone numbers are provided to TCS or Leopards Courier for doorstep package dispatch.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Public Winner Transparency:</strong> Winner names, city locations, and masked phone numbers (e.g., 0300 ****123) are published in our verified Hall of Fame to prove draw legitimacy. Full CNICs and complete phone numbers are kept strictly confidential.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Legal Compliance:</strong> Information may be disclosed if required by law enforcement or competent Pakistani court orders to prevent financial fraud.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* SECTION 5: PARTICIPANT RIGHTS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">5. Your Data Rights & Account Management</h3>
              <p className="text-xs text-gray-500">Access, updates, and account control</p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
            <p>
              <strong>Profile Updates:</strong> You can edit your name, phone number, and city at any time from your <Link href="/profile/settings" className="text-emerald-700 underline font-semibold">Account Settings</Link>.
            </p>
            <p>
              <strong>Data Access & Export:</strong> You can review your complete participation and ticket history anytime in the <Link href="/profile/entries" className="text-emerald-700 underline font-semibold">My Tickets</Link> dashboard.
            </p>
            <p>
              <strong>Account Deletion:</strong> You may request the deletion of your account and personal records by contacting support, provided there are no active, pending draw entries under your name.
            </p>
          </div>
        </div>

        {/* HELP & PRIVACY DESK */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs text-center space-y-3">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">
            Have Questions About Your Privacy or Data?
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
            Our compliance and support desk is available 24/7 to assist with any questions regarding personal information security or privacy controls.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Contact Privacy Team
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/terms"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs transition-colors"
            >
              View Terms & Conditions
            </Link>
          </div>
        </div>

        {/* Footer Audit Stamp */}
        <div className="text-center text-xs text-gray-400 pt-2">
          <p>PakRaffle Official Transparency Agreement • Pakistan&apos;s Verified Digital Lucky Draw Platform</p>
        </div>
      </div>
    </div>
  )
}
