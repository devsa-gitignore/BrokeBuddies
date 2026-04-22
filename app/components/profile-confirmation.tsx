'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ShieldCheck, ShieldAlert, Check, ExternalLink,
  ArrowRight, Plus, Loader2, AlertCircle, UserPlus,
} from 'lucide-react'

interface Profile {
  platform: string
  url: string
  username: string
  found: boolean
  verified?: boolean
  user_added?: boolean
  avatar_url?: string
}

interface ProfileConfirmationProps {
  profiles: Profile[]
  email: string
  onConfirm: (confirmedProfiles: Profile[]) => void
  onReset: () => void
}

const PLATFORM_COLORS: Record<string, string> = {
  GitHub: 'bg-zinc-800 text-white border-zinc-600',
  Instagram: 'bg-gradient-to-br from-purple-600 to-pink-500 text-white border-purple-400',
  LinkedIn: 'bg-blue-700 text-white border-blue-500',
  Reddit: 'bg-orange-600 text-white border-orange-400',
  YouTube: 'bg-red-600 text-white border-red-400',
  'Twitter/X': 'bg-black text-white border-zinc-600',
  TikTok: 'bg-black text-white border-zinc-500',
  Pinterest: 'bg-red-700 text-white border-red-500',
  SoundCloud: 'bg-orange-500 text-white border-orange-400',
  Keybase: 'bg-sky-700 text-white border-sky-500',
  Medium: 'bg-emerald-700 text-white border-emerald-500',
  LeetCode: 'bg-amber-500 text-black border-amber-400',
  CodeChef: 'bg-amber-800 text-white border-amber-600',
  Gravatar: 'bg-indigo-700 text-white border-indigo-500',
}

