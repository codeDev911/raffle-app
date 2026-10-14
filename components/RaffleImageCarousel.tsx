"use client"

import React, { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle,
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
  aspectRatioClass = "aspect-[4/3] sm:aspect-[16/10]",
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

  // Keyboard navigation
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
        className={`relative w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex flex-col items-center justify-center p-8 text-center text-slate-400 ${aspectRatioClass} ${className}`}
      >
        <ImageIcon className="w-12 h-12 stroke-[1.5] mb-2 text-slate-300" />
        <p className="text-xs font-semibold text-slate-500">No photos available</p>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main Carousel Viewport */}
      <div
        className={`relative w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 shadow-xs select-none group ${aspectRatioClass}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={currentImage}
          alt={`${title} - image ${currentIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 800px"
          className="object-cover transition-all duration-300"
        />

        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            {featured && (
              <Badge className="bg-amber-500 text-white font-semibold text-[11px] px-2.5 py-0.5 rounded-lg shadow-sm border-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-current" />
                Featured
              </Badge>
            )}
            {category && (
              <Badge
                variant="secondary"
                className="bg-white/95 backdrop-blur-xs text-slate-800 font-semibold text-[11px] px-2.5 py-0.5 rounded-lg shadow-sm border border-slate-200"
              >
                {category}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {status && (
              <Badge
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg shadow-sm border-0 ${
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

            {/* Lightbox full screen button */}
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="pointer-events-auto w-7 h-7 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white flex items-center justify-center transition-colors shadow-xs"
              title="Expand photo"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md backdrop-blur-xs flex items-center justify-center transition-all opacity-85 group-hover:opacity-100 hover:scale-105"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5 -ml-0.5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md backdrop-blur-xs flex items-center justify-center transition-all opacity-85 group-hover:opacity-100 hover:scale-105"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5 -mr-0.5" />
            </button>
          </>
        )}

        {/* Bottom Slide Counter & Dots */}
        {hasMultiple && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <div className="px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-xs text-white text-[11px] font-mono font-medium flex items-center gap-1.5 shadow-xs">
              <Layers className="w-3 h-3 text-slate-300" />
              <span>
                {currentIndex + 1} / {cleanImages.length}
              </span>
            </div>

            {/* Dots */}
            <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-xs px-2 py-1 rounded-full">
              {cleanImages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`pointer-events-auto h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? "w-5 bg-white"
                      : "w-2 bg-white/50 hover:bg-white/80"
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
        <div className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-1 no-scrollbar touch-pan-x">
          {cleanImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-slate-100 ${
                idx === currentIndex
                  ? "border-emerald-600 ring-2 ring-emerald-100 scale-95"
                  : "border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`${title} thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Top Bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-10">
            <span className="text-sm font-semibold truncate max-w-md">
              {title} ({currentIndex + 1} of {cleanImages.length})
            </span>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Centered Image */}
          <div
            className="relative w-full max-w-5xl h-[75vh] max-h-[800px]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentImage}
              alt={title}
              fill
              className="object-contain"
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
