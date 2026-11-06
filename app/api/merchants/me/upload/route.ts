import { type NextRequest } from "next/server"
import { requireMerchant } from "@/lib/merchants/session"
import { fail, handleRouteError, ok } from "@/lib/merchants/http"
import { enforceRateLimit } from "@/lib/merchants/rate-limit"
import { MerchantError } from "@/lib/merchants/errors"
import { cloudinary } from "@/lib/cloudinary"

export const dynamic = "force-dynamic"

const ACCEPTED = ["image/jpeg", "image/pjpeg", "image/png", "image/webp", "image/avif"]
const MAX_BYTES = 8 * 1024 * 1024
/** Long edge we are willing to serve; a 12 MB phone photo is resized, never rejected. */
const MAX_EDGE = 2000

/** Only two slots exist, so the folder name can be a whitelist instead of user input. */
function slotOf(value: FormDataEntryValue | null): "banner" | "popup" {
  return String(value || "").trim().toLowerCase() === "popup" ? "popup" : "banner"
}

function upload(storeId: string, slot: "banner" | "popup", bytes: Buffer, name: string) {
  const safeName = name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 40)
  const publicId = `merchant-creative/${storeId}/${slot}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}${safeName ? `-${safeName}` : ""}`

  return new Promise<{ url: string; publicId: string; width: number; height: number; format: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "image",
          public_id: publicId,
          folder: `merchant-creative/${storeId}`,
          overwrite: false,
          transformation: [
            // Crop "limit" only ever shrinks, and the widget's cards are small: no shopper should
            // download a 4000-pixel original to render a 342px banner.
            { width: MAX_EDGE, height: MAX_EDGE, crop: "limit" },
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
          tags: ["pakraffle", "merchant-creative", `slot-${slot}`],
        },
        (error, result) => {
          if (error || !result) return reject(error || new Error("Cloudinary upload failed"))
          resolve({
            url: result.secure_url,
            publicId: String(result.public_id),
            width: Number(result.width) || 0,
            height: Number(result.height) || 0,
            format: String(result.format || ""),
          })
        },
      )
      .end(bytes)
  })
}

/**
 * POST /api/merchants/me/upload — multipart { file, kind: "banner" | "popup" }
 *
 * The authenticated sibling of the public upload route, used by the dashboard's Campaign details tab.
 * It exists because that tab is driven by a seller, not by PakRaffle staff: the session decides the
 * folder, the file type and size are checked here rather than trusted from the browser, and the
 * caller's own strings never reach Cloudinary as a path.
 */
export async function POST(req: NextRequest) {
  try {
    const store = await requireMerchant(req)
    enforceRateLimit(req, "merchant-upload", 30, 10 * 60 * 1000)

    const form = await req.formData().catch(() => null)
    if (!form) return fail("Upload the image as multipart/form-data", 400)

    const file = form.get("file")
    if (!(file instanceof File)) return fail("No image file provided", 400)
    if (!ACCEPTED.includes(file.type)) return fail("Use a JPG, PNG, WebP or AVIF image", 415)
    if (file.size > MAX_BYTES) return fail(`That image is ${(file.size / 1048576).toFixed(1)} MB. Upload 8 MB or less.`, 413)

    const slot = slotOf(form.get("kind"))
    const result = await upload(store.id, slot, Buffer.from(await file.arrayBuffer()), file.name)

    return ok({ image: result }, 201)
  } catch (err) {
    if (err instanceof MerchantError) return fail(err.message, err.status, { code: err.code })
    // A rejected Cloudinary upload is the caller's problem to fix, not an internal fault.
    if (err instanceof Error && /Cloudinary/.test(err.message)) {
      return fail("Could not store that image. Try another file.", 502, { code: "UPLOAD_FAILED" })
    }
    return handleRouteError(err, "merchant creative upload")
  }
}
