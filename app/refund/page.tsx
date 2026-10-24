import { Shield, AlertTriangle, CheckCircle2, ArrowRight, RotateCcw, Lock, FileQuestion } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Refund Policy — Official Cancellation & Return Terms | PakRaffle",
  description:
    "Review PakRaffle’s official refund and cancellation policy, entry finality, and 100% target sales guarantee.",
  keywords: ["PakRaffle refund", "cancellation policy", "ticket return", "Pakistan raffle refund rules"],
  robots: "index, follow",
  openGraph: {
    title: "Refund Policy - PakRaffle Pakistan",
    description: "Clear guidelines on entry finality, fair play pool funding, and raffle cancellation guarantees.",
    url: "https://pakraffle.com/refund",
    siteName: "PakRaffle",
    type: "website",
  },
}

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-3 pb-2">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
            <Shield className="w-4 h-4 text-emerald-700" />
            <span>Official Cancellation & Return Terms</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">
            Refund <span className="text-emerald-700">Policy</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Transparent guidelines regarding ticket entry finality, fair play guarantees, and full refund protocols in cases of platform-canceled draws.
          </p>
          <div className="flex items-center justify-center gap-3 text-xs text-gray-500 pt-1">
            <span>Last Updated: 2025</span>
            <span>•</span>
            <span>Applicable across Pakistan</span>
          </div>
        </div>

        {/* SECTION 1: NON-REFUNDABLE ENTRY RULE */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">1. Finality of Lucky Draw Entries</h3>
              <p className="text-xs text-gray-500">Why purchased raffle tickets are strictly non-refundable</p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
            <p>
              <strong>Immediate Entry Allocation:</strong> Once payment verification is completed through EasyPaisa, JazzCash, or bank transfer, all raffle ticket purchases are final. We do not provide refunds, charge reversals, or entry cancellations.
            </p>
            <p>
              <strong>Non-Transferable Entries:</strong> Purchased tickets cannot be transferred to another user&apos;s account, exchanged for cash, or migrated to a different lucky draw.
            </p>
            <p>
              <strong>Personal Circumstances:</strong> Requests for refunds due to accidental ticket purchase, change of mind, or misreading prize specifications cannot be entertained once tickets have been issued.
            </p>
          </div>
        </div>

        {/* SECTION 2: WHY THIS POLICY EXISTS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">2. Why This Policy Protects All Participants</h3>
              <p className="text-xs text-gray-500">Maintaining fair odds and 100% target pool integrity</p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
            <p>
              <strong>Mathematical Odds Protection:</strong> In a transparent raffle with a fixed target ticket count (e.g. 1,000 total tickets), every purchased ticket directly secures an exact, verifiable probability of winning. Allowing ticket cancellations or refunds after purchase would alter the odds for all other participants and jeopardize fair play.
            </p>
            <p>
              <strong>100% Target Ticket Sell-Out Policy:</strong> PakRaffle conducts each live draw only when 100% of target tickets are sold. Strict entry finality guarantees that the prize fund is fully locked, verified, and secured prior to the certified draw.
            </p>
            <p>
              <strong>Prevention of Market Manipulation:</strong> Entry finality stops bad actors from buying blocks of tickets and canceling them right before the draw, keeping the platform clean, fair, and reliable.
            </p>
          </div>
        </div>

        {/* SECTION 3: PRE-CHECKOUT CHECKLIST */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <FileQuestion className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">3. Pre-Purchase Verification Checklist</h3>
              <p className="text-xs text-gray-500">Recommended steps before confirming your ticket purchase</p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
            <p>To avoid any misunderstandings, please ensure you review the following before completing your transfer:</p>
            <ul className="space-y-2 list-none">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Verify the exact prize title, model, and item description shown on the raffle details page.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Confirm your selected ticket quantity and the total payable PKR amount before submitting payment.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Ensure your registered mobile number is accurate so you can receive draw alerts and verification calls.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* SECTION 4: EXCEPTION GUARANTEE: CANCELED RAFFLES */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">4. Full Refund Guarantee for Canceled Raffles</h3>
              <p className="text-xs text-gray-500">Our 100% money-back guarantee in extraordinary circumstances</p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
            <p>
              <strong>100% Refund on Canceled Draws:</strong> In the rare circumstance that an active raffle is officially canceled by PakRaffle due to product discontinuation, severe supply chain disruption, or regulatory compliance mandates, <strong>100% of the ticket purchase price will be promptly refunded to each participant</strong>.
            </p>
            <p>
              <strong>Refund Processing Timeline:</strong> Canceled draw refunds are processed directly back to the participant&apos;s original payment method (EasyPaisa, JazzCash, or bank account) within 24 to 48 business hours with zero deduction of processing fees.
            </p>
            <p>
              <strong>Duplicate Charge Adjustments:</strong> If a technical glitch causes a user to be billed multiple times for a single ticket order, our finance team will promptly reverse the duplicate payment upon receiving statement proof.
            </p>
          </div>
        </div>

        {/* SECTION 5: DISPUTES & TRANSACTION ISSUES */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">5. Payment Inquiries & Receipt Verification Support</h3>
              <p className="text-xs text-gray-500">What to do if your payment screenshot requires manual matching</p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
            <p>
              If your payment was completed but your tickets have not reflected in your account within 15 minutes, please do not worry. Simply reach out to our dedicated support desk with your Transaction ID (TID) and receipt screenshot.
            </p>
            <p>
              Our support team will cross-check the institutional bank statement and manually allocate your official ticket numbers without any delay.
            </p>
          </div>
        </div>

        {/* HELP & SUPPORT DESK */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs text-center space-y-3">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">
            Need Clarification on Our Refund or Payment Terms?
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
            Our customer care team is available 24/7 on WhatsApp and email to resolve any transaction queries or ticket confirmation questions.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Contact Support Desk
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/terms"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs transition-colors"
            >
              Read Full Terms & Conditions
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
