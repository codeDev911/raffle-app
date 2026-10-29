import Link from "next/link"
import {
  Trophy,
  Facebook,
  Mail,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Truck,
  MessageSquare,
  Sparkles,
  ArrowRight,
} from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-white text-gray-600 border-t border-gray-200 text-xs sm:text-sm">
      {/* Trust & Guarantee Banner */}
      <div className="border-b border-gray-200/80 bg-slate-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center shrink-0 shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-xs sm:text-sm">100% Target Ticket Rule</div>
                <p className="text-[11px] text-gray-500 mt-0.5">Draws commence only once all target tickets sell out.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center shrink-0 shadow-2xs">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-xs sm:text-sm">Free Insured Delivery</div>
                <p className="text-[11px] text-gray-500 mt-0.5">TCS tracked doorstep delivery across all of Pakistan.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center shrink-0 shadow-2xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-xs sm:text-sm">100% PTA Approved</div>
                <p className="text-[11px] text-gray-500 mt-0.5">All mobile phones &amp; gadgets are genuine and sealed.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center shrink-0 shadow-2xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-xs sm:text-sm">Uncut Live Broadcasts</div>
                <p className="text-[11px] text-gray-500 mt-0.5">Certified randomizer streamed live on YouTube &amp; Facebook.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
          {/* Brand Info (Span 2 on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Trophy className="h-5 w-5" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Pak<span className="text-emerald-700">Raffle</span>
              </span>
            </Link>

            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed max-w-sm">
              Pakistan&apos;s verified digital lucky draw platform. We democratize life-changing prizes through provably fair draws, native Pakistani payment clearing, and free doorstep delivery.
            </p>

            {/* Social Links - Facebook, TikTok, X, WhatsApp Channel ONLY */}
            <div className="pt-1 flex items-center gap-2">
              <a
                href="https://www.facebook.com/profile.php?id=61578036305307"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 hover:border-emerald-500/50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 flex items-center justify-center transition-colors shadow-2xs"
                aria-label="Facebook"
                title="Follow us on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://www.tiktok.com/@pak.raffle"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 hover:border-emerald-500/50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 flex items-center justify-center transition-colors shadow-2xs"
                aria-label="TikTok"
                title="Follow us on TikTok"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.35 22a6.33 6.33 0 0 0 6.34-6.32V9.32a8.27 8.27 0 0 0 4.84 1.57V7.45a4.86 4.86 0 0 1-.94-.76z"/>
                </svg>
              </a>
              <a
                href="https://x.com/PakRaffle"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 hover:border-emerald-500/50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 flex items-center justify-center transition-colors shadow-2xs"
                aria-label="X (Twitter)"
                title="Follow us on X"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://whatsapp.com/channel/0029VbB0CzJ8fewyBXpXy210"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 hover:border-emerald-500/50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 flex items-center justify-center transition-colors shadow-2xs"
                aria-label="WhatsApp Channel"
                title="Join our official WhatsApp Channel"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M17.507 14.307l-.009.075c-.238-.12-1.406-.694-1.624-.774-.219-.079-.378-.12-.538.12-.158.239-.617.774-.757.933-.138.16-.279.179-.517.06-.239-.12-1.008-.372-1.92-1.185-.709-.633-1.188-1.415-1.328-1.654-.139-.239-.015-.368.105-.487.108-.107.239-.279.359-.418.119-.14.159-.239.239-.399.08-.159.04-.299-.02-.418-.06-.12-.538-1.296-.737-1.774-.194-.467-.393-.404-.539-.412l-.46-.008c-.159 0-.418.06-.637.299-.22.239-.837.817-.837 1.993 0 1.176.857 2.311.976 2.471.12.16 1.687 2.576 4.088 3.613.571.247 1.018.395 1.366.506.574.183 1.096.157 1.509.095.46-.069 1.406-.575 1.605-1.131.199-.557.199-1.035.139-1.135-.059-.1-.219-.16-.458-.279zM12.023 2C6.49 2 2 6.48 2 12c0 1.979.578 3.824 1.579 5.378L2.094 22l4.802-1.436C8.36 21.435 10.134 22 12.023 22c5.534 0 10.024-4.48 10.024-10S17.557 2 12.023 2zm0 18.25c-1.644 0-3.18-.49-4.475-1.332l-.321-.21-2.852.853.865-2.784-.23-.332A8.196 8.196 0 013.78 12c0-4.545 3.697-8.243 8.243-8.243 4.545 0 8.243 3.698 8.243 8.243 0 4.545-3.698 8.25-8.243 8.25z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Explore Raffles */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Explore Draws
            </h3>
            <ul className="space-y-2.5 text-xs text-gray-600">
              <li>
                <Link href="/raffles" className="hover:text-emerald-700 transition-colors">
                  All Active Raffles
                </Link>
              </li>
              <li>
                <Link href="/winners" className="hover:text-emerald-700 transition-colors">
                  Recent Winners Gallery
                </Link>
              </li>
              <li>
                <Link href="/raffles?category=Electronics" className="hover:text-emerald-700 transition-colors">
                  Smartphones &amp; Gadgets
                </Link>
              </li>
              <li>
                <Link href="/raffles?category=Vehicles" className="hover:text-emerald-700 transition-colors">
                  Motorcycles &amp; Cars
                </Link>
              </li>
              <li>
                <Link href="/raffles?category=Cash" className="hover:text-emerald-700 transition-colors">
                  Cash &amp; Gold Drops
                </Link>
              </li>
              <li>
                <Link href="/become-a-partner" className="hover:text-emerald-700 transition-colors">
                  Earn with Us (Affiliates)
                </Link>
              </li>
              <li>
                <Link href="/merchants" className="text-emerald-700 font-semibold hover:underline flex items-center gap-1">
                  <span>Merchant Connect (Shopify)</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold">Sellers</span>
                </Link>
              </li>
              <li>
                <Link href="/lookup/store-ticket" className="hover:text-emerald-700 transition-colors">
                  Store Ticket Lookup
                </Link>
              </li>
              <li>
                <Link href="/list-product" className="text-emerald-700 font-semibold hover:underline flex items-center gap-1">
                  <span>List Your Product</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold">8% Fee</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Legal */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Trust &amp; Legal
            </h3>
            <ul className="space-y-2.5 text-xs text-gray-600">
              <li>
                <Link href="/about" className="hover:text-emerald-700 transition-colors">
                  About PakRaffle
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-emerald-700 transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-emerald-700 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-emerald-700 transition-colors">
                  Refund &amp; Cancellation Policy
                </Link>
              </li>
              <li>
                <a
                  href="https://blog.pakraffle.com?utm=pakraffle&medium=footer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-700 transition-colors inline-flex items-center gap-1"
                >
                  <span>Official Blog</span>
                  <ArrowRight className="w-3 h-3 -rotate-45" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Official Contact Desks */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Official Help Desk
            </h3>
            <div className="space-y-3 text-xs text-gray-600">
              <div>
                <a
                  href="https://whatsapp.com/channel/0029VbB0CzJ8fewyBXpXy210"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-semibold transition-colors"
                >
                  <MessageSquare className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>WhatsApp Channel</span>
                </a>
                <p className="text-[11px] text-gray-500 mt-0.5">Live draw updates &amp; 24/7 support</p>
              </div>

              <div>
                <a
                  href="mailto:support@pakraffle.com"
                  className="inline-flex items-center gap-2 hover:text-emerald-700 transition-colors"
                >
                  <Mail className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="text-gray-700">support@pakraffle.com</span>
                </a>
                <p className="text-[11px] text-gray-500 mt-0.5">Audits &amp; official queries</p>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <MapPin className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <span className="text-gray-800 font-medium">Lahore &amp; Islamabad</span>
                  <p className="text-[11px] text-gray-500">Physical prize handover desks</p>
                </div>
              </div>

              <div className="pt-1.5">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 text-gray-800 font-semibold text-[11px] transition-colors"
                >
                  <span>Submit Inquiry Form</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Accepted Payment Methods - Original Icons Only (Inline) */}
        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-5 text-xs text-gray-500">
          <div className="inline-flex items-center gap-5 flex-wrap justify-center md:justify-start">
            <span className="text-xs font-semibold text-gray-500">Accepted Payments:</span>

            {/* EasyPaisa Original Icon */}
            <img
              src="/assets/easypaisa-logo.png"
              alt="EasyPaisa"
              className="h-6 w-auto object-contain inline-block"
              title="EasyPaisa"
            />

            {/* JazzCash Original Icon */}
            <img
              src="/assets/jazzcash-logo.png"
              alt="JazzCash"
              className="h-6 w-auto object-contain inline-block"
              title="JazzCash"
            />

            {/* NayaPay Original Icon */}
            <img
              src="/assets/nayapay.svg"
              alt="NayaPay"
              className="h-4.5 w-auto object-contain inline-block"
              title="NayaPay"
            />

            {/* SadaPay Original Icon */}
            <img
              src="/assets/sadapay.svg"
              alt="SadaPay"
              className="h-6 w-auto object-contain inline-block"
              title="SadaPay"
            />

            {/* 1Link Original Icon */}
            <img
              src="/assets/1link-logo.svg"
              alt="1LINK"
              className="h-6 w-auto object-contain inline-block"
              title="1LINK"
            />
          </div>

          <div className="flex items-center gap-2 text-gray-600 bg-emerald-50/60 border border-emerald-200/60 px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-emerald-900">CSPRNG RNG Engine Operational</span>
          </div>
        </div>

        {/* Bottom Sub-Footer Copyright */}
        <div className="border-t border-gray-100 mt-6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-500">
          <p>© {new Date().getFullYear()} PakRaffle. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span>🇵🇰 Made in Pakistan</span>
            <span className="text-gray-300">•</span>
            <span>100% Target Ticket Policy</span>
            <span className="text-gray-300">•</span>
            <span>Zero Hidden Fees</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
