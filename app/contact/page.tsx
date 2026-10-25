import { Headphones, MessageSquare, Mail, MapPin, Clock, HelpCircle, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { ContactForm } from "@/components/contact-form"

export const metadata = {
  title: "Contact Us — Official Support Desk & Inquiries | PakRaffle",
  description:
    "Reach out to PakRaffle customer support. Get assistance with ticket verification, draw schedules, prize claims, or live chat.",
  keywords: [
    "contact PakRaffle",
    "PakRaffle support",
    "lucky draw help Pakistan",
    "ticket verification help",
    "PakRaffle customer care",
  ],
  robots: "index, follow",
  openGraph: {
    title: "Contact Us - PakRaffle Pakistan",
    description: "Get in touch with PakRaffle customer care via WhatsApp, email, or our inquiry desk.",
    url: "https://pakraffle.com/contact",
    siteName: "PakRaffle",
    type: "website",
  },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-3 pb-2">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
            <Headphones className="w-4 h-4 text-emerald-700" />
            <span>Official Customer Support & Inquiry Desk</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">
            Contact <span className="text-emerald-700">Support</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Have questions regarding ticket verification, the 100% target ticket draw policy, or prize handover? Our support team is active 7 days a week to assist you.
          </p>
          <div className="flex items-center justify-center gap-3 text-xs text-gray-500 pt-1">
            <span>Average Response: &lt; 15 mins</span>
            <span>•</span>
            <span>24/7 WhatsApp &amp; Email</span>
            <span>•</span>
            <span>Lahore &amp; Islamabad Desks</span>
          </div>
        </div>

        {/* SECTION 1: DIRECT CONTACT CHANNELS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">1. Direct Communication Channels</h3>
              <p className="text-xs text-gray-500">Fastest ways to reach our verification and support representatives</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {/* WhatsApp */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-gray-200/60 flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Live Support</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Best for instant ticket confirmation, payment slip reviews, and rapid questions.
                </p>
              </div>
              <a
                href="https://wa.me/923377155722?text=Hello%20PakRaffle%20Support%2C%20I%20need%20assistance"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors"
              >
                <span>Chat on WhatsApp</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Email */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-gray-200/60 flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                  <Mail className="w-4 h-4 text-emerald-700" />
                  <span>Official Email Desk</span>
                </div>
                <p className="text-xs font-mono font-medium text-emerald-800">support@pakraffle.com</p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  For formal dispute reviews, partnership inquiries, and account audits.
                </p>
              </div>
              <a
                href="mailto:support@pakraffle.com"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs transition-colors"
              >
                <span>Send Email</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Offices */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-gray-200/60 flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <span>Regional Desks</span>
                </div>
                <p className="text-xs font-semibold text-gray-800">Lahore &amp; Islamabad, Pakistan</p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Physical winner ceremonies and prize collection. Mon–Sat, 10:00 AM – 6:00 PM PKT.
                </p>
              </div>
              <div className="text-[11px] font-bold text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200/70 text-center">
                By Appointment For Prize Delivery
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: SEND US A MESSAGE FORM */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">2. Submit an Inquiry</h3>
              <p className="text-xs text-gray-500">Send our support staff a message directly from this portal</p>
            </div>
          </div>

          <ContactForm />
        </div>

        {/* SECTION 3: DEPARTMENT RESOLUTION STANDARDS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">3. Resolution Timelines &amp; SLA</h3>
              <p className="text-xs text-gray-500">Expected turnaround times for common requests</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-gray-600">
            <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200/60 space-y-1">
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Payment &amp; Ticket Approval</span>
              </div>
              <p className="text-xs text-gray-500 pl-6">5 to 15 minutes average review time 24 hours a day.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200/60 space-y-1">
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Draw Schedule Updates</span>
              </div>
              <p className="text-xs text-gray-500 pl-6">Live broadcast dates announced upon 100% target ticket sales.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200/60 space-y-1">
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Prize Claim &amp; Verification</span>
              </div>
              <p className="text-xs text-gray-500 pl-6">Winner identity validation initiated within 2 hours of draw end.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200/60 space-y-1">
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Technical &amp; Account Support</span>
              </div>
              <p className="text-xs text-gray-500 pl-6">Password resets and profile updates handled within 30 minutes.</p>
            </div>
          </div>
        </div>

        {/* SECTION 4: FREQUENTLY ASKED QUESTIONS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">4. Frequently Asked Questions</h3>
              <p className="text-xs text-gray-500">Quick answers to standard participant questions</p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
            <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200/60 space-y-1.5">
              <h4 className="font-bold text-gray-900">When does a lucky draw take place?</h4>
              <p className="text-xs text-gray-600">
                A draw takes place only when <strong>100% of the target tickets are sold</strong>. There are no artificial countdown deadlines or premature cancellations. Once the ticket progress bar reaches 100%, the live stream date and time are published on our website and social channels.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200/60 space-y-1.5">
              <h4 className="font-bold text-gray-900">How do I verify my payment after transferring funds?</h4>
              <p className="text-xs text-gray-600">
                After completing your payment via JazzCash, EasyPaisa, or Pakistani Bank Transfer, enter your Transaction ID (TID) and submit a screenshot on the checkout page. Our verification desk reconciles payments within 5 to 15 minutes, and your tickets appear in your profile entries immediately.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200/60 space-y-1.5">
              <h4 className="font-bold text-gray-900">How do winners receive their prizes?</h4>
              <p className="text-xs text-gray-600">
                Prizes are delivered free of charge nationwide. Electronics and gadgets are shipped via insured couriers directly to your home. Vehicles are handed over in person with full registration paperwork at our office or arranged doorstep delivery. Cash prizes are transferred to your verified Pakistani bank account or mobile wallet.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200/60 space-y-1.5">
              <h4 className="font-bold text-gray-900">Are my entries guaranteed against fraud?</h4>
              <p className="text-xs text-gray-600">
                Yes. Every verified ticket is assigned an immutable alphanumeric serial number and recorded with your CNIC and timestamp. Draws use verified cryptographically secure random number generation (CSPRNG) and are broadcast live without camera cuts.
              </p>
            </div>
          </div>
        </div>

        {/* QUICK ACTION TILES */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs text-center space-y-3">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">
            Looking for Your Tickets or Recent Winners?
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
            You can view your active tickets, check draw statuses, or see photos and videos from our latest prize distribution ceremonies.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/profile/entries"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors"
            >
              View My Tickets
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/winners"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs transition-colors"
            >
              Winners Gallery
            </Link>
            <Link
              href="/raffles"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs transition-colors"
            >
              Explore Active Draws
            </Link>
          </div>
        </div>

        {/* Footer Audit Stamp */}
        <div className="text-center text-xs text-gray-400 pt-2">
          <p>PakRaffle Official Support Center • Pakistan&apos;s Verified Digital Lucky Draw Platform</p>
        </div>
      </div>
    </div>
  )
}
