"use client"

import { useState, useEffect } from "react"

interface TypewriterEffectProps {
  phrases: string[]
  typingSpeed?: number
  deletingSpeed?: number
  pauseTime?: number
  className?: string
}

export function TypewriterEffect({
  phrases,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseTime = 2000,
  className = "",
}: TypewriterEffectProps) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex]

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          // Typing
          if (currentText.length < currentPhrase.length) {
            setCurrentText(currentPhrase.slice(0, currentText.length + 1))
          } else {
            // Finished typing, start deleting after pause
            setTimeout(() => setIsDeleting(true), pauseTime)
          }
        } else {
          // Deleting
          if (currentText.length > 0) {
            setCurrentText(currentText.slice(0, -1))
          } else {
            // Finished deleting, move to next phrase
            setIsDeleting(false)
            setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
          }
        }
      },
      isDeleting ? deletingSpeed : typingSpeed,
    )

    return () => clearTimeout(timeout)
  }, [currentText, isDeleting, currentPhraseIndex, phrases, typingSpeed, deletingSpeed, pauseTime])

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)

    return () => clearInterval(cursorInterval)
  }, [])

  return (
    <span className={className}>
      {currentText}
      <span className={`${showCursor ? "opacity-100" : "opacity-0"} transition-opacity duration-100`}>|</span>
    </span>
  )
}
