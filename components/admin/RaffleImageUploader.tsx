"use client"

import React, { useState, useRef } from "react"
import Image from "next/image"
import {
  UploadCloud,
  ImageIcon,
  X,
  Star,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Plus,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface RaffleImageUploaderProps {
  mainImage: string
  gallery: string[]
  onChange: (data: { image: string; gallery: string[] }) => void
}

export function RaffleImageUploader({
  mainImage,
  gallery = [],
  onChange,
}: RaffleImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [urlInput, setUrlInput] = useState("")
  const [showUrlInput, setShowUrlInput] = useState(false)

  // Construct combined list of unique images:
  // First item is mainImage (if present), followed by gallery items
  const allImages = React.useMemo(() => {
    const list: string[] = []
    if (mainImage && mainImage.trim()) {
      list.push(mainImage.trim())
    }
    for (const g of gallery) {
      if (g && g.trim() && !list.includes(g.trim())) {
        list.push(g.trim())
      }
    }
    return list
  }, [mainImage, gallery])

  const notifyChange = (images: string[]) => {
    if (images.length === 0) {
      onChange({ image: "", gallery: [] })
    } else {
      const cover = images[0]
      const rest = images.slice(1)
      onChange({ image: cover, gallery: rest })
    }
  }

  // Handle file uploads to Cloudinary
  const handleFiles = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    )

    if (imageFiles.length === 0) {
      setErrorMessage("Please select valid image files (PNG, JPG, WebP, etc.)")
      return
    }

    setIsUploading(true)
    setErrorMessage(null)
    setUploadProgress(`Uploading ${imageFiles.length} photo${imageFiles.length > 1 ? "s" : ""} to Cloudinary...`)

    try {
      const formData = new FormData()
      formData.append("folder", "raffles")
      for (const file of imageFiles) {
        formData.append("files", file)
      }

      const res = await fetch("/api/upload/cloudinary", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload to Cloudinary")
      }

      const uploadedUrls: string[] = data.urls || (data.url ? [data.url] : [])

      if (uploadedUrls.length === 0) {
        throw new Error("No image URLs returned from Cloudinary")
      }

      // Append new URLs to the existing images
      const updatedList = [...allImages]
      for (const url of uploadedUrls) {
        if (!updatedList.includes(url)) {
          updatedList.push(url)
        }
      }

      notifyChange(updatedList)
      setUploadProgress(null)
    } catch (err: any) {
      console.error("Upload failed:", err)
      setErrorMessage(err.message || "Failed to upload image(s). Please try again.")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleSetCover = (index: number) => {
    if (index === 0 || index >= allImages.length) return
    const target = allImages[index]
    const updated = [target, ...allImages.filter((_, i) => i !== index)]
    notifyChange(updated)
  }

  const handleMove = (index: number, direction: "left" | "right") => {
    const newIndex = direction === "left" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= allImages.length) return

    const updated = [...allImages]
    const temp = updated[index]
    updated[index] = updated[newIndex]
    updated[newIndex] = temp
    notifyChange(updated)
  }

  const handleRemove = (index: number) => {
    const updated = allImages.filter((_, i) => i !== index)
    notifyChange(updated)
  }

  const handleAddUrl = () => {
    const trimmed = urlInput.trim()
    if (!trimmed) return
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      setErrorMessage("Image URL must start with http:// or https://")
      return
    }

    if (!allImages.includes(trimmed)) {
      const updated = [...allImages, trimmed]
      notifyChange(updated)
    }
    setUrlInput("")
    setShowUrlInput(false)
    setErrorMessage(null)
  }

  return (
    <div className="space-y-4">
      {/* Upload Zone Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? "border-emerald-500 bg-emerald-50/60 scale-[1.005]"
            : "border-slate-300 hover:border-emerald-500 hover:bg-slate-50/70 bg-white"
        } ${isUploading ? "pointer-events-none opacity-80" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(e.target.files)
            }
          }}
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-2xs ${
              isDragging
                ? "bg-emerald-500 text-white"
                : "bg-emerald-50 text-emerald-600 border border-emerald-100"
            }`}
          >
            {isUploading ? (
              <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <div className="space-y-1">
            <h4 className="text-sm sm:text-base font-bold text-slate-900">
              {isUploading
                ? "Uploading photos to Cloudinary..."
                : "Click or drag & drop multiple photos"}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Select multiple campaign photos at once. The first image will be set as the featured cover, and remaining images will automatically render in the interactive gallery carousel.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 font-medium">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Cloudinary Auto WebP/AVIF
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 font-medium">
              Multi-Select Supported
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 font-medium">
              Max 10MB per photo
            </span>
          </div>

          {uploadProgress && (
            <div className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {uploadProgress}
            </div>
          )}
        </div>
      </div>

      {/* Error notification */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1 font-medium">{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Manual URL input fallback toggle */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-slate-500 font-medium">
          {allImages.length === 0
            ? "No photos added yet"
            : `${allImages.length} photo${allImages.length > 1 ? "s" : ""} selected (1 Cover + ${Math.max(0, allImages.length - 1)} Carousel Gallery)`}
        </span>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold underline flex items-center gap-1"
        >
          {showUrlInput ? "Hide URL Input" : "+ Add image via direct URL"}
        </button>
      </div>

      {showUrlInput && (
        <div className="flex gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="text-xs h-9 bg-white"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddUrl()
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAddUrl}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 px-3 rounded-lg shrink-0"
          >
            Add URL
          </Button>
        </div>
      )}

      {/* Preview Grid */}
      {allImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 pt-2">
          {allImages.map((imgUrl, index) => {
            const isCover = index === 0
            return (
              <div
                key={`${imgUrl}-${index}`}
                className={`group relative rounded-xl overflow-hidden border-2 bg-slate-100 shadow-2xs transition-all ${
                  isCover
                    ? "border-amber-400 ring-2 ring-amber-100"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* Image Aspect Box */}
                <div className="relative aspect-square w-full">
                  <Image
                    src={imgUrl}
                    alt={`Raffle photo ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 opacity-70 group-hover:opacity-90 transition-opacity" />

                  {/* Top Badge: Cover or Gallery index */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1">
                    {isCover ? (
                      <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 border-0">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        Cover Photo
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md border-0"
                      >
                        Slide {index + 1}
                      </Badge>
                    )}

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="w-6 h-6 rounded-full bg-rose-600/90 hover:bg-rose-700 text-white flex items-center justify-center transition-colors shadow-xs"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Bottom Action Controls */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1">
                    {!isCover && (
                      <button
                        type="button"
                        onClick={() => handleSetCover(index)}
                        className="text-[10px] font-semibold text-white bg-black/60 hover:bg-emerald-600 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                      >
                        <Star className="w-2.5 h-2.5" />
                        Make Cover
                      </button>
                    )}

                    <div className="flex items-center gap-1 ml-auto">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMove(index, "left")}
                          className="w-6 h-6 rounded bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
                          title="Move earlier"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                      )}
                      {index < allImages.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMove(index, "right")}
                          className="w-6 h-6 rounded bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
                          title="Move later"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
