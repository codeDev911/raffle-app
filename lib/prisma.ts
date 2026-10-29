// Dual-mode Prisma client:
// Automatically uses real PostgreSQL database when DATABASE_URL is configured,
// and gracefully falls back to in-memory mock store if DATABASE_URL is not set.
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import {
  readAllListingRequests,
  saveListingRequest,
  updateListingRequest,
  removeListingRequest,
  getListingRequestById,
} from "./listing-storage"

export interface User {
  id: string
  email: string
  name: string
  phone?: string | null
  city?: string | null
  password: string
  role: "USER" | "ADMIN"
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Raffle {
  id: string
  title: string
  description: string
  longDescription?: string | null
  image?: string | null
  gallery: string[]
  price: number // in paisa
  realPrice: number // in paisa
  totalEntries: number
  currentEntries: number
  category: string
  featured: boolean
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED"
  startDate: Date
  endDate: Date
  specifications: string[]
  rules: string[]
  expenses?: any
  listingRequestId?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Entry {
  id: string
  userId: string
  raffleId: string
  quantity: number
  totalCost: number
  paymentId?: string | null
  createdAt: Date
}

export interface Payment {
  id: string
  userId: string
  amount: number
  currency: string
  method: "EASYPAISA" | "JAZZCASH" | "CARD" | "NAYAPAY" | "SAYAPAY" | "MEZAN"
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED"
  transactionId?: string | null
  gatewayRef?: string | null
  metadata?: any
  createdAt: Date
  updatedAt: Date
}

export interface Winner {
  id: string
  userId: string
  raffleId: string
  prizeValue: number
  testimonial?: string | null
  proofImage?: string | null
  verified: boolean
  featured: boolean
  drawnAt: Date
  deliveredAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface ProductListingRequest {
  id: string
  productType: string
  productName: string
  description: string
  phone: string
  email: string
  fullNameCnic: string
  cnicNumber?: string | null
  city?: string | null
  marketPrice: number // In PKR
  ticketPrice: number // In PKR
  totalTickets: number
  totalRevenue: number // ticketPrice * totalTickets
  platformFee: number // 8% fee
  sellerPayout: number // totalRevenue - platformFee
  condition?: string | null
  images: string[]
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED"
  adminNotes?: string | null
  secureToken?: string | null
  raffleId?: string | null
  createdAt: Date
  updatedAt: Date
}

const globalStores = globalThis as unknown as {
  productListingRequestsStore?: ProductListingRequest[]
  usersStore?: User[]
  rafflesStore?: Raffle[]
  entriesStore?: Entry[]
  paymentsStore?: Payment[]
  winnersStore?: Winner[]
}

// Seed data
const initialProductListingRequestsStore: ProductListingRequest[] = [
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

// Persistent store connected to disk storage
export const productListingRequestsStore: ProductListingRequest[] = new Proxy([] as ProductListingRequest[], {
  get(target, prop, receiver) {
    const list = readAllListingRequests()
    return Reflect.get(list, prop, receiver)
  },
  set(target, prop, value, receiver) {
    const list = readAllListingRequests()
    const success = Reflect.set(list, prop, value, receiver)
    return success
  },
})

const usersStore: User[] = [
  {
    id: "user-admin-1",
    email: "afnanahhad@gmail.com",
    name: "Admin Afnan",
    phone: "+92 300 0000000",
    city: "Lahore",
    password: "$2a$12$e0M2O7nBwL6m8.Y4XjS5CeP/8pB01.3J8t5B2sYyP79R.gM9uJ3pG",
    role: "ADMIN",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "user-demo-1",
    email: "pakraffle1@gmail.com",
    name: "Hamza Khan",
    phone: "+92 301 9876543",
    city: "Karachi",
    password: "$2a$12$e0M2O7nBwL6m8.Y4XjS5CeP/8pB01.3J8t5B2sYyP79R.gM9uJ3pG",
    role: "USER",
    isActive: true,
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-02-15"),
  },
  {
    id: "user-demo-2",
    email: "zain.iqbal@example.com",
    name: "Zain Iqbal",
    phone: "+92 321 4567890",
    city: "Islamabad",
    password: "$2a$12$e0M2O7nBwL6m8.Y4XjS5CeP/8pB01.3J8t5B2sYyP79R.gM9uJ3pG",
    role: "USER",
    isActive: true,
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date("2024-03-10"),
  },
  {
    id: "user-demo-3",
    email: "ahmed.hassan@example.com",
    name: "Ahmed Hassan",
    phone: "+92 300 1234567",
    city: "Karachi",
    password: "$2a$12$e0M2O7nBwL6m8.Y4XjS5CeP/8pB01.3J8t5B2sYyP79R.gM9uJ3pG",
    role: "USER",
    isActive: true,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },
  {
    id: "user-demo-4",
    email: "sara.khan@example.com",
    name: "Sara Khan",
    phone: "+92 333 7654321",
    city: "Lahore",
    password: "$2a$12$e0M2O7nBwL6m8.Y4XjS5CeP/8pB01.3J8t5B2sYyP79R.gM9uJ3pG",
    role: "USER",
    isActive: true,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
  },
  {
    id: "user-demo-5",
    email: "muhammad.ali@example.com",
    name: "Muhammad Ali",
    phone: "+92 345 8899776",
    city: "Rawalpindi",
    password: "$2a$12$e0M2O7nBwL6m8.Y4XjS5CeP/8pB01.3J8t5B2sYyP79R.gM9uJ3pG",
    role: "USER",
    isActive: true,
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date("2024-02-20"),
  },
]

const rafflesStore: Raffle[] = [
  {
    id: "raffle-1",
    title: "iPhone 16 Pro Max 256GB Desert Titanium",
    description: "Win the brand new iPhone 16 Pro Max with A18 Pro chip and 48MP camera fusion system.",
    longDescription: "The most powerful iPhone yet, featuring grade 5 titanium design, Camera Control, 4K 120 fps Dolby Vision, and the revolutionary A18 Pro chip. Delivered right to your doorstep anywhere in Pakistan.",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80",
    ],
    price: 35000, // 350 PKR in paisa
    realPrice: 42000000, // 420,000 PKR
    totalEntries: 2000,
    currentEntries: 1420,
    category: "Electronics",
    featured: true,
    status: "ACTIVE",
    startDate: new Date("2025-01-01"),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    specifications: [
      "256GB Storage",
      "Desert Titanium Finish",
      "6.9-inch Super Retina XDR OLED",
      "PTA Approved with Official Warranty",
    ],
    rules: [
      "Open to all Pakistani residents aged 18+",
      "Free nationwide shipping via tracked courier",
      "Live draw broadcasted on YouTube & Facebook",
    ],
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  },
  {
    id: "raffle-2",
    title: "Honda CG 125 Special Edition 2025",
    description: "Brand new Honda CG 125 Self Start with 5-speed transmission and modern Euro II engine.",
    longDescription: "The king of Pakistani roads! Win a 0-meter Honda CG 125 Special Edition with Euro II technology, self-start mechanism, and sporty styling.",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80",
    ],
    price: 45000, // 450 PKR in paisa
    realPrice: 28500000, // 285,000 PKR
    totalEntries: 1000,
    currentEntries: 812,
    category: "Vehicles",
    featured: true,
    status: "ACTIVE",
    startDate: new Date("2025-01-05"),
    endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    specifications: [
      "Self Start & 5-Speed",
      "Euro II Fuel Efficient Engine",
      "Brand New 2025 Model with full paperwork",
    ],
    rules: [
      "Winner must provide valid CNIC",
      "Registration assistance provided in all major cities",
    ],
    createdAt: new Date("2025-01-05"),
    updatedAt: new Date("2025-01-05"),
  },
  {
    id: "raffle-3",
    title: "Sony PlayStation 5 Slim 1TB + Extra Controller",
    description: "PS5 Disc Edition console bundle with Marvel's Spider-Man 2 and DualSense wireless controller.",
    longDescription: "Experience lightning-fast loading with an ultra-high-speed SSD, deeper immersion with haptic feedback, adaptive triggers and 3D Audio.",
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80",
    ],
    price: 25000, // 250 PKR
    realPrice: 17500000, // 175,000 PKR
    totalEntries: 1200,
    currentEntries: 954,
    category: "Gaming",
    featured: true,
    status: "ACTIVE",
    startDate: new Date("2025-01-10"),
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    specifications: [
      "PS5 Slim Disc Edition 1TB",
      "2x DualSense Wireless Controllers",
      "Spider-Man 2 Game Voucher Included",
    ],
    rules: ["100% genuine sealed box with 1-year warranty"],
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-10"),
  },
  {
    id: "raffle-4",
    title: "₨100,000 Cash Prize Instant Transfer",
    description: "Receive ₨100,000 cash straight into your JazzCash, EasyPaisa, or Pakistani Bank Account.",
    longDescription: "Direct cash grand prize transfer! Once drawn, the cash will be deposited into the winner's account within 60 minutes after verification.",
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80",
    ],
    price: 15000, // 150 PKR
    realPrice: 10000000, // 100,000 PKR
    totalEntries: 1000,
    currentEntries: 1000,
    category: "Cash",
    featured: false,
    status: "COMPLETED",
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-01-15"),
    specifications: [
      "₨100,000 Cash Prize",
      "Instant transfer to JazzCash / EasyPaisa / Bank",
    ],
    rules: ["Transfer completed within 1 hour of drawing"],
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-15"),
  },
]

