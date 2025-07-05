import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

// Helper function to get receipt URL by order ID and payment method
export function getReceiptUrl(paymentMethod: string, orderId: string) {
  const publicId = `receipts/${paymentMethod.toLowerCase()}/${orderId}`
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [{ width: 500, height: 500, crop: "limit" }, { quality: "auto" }, { format: "auto" }],
  })
}

// Helper function to delete receipt
export async function deleteReceipt(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    console.error("Error deleting receipt:", error)
    throw error
  }
}

// Helper function to get all receipts for a payment method
export async function getReceiptsByPaymentMethod(paymentMethod: string) {
  try {
    const result = await cloudinary.search
      .expression(`folder:receipts/${paymentMethod.toLowerCase()}`)
      .sort_by("created_at", "desc")
      .max_results(100)
      .execute()
    return result.resources
  } catch (error) {
    console.error("Error fetching receipts:", error)
    throw error
  }
}
