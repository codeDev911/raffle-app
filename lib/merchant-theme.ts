"use client"

// Merchant-workspace theme store.
//
// Dark mode is confined to one corner of the app, so it is driven by a single attribute on
// <html> — `data-merchant-workspace="dark"` — that the dark sheet in app/globals.css keys off.
// Two rules keep it contained: the attribute is only ever written while a workspace route is
// mounted, and nothing here touches a global `.dark` class or <html>'s `color-scheme`, which
// would leak dark scrollbars and form controls onto the public pages.
//
// The initial paint is handled by an inline script in app/layout.tsx (same key, same route
// test); this module takes over from there so client-side navigation stays correct.

export const MERCHANT_THEME_KEY = "raffle-merchant-theme"
export type MerchantTheme = "light" | "dark"

// The dashboard, checkout, onboarding and merchant auth screens — the workspace proper. The
// public marketing landing (/merchants) is intentionally NOT here: it is a bespoke gradient
// page the dark sheet was never written for, so it always stays light.
const WORKSPACE_ROUTES = ["/merchants/dashboard", "/merchants/checkout", "/merchants/onboarding", "/auth/merchant"]

export function isWorkspacePath(pathname?: string | null) {
  return WORKSPACE_ROUTES.some((route) => pathname?.startsWith(route))
}

export function readMerchantTheme(): MerchantTheme {
  if (typeof window === "undefined") return "light"
  try {
    return window.localStorage.getItem(MERCHANT_THEME_KEY) === "dark" ? "dark" : "light"
  } catch {
    return "light" // private mode / blocked storage: stay on the light design
  }
}

/** Paints (or unpaints) dark mode. Safe to call from any route: outside the workspace the
 *  stored preference is remembered but never rendered. */
export function applyMerchantTheme(theme: MerchantTheme, pathname?: string | null) {
  if (typeof document === "undefined") return
  const root = document.documentElement
  if (theme === "dark" && isWorkspacePath(pathname)) root.setAttribute("data-merchant-workspace", "dark")
  else root.removeAttribute("data-merchant-workspace")
}

export function setMerchantTheme(theme: MerchantTheme, pathname?: string | null) {
  try {
    window.localStorage.setItem(MERCHANT_THEME_KEY, theme)
  } catch {
    // Remembering is best-effort; the current view still switches.
  }
  applyMerchantTheme(theme, pathname)
  window.dispatchEvent(new CustomEvent<MerchantTheme>("merchant-theme-change", { detail: theme }))
}

/** Lets every toggle on the page reflect a choice made by another one. */
export function onMerchantThemeChange(handler: (theme: MerchantTheme) => void) {
  const listener = (event: Event) => handler((event as CustomEvent<MerchantTheme>).detail ?? readMerchantTheme())
  window.addEventListener("merchant-theme-change", listener)
  return () => window.removeEventListener("merchant-theme-change", listener)
}
