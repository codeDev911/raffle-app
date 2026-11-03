import "./globals.css"
import type React from "react"
import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import ClientLayout from "./ClientLayout"
import SupportChat from "@/components/support-chat"
import Script from 'next/script'

const inter = Inter({ subsets: ["latin"] })
// Geometric display face for the marketing headlines; exposed as a CSS variable so only the
// pages that ask for `font-display` pick it up.
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" })

const Analytics = () => null
const SpeedInsights = () => null


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  // The document shell must be rendered by this Server Component — a client component owning
  // <html>/<body> wipes the page at hydration. Route-aware head logic lives in ClientLayout's
  // providers, which render inside <body>.
  return (
    <html lang="en" className={display.variable} suppressHydrationWarning>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-EX44PLKN82"></script>
        <meta name="monetag" content="78091832d51a3d2d1cd351e318c806b9"></meta>
        <meta name="google-adsense-account" content="ca-pub-8516478537168335"></meta>
        {/* The merchant workspace is the app's only dark-mode corner: the saved theme is applied
            there (and only there) via `data-merchant-workspace` on <html>, which the dark sheet in
            globals.css keys off. beforeInteractive runs blocking in <head> before first paint, so a
            dark-mode visitor never sees a light flash; ClientLayout re-asserts it on navigation. */}
        <Script id="workspace-theme" strategy="beforeInteractive">
          {`try{var t=localStorage.getItem('raffle-merchant-theme');var p=location.pathname;var ws=p.indexOf('/merchants/dashboard')===0||p.indexOf('/merchants/checkout')===0||p.indexOf('/merchants/onboarding')===0||p.indexOf('/auth/merchant')===0;if(t==='dark'&&ws){document.documentElement.setAttribute('data-merchant-workspace','dark')}else{document.documentElement.removeAttribute('data-merchant-workspace')}}catch(e){}`}
        </Script>
      </head>
      <body className={inter.className}>
        <ClientLayout>
          <SupportChat/>
          <Analytics/>
          <SpeedInsights/>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
