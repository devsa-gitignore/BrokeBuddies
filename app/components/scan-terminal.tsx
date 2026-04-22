'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface TerminalLine {
  type: 'status' | 'log' | 'success' | 'error' | 'progress'
  message: string
  timestamp: string
}

interface ScanTerminalProps {
  logs: TerminalLine[]
  progress: number
  scanError?: string | null
  onReset?: () => void
  isGlitchTriggered?: boolean
}

export function ScanTerminal({ logs, progress, scanError, onReset, isGlitchTriggered }: ScanTerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  const getLogColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'success': return 'text-primary'
      case 'error': return 'text-destructive'
      case 'progress': return 'text-accent'
      default: return 'text-muted-foreground'
    }
  }

  const getLogPrefix = (type: TerminalLine['type']) => {
    switch (type) {
      case 'success': return '✓'
      case 'error': return '✗'
      case 'progress': return '→'
      default: return '•'
    }
  }

  // Glitch animation variants
  const glitchVariants: Variants = {
    glitch: {
      x: [0, -5, 5, -2, 2, 0],
      y: [0, 2, -2, 1, -1, 0],
      filter: [
        'none',
        'hue-rotate(90deg) brightness(1.2) contrast(1.5)',
        'hue-rotate(-90deg) brightness(0.8) contrast(1.2)',
        'none'
      ],
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      }
    },
    normal: {
      x: 0,
      y: 0,
      filter: 'none'
    }
  }
  return (
    <motion.div
      className={`min-h-screen transition-colors duration-300 flex flex-col items-center justify-center p-4 ${isGlitchTriggered ? 'bg-destructive/20' : 'bg-background'
        }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-4xl relative">
        {/* Background Glitch Flash */}
        <AnimatePresence>
          {isGlitchTriggered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.4, 0] }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-destructive/30 blur-3xl z-0"
              transition={{ duration: 0.2, repeat: 2 }}
            />
          )}
        </AnimatePresence>

        <motion.div
          animate={isGlitchTriggered ? "glitch" : "normal"}
          variants={glitchVariants}
          className="relative z-10"
        >
          {/* Header */}
          <motion.div
            className="mb-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className={`text-3xl font-bold mb-2 flex items-center gap-3 ${scanError ? 'text-destructive' : isGlitchTriggered ? 'text-destructive animate-pulse' : 'text-primary'
              }`}>
              {scanError ? 'SCAN FAILED' : isGlitchTriggered ? '⚠️ CRITICAL VULNERABILITY DETECTED' : 'SCANNING…'}
              {isGlitchTriggered && <AlertTriangle className="w-8 h-8 text-destructive" />}
            </h1>
            <p className="text-muted-foreground">
              {scanError ? 'An error occurred during the scan' : isGlitchTriggered ? 'P0 SEVERITY HIT DETECTED' : 'Analysis in progress'}
            </p>
          </motion.div>

          {/* Progress Bar */}
          <AnimatePresence>
            {!scanError && (
              <motion.div
                className="mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className={`text-sm font-mono ${isGlitchTriggered ? 'text-destructive' : 'text-primary'}`}>{progress}%</span>
                </div>
                <div className={`h-2 bg-card/50 border rounded-full overflow-hidden ${isGlitchTriggered ? 'border-destructive/40' : 'border-primary/20'
                  }`}>
                  <motion.div
                    className={`h-full ${isGlitchTriggered ? 'bg-destructive' : 'bg-gradient-to-r from-primary via-accent to-primary'
                      }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Terminal */}
          <Card className={`glass backdrop-blur-xl p-6 font-mono text-sm h-96 overflow-hidden flex flex-col transition-colors duration-300 ${isGlitchTriggered ? 'border-destructive/50 bg-destructive/10' : 'border-primary/20'
            }`}>
            {/* Terminal Header */}
            <div className={`flex items-center gap-2 pb-4 border-b mb-4 ${isGlitchTriggered ? 'border-destructive/30' : 'border-primary/10'
              }`}>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive animate-ping" />
                <div className="w-3 h-3 rounded-full bg-accent" />
                <div className="w-3 h-3 rounded-full bg-primary" />
              </div>
              <span className={`text-xs ml-auto ${isGlitchTriggered ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                {isGlitchTriggered ? 'SYSTEM ALERT' : 'ShadowSelf Terminal v1.0'}
              </span>
            </div>

            {/* Logs */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1">
              {logs.length === 0 ? (
                <motion.div
                  className="flex items-center gap-2 text-muted-foreground"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <span className="text-primary">$</span>
                  <span>Initializing scan…</span>
                </motion.div>
              ) : (
                logs.map((log, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className={`flex-shrink-0 w-4 ${getLogColor(log.type)}`}>
                      {getLogPrefix(log.type)}
                    </span>
                    <span className={`flex-1 ${getLogColor(log.type)} ${isGlitchTriggered && log.message.toUpperCase().includes('AWS') ? 'font-bold underline' : ''
                      }`}>{log.message}</span>
                    <span className="text-muted-foreground text-xs flex-shrink-0">{log.timestamp}</span>
                  </motion.div>
                ))
              )}
            </div>

            {/* Blinking cursor */}
            {!scanError && progress < 100 && (
              <div className={`mt-4 pt-4 border-t ${isGlitchTriggered ? 'border-destructive/20' : 'border-primary/10'}`}>
                <motion.div
                  className={`flex items-center gap-2 ${isGlitchTriggered ? 'text-destructive' : 'text-primary'}`}
                  animate={{ opacity: [1, 0.5] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  <span>$</span>
                  <span className={`inline-block w-2 h-4 ${isGlitchTriggered ? 'bg-destructive' : 'bg-primary'}`} />
                </motion.div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Error panel */}
        <AnimatePresence>
          {scanError && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.3 }}
              className="mt-6 relative z-20"
            >
              <Card className="border-destructive/30 bg-destructive/5 p-5">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-destructive mb-1">Scan Error</p>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {scanError}
                    </p>
                  </div>
                </div>
                {onReset && (
                  <Button
                    onClick={onReset}
                    variant="outline"
                    size="sm"
                    className="border-3 border-destructive/30 text-destructive hover:bg-destructive/10 gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Return to Home
                  </Button>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