export function ProfileConfirmation({
  profiles,
  email,
  onConfirm,
  onReset,
}: ProfileConfirmationProps) {
  // Verified pre-selected, possible matches unselected
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(profiles.filter((p) => p.verified).map((p) => p.url))
  )
  // Extra profiles added manually by the user
  const [manualProfiles, setManualProfiles] = useState<Profile[]>([])

  // Manual add state
  const [urlInput, setUrlInput] = useState('')
  const [addState, setAddState] = useState<'idle' | 'loading' | 'done'>('idle')
  const [addResults, setAddResults] = useState<{ url: string; ok: boolean; reason?: string }[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const allProfiles = [...profiles, ...manualProfiles]
  const verifiedProfiles = allProfiles.filter((p) => p.verified)
  const possibleProfiles = allProfiles.filter((p) => !p.verified && !p.user_added)
  const userAddedProfiles = allProfiles.filter((p) => p.user_added)
  const confirmedCount = selected.size

  const toggle = (url: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(url) ? next.delete(url) : next.add(url)
      return next
    })
  }

  const handleVerifyAll = async () => {
    const urls = urlInput
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 0)

    if (urls.length === 0) return

    setAddState('loading')
    setAddResults([])

    const results = await Promise.all(
      urls.map(async (url) => {
        // Duplicate check
        if (allProfiles.some((p) => p.url === url)) {
          return { url, ok: false, reason: 'Already in list' }
        }
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/verify-profile-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
          })
          const data = await res.json()
          return { url, ok: data.valid, reason: data.reason, data }
        } catch {
          return { url, ok: false, reason: 'Backend unreachable' }
        }
      })
    )

    const added: Profile[] = []
    const newSelected = new Set(selected)

    for (const r of results) {
      if (r.ok && (r as any).data) {
        const d = (r as any).data
        const newProfile: Profile = {
          platform: d.platform || 'Unknown',
          url: d.url || r.url,
          username: d.username || r.url,
          found: true,
          verified: false,
          user_added: true,
        }
        added.push(newProfile)
        newSelected.add(newProfile.url)
      }
    }

    if (added.length > 0) {
      setManualProfiles((prev) => [...prev, ...added])
      setSelected(newSelected)
      // Clear only the valid URLs from the textarea, keep failed ones
      const failedUrls = results.filter((r) => !r.ok).map((r) => r.url)
      setUrlInput(failedUrls.join('\n'))
    }

    setAddResults(results)
    setAddState('done')
  }

  const handleContinue = () => {
    const confirmed = allProfiles.filter((p) => selected.has(p.url))
    onConfirm(confirmed)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  }

  return (
    <motion.div
      className="min-h-screen bg-background flex flex-col items-center justify-center p-4 py-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-30" />
      </div>

      <div className="relative z-10 w-full max-w-3xl">

        {/* Header */}
        <motion.div className="text-center mb-10" variants={itemVariants}>
          <div className="inline-flex items-center gap-2 bg-primary/20 border-2 border-primary text-primary text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-none mb-6 shadow-[2px_2px_0px_0px_var(--primary)]">
            Step 3 of 4 — Verify Your Profiles
          </div>
          <h1 className="text-4xl font-bold mb-3">
            <span className="text-primary">Are these</span>{' '}
            <span className="text-foreground">yours?</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
            Confirm which found accounts are yours, or add any we missed.
            Only confirmed profiles count towards your exposure score.
          </p>
        </motion.div>

        {/* Email-verified */}
        {verifiedProfiles.length > 0 && (
          <motion.div className="mb-6" variants={itemVariants}>
            <SectionLabel icon={<ShieldCheck className="w-4 h-4 text-primary" />} color="text-primary">
              Email-Verified
              <span className="text-xs text-muted-foreground font-normal ml-1">
                — confirmed your email maps to these
              </span>
            </SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {verifiedProfiles.map((profile) => (
                <ProfileCard
                  key={profile.url}
                  profile={profile}
                  isSelected={selected.has(profile.url)}
                  isVerified
                  onToggle={() => toggle(profile.url)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Possible matches */}
        {possibleProfiles.length > 0 && (
          <motion.div className="mb-6" variants={itemVariants}>
            <SectionLabel icon={<ShieldAlert className="w-4 h-4 text-muted-foreground" />} color="text-muted-foreground">
              Possible Matches
              <span className="text-xs text-muted-foreground font-normal ml-1">
                — username found, confirm if yours
              </span>
            </SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AnimatePresence>
                {possibleProfiles.map((profile) => (
                  <ProfileCard
                    key={profile.url}
                    profile={profile}
                    isSelected={selected.has(profile.url)}
                    isVerified={false}
                    onToggle={() => toggle(profile.url)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* User-added profiles */}
        {userAddedProfiles.length > 0 && (
          <motion.div className="mb-6" variants={itemVariants} layout>
            <SectionLabel icon={<UserPlus className="w-4 h-4 text-accent" />} color="text-accent">
              Added by You
              <span className="text-xs text-muted-foreground font-normal ml-1">
                — manually added and verified reachable
              </span>
            </SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AnimatePresence>
                {userAddedProfiles.map((profile) => (
                  <ProfileCard
                    key={profile.url}
                    profile={profile}
                    isSelected={selected.has(profile.url)}
                    isVerified={false}
                    isUserAdded
                    onToggle={() => toggle(profile.url)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {profiles.length === 0 && manualProfiles.length === 0 && (
          <motion.div variants={itemVariants} className="mb-6 text-center py-8">
            <ShieldCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No social profiles were found automatically.</p>
            <p className="text-muted-foreground text-sm mt-1">Add your profiles below.</p>
          </motion.div>
        )}

        {/* ── Manual URL input ──────────────────────────────────────────── */}
        <motion.div className="mb-6" variants={itemVariants}>
          <Card className="neo-box border-2 border-primary shadow-[6px_6px_0px_0px_var(--primary)] p-6 rounded-none">
            <p className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              Add your own accounts
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Paste one profile URL per line — we'll verify each one is reachable before adding.
            </p>

            <textarea
              ref={textareaRef}
              placeholder={`https://instagram.com/yourhandle\nhttps://linkedin.com/in/your-name\nhttps://github.com/youruser`}
              value={urlInput}
              onChange={(e) => { setUrlInput(e.target.value); setAddState('idle'); setAddResults([]) }}
              rows={3}
              className="w-full bg-background border-2 border-primary/50 focus:border-primary focus:shadow-[4px_4px_0px_0px_var(--primary)] rounded-none px-3 py-2 text-sm font-mono outline-none transition-all resize-none mb-4 placeholder:text-muted-foreground/40"
            />

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <button
                onClick={handleVerifyAll}
                disabled={!urlInput.trim() || addState === 'loading'}
                className="neo-btn-primary px-4 py-2 text-sm flex items-center gap-1.5 uppercase tracking-widest font-mono disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_white] hover:shadow-[2px_2px_0px_0px_white]"
              >
                {addState === 'loading'
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying…</>
                  : <><Plus className="w-3.5 h-3.5" /> Verify & Add All</>}
              </button>

              {addState === 'done' && addResults.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  <span className="text-primary font-semibold">
                    {addResults.filter((r) => r.ok).length} added
                  </span>
                  {addResults.filter((r) => !r.ok).length > 0 && (
                    <span className="text-destructive font-semibold">
                      {' '}· {addResults.filter((r) => !r.ok).length} failed
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Per-URL failure details */}
            <AnimatePresence>
              {addState === 'done' && addResults.some((r) => !r.ok) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-1"
                >
                  {addResults.filter((r) => !r.ok).map((r) => (
                    <div key={r.url} className="flex items-start gap-2 text-xs text-destructive">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span className="font-mono truncate flex-1">{r.url}</span>
                      <span className="text-muted-foreground flex-shrink-0 ml-2">{r.reason}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Action bar */}
        <motion.div variants={itemVariants}>
          <Card className="neo-box border-2 border-primary shadow-[6px_6px_0px_0px_var(--primary)] p-6 flex items-center justify-between gap-4 flex-wrap rounded-none mt-4">
            <div className="text-sm text-muted-foreground uppercase font-mono tracking-widest">
              <span className="text-foreground font-bold text-lg">{confirmedCount}</span>{' '}
              {confirmedCount === 1 ? 'profile' : 'profiles'} selected
            </div>
            <div className="flex gap-4">
              <button
                onClick={onReset}
                className="neo-btn border-2 border-muted-foreground bg-transparent text-muted-foreground hover:bg-muted-foreground hover:text-black px-6 py-3 font-mono font-bold uppercase tracking-widest text-sm shadow-[4px_4px_0px_0px_rgba(156,163,175,0.5)] transition-all"
              >
                Start Over
              </button>
              <button
                onClick={handleContinue}
                className="neo-btn-primary px-6 py-3 text-base flex items-center gap-2 font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_white] hover:shadow-[2px_2px_0px_0px_white]"
              >
                Generate Report
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </Card>
        </motion.div>

      </div>
    </motion.div>
  )
}


// ── Section label helper ───────────────────────────────────────────────────────

function SectionLabel({ icon, color, children }: {
  icon: React.ReactNode
  color: string
  children: React.ReactNode
}) {
  return (
    <div className={`flex items-center gap-2 mb-3 ${color} font-semibold text-sm`}>
      {icon}
      {children}
    </div>
  )
}


// ── Individual profile card ────────────────────────────────────────────────────

function ProfileCard({
  profile,
  isSelected,
  isVerified,
  isUserAdded = false,
  onToggle,
}: {
  profile: Profile
  isSelected: boolean
  isVerified: boolean
  isUserAdded?: boolean
  onToggle: () => void
}) {
  const colorClass = PLATFORM_COLORS[profile.platform] ?? 'bg-primary/20 text-primary border-primary/30'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`relative p-4 transition-all duration-200 cursor-pointer select-none rounded-none border-2 hover:-translate-y-1 hover:translate-x-[-1px] ${isSelected
          ? isVerified
            ? 'border-primary bg-primary/5 shadow-[4px_4px_0px_0px_var(--primary)]'
            : isUserAdded
              ? 'border-accent bg-accent/5 shadow-[4px_4px_0px_0px_var(--accent)]'
              : 'border-primary/80 bg-primary/5 shadow-[4px_4px_0px_0px_var(--primary)]'
          : 'border-muted-foreground/30 bg-card/30 shadow-[4px_4px_0px_0px_rgba(156,163,175,0.3)] opacity-70 hover:opacity-100 hover:shadow-[4px_4px_0px_0px_var(--primary)] hover:border-primary/50'
          }`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="w-10 h-10 border-2 border-primary flex-shrink-0 rounded-none object-cover"
            />
          ) : (
            <div className={`w-10 h-10 border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 rounded-none ${colorClass}`}>
              {profile.platform[0]}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-foreground truncate">{profile.platform}</p>
              {isVerified && <ShieldCheck className="w-3 h-3 text-primary flex-shrink-0" />}
              {isUserAdded && (
                <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-full font-mono flex-shrink-0">
                  you
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-mono truncate">
              {profile.username.startsWith('http') ? profile.username : `@${profile.username}`}
            </p>
          </div>

          <a
            href={profile.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0 p-1"
            title="Open profile"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div
            className={`w-6 h-6 border-2 flex items-center justify-center flex-shrink-0 transition-all rounded-none ${isSelected ? 'bg-primary border-primary shadow-[2px_2px_0px_0px_var(--primary)]' : 'bg-transparent border-muted-foreground/30'
              }`}
          >
            {isSelected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
