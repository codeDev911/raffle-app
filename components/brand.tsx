import Image from "next/image"
import { cn } from "@/lib/utils"

/**
 * The PakRaffle gift-box mark. The artwork has an opaque white face, so it sits on its own white
 * tile instead of being tinted per surface — the brand green stays exact on light and dark headers.
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
    <span
      className={cn(
        "relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-900/10",
        className,
      )}
    >
      <Image
        src="/brand/logo.png"
        alt=""
        width={512}
        height={512}
        priority={priority}
        className="h-full w-full object-contain"
      />
    </span>
  )
}
