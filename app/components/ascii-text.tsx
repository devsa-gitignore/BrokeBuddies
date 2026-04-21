'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface ASCIITextProps {
  text: string
  enableWaves?: boolean
  asciiFontSize?: number
  className?: string
}

export function ASCIIText({ text, enableWaves = true, asciiFontSize = 8, className = "" }: ASCIITextProps) {
  const [glitchedText, setGlitchedText] = useState(text)
  // ASCII characters arranged from dense to sparse
  const characters = '▓▒░█▄▀▌▐■□▪▫▬@#8%&*'

  useEffect(() => {
    if (!enableWaves) {
      setGlitchedText(text)
      return
    }

    let interval: NodeJS.Timeout
    const startGlitch = () => {
      let iterations = 0
      clearInterval(interval)

      interval = setInterval(() => {
        setGlitchedText(prev =>
          prev.split('').map((char, index) => {
            // Un-glitch from left to right
            if (index < iterations) return text[index]
            // Random ASCII character
            return characters[Math.floor(Math.random() * characters.length)]
          }).join('')
        )

        if (iterations >= text.length) {
          clearInterval(interval)
          setTimeout(startGlitch, Math.random() * 3000)
        }

        iterations += 1 / 3
      }, 30)
    }

    startGlitch()
    return () => clearInterval(interval)
  }, [text, enableWaves])

  return (
    <motion.span
      className={`font-pixel inline-block tracking-[0.2em] uppercase whitespace-nowrap ${className}`}
      style={{ fontSize: `${asciiFontSize * 0.75}rem`, lineHeight: 1 }}
      initial={{ opacity: 0, filter: 'blur(4px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.5 }}
    >
      {glitchedText}
    </motion.span>
  )
}
