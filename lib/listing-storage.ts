import fs from "fs"
import path from "path"
import { ProductListingRequest } from "./prisma"

const PRIMARY_DATA_DIR = path.join(process.cwd(), "data")
const PRIMARY_DATA_FILE = path.join(PRIMARY_DATA_DIR, "listing-requests.json")
const FALLBACK_DATA_FILE = path.join("/tmp", "pakraffle-listing-requests.json")

// This store is the disk fallback used when the real database is unavailable, so it holds only
// genuine submissions. It used to carry five hard-coded demo listings ("req-101"… plus a restored
// test row) and re-wrote them back into the JSON file whenever it was found empty, which made
// already-deleted product requests reappear in the admin queue after a database reset.

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath)
  if (!fs.existsSync(dirname)) {
    try {
      fs.mkdirSync(dirname, { recursive: true })
    } catch (e) {
      // ignore
    }
  }
}

function getStorageFilePath(): string {
  try {
    ensureDirectoryExistence(PRIMARY_DATA_FILE)
    return PRIMARY_DATA_FILE
  } catch {
    return FALLBACK_DATA_FILE
  }
}

// In-memory cache for fast read access
let memoryCache: ProductListingRequest[] | null = null

export function readAllListingRequests(): ProductListingRequest[] {
  const filePath = getStorageFilePath()

  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8")
      const parsed = JSON.parse(raw)
      // An empty array is a valid state, not a missing file: it must not be treated as "unseeded".
      if (Array.isArray(parsed)) {
        memoryCache = parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        }))
        return memoryCache
      }
    }
  } catch (err) {
    console.warn("[ListingStorage] Failed to read from file, starting with no requests:", err)
  }

  // No file yet (or it could not be parsed): start empty. The file is created by the first save.
  memoryCache = []
  return memoryCache
}

export function writeAllListingRequests(requests: ProductListingRequest[]): boolean {
  memoryCache = requests
  const filePath = getStorageFilePath()

  try {
    ensureDirectoryExistence(filePath)
    fs.writeFileSync(filePath, JSON.stringify(requests, null, 2), "utf-8")
    return true
  } catch (err) {
    console.warn(`[ListingStorage] Failed to write to primary ${filePath}, trying fallback:`, err)
    try {
      fs.writeFileSync(FALLBACK_DATA_FILE, JSON.stringify(requests, null, 2), "utf-8")
      return true
    } catch (fallbackErr) {
      console.error("[ListingStorage] Critical: Failed to write to fallback storage:", fallbackErr)
      return false
    }
  }
}

export function getListingRequestById(id: string): ProductListingRequest | null {
  const cleanId = String(id || "").trim().toLowerCase()
  const all = readAllListingRequests()
  const found = all.find((r) => String(r.id || "").trim().toLowerCase() === cleanId)
  return found ? { ...found } : null
}

export function saveListingRequest(request: ProductListingRequest): ProductListingRequest {
  const all = readAllListingRequests()
  const cleanId = String(request.id || "").trim().toLowerCase()
  const existingIdx = all.findIndex((r) => String(r.id || "").trim().toLowerCase() === cleanId)

  const toSave: ProductListingRequest = {
    ...request,
    updatedAt: new Date(),
  }

  if (existingIdx >= 0) {
    all[existingIdx] = toSave
  } else {
    all.unshift(toSave)
  }

  writeAllListingRequests(all)
  return { ...toSave }
}

export function updateListingRequest(
  id: string,
  updates: Partial<ProductListingRequest>
): ProductListingRequest | null {
  const all = readAllListingRequests()
  const cleanId = String(id || "").trim().toLowerCase()
  const existingIdx = all.findIndex((r) => String(r.id || "").trim().toLowerCase() === cleanId)

  if (existingIdx === -1) {
    console.warn(`[ListingStorage] Update failed: request ID "${id}" not found`)
    return null
  }

  const updated: ProductListingRequest = {
    ...all[existingIdx],
    ...updates,
    updatedAt: new Date(),
  }

  all[existingIdx] = updated
  writeAllListingRequests(all)
  return { ...updated }
}

export function removeListingRequest(id: string): boolean {
  const all = readAllListingRequests()
  const cleanId = String(id || "").trim().toLowerCase()
  const filtered = all.filter((r) => String(r.id || "").trim().toLowerCase() !== cleanId)
  if (filtered.length !== all.length) {
    writeAllListingRequests(filtered)
    return true
  }
  return false
}