const entriesStore: Entry[] = [
  {
    id: "entry-1",
    userId: "user-demo-1",
    raffleId: "raffle-1",
    quantity: 5,
    totalCost: 175000,
    paymentId: "pay-1",
    createdAt: new Date("2025-01-02"),
  },
  {
    id: "entry-2",
    userId: "user-demo-1",
    raffleId: "raffle-2",
    quantity: 2,
    totalCost: 90000,
    paymentId: "pay-2",
    createdAt: new Date("2025-01-06"),
  },
  {
    id: "entry-3",
    userId: "user-demo-2",
    raffleId: "raffle-4",
    quantity: 10,
    totalCost: 150000,
    paymentId: "pay-3",
    createdAt: new Date("2025-01-04"),
  },
]

const paymentsStore: Payment[] = [
  {
    id: "pay-1",
    userId: "user-demo-1",
    amount: 175000,
    currency: "PKR",
    method: "EASYPAISA",
    status: "COMPLETED",
    transactionId: "TXN-984729104",
    gatewayRef: "EP-984729104",
    metadata: {
      raffleId: "raffle-1",
      quantity: 5,
      raffleName: "iPhone 16 Pro Max 256GB Desert Titanium",
    },
    createdAt: new Date("2025-01-02"),
    updatedAt: new Date("2025-01-02"),
  },
  {
    id: "pay-2",
    userId: "user-demo-1",
    amount: 90000,
    currency: "PKR",
    method: "NAYAPAY",
    status: "COMPLETED",
    transactionId: "TXN-112349812",
    gatewayRef: "NP-112349812",
    metadata: {
      raffleId: "raffle-2",
      quantity: 2,
      raffleName: "Honda CG 125 Special Edition 2025",
    },
    createdAt: new Date("2025-01-06"),
    updatedAt: new Date("2025-01-06"),
  },
  {
    id: "pay-3",
    userId: "user-demo-2",
    amount: 150000,
    currency: "PKR",
    method: "JAZZCASH",
    status: "COMPLETED",
    transactionId: "TXN-664829100",
    gatewayRef: "JC-664829100",
    metadata: {
      raffleId: "raffle-4",
      quantity: 10,
      raffleName: "₨100,000 Cash Prize Instant Transfer",
    },
    createdAt: new Date("2025-01-04"),
    updatedAt: new Date("2025-01-04"),
  },
]

