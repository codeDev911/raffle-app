/**
 * Route scope helpers shared by the shell (app/ClientLayout.tsx) and the chat loader
 * (components/support-chat.tsx).
 *
 * Staff surfaces must not carry visitor machinery: the tawk.to bubble floats over admin KPI
 * tiles and ledger rows, and Google's ad / captcha frames have no business being requested
 * from inside an operations console.
 */

const STAFF_PREFIX = "/admin"

/** True for /admin and anything beneath it. Deliberately not a bare startsWith("/admin"). */
export function isStaffRoute(pathname: string | null | undefined): boolean {
  return pathname === STAFF_PREFIX || Boolean(pathname && pathname.startsWith(`${STAFF_PREFIX}/`))
}
