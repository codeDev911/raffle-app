"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * Motion primitives for the marketing pages. Both degrade to plain, fully visible content:
 * the server renders the final state, and the animation only starts once the browser can
 * observe it. Nothing here runs when the visitor prefers reduced motion.
 */

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function Reveal({
  children,
  delay = 0,
  className,
  distance = 18,
}: {
  children: ReactNode
  delay?: number
  className?: string
  distance?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  // Starts visible so the HTML is readable without JS and never flashes on first paint.
  const [shown, setShown] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion() || !("IntersectionObserver" in window)) return
    // Anything already in the first screen is left alone — animating it would just blink.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return

    setShown(false)
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn("transition-[opacity,transform] duration-700 ease-out will-change-transform", className)}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : `translate3d(0, ${distance}px, 0)`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

/**
 * Counts up to `to` the first time it scrolls into view. The server output is already the final
 * number, so crawlers, no-JS readers and reduced-motion visitors all see the real figure.
 */
export function Counter({
  to,
  duration = 1500,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
}: {
  to: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [value, setValue] = useState(to)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion() || !("IntersectionObserver" in window)) return
    if (el.getBoundingClientRect().top < window.innerHeight * 0.95) return

    setValue(0)
    let frame = 0
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        observer.disconnect()
        const start = performance.now()
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / duration)
          // easeOutCubic keeps the last digits from crawling
          const eased = 1 - Math.pow(1 - progress, 3)
          setValue(to * eased)
          if (progress < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.2 },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [to, duration])

  const formatted = value.toLocaleString("en-PK", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}

/** Hover tilt for prize cards; disabled for touch and reduced-motion visitors. */
export function Lift({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_30px_70px_-40px_rgba(4,47,34,0.55)]",
        className,
      )}
    >
      {children}
    </div>
  )
}