const winnersStore: Winner[] = [
  {
    id: "winner-1",
    userId: "user-demo-3",
    raffleId: "raffle-1",
    prizeValue: 42000000,
    testimonial: "Alhamdulillah! I won the iPhone 16 Pro Max with just 5 tickets! It arrived within 48 hours sealed packed with official PTA approval. 100% genuine platform!",
    proofImage: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
    verified: true,
    featured: true,
    drawnAt: new Date("2025-01-18"),
    deliveredAt: new Date("2025-01-20"),
    createdAt: new Date("2025-01-18"),
    updatedAt: new Date("2025-01-20"),
  },
  {
    id: "winner-2",
    userId: "user-demo-5",
    raffleId: "raffle-2",
    prizeValue: 28500000,
    testimonial: "My dream bike is finally home! PakRaffle team called me on WhatsApp video call right during the live draw. Received my Honda 125 with all genuine documents.",
    proofImage: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80",
    verified: true,
    featured: true,
    drawnAt: new Date("2025-01-16"),
    deliveredAt: new Date("2025-01-19"),
    createdAt: new Date("2025-01-16"),
    updatedAt: new Date("2025-01-19"),
  },
  {
    id: "winner-3",
    userId: "user-demo-4",
    raffleId: "raffle-3",
    prizeValue: 17500000,
    testimonial: "PS5 Slim disc edition arrived safe and sound in Lahore! Everything was transparent and fair. Big thanks to the PakRaffle support team on WhatsApp!",
    proofImage: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80",
    verified: true,
    featured: true,
    drawnAt: new Date("2025-01-14"),
    deliveredAt: new Date("2025-01-16"),
    createdAt: new Date("2025-01-14"),
    updatedAt: new Date("2025-01-16"),
  },
  {
    id: "winner-4",
    userId: "user-demo-2",
    raffleId: "raffle-4",
    prizeValue: 10000000,
    testimonial: "I couldn't believe it when I got the notification! PakRaffle transferred the ₨100,000 cash within 15 minutes straight to my JazzCash.",
    proofImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80",
    verified: true,
    featured: true,
    drawnAt: new Date("2025-01-15"),
    deliveredAt: new Date("2025-01-15"),
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-01-15"),
  },
]

