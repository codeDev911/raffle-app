import Link from "next/link"
import {
  ShieldCheck,
  Trophy,
  Target,
  Truck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Eye,
  Lock,
  HeartHandshake,
  MessageSquare,
  Sparkles,
} from "lucide-react"

export const metadata = {
  title: "About Us — Pakistan's Trusted Lucky Draw Platform | PakRaffle",
  description:
    "Learn about PakRaffle — our story, 100% target ticket draw policy, transparent live broadcasts, and verified prize delivery across Pakistan.",
  keywords: [
    "about PakRaffle",
    "Pakistan lucky draw",
    "transparent raffle Pakistan",
    "target tickets sold draw",
    "verified prize delivery",
    "PakRaffle story",
  ],
  robots: "index, follow",
  openGraph: {
    title: "About Us - PakRaffle Pakistan",
    description: "Discover the vision, mission, and transparent draw standards behind PakRaffle.",
    url: "https://pakraffle.com/about",
    siteName: "PakRaffle",
    type: "website",
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 py-12 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
        
        {/* HERO SECTION */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-700">
            <ShieldCheck className="w-4 h-4" />
            <span>Pakistan&apos;s Sovereign Lucky Draw Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-[1.1]">
            Democratizing life-changing moments across <span className="text-emerald-700">Pakistan.</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            PakRaffle was built on a simple conviction: every Pakistani deserves a 100% honest, mathematically fair shot at luxury lifestyle prizes — backed by verified physical inventory, uncut live broadcasts, and zero hidden costs.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/raffles"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-sm transition-colors"
            >
              <span>Explore Active Draws</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/winners"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm transition-colors shadow-xs"
            >
              <Trophy className="w-4 h-4 text-emerald-700" />
              <span>Winners Gallery &amp; Proof</span>
            </Link>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-500 font-medium">
            <span>Established 2024</span>
            <span aria-hidden="true">·</span>
            <span>Serving All 4 Provinces, AJK &amp; GB</span>
            <span aria-hidden="true">·</span>
            <span>100% Target Ticket Rule</span>
          </div>
        </div>

        {/* KEY PERFORMANCE METRICS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight">₨ 25M+</div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Prizes Distributed</div>
            <p className="text-xs text-gray-400 pt-1">PTA phones, bikes, gold &amp; cash</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight">100%</div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Target Ticket Rule</div>
            <p className="text-xs text-gray-400 pt-1">Zero premature or rigged draws</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight">65,000+</div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Active Participants</div>
            <p className="text-xs text-gray-400 pt-1">Across 120+ Pakistani cities</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight">₨ 0</div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Winner Fees</div>
            <p className="text-xs text-gray-400 pt-1">100% free delivery nationwide</p>
          </div>
        </div>

        {/* THE STORY: WHY WE BUILT PAKRAFFLE */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200/80 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                Our Purpose
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                Rebuilding trust in Pakistani giveaways through radical transparency.
              </h2>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                For years, online giveaways in Pakistan were plagued by empty promises: social media pages that never drew winners, arbitrary deadline extensions when ticket sales fell short, and surprise &quot;customs clearance&quot; or &quot;delivery&quot; fees demanded from winners.
              </p>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                PakRaffle was engineered to eliminate doubt. We operate under strict corporate governance: every prize is physically procured and verified before launch, every entry is stamped with an immutable alphanumeric ID, draws occur only when 100% of tickets sell, and selection is broadcast live without camera cuts.
              </p>
            </div>

            <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-6 border border-gray-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">The PakRaffle Guarantee</h3>
                  <p className="text-xs text-gray-500">Unbroken platform standards</p>
                </div>
              </div>
              <div className="space-y-3 text-xs text-gray-600">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Physical Inventory First:</strong> We never launch a raffle for an item that is not already in our secured custody.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Zero Premature Draws:</strong> The draw executes strictly when 100% of target tickets are sold.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Free Nationwide Delivery:</strong> TCS, Leopard, or in-person ceremony handover with all taxes covered.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Zero Staff Participation:</strong> Staff, directors, and immediate family members are barred from entering.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COMPARISON: THE INDUSTRY VS PAKRAFFLE */}
        <div className="space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-700">
              Honest Comparison
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Why Pakistan Trusts PakRaffle
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              A transparent look at how our institutional model compares to unregulated social giveaways.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* The Unregulated Way */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-red-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2.5 text-red-700 font-bold text-sm sm:text-base">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span>Unregulated Social Schemes</span>
                </div>
                <span className="text-[11px] font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-md">High Risk</span>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span><strong>Arbitrary Delays:</strong> Draw dates pushed repeatedly if ticket targets are missed.</span>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span><strong>Phantom Winners:</strong> Winner names announced in text stories without live video or proof of handover.</span>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span><strong>Hidden Courier Charges:</strong> Winners asked to transfer thousands in shipping or processing fees.</span>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span><strong>No Audit Trail:</strong> No public ticket ledgers or mathematical random seed disclosures.</span>
                </div>
              </div>
            </div>

            {/* The PakRaffle Standard */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-300 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-sm sm:text-base">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>The PakRaffle Standard</span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">100% Verified</span>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>100% Target Ticket Rule:</strong> The draw executes only when all tickets are sold. No guesswork.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Live 4K Broadcast:</strong> Uncut YouTube/Facebook stream with real-time on-air phone calls to the winner.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>100% Free Doorstep Delivery:</strong> Delivered via insured courier or in-person ceremony at Rs 0 cost to winner.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Public Hashed Ledger:</strong> Cryptographic random number generator with transparent ticket pool records.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HOW IT WORKS: 4 STEPS TO A VERIFIED DRAW */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200/80 shadow-xs space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-700">
              Draw Architecture
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              How a PakRaffle Campaign Operates
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-gray-200/70 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                01
              </div>
              <h4 className="font-bold text-gray-900 text-sm">Pick Your Prize</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Choose from flagship smartphones, motorbikes, luxury sedans, or gold bars with ticket entries starting from Rs. 50.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-gray-200/70 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                02
              </div>
              <h4 className="font-bold text-gray-900 text-sm">Instant Local Payment</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Pay securely with JazzCash, EasyPaisa, or Pakistani Bank Transfer. Our team audits receipts within 5–15 minutes.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-gray-200/70 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <h4 className="font-bold text-gray-900 text-sm">100% Target Met &amp; Draw</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Once the final ticket is sold, the pool locks. The draw is streamed live with uncut cameras and cryptographic RNG.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-gray-200/70 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                04
              </div>
              <h4 className="font-bold text-gray-900 text-sm">Insured Doorstep Delivery</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                After identity verification, your prize is shipped via insured couriers or handed over in person with full registration documents.
              </p>
            </div>
          </div>
        </div>

        {/* VERIFIED WINNERS HIGHLIGHT */}
        <div className="space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-700">
              Real Experiences
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Verified Stories from Our Winners
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Authentic feedback from participants across Pakistan who won on PakRaffle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed italic">
                &quot;I entered with 2 tickets for Rs. 300 while having tea in Saddar, Rawalpindi. When they phoned me live during the YouTube stream, I couldn&apos;t believe it. 3 days later, my iPhone 16 Pro arrived via TCS without paying a single rupee for shipping.&quot;
              </p>
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-900 text-xs sm:text-sm">Daniyal Khan</div>
                  <div className="text-[11px] text-gray-500">Rawalpindi, Punjab</div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  iPhone 16 Pro
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed italic">
                &quot;The 100% target ticket rule gives complete peace of mind. The progress bar is public, the live draw is totally uncut, and Rs. 500,000 cash was transferred directly into my Meezan bank account within 24 hours of verification.&quot;
              </p>
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-900 text-xs sm:text-sm">Fatima Zahra</div>
                  <div className="text-[11px] text-gray-500">Gulshan-e-Iqbal, Karachi</div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Rs. 500,000 Cash
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed italic">
                &quot;Visited their regional office in Lahore to collect my Yamaha YBR 125G. The team handed over all registration paperwork, keys, and warranty card on camera. Professional, polite, and completely genuine.&quot;
              </p>
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-900 text-xs sm:text-sm">Usman Tariq</div>
                  <div className="text-[11px] text-gray-500">Faisalabad, Punjab</div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Yamaha YBR 125G
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM CALL TO ACTION */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200/80 shadow-xs text-center space-y-5">
          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Ready to claim your lucky entry?
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Browse active draws, participate starting from Rs. 50 via JazzCash or EasyPaisa, and follow the live draw when target tickets sell out.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/raffles"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors"
            >
              <span>Explore Active Raffles</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://wa.me/923377155722?text=Hello%20PakRaffle%20Support%2C%20I%20have%20a%20question%20about%20a%20draw"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs sm:text-sm transition-colors shadow-xs"
            >
              <MessageSquare className="w-4 h-4 text-emerald-700" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>

          <div className="pt-3 text-xs text-gray-400">
            PakRaffle Institutional Profile • Pakistan&apos;s Verified Digital Lucky Draw Platform
          </div>
        </div>

      </div>
    </div>
  )
}
