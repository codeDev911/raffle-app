// Typed domain error so API routes can map service failures to HTTP status codes
// without leaking internal exceptions.
export class MerchantError extends Error {
  status: number
  code: string

  constructor(message: string, status = 400, code = "BAD_REQUEST") {
    super(message)
    this.name = "MerchantError"
    this.status = status
    this.code = code
  }
}

export const notFound = (what: string) => new MerchantError(`${what} not found`, 404, "NOT_FOUND")
export const conflict = (message: string) => new MerchantError(message, 409, "CONFLICT")
export const unauthorized = (message = "Merchant authentication required") =>
  new MerchantError(message, 401, "UNAUTHORIZED")
export const forbidden = (message = "Access denied") => new MerchantError(message, 403, "FORBIDDEN")

/** Prisma (and the file-store adapter) report unique constraint violations as P2002. */
export function isUniqueViolation(err: unknown): boolean {
  return Boolean(err && typeof err === "object" && (err as any).code === "P2002")
}

/** Missing table / column — the schema has not been pushed to the database yet. */
export function isSchemaMissing(err: unknown): boolean {
  const code = err && typeof err === "object" ? (err as any).code : undefined
  return code === "P2021" || code === "P2022"
}
