import { type NextRequest, NextResponse } from "next/server"
import { cloudinary } from "@/lib/cloudinary"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const folder = (formData.get("folder") as string) || "raffles"
    
    // Support both single "file" and multiple "files" / "images"
    const files: File[] = []
    const singleFile = formData.get("file") as File | null
    if (singleFile && singleFile instanceof File) {
      files.push(singleFile)
    }

    const multiFiles = formData.getAll("files") as File[]
    for (const f of multiFiles) {
      if (f instanceof File && !files.includes(f)) {
        files.push(f)
      }
    }

    const multiImages = formData.getAll("images") as File[]
    for (const f of multiImages) {
      if (f instanceof File && !files.includes(f)) {
        files.push(f)
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No image files provided for upload" },
        { status: 400 }
      )
    }

    // Upload files to Cloudinary in parallel
    const uploadPromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const sanitizedName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9-_]/g, "_")
        .substring(0, 40)
      const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
      const publicId = `${folder}/${sanitizedName}-${uniqueSuffix}`

      return new Promise<{
        url: string
        secure_url: string
        publicId: string
        format?: string
        width?: number
        height?: number
        originalName: string
        size: number
      }>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "image",
              public_id: publicId,
              folder: folder,
              overwrite: false,
              transformation: [
                { quality: "auto" },
                { format: "auto" },
              ],
              tags: ["raffle", folder],
            },
            (error, result) => {
              if (error || !result) {
                console.error("Cloudinary upload stream error:", error)
                reject(error || new Error("Cloudinary upload failed"))
              } else {
                resolve({
                  url: result.secure_url,
                  secure_url: result.secure_url,
                  publicId: result.public_id,
                  format: result.format,
                  width: result.width,
                  height: result.height,
                  originalName: file.name,
                  size: file.size,
                })
              }
            }
          )
          .end(buffer)
      })
    })

    const results = await Promise.all(uploadPromises)

    return NextResponse.json({
      success: true,
      count: results.length,
      images: results,
      // Convenience shortcuts
      urls: results.map((r) => r.secure_url),
      url: results[0]?.secure_url,
      publicId: results[0]?.publicId,
    })
  } catch (error: any) {
    console.error("Cloudinary upload API error:", error)
    return NextResponse.json(
      {
        error: error?.message || "Failed to upload image(s) to Cloudinary",
      },
      { status: 500 }
    )
  }
}
