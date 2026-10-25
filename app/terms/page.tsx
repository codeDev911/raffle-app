import { FileText, Shield, Users, AlertTriangle, CheckCircle2, Trophy, Truck, ArrowRight } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Terms & Conditions — Official Rules & 100% Ticket Draw Policy | PakRaffle",
  description:
    "Official terms, participation rules, and draw policy for PakRaffle Pakistan.",
  keywords: ["PakRaffle terms", "conditions", "raffle draw rules", "target ticket solds", "Pakistan lucky draw policy"],
  robots: "index, follow",
  openGraph: {
    title: "Terms & Conditions - PakRaffle Pakistan",
    description: "Review our transparent lucky draw rules, target ticket sell-out draw policy, and prize delivery terms.",
    url: "https://pakraffle.com/terms",
    siteName: "PakRaffle",
    type: "website",
  },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-3 pb-2">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
            <Shield className="w-4 h-4 text-emerald-700" />
            <span>Official Platform Terms & Rules</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">
            Terms & <span className="text-emerald-700">Conditions</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Please read these terms carefully before participating in any lucky draws on PakRaffle. All draws are conducted with full transparency, verified prize procurement, and strict audit compliance.
          </p>
          <div className="flex items-center justify-center gap-3 text-xs text-gray-500 pt-1">
            <span>Last Updated: 2025</span>
            <span>•</span>
            <span>Applicable across Pakistan</span>
          </div>
        </div>

        {/* SECTION 1: ELIGIBILITY & USER ACCOUNTS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">1. Eligibility & Participant Requirements</h3>
              <p className="text-xs text-gray-500">Who is legally permitted to participate on PakRaffle</p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
            <p>To register an account and purchase lucky draw tickets on PakRaffle, you must meet all of the following requirements:</p>
            <ul className="space-y-2 list-none">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>You must be at least 18 years of age at the time of entry purchase.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>You must be a citizen or resident of Pakistan with valid government-issued identification (CNIC or Passport).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>You must possess an active Pakistani mobile wallet or bank account (JazzCash, EasyPaisa, or Pakistani Bank Account) registered in your name for ticket verification and potential cash prize payouts.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Employees, officers, or immediate family members of PakRaffle staff cannot enter lucky draws to ensure uncompromised impartiality.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* SECTION 2: TICKET PURCHASING & ORDER VERIFICATION */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">2. Ticket Purchasing & Verification Protocol</h3>
              <p className="text-xs text-gray-500">How entries are validated and allocated to users</p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
            <p>
              <strong>Single-Ticket & Bundle Pricing:</strong> Each raffle has an officially published price per ticket in Pakistani Rupees (PKR). Users can purchase one or multiple tickets in a single checkout session, up to the maximum permitted per user for that raffle.
            </p>
            <p>
              <strong>Manual & Automated Transaction Proof:</strong> To complete entry allocation, users must submit their transaction ID (TID) or upload a genuine screenshot of the payment receipt. Our compliance team verifies transaction records directly against institutional statements within 5 to 15 minutes.
            </p>
            <p>
              <strong>Disqualification of Fake Receipts:</strong> Submitting altered, fabricated, or duplicate transaction receipts is strictly prohibited and will result in permanent account termination, forfeiture of tickets, and reporting to relevant anti-fraud authorities.
            </p>
          </div>
        </div>

        {/* SECTION 3: DRAW POLICY WHEN TARGET TICKETS SOLD */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">3. Raffle Draw Execution When Target Tickets Sold</h3>
              <p className="text-xs text-gray-500">Official draw trigger and ticket pool completion rule</p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
            <p>
              <strong>Target Ticket Threshold:</strong> Every raffle hosted on PakRaffle is tied to an explicit target number of total entries (e.g. 500, 1,000, or 2,500 tickets). The official lucky draw will take place when all the target tickets for that specific raffle have been sold.
            </p>
            <p>
              <strong>No Premature Draws:</strong> A draw will not take place before the designated target ticket count is reached. This ensures 100% complete prize funding, fair equal odds for all participants, and complete transparency.
            </p>
            <p>
              <strong>Draw Scheduling:</strong> As soon as all target tickets are sold, ticket purchasing is closed and all ticket holders are notified with the confirmed date and time of the live draw.
            </p>
          </div>
        </div>

        {/* SECTION 4: WINNER SELECTION & LIVE DRAW AUDIT */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">4. Winner Selection & Transparency Audit</h3>
              <p className="text-xs text-gray-500">Our mathematically verifiable random draw procedures</p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
            <p>
              <strong>Cryptographic Random Number Generation (RNG):</strong> The winning ticket number is selected using mathematically audited, unbiased pseudo-random number generator algorithms, ensuring every purchased ticket has an identical mathematical probability of winning.
            </p>
            <p>
              <strong>Live Stream Broadcast:</strong> Whenever feasible, draws are broadcasted live to participants via YouTube / Facebook Live / official WhatsApp community feeds. Complete uncut video recordings are permanently archived in our public <Link href="/winners" className="text-emerald-700 underline font-semibold">Winners Hall of Fame</Link>.
            </p>
            <p>
              <strong>Winner Notification Protocol:</strong> The verified winner is immediately contacted via phone call, SMS, and WhatsApp message within 2 hours of draw conclusion. Winners are granted 7 business days to confirm their delivery address and provide CNIC verification.
            </p>
          </div>
        </div>

        {/* SECTION 5: PRIZE DELIVERY & NATIONWIDE SHIPPING */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">5. Free Doorstep Prize Delivery & Cash Payouts</h3>
              <p className="text-xs text-gray-500">Nationwide courier delivery with zero hidden delivery charges</p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
            <p>
              <strong>100% Free Nationwide Delivery:</strong> All physical prizes (including mobile phones, motorbikes, electronics, and home appliances) are shipped free of charge directly to the winner’s doorstep anywhere in Pakistan via TCS, Leopards Courier, or authorized dealership handover.
            </p>
            <p>
              <strong>Zero Winner Fees:</strong> PakRaffle will <strong>NEVER</strong> demand shipping fees, tax clearance fees, courier charges, or service charges from a winner to release their prize. Any third party requesting payment on our behalf is a scammer and must be reported immediately.
            </p>
            <p>
              <strong>Cash Prize Transfers:</strong> Cash prize draws are disbursed directly to the winner's verified EasyPaisa, JazzCash, or Pakistani bank account within 15 to 30 minutes following identity confirmation.
            </p>
          </div>
        </div>

        {/* SECTION 6: REFUND POLICY & FAIR PLAY */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">6. Refunds, Modifications & Legal Jurisdiction</h3>
              <p className="text-xs text-gray-500">Terms regarding entry finality and legal governance</p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
            <p>
              <strong>Finality of Entry Purchases:</strong> Because ticket allocations directly alter the remaining pool and odds for other participants, purchased tickets are strictly non-refundable and non-exchangeable once payment verification is completed.
            </p>
            <p>
              <strong>Raffle Cancellation Guarantee:</strong> In the rare event that an active raffle is canceled by PakRaffle due to force majeure, unresolvable technical issues, or inventory supply discontinuation, 100% of the ticket purchase price will be promptly refunded to each participant's original payment method or wallet.
            </p>
            <p>
              <strong>Governing Law:</strong> These terms are governed and construed in accordance with the applicable laws of the Islamic Republic of Pakistan. Any legal disputes are subject to the exclusive jurisdiction of the competent courts in Pakistan.
            </p>
          </div>
        </div>

        {/* SECTION 7: USER-LISTED RAFFLES, CUSTODY, CANCELLATION & 3-MONTH DURATION */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                7. User Product Listings, Physical Custody &amp; Cancellation Policy
              </h3>
              <p className="text-xs text-gray-500">
                Mandatory operational terms for users listing products for public draw campaigns
              </p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs sm:text-sm text-gray-600 leading-relaxed">
            <p>
              <strong>Review &amp; Verified Outreach:</strong> After submitting a product listing application, our verification desk will review the documentation and contact the applicant directly through one of their provided and verified contact channels (WhatsApp, phone call, or email) to confirm asset authenticity and CNIC legal identity.
            </p>

            <p>
              <strong>Physical Verification &amp; Escrow Custody:</strong> Before ticket sales commence, the physical item must be shipped or delivered to an authorized PakRaffle custody facility in Lahore, Islamabad, or Karachi. PakRaffle will hold the verified item in secure, insured custody until the raffle is either successfully completed or officially cancelled.
            </p>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 space-y-2">
              <p className="font-bold text-xs uppercase tracking-wider text-amber-900">
                Voluntary Cancellation &amp; 8% Platform Fee Clause:
              </p>
              <p className="text-xs leading-relaxed">
                If a seller requests to cancel their live raffle after tickets have been made available for purchase, <strong>100% of all sold ticket amounts will be immediately refunded to participants</strong>. The seller is required to pay PakRaffle the <strong>8% platform fee</strong> (covering payment gateway transaction charges, verification labor, and marketing expenses) before the item will be released and returned to the seller.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 space-y-2">
              <p className="font-bold text-xs uppercase tracking-wider text-slate-900">
                3-Month Maximum Duration Limit:
              </p>
              <p className="text-xs leading-relaxed">
                All community product raffles must be completed within <strong>3 months (90 days)</strong> from their official launch date. If the required ticket goal is not met within 3 months, PakRaffle will automatically cancel the raffle, process full 100% refunds to all ticket buyers, charge/deduct the 8% platform fee, and securely return the physical item to the verified owner.
              </p>
            </div>
          </div>
        </div>

        {/* HELP & SUPPORT DESK */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs text-center space-y-3">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">
            Have Questions About Our Terms or Draw Rules?
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
            Our support desk is active 24/7 on WhatsApp and email to assist you with any questions regarding draw schedules, target ticket counts, or winner verification.
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
              href="/raffles"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs transition-colors"
            >
              Explore Active Raffles
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