function matchesWhere(item: any, where?: any): boolean {
  if (!where) return true
  for (const [key, value] of Object.entries(where)) {
    if (key === "OR" && Array.isArray(value)) {
      const orMatched = value.some((subWhere) => matchesWhere(item, subWhere))
      if (!orMatched) return false
      continue
    }
    if (key === "AND" && Array.isArray(value)) {
      const andMatched = value.every((subWhere) => matchesWhere(item, subWhere))
      if (!andMatched) return false
      continue
    }
    if (key === "NOT") {
      if (matchesWhere(item, value)) return false
      continue
    }

    const itemVal = item[key]

    if (value !== null && typeof value === "object" && !(value instanceof Date)) {
      if ("contains" in value) {
        const itemStr = String(itemVal || "").toLowerCase()
        const targetStr = String(value.contains).toLowerCase()
        if (!itemStr.includes(targetStr)) return false
        continue
      }
      if ("equals" in value) {
        if (itemVal !== value.equals) return false
        continue
      }
      if ("in" in value && Array.isArray(value.in)) {
        if (!value.in.includes(itemVal)) return false
        continue
      }
      if ("notIn" in value && Array.isArray(value.notIn)) {
        if (value.notIn.includes(itemVal)) return false
        continue
      }
      if ("gte" in value) {
        if (itemVal < value.gte) return false
        continue
      }
      if ("lte" in value) {
        if (itemVal > value.lte) return false
        continue
      }
      if ("gt" in value) {
        if (itemVal <= value.gt) return false
        continue
      }
      if ("lt" in value) {
        if (itemVal >= value.lt) return false
        continue
      }
    }

    if (itemVal !== value) return false
  }
  return true
}

function resolveUserRelations(user: User, include?: any, select?: any) {
  const result: any = { ...user }

  if (include?.entries) {
    const userEntries = entriesStore.filter((e) => e.userId === user.id)
    result.entries = userEntries.map((e) => resolveEntryRelations(e, include.entries.include, include.entries.select))
  }
  if (include?.payments) {
    result.payments = paymentsStore.filter((p) => p.userId === user.id)
  }
  if (include?.winners) {
    const userWinners = winnersStore.filter((w) => w.userId === user.id)
    result.winners = userWinners.map((w) => resolveWinnerRelations(w, include.winners.include, include.winners.select))
  }
  if (include?._count || select?._count) {
    result._count = {
      entries: entriesStore.filter((e) => e.userId === user.id).length,
      payments: paymentsStore.filter((p) => p.userId === user.id).length,
      winners: winnersStore.filter((w) => w.userId === user.id).length,
    }
  }

  if (select) {
    const filtered: any = {}
    for (const key of Object.keys(select)) {
      if (select[key]) filtered[key] = result[key]
    }
    return filtered
  }
  return result
}

