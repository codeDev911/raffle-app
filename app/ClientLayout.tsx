"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { usePathname } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith("/admin") || pathname?.startsWith("/payment")

  return (
    <html lang="en">
      <body className={inter.className}>
        {!isAdminRoute && <Header />}
        <main>{children}</main>
        {!isAdminRoute && <Footer />}
      </body>
    </html>
  )
}
