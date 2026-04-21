'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { X } from 'lucide-react'

interface EntryPageProps {
  onScanStart: (email: string, username: string, repoUrl: string) => void
  onDomainScanStart: (domain: string, webhookUrl: string) => void
  isLoading?: boolean
}

export function EntryPage({ onScanStart, isLoading = false }: EntryPageProps) {
  const [isEnterprise, setIsEnterprise] = useState(false)
  const [email, setEmail] = useState('')
  const [usernames, setUsernames] = useState<string[]>([])
  const [usernameInput, setUsernameInput] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [domain, setDomain] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const inputRef = useRef<HTMLInputElement>(null)

  // Add a username tag
  const addUsername = (value: string) => {
    const trimmed = value.trim().replace(/^@/, '') // strip leading @
    if (trimmed && !usernames.includes(trimmed)) {
      setUsernames((prev) => [...prev, trimmed])
      setErrors((prev) => ({ ...prev, username: '' }))
    }
    setUsernameInput('')
  }

  // Remove a specific tag
  const removeUsername = (index: number) => {
    setUsernames((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUsernameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab' || e.key === ',') {
      e.preventDefault()
      if (usernameInput.trim()) addUsername(usernameInput)
    } else if (e.key === 'Backspace' && !usernameInput && usernames.length > 0) {
      // Remove last tag on backspace if input is empty
      setUsernames((prev) => prev.slice(0, -1))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}

    if (isEnterprise) {
      if (!domain.trim()) newErrors.domain = 'Domain is required'
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }
      setErrors({})
      onDomainScanStart(domain, webhookUrl)
      return
    }

    // Individual Scan Logic
    const pendingUsername = usernameInput.trim().replace(/^@/, '')
    let finalUsernames = usernames
    if (pendingUsername && !usernames.includes(pendingUsername)) {
      finalUsernames = [...usernames, pendingUsername]
      setUsernames(finalUsernames)
      setUsernameInput('')
    }

    if (!email.trim()) newErrors.email = 'Email is required'
    if (!email.includes('@')) newErrors.email = 'Invalid email format'
    if (finalUsernames.length === 0) newErrors.username = 'Add at least one username'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    onScanStart(email, finalUsernames.join(','), repoUrl)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  const chipVariants = {
    hidden: { opacity: 0, scale: 0.7, x: -8 },
    visible: { opacity: 1, scale: 1, x: 0, transition: { type: 'spring', stiffness: 400, damping: 20 } },
    exit: { opacity: 0, scale: 0.6, x: -8, transition: { duration: 0.15 } },
  }

  return (
    <motion.div
      className="min-h-screen bg-background flex flex-col items-center justify-center p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-20" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <h1 className="text-5xl font-bold mb-2">
            <span className="text-primary">Shadow</span>
            <span className="text-foreground">Self</span>
          </h1>
          <p className="text-muted-foreground text-lg">Advanced OSINT Intelligence</p>
        </motion.div>

        {/* Main Card */}
        <motion.div variants={itemVariants}>
          <Card className="glass border-primary/20 backdrop-blur-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">

              {!isEnterprise ? (
                <>
                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email Address</label>
                    <div className="relative">
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`bg-card/50 border-primary/20 text-foreground placeholder:text-muted-foreground focus:border-primary ${errors.email ? 'border-destructive' : ''
                          }`}
                        disabled={isLoading}
                      />
                      {errors.email && (
                        <p className="text-xs text-destructive mt-1">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Username Tag Input */}
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <label className="text-sm font-medium text-foreground">Usernames</label>
                      <span className="text-xs text-muted-foreground">Enter → add tag</span>
                    </div>

                    <div
                      className={`min-h-[42px] flex flex-wrap gap-2 items-center px-3 py-2 rounded-md border bg-card/50 cursor-text transition-colors ${errors.username
                          ? 'border-destructive'
                          : 'border-primary/20 focus-within:border-primary'
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
                            <span className="text-primary/60">@</span>
                            {u}
                            {!isLoading && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeUsername(i) }}
                                className="ml-0.5 hover:text-destructive transition-colors rounded-full"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </motion.span>
                        ))}
                      </AnimatePresence>

                      <input
                        ref={inputRef}
                        type="text"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        onKeyDown={handleUsernameKeyDown}
                        onBlur={() => { if (usernameInput.trim()) addUsername(usernameInput) }}
                        placeholder={usernames.length === 0 ? 'your_handle, @alias…' : ''}
                        disabled={isLoading}
                        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    {errors.username && (
                      <p className="text-xs text-destructive">{errors.username}</p>
                    )}
                  </div>

                  {/* Repo URL Input (Optional) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Repository URL{' '}
                      <span className="text-muted-foreground text-xs">(optional)</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="https://github.com/user/repo"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      className="bg-card/50 border-primary/20 text-foreground placeholder:text-muted-foreground focus:border-primary"
                      disabled={isLoading}
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Domain Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Company Domain</label>
                    <Input
                      type="text"
                      placeholder="startup.com"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className={`bg-card/50 border-primary/20 text-foreground placeholder:text-muted-foreground focus:border-primary ${errors.domain ? 'border-destructive' : ''}`}
                      disabled={isLoading}
                    />
                    {errors.domain && (
                      <p className="text-xs text-destructive mt-1">{errors.domain}</p>
                    )}
                  </div>

                  {/* Webhook Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Monitoring Webhook{' '}
                      <span className="text-muted-foreground text-xs">(Slack/Discord)</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="https://hooks.slack.com/services/..."
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="bg-card/50 border-primary/20 text-foreground placeholder:text-muted-foreground focus:border-primary font-mono text-xs"
                      disabled={isLoading}
                    />
                  </div>
                </>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground font-bold py-6 text-lg hover:bg-primary/90 glow-primary transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Scanning...
                  </div>
                ) : (
                  'Begin Scan'
                )}
              </Button>
            </form>

            {/* Info Footer */}
            <div className="mt-8 pt-6 border-t border-primary/10">
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                Your digital footprint will be analyzed across breach databases, social networks, and public repositories.
              </p>
            </div>
          </Card>
          
            <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <button 
              type="button"
              onClick={() => setIsEnterprise(!isEnterprise)}
              className="text-xs font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors flex items-center justify-center gap-2 group mx-auto"
            >
              <div className="w-1 h-1 bg-primary rounded-full group-hover:scale-150 transition-all" />
              {isEnterprise ? 'Switch to Individual Search' : 'Switch to Domain-Wide "Weakest Link" Analysis'}
              <div className="w-1 h-1 bg-primary rounded-full group-hover:scale-150 transition-all" />
            </button>
          </motion.div>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div className="mt-8 flex justify-center gap-8" variants={itemVariants}>
          {['Breaches', 'Profiles', 'Secrets'].map((item, i) => (
            <div key={item} className="text-center">
              <div className="text-primary text-2xl font-bold mb-1">{i + 1}</div>
              <p className="text-xs text-muted-foreground">{item}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}