function resolveRaffleRelations(raffle: Raffle, include?: any, select?: any) {
  const result: any = { ...raffle }

  if (include?.entries) {
    const raffleEntries = entriesStore.filter((e) => e.raffleId === raffle.id)
    result.entries = raffleEntries.map((e) => resolveEntryRelations(e, include.entries.include, include.entries.select))
  }
  if (include?.winners) {
    const raffleWinners = winnersStore.filter((w) => w.raffleId === raffle.id)
    result.winners = raffleWinners.map((w) => resolveWinnerRelations(w, include.winners.include, include.winners.select))
  }
  if (include?._count || select?._count) {
    result._count = {
      entries: entriesStore.filter((e) => e.raffleId === raffle.id).length,
      winners: winnersStore.filter((w) => w.raffleId === raffle.id).length,
    }
  }

  if (select) {
    const filtered: any = {}
    for (const key of Object.keys(select)) {
      if (select[key]) filtered[key] = result[key]
    }
    return filtered
  }
  return result
}

function resolveEntryRelations(entry: Entry, include?: any, select?: any) {
  const result: any = { ...entry }

  if (include?.user) {
    const user = usersStore.find((u) => u.id === entry.userId)
    result.user = user ? resolveUserRelations(user, undefined, include.user.select) : null
  }
  if (include?.raffle) {
    const raffle = rafflesStore.find((r) => r.id === entry.raffleId)
    result.raffle = raffle ? resolveRaffleRelations(raffle, undefined, include.raffle.select) : null
  }
  if (include?.payment) {
    const payment = paymentsStore.find((p) => p.id === entry.paymentId)
    result.payment = payment || null
  }

  if (select) {
    const filtered: any = {}
    for (const key of Object.keys(select)) {
      if (select[key]) filtered[key] = result[key]
    }
    return filtered
  }
  return result
}

function resolvePaymentRelations(payment: Payment, include?: any, select?: any) {
  const result: any = { ...payment }

  if (include?.user) {
    const user = usersStore.find((u) => u.id === payment.userId)
    result.user = user ? resolveUserRelations(user, undefined, include.user.select) : null
  }
  if (include?.entries) {
    const payEntries = entriesStore.filter((e) => e.paymentId === payment.id)
    result.entries = payEntries.map((e) => resolveEntryRelations(e, include.entries.include, include.entries.select))
  }

  if (select) {
    const filtered: any = {}
    for (const key of Object.keys(select)) {
      if (select[key]) filtered[key] = result[key]
    }
    return filtered
  }
  return result
}

function resolveWinnerRelations(winner: Winner, include?: any, select?: any) {
  const result: any = { ...winner }

  if (include?.user) {
    const user = usersStore.find((u) => u.id === winner.userId)
    result.user = user ? resolveUserRelations(user, undefined, include.user.select) : null
  }
  if (include?.raffle) {
    const raffle = rafflesStore.find((r) => r.id === winner.raffleId)
    result.raffle = raffle ? resolveRaffleRelations(raffle, undefined, include.raffle.select) : null
  }

  if (select) {
    const filtered: any = {}
    for (const key of Object.keys(select)) {
      if (select[key]) filtered[key] = result[key]
    }
    return filtered
  }
  return result
}

