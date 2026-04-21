'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, AtSign, X, Scan } from 'lucide-react'
import { ScanTerminal } from '@/app/components/scan-terminal'
import { ProfileConfirmation } from '@/app/components/profile-confirmation'
import { ResultsDashboard } from '@/app/components/results-dashboard'

interface TerminalLine {
  type: 'status' | 'log' | 'success' | 'error' | 'progress'
  message: string
  timestamp: string
}

interface Profile {
  platform: string
  url: string
  username: string
  found: boolean
  verified?: boolean
  avatar_url?: string
}

interface ScanState {
  stage: 'entry' | 'scanning' | 'confirming' | 'results'
  email: string
  username: string
  logs: TerminalLine[]
  progress: number
  exposureScore: number
  allProfiles: Profile[]
  breaches: any[]
  confirmedProfiles: Profile[]
  secrets: any[]
  scanError: string | null
  isGlitchTriggered: boolean
}

const chipVariants = {
  hidden: { opacity: 0, scale: 0.7, x: -8 },
  visible: { opacity: 1, scale: 1, x: 0, transition: { type: 'spring', stiffness: 400, damping: 20 } },
  exit: { opacity: 0, scale: 0.6, x: -8, transition: { duration: 0.15 } },
}

export default function PersonalScanPage() {
  const [state, setState] = useState<ScanState>({
    stage: 'entry',
    email: '',
    username: '',
    logs: [],
    progress: 0,
    exposureScore: 0,
    allProfiles: [],
    breaches: [],
    confirmedProfiles: [],
    secrets: [],
    scanError: null,
    isGlitchTriggered: false,
  })

  // Entry form local state
  const [email, setEmail] = useState('')
  const [usernames, setUsernames] = useState<string[]>([])
  const [usernameInput, setUsernameInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const inputRef = useRef<HTMLInputElement>(null)

  const ts = () =>
    new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })

  const addLog = (message: string, type: TerminalLine['type'] = 'log') =>
    setState(prev => ({ ...prev, logs: [...prev.logs, { type, message, timestamp: ts() }] }))

  // Username tag helpers
  const addUsername = (value: string) => {
    const trimmed = value.trim().replace(/^@/, '')
    if (trimmed && !usernames.includes(trimmed)) {
      setUsernames(prev => [...prev, trimmed])
      setErrors(prev => ({ ...prev, username: '' }))
    }
    setUsernameInput('')
  }
  const removeUsername = (i: number) => setUsernames(prev => prev.filter((_, idx) => idx !== i))
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab' || e.key === ',') {
      e.preventDefault()
      if (usernameInput.trim()) addUsername(usernameInput)
    } else if (e.key === 'Backspace' && !usernameInput && usernames.length > 0) {
      setUsernames(prev => prev.slice(0, -1))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}

    const pending = usernameInput.trim().replace(/^@/, '')
    let finalUsernames = usernames
    if (pending && !usernames.includes(pending)) {
      finalUsernames = [...usernames, pending]
      setUsernames(finalUsernames)
      setUsernameInput('')
    }

    if (!email.trim()) errs.email = 'Email is required'
    else if (!email.includes('@')) errs.email = 'Invalid email format'
    if (finalUsernames.length === 0) errs.username = 'Add at least one username'
    if (Object.keys(errs).length) { setErrors(errs); return }

    handleScanStart(email, finalUsernames.join(','))
  }

  const handleScanStart = async (email: string, username: string) => {
    setState(prev => ({
      ...prev,
      stage: 'scanning',
      email,
      username,
      logs: [{ type: 'status', message: 'Initializing OSINT scan…', timestamp: ts() }],
      progress: 0,
      scanError: null,
      allProfiles: [],
      confirmedProfiles: [],
      isGlitchTriggered: false,
    }))

    try {
      addLog('Connecting to backend…', 'log')
      const response = await fetch('http://localhost:8000/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, repo_url: '' }),
      })
      if (!response.ok) throw new Error(`Backend returned ${response.status}`)
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let hibpResults: any = { breaches: [] }
      let sherlockResults: any = { profiles: [] }
      let trufflehoResults: any = { secrets: [] }
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = JSON.parse(line.slice(6))
          if (data.type === 'status') {
            addLog(data.message, 'progress')
            setState(prev => ({ ...prev, progress: data.progress }))
          } else if (data.type === 'hibp') {
            hibpResults = data.data
          } else if (data.type === 'sherlock') {
            sherlockResults = data.data
          } else if (data.type === 'trufflehog') {
            trufflehoResults = data.data
            if ((trufflehoResults.secrets || []).some((s: any) => s.severity === 'high' || s.severity === 'critical')) {
              setState(prev => ({ ...prev, isGlitchTriggered: true }))
              setTimeout(() => setState(prev => ({ ...prev, isGlitchTriggered: false })), 3000)
            }
          }
        }
      }

      // Persist for audit page
      if (typeof window !== 'undefined') {
        localStorage.setItem('shadowself_scan_result', JSON.stringify({
          email, username,
          breaches: hibpResults.breaches || [],
          social_profiles: sherlockResults.profiles || [],
          secrets: trufflehoResults.secrets || [],
          exposure_score: { score: 0 },
        }))
      }

      setState(prev => ({
        ...prev,
        stage: 'confirming',
        allProfiles: sherlockResults.profiles || [],
        breaches: hibpResults.breaches || [],
        secrets: trufflehoResults.secrets || [],
      }))
    } catch (error: any) {
      addLog(`Scan failed: ${error.message}`, 'error')
      setState(prev => ({ ...prev, scanError: error.message }))
    }
  }

  const handleConfirmProfiles = (confirmedProfiles: Profile[]) => {
    const score = Math.min(state.breaches.length * 15 + confirmedProfiles.length * 5 + state.secrets.length * 10, 100)
    setState(prev => ({ ...prev, stage: 'results', confirmedProfiles, exposureScore: score }))
  }

  const handleReset = () => {
    setEmail('')
    setUsernames([])
    setUsernameInput('')
    setErrors({})
    setState(prev => ({
      ...prev,
      stage: 'entry',
      email: '',
      username: '',
      logs: [],
      progress: 0,
      exposureScore: 0,
      allProfiles: [],
      breaches: [],
      confirmedProfiles: [],
      secrets: [],
      scanError: null,
      isGlitchTriggered: false,
    }))
  }

  return (
    <>
      {/* ── Entry Form ── */}
      {state.stage === 'entry' && (
        <motion.div
          className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 w-full max-w-md">
            {/* Header */}
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="neo-box-primary inline-flex items-center justify-center w-14 h-14 mb-6">
                <User className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-4xl font-black tracking-tight mb-1">
                <span className="text-primary">Personal</span> Scan
              </h1>
              <p className="text-muted-foreground text-sm">Map your digital footprint across breach databases and social networks.</p>
            </motion.div>

            {/* Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="neo-box p-8 space-y-6"
            >
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <Mail className="w-3 h-3" /> Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={`w-full bg-background border-2 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-all ${
                      errors.email ? 'border-destructive focus:shadow-[4px_4px_0px_0px_var(--destructive)]' : 'border-foreground focus:border-primary focus:shadow-[4px_4px_0px_0px_var(--primary)]'
                    }`}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                {/* Usernames tag input */}
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <AtSign className="w-3 h-3" /> Usernames
                    </label>
                    <span className="text-[10px] text-muted-foreground/50">Enter or Tab to add</span>
                  </div>
                  <div
                    className={`min-h-[44px] flex flex-wrap gap-2 items-center px-3 py-2 border-2 bg-background cursor-text transition-all ${
                      errors.username ? 'border-destructive focus-within:shadow-[4px_4px_0px_0px_var(--destructive)]' : 'border-foreground focus-within:border-primary focus-within:shadow-[4px_4px_0px_0px_var(--primary)]'
                    }`}
                    onClick={() => inputRef.current?.focus()}
                  >
                    <AnimatePresence>
                      {usernames.map((u, i) => (
                        <motion.span
                          key={u}
                          variants={chipVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="flex items-center gap-1 bg-primary/15 border border-primary/30 text-primary text-xs font-mono px-2 py-1 rounded-full"
                        >
                          <span className="text-primary/60">@</span>{u}
                          <button type="button" onClick={e => { e.stopPropagation(); removeUsername(i) }}
                            className="ml-0.5 hover:text-destructive transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                    <input
                      ref={inputRef}
                      type="text"
                      value={usernameInput}
                      onChange={e => setUsernameInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={() => { if (usernameInput.trim()) addUsername(usernameInput) }}
                      placeholder={usernames.length === 0 ? 'your_handle, @alias…' : ''}
                      className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/40"
                    />
                  </div>
                  {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
                </div>

                <button
                  type="submit"
                  className="neo-btn-primary w-full flex items-center justify-center gap-2 py-4 mt-2 text-base"
                >
                  <Scan className="w-4 h-4" /> Begin Scan
                </button>
              </form>

              <p className="text-[11px] text-muted-foreground/50 text-center leading-relaxed pt-2 border-t border-white/5">
                We scan breach databases, 300+ social platforms, and public records. No data is stored.
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}

      {state.stage === 'scanning' && (
        <ScanTerminal
          logs={state.logs}
          progress={state.progress}
          scanError={state.scanError}
          onReset={handleReset}
          isGlitchTriggered={state.isGlitchTriggered}
        />
      )}

      {state.stage === 'confirming' && (
        <ProfileConfirmation
          profiles={state.allProfiles}
          email={state.email}
          onConfirm={handleConfirmProfiles}
          onReset={handleReset}
        />
      )}

      {state.stage === 'results' && (
        <ResultsDashboard
          email={state.email}
          username={state.username}
          exposureScore={state.exposureScore}
          breaches={state.breaches}
          profiles={state.confirmedProfiles}
          secrets={state.secrets}
          onReset={handleReset}
        />
      )}
    </>
  )
}
