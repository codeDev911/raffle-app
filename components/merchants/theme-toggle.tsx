"use client"

// Light/dark switch for the merchant workspace. Backed by lib/merchant-theme (a plain
// localStorage store that paints the scoped `data-merchant-workspace` attribute), deliberately
// not next-themes: that library writes a global `.dark` class / `color-scheme` on <html>, which
// would leak dark scrollbars and form controls onto the public pages. The button borrows the
// kit's secondary-button look, so its slate classes are remapped by the dark sheet in globals.css.
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { onMerchantThemeChange, readMerchantTheme, setMerchantTheme } from "@/lib/merchant-theme"

export function ThemeToggle({ className }: { className?: string }) {
  const pathname = usePathname()
  // Draw the moon placeholder until mounted so SSR and the first client paint agree.
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsDark(readMerchantTheme() === "dark")
    // Keep the icon in sync when another toggle on the page changes the theme.
    return onMerchantThemeChange((theme) => setIsDark(theme === "dark"))
  }, [])

  return (
    <button
      type="button"
      onClick={() => setMerchantTheme(isDark ? "light" : "dark", pathname)}
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
