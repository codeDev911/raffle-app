import Image from "next/image"
import { cn } from "@/lib/utils"

/**
 * The PakRaffle gift-box mark (public/logo.svg).
 *
 * The artwork is transparent, so it is drawn exactly as supplied — no tile, ring, border or
 * background colour behind it. Callers only choose the size; the mark sits directly on the
 * surface it is placed on (white header, dark footer, glass panels).
 */
export function BrandMark({
  className,
  priority,
}: {
  className?: string
  /** Set on the first paint of a page so the mark never pops in after the text. */
  priority?: boolean
}) {
  return (
    <Image
      src="/logo.svg"
      alt=""
      width={132}
      height={136}
      priority={priority}
      className={cn("h-9 w-9 shrink-0 object-contain", className)}
    />
  )
}
