import type React from "react"
import type { Metadata } from "next"
import ClientLayout from "./ClientLayout"
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "PakRaffle - Pakistan's #1 Raffle Platform",
  description: "Win amazing prizes through Pakistan's most trusted raffle platform. Fair, transparent, and secure.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout>{children}</ClientLayout>
}


import './globals.css'