import fs from "fs"
import path from "path"
import { ProductListingRequest } from "./prisma"

const PRIMARY_DATA_DIR = path.join(process.cwd(), "data")
const PRIMARY_DATA_FILE = path.join(PRIMARY_DATA_DIR, "listing-requests.json")
const FALLBACK_DATA_FILE = path.join("/tmp", "pakraffle-listing-requests.json")

// Initial seed data including existing demo requests and restored user submission
export const initialListingRequests: ProductListingRequest[] = [
  {
    id: "req-1793003835516-456w",
    productType: "Electronics",
    productName: "Apple iPhone 15 Pro Max 256GB Natural Titanium (PTA Approved)",
    description: "Brand new sealed condition, PTA approved with official invoice and Mercantile 1-year warranty. Dual physical SIM + eSIM support with all original accessories included.",
    phone: "+92 300 8765432",
    email: "applicant@pakraffle.pk",
    fullNameCnic: "Verified Applicant (PakRaffle Partner)",
    cnicNumber: "35201-8765432-1",
    city: "Lahore",
    marketPrice: 350000,
    ticketPrice: 1269,
    totalTickets: 300,
    totalRevenue: 380700,
    platformFee: 30456, // 8% fee
    sellerPayout: 350244,
    condition: "Brand New (Sealed)",
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
    ],
    status: "PENDING",
    adminNotes: "Application received and registered in PakRaffle verification queue. Awaiting physical item verification at Lahore hub.",
    secureToken: "tok_secure_1793003835516_456w",
    createdAt: new Date(1793003835516 > Date.now() ? Date.now() - 3600 * 1000 : 1793003835516),
    updatedAt: new Date(1793003835516 > Date.now() ? Date.now() - 3600 * 1000 : 1793003835516),
  },
  {
    id: "req-101",
    productType: "Electronics",
    productName: "Apple iPhone 16 Pro 256GB Natural Titanium (PTA Approved)",
    description: "Brand new sealed box iPhone 16 Pro with 1-year official Apple and Mercantile warranty. PTA approved with physical SIM + eSIM. Receipt from official reseller available.",
    phone: "+92 300 1234567",
    email: "usman.nadeem@gmail.com",
    fullNameCnic: "Muhammad Usman Nadeem",
    cnicNumber: "35201-1234567-1",
    city: "Lahore",
    marketPrice: 380000,
    ticketPrice: 500,
    totalTickets: 826,
    totalRevenue: 413000,
    platformFee: 33040, // 8%
    sellerPayout: 379960,
    condition: "Brand New (Sealed)",
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
    ],
    status: "PENDING",
    adminNotes: "Customer submitted official purchase receipt. Needs physical verification at Lahore hub.",
    secureToken: "tok_demo_iphone16_a94b81c2d3",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000),
  },
  {
    id: "req-102",
    productType: "Vehicles",
    productName: "Honda CB 150F Red 2024 (Zero Meter)",
    description: "Brand new Honda CB 150F Self Start Euro II. Fresh showroom delivery with invoice ready to register in buyer's name. Zero kilometers driven, with 2 factory keys and warranty book.",
    phone: "+92 321 5556677",
    email: "tariq.mehmood@outlook.com",
    fullNameCnic: "Tariq Mehmood Gondal",
    cnicNumber: "61101-7654321-3",
    city: "Islamabad",
    marketPrice: 495000,
    ticketPrice: 1000,
    totalTickets: 538,
    totalRevenue: 538000,
    platformFee: 43040, // 8%
    sellerPayout: 494960,
    condition: "Brand New (Zero Meter)",
    images: [
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80",
    ],
    status: "UNDER_REVIEW",
    adminNotes: "Invoice verified with authorized Honda dealership in I-9 Islamabad. Scheduling physical inspection.",
    secureToken: "tok_demo_hondacb_f47e2311b9",
    createdAt: new Date(Date.now() - 14 * 3600 * 1000),
    updatedAt: new Date(Date.now() - 5 * 3600 * 1000),
  },
  {
    id: "req-103",
    productType: "Gaming",
    productName: "Sony PlayStation 5 Pro 2TB Digital Edition + DualSense Edge",
    description: "Imported US edition PS5 Pro console with enhanced ray tracing and AI upscaling. Includes DualSense Edge pro controller and sealed Spiderman 2.",
    phone: "+92 333 4445566",
    email: "bilal.ahmed99@yahoo.com",
    fullNameCnic: "Bilal Ahmed Khan",
    cnicNumber: "42101-9988776-5",
    city: "Karachi",
    marketPrice: 260000,
    ticketPrice: 400,
    totalTickets: 706,
    totalRevenue: 282400,
    platformFee: 22592, // 8%
    sellerPayout: 259808,
    condition: "Open Box - Like New",
    images: [
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80",
    ],
    status: "APPROVED",
    adminNotes: "Approved by Admin. Ready to prepare raffle entry draft and schedule launch.",
    secureToken: "tok_demo_ps5pro_8c12903b41",
    createdAt: new Date(Date.now() - 28 * 3600 * 1000),
    updatedAt: new Date(Date.now() - 4 * 3600 * 1000),
  },
  {
    id: "req-104",
    productType: "Electronics",
    productName: "Apple MacBook Air 15\" M3 Chip 16GB / 512GB Midnight",
    description: "MacBook Air 15-inch M3, 16GB Unified Memory, 512GB SSD. Midnight color, brand new sealed box with AppleCare eligible.",
    phone: "+92 345 6677889",
    email: "ayesha.siddiqui@gmail.com",
    fullNameCnic: "Ayesha Noor Siddiqui",
    cnicNumber: "35202-3344556-2",
    city: "Rawalpindi",
    marketPrice: 340000,
    ticketPrice: 500,
    totalTickets: 739,
    totalRevenue: 369500,
    platformFee: 29560, // 8%
    sellerPayout: 339940,
    condition: "Brand New (Sealed)",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
    ],
    status: "PENDING",
    adminNotes: "Awaiting CNIC scan upload from user.",
    secureToken: "tok_demo_macbook_e18239021a",
    createdAt: new Date(Date.now() - 48 * 3600 * 1000),
    updatedAt: new Date(Date.now() - 48 * 3600 * 1000),
  },
]

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
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryCache = parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        }))
        return memoryCache
      }
    }
  } catch (err) {
    console.warn("[ListingStorage] Failed to read from file, using initial data:", err)
  }

  // If file doesn't exist or failed to parse, populate with initial data
  memoryCache = [...initialListingRequests]
  writeAllListingRequests(memoryCache)
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

