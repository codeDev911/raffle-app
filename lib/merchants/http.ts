import { NextResponse } from "next/server"
import { MerchantError } from "./errors"

export const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
}

export function ok(data: Record<string, any>, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status, headers: noCacheHeaders })
}

export function fail(error: string, status = 400, extra: Record<string, any> = {}) {
  return NextResponse.json({ success: false, error, ...extra }, { status, headers: noCacheHeaders })
}

/** Maps domain / validation errors to HTTP responses; never leaks internal stack traces. */
export function handleRouteError(err: unknown, context: string) {
  if (err instanceof MerchantError) {
    return fail(err.message, err.status, { code: err.code })
  }
  if (err && typeof err === "object" && (err as any).name === "ZodError") {
    const issues = ((err as any).issues || []) as Array<{ path: (string | number)[]; message: string }>
    const first = issues[0]
    const message = first ? `${first.path.join(".") || "input"}: ${first.message}` : "Invalid input"
    return fail(message, 400, { code: "VALIDATION_ERROR" })
  }
  console.error(`[MerchantConnect] ${context}:`, err)
  return fail("Something went wrong. Please try again.", 500, { code: "INTERNAL_ERROR" })
}

export async function readJson(req: Request): Promise<any> {
  try {
    return await req.json()
  } catch {
    throw new MerchantError("Request body must be valid JSON", 400, "INVALID_JSON")
  }
}

/** Public origin for URLs shown to merchants (prefers the configured base URL used by payments). */
export function publicBaseUrl(req: Request): string {
  const configured = process.env.NEXT_PUBLIC_BASE_URL?.trim().replace(/\/+$/, "")
  return configured || new URL(req.url).origin
}

export function webhookUrlFor(req: Request): string {
  return `${publicBaseUrl(req)}/api/merchants/webhooks/shopify`
}
