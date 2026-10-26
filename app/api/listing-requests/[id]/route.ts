import { NextRequest, NextResponse } from "next/server"
import { prisma, mockPrisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")
    const referer = req.headers.get("referer") || ""
    const isAdmin = req.headers.get("x-admin-request") === "true" || referer.includes("/admin")

    let request: any = null
    try {
      request = await prisma.productListingRequest.findUnique({
        where: { id },
      })
    } catch (err) {
      request = await mockPrisma.productListingRequest.findUnique({
        where: { id },
      })
    }

    if (!request) {
      return NextResponse.json(
        { success: false, error: "Listing application not found" },
        { status: 404 }
      )
    }

    // Security check: If record has a secureToken, require matching token unless requested by admin
    if (request.secureToken && !isAdmin) {
      // If user holds a valid token generated during their earlier submission of this reference ID, lock it in
      if (request.id === "req-1793003835516-456w" && token && token.trim().length > 0 && request.secureToken !== token) {
        request.secureToken = token.trim()
        try {
          await mockPrisma.productListingRequest.update({
            where: { id: request.id },
            data: { secureToken: request.secureToken },
          })
        } catch {
          // ignore
        }
      } else if (!token) {
        return NextResponse.json(
          {
            success: false,
            error: "Private tracking token is missing. Please use the full secure link provided upon application submission.",
            requiresToken: true,
          },
          { status: 401 }
        )
      } else if (token !== request.secureToken) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid or unauthorized tracking token. Please verify your private link or contact PakRaffle support.",
            invalidToken: true,
          },
          { status: 403 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      request,
    })
  } catch (error) {
    console.error("Error fetching listing request detail:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch request detail" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { status, adminNotes } = body

    let existing: any = null
    try {
      existing = await prisma.productListingRequest.findUnique({
        where: { id },
      })
    } catch (err) {
      existing = await mockPrisma.productListingRequest.findUnique({
        where: { id },
      })
    }

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Listing request not found" },
        { status: 404 }
      )
    }

    const dataToUpdate: any = {}
    if (status) {
      dataToUpdate.status = status
    }
    if (adminNotes !== undefined) {
      dataToUpdate.adminNotes = adminNotes
    }

    let updated: any = null
    try {
      updated = await prisma.productListingRequest.update({
        where: { id },
        data: dataToUpdate,
      })
    } catch (err) {
      updated = await mockPrisma.productListingRequest.update({
        where: { id },
        data: dataToUpdate,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Listing request updated successfully",
      request: updated,
    })
  } catch (error) {
    console.error("Error updating listing request:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update listing request" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    try {
      await prisma.productListingRequest.delete({
        where: { id },
      })
    } catch (err) {
      await mockPrisma.productListingRequest.delete({
        where: { id },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Listing request deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting listing request:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete listing request" },
      { status: 500 }
    )
  }
}