export const mockPrisma = {
  user: {
    findUnique: async (args: { where: any; include?: any; select?: any }) => {
      const user = usersStore.find((u) => matchesWhere(u, args.where))
      return user ? resolveUserRelations(user, args.include, args.select) : null
    },
    findFirst: async (args: { where?: any; include?: any; select?: any }) => {
      const user = usersStore.find((u) => matchesWhere(u, args?.where))
      return user ? resolveUserRelations(user, args?.include, args?.select) : null
    },
    findMany: async (args?: { where?: any; include?: any; select?: any; take?: number; orderBy?: any }) => {
      let items = usersStore.filter((u) => matchesWhere(u, args?.where))
      if (args?.take) items = items.slice(0, args.take)
      return items.map((u) => resolveUserRelations(u, args?.include, args?.select))
    },
    count: async (args?: { where?: any }) => {
      return usersStore.filter((u) => matchesWhere(u, args?.where)).length
    },
    create: async (args: { data: any; select?: any }) => {
      const newUser: User = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        role: args.data.role || "USER",
        ...args.data,
      }
      usersStore.push(newUser)
      return resolveUserRelations(newUser, undefined, args.select)
    },
    update: async (args: { where: any; data: any; select?: any }) => {
      const idx = usersStore.findIndex((u) => matchesWhere(u, args.where))
      if (idx !== -1) {
        usersStore[idx] = { ...usersStore[idx], ...args.data, updatedAt: new Date() }
        return resolveUserRelations(usersStore[idx], undefined, args.select)
      }
      return null
    },
  },

  raffle: {
    findUnique: async (args: { where: any; include?: any; select?: any }) => {
      const raffle = rafflesStore.find((r) => matchesWhere(r, args.where))
      return raffle ? resolveRaffleRelations(raffle, args.include, args.select) : null
    },
    findFirst: async (args: { where?: any; include?: any; select?: any }) => {
      const raffle = rafflesStore.find((r) => matchesWhere(r, args?.where))
      return raffle ? resolveRaffleRelations(raffle, args?.include, args?.select) : null
    },
    findMany: async (args?: { where?: any; include?: any; select?: any; take?: number; orderBy?: any }) => {
      let items = rafflesStore.filter((r) => matchesWhere(r, args?.where))
      if (args?.take) items = items.slice(0, args.take)
      return items.map((r) => resolveRaffleRelations(r, args?.include, args?.select))
    },
    count: async (args?: { where?: any }) => {
      return rafflesStore.filter((r) => matchesWhere(r, args?.where)).length
    },
    create: async (args: { data: any; select?: any }) => {
      const newRaffle: Raffle = {
        id: `raffle-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        currentEntries: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: args.data.status || "ACTIVE",
        featured: args.data.featured || false,
        gallery: args.data.gallery || [],
        specifications: args.data.specifications || [],
        rules: args.data.rules || [],
        startDate: args.data.startDate ? new Date(args.data.startDate) : new Date(),
        endDate: new Date(args.data.endDate),
        ...args.data,
      }
      rafflesStore.push(newRaffle)
      return resolveRaffleRelations(newRaffle, undefined, args.select)
    },
    update: async (args: { where: any; data: any; select?: any }) => {
      const idx = rafflesStore.findIndex((r) => matchesWhere(r, args.where))
      if (idx !== -1) {
        rafflesStore[idx] = { ...rafflesStore[idx], ...args.data, updatedAt: new Date() }
        return resolveRaffleRelations(rafflesStore[idx], undefined, args.select)
      }
      return null
    },
    delete: async (args: { where: any }) => {
      const idx = rafflesStore.findIndex((r) => matchesWhere(r, args.where))
      if (idx !== -1) {
        const deleted = rafflesStore.splice(idx, 1)[0]
        return deleted
      }
      return null
    },
    groupBy: async (args: { by: string[]; where?: any }) => {
      const filtered = rafflesStore.filter((r) => matchesWhere(r, args.where))
      const map = new Map<string, any>()
      for (const item of filtered) {
        const key = args.by.map((field) => (item as any)[field]).join("::")
        if (!map.has(key)) {
          const entry: any = {}
          for (const field of args.by) {
            entry[field] = (item as any)[field]
          }
          map.set(key, entry)
        }
      }
      return Array.from(map.values())
    },
  },

  entry: {
    findUnique: async (args: { where: any; include?: any; select?: any }) => {
      const entry = entriesStore.find((e) => matchesWhere(e, args.where))
      return entry ? resolveEntryRelations(entry, args.include, args.select) : null
    },
    findMany: async (args?: { where?: any; include?: any; select?: any; take?: number; orderBy?: any }) => {
      let items = entriesStore.filter((e) => matchesWhere(e, args?.where))
      if (args?.take) items = items.slice(0, args.take)
      return items.map((e) => resolveEntryRelations(e, args?.include, args?.select))
    },
    count: async (args?: { where?: any }) => {
      return entriesStore.filter((e) => matchesWhere(e, args?.where)).length
    },
    create: async (args: { data: any; select?: any }) => {
      const newEntry: Entry = {
        id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        createdAt: new Date(),
        quantity: 1,
        totalCost: 0,
        ...args.data,
      }
      entriesStore.push(newEntry)

      // Update currentEntries on raffle
      const raffle = rafflesStore.find((r) => r.id === newEntry.raffleId)
      if (raffle) {
        raffle.currentEntries = (raffle.currentEntries || 0) + (newEntry.quantity || 1)
      }

      return resolveEntryRelations(newEntry, undefined, args.select)
    },
  },

  payment: {
    findUnique: async (args: { where: any; include?: any; select?: any }) => {
      const payment = paymentsStore.find((p) => matchesWhere(p, args.where))
      return payment ? resolvePaymentRelations(payment, args.include, args.select) : null
    },
    findFirst: async (args: { where?: any; include?: any; select?: any }) => {
      const payment = paymentsStore.find((p) => matchesWhere(p, args?.where))
      return payment ? resolvePaymentRelations(payment, args?.include, args?.select) : null
    },
    findMany: async (args?: { where?: any; include?: any; select?: any; take?: number; orderBy?: any }) => {
      let items = paymentsStore.filter((p) => matchesWhere(p, args?.where))
      if (args?.take) items = items.slice(0, args.take)
      return items.map((p) => resolvePaymentRelations(p, args?.include, args?.select))
    },
    count: async (args?: { where?: any }) => {
      return paymentsStore.filter((p) => matchesWhere(p, args?.where)).length
    },
    create: async (args: { data: any; select?: any }) => {
      const newPayment: Payment = {
        id: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        currency: "PKR",
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
        ...args.data,
      }
      paymentsStore.push(newPayment)
      return resolvePaymentRelations(newPayment, undefined, args.select)
    },
    update: async (args: { where: any; data: any; select?: any }) => {
      const idx = paymentsStore.findIndex((p) => matchesWhere(p, args.where))
      if (idx !== -1) {
        paymentsStore[idx] = { ...paymentsStore[idx], ...args.data, updatedAt: new Date() }
        return resolvePaymentRelations(paymentsStore[idx], undefined, args.select)
      }
      return null
    },
    aggregate: async (args?: { where?: any; _sum?: any }) => {
      const filtered = paymentsStore.filter((p) => matchesWhere(p, args?.where))
      let totalAmount = 0
      for (const p of filtered) {
        totalAmount += p.amount || 0
      }
      return {
        _sum: {
          amount: totalAmount,
        },
        _count: filtered.length,
      }
    },
  },

  winner: {
    findUnique: async (args: { where: any; include?: any; select?: any }) => {
      const winner = winnersStore.find((w) => matchesWhere(w, args.where))
      return winner ? resolveWinnerRelations(winner, args.include, args.select) : null
    },
    findFirst: async (args: { where?: any; include?: any; select?: any }) => {
      const winner = winnersStore.find((w) => matchesWhere(w, args?.where))
      return winner ? resolveWinnerRelations(winner, args?.include, args?.select) : null
    },
    findMany: async (args?: { where?: any; include?: any; select?: any; take?: number; orderBy?: any }) => {
      let items = winnersStore.filter((w) => matchesWhere(w, args?.where))
      if (args?.take) items = items.slice(0, args.take)
      return items.map((w) => resolveWinnerRelations(w, args?.include, args?.select))
    },
    count: async (args?: { where?: any }) => {
      return winnersStore.filter((w) => matchesWhere(w, args?.where)).length
    },
    create: async (args: { data: any; include?: any; select?: any }) => {
      const newWinner: Winner = {
        id: `winner-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        verified: true,
        featured: false,
        drawnAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...args.data,
      }
      winnersStore.push(newWinner)
      return resolveWinnerRelations(newWinner, args.include, args.select)
    },
    aggregate: async (args?: { where?: any; _sum?: any }) => {
      const filtered = winnersStore.filter((w) => matchesWhere(w, args?.where))
      let totalPrize = 0
      for (const w of filtered) {
        totalPrize += w.prizeValue || 0
      }
      return {
        _sum: {
          prizeValue: totalPrize,
        },
        _count: filtered.length,
      }
    },
  },

  productListingRequest: {
    findUnique: async (args: { where: any; select?: any }) => {
      if (args?.where?.id) {
        const direct = getListingRequestById(args.where.id)
        if (direct && matchesWhere(direct, args.where)) {
          return { ...direct }
        }
      }
      const all = readAllListingRequests()
      const req = all.find((r) => matchesWhere(r, args.where))
      return req ? { ...req } : null
    },
    findFirst: async (args: { where?: any; select?: any }) => {
      const all = readAllListingRequests()
      const req = all.find((r) => matchesWhere(r, args?.where))
      return req ? { ...req } : null
    },
    findMany: async (args?: { where?: any; select?: any; take?: number; orderBy?: any }) => {
      const all = readAllListingRequests()
      let items = all.filter((r) => matchesWhere(r, args?.where))
      if (args?.orderBy) {
        if (args.orderBy.createdAt === "desc") {
          items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        } else if (args.orderBy.createdAt === "asc") {
          items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        }
      }
      if (args?.take) items = items.slice(0, args.take)
      return items.map((r) => ({ ...r }))
    },
    count: async (args?: { where?: any }) => {
      const all = readAllListingRequests()
      return all.filter((r) => matchesWhere(r, args?.where)).length
    },
    create: async (args: { data: any; select?: any }) => {
      const newReq: ProductListingRequest = {
        id: args.data.id || `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        status: args.data.status || "PENDING",
        images: args.data.images || [],
        createdAt: args.data.createdAt ? new Date(args.data.createdAt) : new Date(),
        updatedAt: new Date(),
        ...args.data,
      }
      saveListingRequest(newReq)
      return { ...newReq }
    },
    update: async (args: { where: any; data: any; select?: any }) => {
      if (args?.where?.id) {
        const updated = updateListingRequest(args.where.id, args.data)
        if (updated) return { ...updated }
      }
      const all = readAllListingRequests()
      const target = all.find((r) => matchesWhere(r, args.where))
      if (target) {
        const updated = updateListingRequest(target.id, args.data)
        return updated ? { ...updated } : null
      }
      return null
    },
    delete: async (args: { where: any }) => {
      if (args?.where?.id) {
        const target = getListingRequestById(args.where.id)
        if (target) {
          removeListingRequest(target.id)
          return { ...target }
        }
      }
      const all = readAllListingRequests()
      const target = all.find((r) => matchesWhere(r, args.where))
      if (target) {
        removeListingRequest(target.id)
        return { ...target }
      }
      return null
    },
    aggregate: async (args?: { where?: any; _sum?: any }) => {
      const all = readAllListingRequests()
      const filtered = all.filter((r) => matchesWhere(r, args?.where))
      let totalMarket = 0
      let totalRev = 0
      let totalFee = 0
      for (const r of filtered) {
        totalMarket += r.marketPrice || 0
        totalRev += r.totalRevenue || 0
        totalFee += r.platformFee || 0
      }
      return {
        _sum: {
          marketPrice: totalMarket,
          totalRevenue: totalRev,
          platformFee: totalFee,
        },
        _count: filtered.length,
      }
    },
  },

  $transaction: async (arg: any) => {
    if (typeof arg === "function") {
      return await arg(prisma)
    }
    if (Array.isArray(arg)) {
      return await Promise.all(arg)
    }
    return arg
  },
}

// Global singleton for Next.js hot reload / serverless connection reuse
const globalForPrisma = globalThis as unknown as {
  prismaClientInstance?: PrismaClient
}

export function isUsingRealDatabase(): boolean {
  const dbUrl = process.env.DATABASE_URL
  return Boolean(
    dbUrl &&
    !dbUrl.includes("localhost") &&
    !dbUrl.includes("user:password") &&
    !dbUrl.includes("placeholder")
  )
}

function getRealPrismaClient(): PrismaClient | null {
  if (!isUsingRealDatabase()) {
    return null
  }
  try {
    if (!globalForPrisma.prismaClientInstance) {
      const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
      globalForPrisma.prismaClientInstance = new PrismaClient({ adapter })
    }
    return globalForPrisma.prismaClientInstance
  } catch (err) {
    console.warn("[Prisma] Failed to initialize real client, falling back to in-memory store:", err)
    return null
  }
}

export const prisma: any = new Proxy(mockPrisma, {
  get(target, prop, receiver) {
    const realClient = getRealPrismaClient()
    if (realClient && prop in realClient) {
      const val = (realClient as any)[prop]
      if (typeof val === "function") {
        return val.bind(realClient)
      }
      return val
    }
    return Reflect.get(target, prop, receiver)
  },
})
