"use client"

import type React from "react"
import { Inter, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

const inter = Inter({ subsets: ["latin"] })
// Geometric display face for the marketing headlines; exposed as a CSS variable so only the
// pages that ask for `font-display` pick it up.
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" })

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isStandaloneRoute =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/payment") ||
    pathname?.startsWith("/application/") ||
    pathname?.startsWith("/merchants/dashboard") ||
    pathname?.startsWith("/merchants/checkout") ||
    pathname?.startsWith("/merchants/onboarding") ||
    pathname?.startsWith("/auth/merchant")
  // Ads on a payment page read as a scam, so the AdSense tag is skipped there.
  const isCheckoutRoute = pathname?.startsWith("/merchants/checkout")
  useEffect(() => {
    if (typeof window !== "undefined") {
      const key = "client_browse_id"
      if (!localStorage.getItem(key)) {
        const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem(key, uniqueId)
      }
    }
  }, [])
  return (
    <html lang="en" className={display.variable}>
      <head>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-EX44PLKN82"></script>
     <meta name="monetag" content="78091832d51a3d2d1cd351e318c806b9"></meta>
     <meta name="google-adsense-account" content="ca-pub-8516478537168335"></meta>
     {!isCheckoutRoute && (
       <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8516478537168335"
       crossOrigin="anonymous"></script>
     )}
      </head>
      <body className={inter.className}>
        {!isStandaloneRoute && <Header />}
        <main>{children}</main>
        {!isStandaloneRoute && <Footer />}
      </body>
    </html>
  )
}
