"use client"

// Body-level client shell: theme provider + route-aware chrome. The <html>/<head>/<body>
// document is owned by the Server RootLayout in app/layout.tsx — rendering the document shell
// from here left React unable to re-attach it at hydration and the whole page went blank.
import type React from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"

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
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="raffle-merchant-theme" disableTransitionOnChange>
      {!isCheckoutRoute && (
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8516478537168335" crossOrigin="anonymous"></script>
      )}
      {!isStandaloneRoute && <Header />}
      <main>{children}</main>
      {!isStandaloneRoute && <Footer />}
    </ThemeProvider>
  )
}
