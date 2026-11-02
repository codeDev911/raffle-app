/**
 * Support destinations shared by Server Components (footer, /help, /contact) and the client
 * launcher in components/marketing/live-chat.tsx.
 *
 * These live outside the client module on purpose: a value imported from a "use client" file
 * becomes a client reference in the server graph, which is fine for components but wrong for a
 * plain string a footer needs to render.
 */

/** Tawk.to property + widget. The same IDs the embed script in app/layout.tsx uses. */
export const LIVE_CHAT_URL = "https://tawk.to/chat/6ae85667fceb143c3f37e8c6/1k6dp31gm?layout=modern"

/** Tawk's hosted article site (KnowMe), reachable without an account. */
export const KNOWLEDGE_BASE_URL = "https://pakraffle.tawk.help/"

export const SUPPORT_EMAIL = "support@pakraffle.com"
