"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Gift,
  Users,
  CreditCard,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Raffles", href: "/admin/raffles", icon: Gift },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Payments", href: "/admin/payments", icon: CreditCard },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = () => {
      const adminAuth = localStorage.getItem("adminAuth")
      if (adminAuth === "true") {
        setIsAuthenticated(true)
      } else if (pathname !== "/admin") {
        router.push("/admin")
      }
      setLoading(false)
    }

    checkAuth()
  }, [pathname, router])

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem("adminAuth")
    router.push("/admin")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-red-500 border-t-transparent mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Verifying session...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated && pathname !== "/admin") {
    return null
  }

  if (pathname === "/admin") {
    return <>{children}</>
  }

  const currentNav = navigation.find((item) =>
    item.href === "/admin/dashboard"
      ? pathname === "/admin/dashboard"
      : pathname.startsWith(item.href)
  )

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row antialiased">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-200"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar (Desktop fixed + Mobile slide-over) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
        aria-label="Admin Navigation"
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-sm shadow-red-200 group-hover:bg-red-700 transition-colors">
              <Gift className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-slate-900 leading-none">
                PakRaffle
              </span>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">
                Admin Console
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            type="button"
            className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Management
          </div>
          {navigation.map((item) => {
            const isActive =
              item.href === "/admin/dashboard"
                ? pathname === "/admin/dashboard"
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                  isActive
                    ? "bg-red-50 text-red-700 font-semibold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`h-4.5 w-4.5 ${
                      isActive ? "text-red-600" : "text-slate-400"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                )}
              </Link>
            )
          })}

          <div className="pt-4 px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Quick Links
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors min-h-[44px]"
          >
            <div className="flex items-center gap-3">
              <ExternalLink className="h-4.5 w-4.5 text-slate-400" />
              <span>Live Website</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          </Link>
        </div>

        {/* Footer info & Logout */}
        <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/50">
          <div className="px-3 py-2 flex items-center gap-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">Administrator</p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Session</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl min-h-[44px] px-3 font-medium"
          >
            <LogOut className="mr-2.5 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Sticky Mobile & Desktop Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden min-h-[44px] min-w-[44px] -ml-2 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb / Title */}
            <div className="flex items-center gap-2 text-sm">
              <span className="hidden sm:inline text-slate-500 font-medium">Admin</span>
              <span className="hidden sm:inline text-slate-300">/</span>
              <span className="font-semibold text-slate-900 truncate">
                {currentNav ? currentNav.name : "Portal"}
              </span>
            </div>
          </div>

          {/* Quick status & Live action */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/admin/raffles/create"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-2xs transition-colors"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>New Raffle</span>
            </Link>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Visit Site</span>
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
