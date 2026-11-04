/**
 * Formbold is our form backend (we moved off Formspree). Every submission goes straight from the
 * browser to `https://formbold.com/s/<form>` as multipart form data — nothing is written to our
 * database first, and there is no API key to leak because the endpoint is public by design.
 *
 * Two rules from their docs that the helpers below encode:
 *  - Formbold keys each value by its field name, so a field without a name is silently dropped.
 *  - Submitting with `Accept: application/json` gets JSON back instead of an HTML redirect, which
 *    is what lets us show an inline success state without reloading the page.
 *
 * Every payload also carries a readable `message`, so a form that only defines Name / Email /
 * Subject / Message still arrives with the full story in the notification email.
 */

const FORMBOLD_SUBMIT_BASE = "https://formbold.com/s/"

/** Accepts the full endpoint or a bare form id, so the env var can hold either. */
export function formboldEndpoint(value: string | null | undefined): string | null {
  const raw = (value || "").trim()
  if (!raw) return null
  if (/^https?:\/\//i.test(raw)) return raw
  return `${FORMBOLD_SUBMIT_BASE}${raw.replace(/^\/+/, "")}`
}

export const CONTACT_ENDPOINT = formboldEndpoint(process.env.NEXT_PUBLIC_FORMBOLD_CONTACT_FORM_ID)
export const COMPLAINT_ENDPOINT = formboldEndpoint(process.env.NEXT_PUBLIC_FORMBOLD_COMPLAINT_FORM_ID)
export const MERCHANT_INTAKE_ENDPOINT = formboldEndpoint(process.env.NEXT_PUBLIC_FORMBOLD_MERCHANT_FORM_ID)

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * The complaint form accepts "email or WhatsApp", and Formbold treats `email` as an address, so an
 * address-looking value is the only thing allowed into that field. The raw contact always travels
 * in its own field regardless.
 */
export function emailField(value: string | null | undefined): string | undefined {
  const email = (value || "").trim()
  return EMAIL_PATTERN.test(email) ? email : undefined
}

export type FormFields = Record<string, string | null | undefined>

/**
 * Posts to Formbold and throws with a user-facing message when the submission did not land, so
 * callers can keep their existing inline error box.
 */
export async function submitToFormbold(
  endpoint: string | null,
  fields: FormFields,
  fallbackMessage = "We couldn't send that. Please try again in a moment.",
): Promise<void> {
  if (!endpoint) {
    throw new Error("Submissions are temporarily unavailable. Please reach us on WhatsApp.")
  }

  const body = new FormData()
  for (const [name, value] of Object.entries(fields)) {
    const text = (value ?? "").trim()
    // Blank optional fields are left out entirely so the submission row stays readable.
    if (text) body.append(name, text)
  }

  // No Content-Type here on purpose: the browser has to generate the multipart boundary, and a
  // hand-written header would drop it and leave the body unparsed on Formbold's side.
  const res = await fetch(endpoint, { method: "POST", body, headers: { Accept: "application/json" } })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.message || data?.errors?.[0]?.message || fallbackMessage)
  }
}
