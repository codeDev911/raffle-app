"use client"

import React, { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Maximize2,
  X,
  Layers,
  ImageIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface RaffleImageCarouselProps {
  images: string[]
  title: string
  category?: string
  status?: string
  featured?: boolean
  className?: string
  aspectRatioClass?: string
}

export function RaffleImageCarousel({
  images = [],
  title,
  category,
  status,
  featured = false,
  className = "",
  aspectRatioClass = "aspect-square sm:aspect-[4/3]",
}: RaffleImageCarouselProps) {
  // Filter and deduplicate images
  const cleanImages = React.useMemo(() => {
    return Array.from(new Set(images.filter((img) => Boolean(img && img.trim()))))
  }, [images])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const hasMultiple = cleanImages.length > 1
  const currentImage = cleanImages[currentIndex] || "/placeholder.svg"

  const handlePrev = useCallback(() => {
    if (!hasMultiple) return
    setCurrentIndex((prev) => (prev === 0 ? cleanImages.length - 1 : prev - 1))
  }, [hasMultiple, cleanImages.length])

  const handleNext = useCallback(() => {
    if (!hasMultiple) return
    setCurrentIndex((prev) => (prev === cleanImages.length - 1 ? 0 : prev + 1))
  }, [hasMultiple, cleanImages.length])

  // Keyboard navigation for lightbox
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (lightboxOpen) {
        if (e.key === "ArrowLeft") handlePrev()
        if (e.key === "ArrowRight") handleNext()
        if (e.key === "Escape") setLightboxOpen(false)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [lightboxOpen, handlePrev, handleNext])

  // Swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50
    if (isLeftSwipe) handleNext()
    if (isRightSwipe) handlePrev()
  }

  if (cleanImages.length === 0) {
    return (
      <div
        className={`relative w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex flex-col items-center justify-center p-8 text-center text-slate-400 ${aspectRatioClass} ${className}`}
      >
        <ImageIcon className="w-12 h-12 stroke-[1.5] mb-2 text-slate-300" />
        <p className="text-xs font-semibold text-slate-500">No photos available</p>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main Viewport Container - Crisp clean light studio backdrop with maximum image presence */}
      <div
        className={`relative w-full overflow-hidden bg-white select-none group border-b border-gray-100 ${
          hasMultiple ? "rounded-t-2xl" : "rounded-2xl"
        } ${aspectRatioClass}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Full Image (Displays prominent and uncropped with object-contain directly filling container) */}
        <div
          onClick={() => setLightboxOpen(true)}
          className="absolute inset-0 cursor-zoom-in flex items-center justify-center p-2 sm:p-4"
          title="Click to view full screen"
        >
          <Image
            src={currentImage}
            alt={`${title} - image ${currentIndex + 1}`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 900px"
            className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>

        {/* Top Badges & Fullscreen Button */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-20 pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            {featured && (
              <Badge className="bg-amber-500 text-white font-semibold text-[11px] px-2.5 py-0.5 rounded-lg shadow-xs border-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-current" />
                Featured
              </Badge>
            )}
            {category && (
              <Badge
                variant="secondary"
                className="bg-white/95 backdrop-blur-xs text-slate-800 font-semibold text-[11px] px-2.5 py-0.5 rounded-lg shadow-xs border border-gray-200"
              >
                {category}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {status && (
              <Badge
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg shadow-xs border-0 ${
                  status === "ACTIVE"
                    ? "bg-emerald-600 text-white"
                    : status === "COMPLETED"
                      ? "bg-sky-600 text-white"
                      : "bg-slate-800 text-white"
                }`}
              >
                {status === "ACTIVE" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse inline-block" />
                )}
                {status}
              </Badge>
            )}

            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 border border-gray-200/80 shadow-xs transition-colors"
              title="Expand full screen"
              aria-label="Expand photo"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        {hasMultiple && (
          <div className="z-20">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handlePrev()
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md border border-gray-200/80 flex items-center justify-center transition-all opacity-85 group-hover:opacity-100 hover:scale-105"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5 -ml-0.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleNext()
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md border border-gray-200/80 flex items-center justify-center transition-all opacity-85 group-hover:opacity-100 hover:scale-105"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5 -mr-0.5" />
            </button>
          </div>
        )}

        {/* Bottom Slide Counter & Dots */}
        {hasMultiple && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
            <div className="px-2.5 py-1 rounded-full bg-gray-900/75 text-white text-[11px] font-mono font-medium flex items-center gap-1.5 shadow-xs">
              <Layers className="w-3 h-3 text-gray-300" />
              <span>
                {currentIndex + 1} / {cleanImages.length}
              </span>
            </div>

            {/* Dots */}
            <div className="flex items-center gap-1.5 bg-gray-900/60 px-2.5 py-1 rounded-full pointer-events-auto">
              {cleanImages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentIndex(idx)
                  }}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? "w-5 bg-emerald-400"
                      : "w-2 bg-white/60 hover:bg-white"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Thumbnails Row */}
      {hasMultiple && (
        <div className="flex gap-2 sm:gap-2.5 overflow-x-auto px-3 pb-3 pt-1 no-scrollbar touch-pan-x bg-gray-50/70 rounded-b-xl">
          {cleanImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-white p-1 ${
                idx === currentIndex
                  ? "border-emerald-600 ring-2 ring-emerald-100 scale-95 shadow-xs"
                  : "border-gray-200 hover:border-gray-300 opacity-80 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`${title} thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-contain p-0.5"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal (Full Screen Original View) */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Top Bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold truncate max-w-xs sm:max-w-md">
                {title}
              </span>
              <span className="text-xs text-gray-400">
                ({currentIndex + 1} of {cleanImages.length})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              title="Close full view"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Centered Image */}
          <div
            className="relative w-full max-w-6xl h-[82vh] max-h-[900px] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentImage}
              alt={title}
              fill
              className="object-contain"
              priority
              sizes="100vw"
            />
          </div>

          {/* Lightbox Nav Buttons */}
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handlePrev()
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleNext()
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
