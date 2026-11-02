"use client"

import type { MouseEvent, ReactNode } from "react"
import { BookOpen, MessagesSquare } from "lucide-react"
import { Cta } from "@/components/marketing/kit"
import { KNOWLEDGE_BASE_URL, LIVE_CHAT_URL } from "@/lib/support-links"

type TawkWindow = Window & {
  Tawk_API?: {
    maximize?: () => void
    minimize?: () => void
    prefillMessage?: (message: string) => void
  }
}

/**
 * The Tawk script is injected on every route by app/layout.tsx, so a click should open that
 * already-loaded conversation instead of navigating away. Returns false when the API is absent
 * (script blocked, offline, still loading) so the caller can fall through to the plain link.
 */
function openChatPanel(prefill?: string): boolean {
  if (typeof window === "undefined") return false

  const api = (window as TawkWindow).Tawk_API
  if (!api || typeof api.maximize !== "function") return false

  if (prefill && typeof api.prefillMessage === "function") {
    try {
      api.prefillMessage(prefill)
    } catch {
      // A prefill failure must not stop the panel from opening.
    }
  }

  try {
    api.maximize()
    return true
  } catch {
    return false
  }
}

type LauncherProps = {
  label?: string
  /** Written into the agent field when the panel opens, so the visitor types less. */
  prefill?: string
  variant?: "primary" | "ink" | "ghost" | "light"
  className?: string
  arrow?: boolean
  icon?: ReactNode
}

/**
 * Live-chat launcher. Deliberately an anchor rather than a button: when the click handler opens
 * the panel it cancels navigation, and when the widget never loaded the browser follows the href
 * into a new tab. Either way the visitor reaches an agent.
 */
export function LiveChatLink({
  label = "Chat with support",
  prefill,
  variant = "primary",
  className,
  arrow = false,
  icon = <MessagesSquare className="h-4 w-4" />,
}: LauncherProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (openChatPanel(prefill)) event.preventDefault()
  }

  return (
    <Cta href={LIVE_CHAT_URL} variant={variant} className={className} arrow={arrow} onClick={handleClick}>
      {icon}
      {label}
    </Cta>
  )
}

/** Public article library — always opens in a new tab so a browse never loses their draw page. */
export function KnowledgeBaseLink({
  label = "Browse help articles",
  variant = "ghost",
  className,
  arrow = false,
  icon = <BookOpen className="h-4 w-4" />,
}: LauncherProps) {
  return (
    <Cta href={KNOWLEDGE_BASE_URL} variant={variant} className={className} arrow={arrow}>
      {icon}
      {label}
    </Cta>
  )
}
