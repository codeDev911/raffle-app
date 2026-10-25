import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const request = await prisma.productListingRequest.findUnique({
      where: { id },
    })

    if (!request) {
      return NextResponse.json(
        { success: false, error: "Listing request not found" },
        { status: 404 }
      )
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

    const existing = await prisma.productListingRequest.findUnique({
      where: { id },
    })

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

    const updated = await prisma.productListingRequest.update({
      where: { id },
      data: dataToUpdate,
    })

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
    await prisma.productListingRequest.delete({
      where: { id },
    })

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
