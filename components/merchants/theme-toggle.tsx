"use client"

// Light/dark switch for the merchant workspace. next-themes stores the choice globally
// (localStorage), but the palette swap in globals.css only renders inside /merchants* routes,
// so the rest of the site is untouched. The button borrows the kit's secondary-button look —
// its slate tokens flip automatically with the workspace palette.
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const pathname = usePathname()
  // Draw the neutral placeholder until mounted so SSR and the first client paint agree.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // The pre-paint script in ClientLayout's <head> covers fresh loads; this keeps the scope
  // honest after client-side navigations and theme changes.
  useEffect(() => {
    const inWorkspace = pathname?.startsWith("/merchants") || pathname?.startsWith("/auth/merchant")
    if (inWorkspace && resolvedTheme === "dark") document.documentElement.setAttribute("data-merchant-workspace", "dark")
    else document.documentElement.removeAttribute("data-merchant-workspace")
  }, [pathname, resolvedTheme])

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100",
        className,
      )}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {mounted ? isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" /> : <span className="h-4 w-4" />}
    </button>
  )
}
