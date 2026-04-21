'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Shield, ShieldCheck, ShieldAlert, ExternalLink, Brain } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { GraphVisualization } from './graph-visualization'
import { ThreatIntelligence } from './threat-intelligence'

interface Breach {
  name: string
  title: string
  breached_data: string[]
  breach_date: string
  severity: string
}

interface Profile {
  platform: string
  url: string
  username: string
  found: boolean
  verified?: boolean
  avatar_url?: string
}

interface Secret {
  type: string
  value: string
  file: string
  line?: number
  severity: string
}

interface ResultsDashboardProps {
  email: string
  username: string
  exposureScore: number
  breaches: Breach[]
  profiles: Profile[]
  secrets: Secret[]
  onReset: () => void
}

export function ResultsDashboard({
  email,
  username,
  exposureScore,
  breaches,
  profiles,
  secrets,
  onReset,
}: ResultsDashboardProps) {
  const [showAllBreaches, setShowAllBreaches] = useState(false)
  const sortedBreaches = [...breaches].sort((a, b) => {
    return new Date(b.breach_date).getTime() - new Date(a.breach_date).getTime()
  })

  const verifiedProfiles = profiles.filter((p) => p.verified)
  const possibleProfiles = profiles.filter((p) => !p.verified)
  const secretsFound = secrets.length

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-destructive'
    if (score >= 50) return 'text-accent'
    return 'text-primary'
  }

  const getRiskBg = (score: number) => {
    if (score >= 80) return 'bg-destructive/10 border-destructive/20'
    if (score >= 50) return 'bg-accent/10 border-accent/20'
    return 'bg-primary/10 border-primary/20'
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <motion.div
      className="min-h-screen bg-background p-4 pb-16"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div className="mb-8" variants={itemVariants}>
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-primary">Shadow</span>
            <span className="text-foreground">Self</span> Results
          </h1>
          <p className="text-muted-foreground">
            Analysis for <span className="text-foreground font-mono">{email}</span>
          </p>
        </motion.div>

        {/* Entity Resolution Graph */}
        <motion.div variants={itemVariants} className="mb-8">
          <GraphVisualization
            email={email}
            profiles={profiles}
            breaches={breaches}
            secrets={secrets}
          />
        </motion.div>

        {/* Exposure Score */}
        <motion.div variants={itemVariants} className="mb-8">
          <Card className={`glass border ${getRiskBg(exposureScore)} p-8`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground mb-2">Exposure Risk Score</h2>
                <div className="flex items-baseline gap-2">
                  <span className={`text-6xl font-bold ${getRiskColor(exposureScore)}`}>
                    {exposureScore}
                  </span>
                  <span className="text-2xl text-muted-foreground">/100</span>
                </div>
                <p className="text-muted-foreground mt-4 text-sm">
                  {exposureScore >= 80
                    ? 'Critical risk — immediate action recommended'
                    : exposureScore >= 50
                      ? 'Significant exposure detected'
                      : 'Low exposure risk'}
                </p>
              </div>
              <Shield className={`w-16 h-16 ${getRiskColor(exposureScore)}`} />
            </div>
          </Card>
        </motion.div>

        {/* Intelligence Hub Section */}
        <motion.div variants={itemVariants} className="mb-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="text-primary" size={20} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Intelligence Hub</h2>
            <Badge variant="outline" className="border-primary/20 text-primary uppercase text-[10px] tracking-widest">
              AI-Powered
            </Badge>
          </div>
          <ThreatIntelligence
            scanData={{
              email,
              username,
              breaches: sortedBreaches,
              social_profiles: profiles,
              secrets,
              exposure_score: { score: exposureScore }
            }}
          />
        </motion.div>

        {/* Summary Pills */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {/* Breaches */}
          <Card className="glass border-destructive/20 backdrop-blur-xl p-6 h-full">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <h3 className="font-semibold text-foreground">Breaches</h3>
            </div>
            <p className="text-3xl font-bold text-destructive mb-4">{sortedBreaches.length}</p>
            <div className="space-y-2">
              {sortedBreaches.length === 0 ? (
                <p className="text-sm text-muted-foreground">No breaches found ✓</p>
              ) : (
                sortedBreaches.slice(0, 3).map((breach, idx) => (
                  <div key={idx} className="text-xs">
                    <p className="text-foreground font-medium">{breach.name}</p>
                    <p className="text-muted-foreground">{breach.breached_data.length} data types exposed</p>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Profiles */}
          <Card className="glass border-accent/20 backdrop-blur-xl p-6 h-full">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-foreground">Profiles Found</h3>
            </div>
            <div className="flex items-baseline gap-3 mb-4">
              <p className="text-3xl font-bold text-accent">{profiles.length}</p>
              {verifiedProfiles.length > 0 && (
                <span className="text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                  {verifiedProfiles.length} email-verified
                </span>
              )}
            </div>
            <div className="space-y-2">
              {profiles.slice(0, 3).map((profile, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs">
                  {profile.verified ? (
                    <ShieldCheck className="w-3 h-3 text-primary shrink-0" />
                  ) : (
                    <ShieldAlert className="w-3 h-3 text-muted-foreground shrink-0" />
                  )}
                  <p className="text-foreground font-medium">{profile.platform}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Secrets */}
          <Card className="glass border-destructive/20 backdrop-blur-xl p-6 h-full">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <h3 className="font-semibold text-foreground">Exposed Secrets</h3>
            </div>
            <p className="text-3xl font-bold text-destructive mb-4">{secretsFound}</p>
            <div className="space-y-2">
              {secretsFound === 0 ? (
                <p className="text-sm text-muted-foreground">No secrets found ✓</p>
              ) : (
                secrets.slice(0, 3).map((secret, idx) => (
                  <div key={idx} className="text-xs">
                    <p className="text-foreground font-medium">{secret.type}</p>
                    <p className="text-muted-foreground font-mono">{secret.file}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>

        {/* Profiles Detail */}
        {profiles.length > 0 && (
          <motion.div variants={itemVariants} className="mb-8">
            <Card className="glass border-accent/20 backdrop-blur-xl p-6">
              <h3 className="text-xl font-semibold text-foreground mb-6">Social Profiles</h3>

              {/* Email-verified accounts */}
              {verifiedProfiles.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <p className="text-sm font-semibold text-primary">
                      Email-Verified Accounts
                    </p>
                    <span className="text-xs text-muted-foreground">
                      — these platforms confirmed this email maps to the account
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {verifiedProfiles.map((profile, idx) => (
                      <a
                        key={idx}
                        href={profile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors group"
                      >
                        {profile.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={profile.username}
                            className="w-8 h-8 rounded-full border border-primary/20"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs text-primary font-bold">
                            {profile.platform[0]}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{profile.platform}</p>
                          <p className="text-xs text-muted-foreground truncate font-mono">@{profile.username}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Username-matched (possible) accounts */}
              {possibleProfiles.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldAlert className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-semibold text-muted-foreground">
                      Possible Matches
                    </p>
                    <span className="text-xs text-muted-foreground">
                      — username found but not confirmed to belong to this email
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {possibleProfiles.map((profile, idx) => (
                      <a
                        key={idx}
                        href={profile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg border border-primary/10 bg-card/30 hover:bg-card/50 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full bg-muted/30 border border-muted/20 flex items-center justify-center text-xs text-muted-foreground font-bold">
                          {profile.platform[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{profile.platform}</p>
                          <p className="text-xs text-muted-foreground truncate font-mono">@{profile.username}</p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Breach Details */}
        {sortedBreaches.length > 0 && (
          <motion.div variants={itemVariants} className="mb-8">
            <Card className="glass border-destructive/20 backdrop-blur-xl p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">Breach Details</h3>
              <div className="space-y-4">
                {(showAllBreaches ? sortedBreaches : sortedBreaches.slice(0, 5)).map((breach, idx) => (
                  <div key={idx} className="border-b border-destructive/10 pb-4 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-foreground">{breach.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${breach.severity === 'high'
                          ? 'bg-destructive/20 text-destructive'
                          : breach.severity === 'medium'
                            ? 'bg-accent/20 text-accent'
                            : 'bg-primary/20 text-primary'
                        }`}>
                        {breach.severity}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{breach.breach_date}</p>
                    <div className="flex flex-wrap gap-1">
                      {breach.breached_data.map((data, i) => (
                        <span key={i} className="text-xs bg-card/50 border border-primary/10 px-2 py-1 rounded">
                          {data}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {sortedBreaches.length > 5 && (
                <div className="mt-4 pt-4 border-t border-destructive/10 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setShowAllBreaches(!showAllBreaches)}
                  >
                    {showAllBreaches ? 'Show Less' : `Show ${sortedBreaches.length - 5} More Breaches`}
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Secrets Details */}
        {secrets.length > 0 && (
          <motion.div variants={itemVariants} className="mb-8">
            <Card className="glass border-destructive/20 backdrop-blur-xl p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">Exposed Secrets</h3>
              <div className="space-y-3">
                {secrets.map((secret, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-foreground">{secret.type}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${secret.severity === 'high' ? 'bg-destructive/20 text-destructive' : 'bg-accent/20 text-accent'
                          }`}>{secret.severity}</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">
                        {secret.file}{secret.line ? `:${secret.line}` : ''}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono mt-1 opacity-70">{secret.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div variants={itemVariants} className="flex gap-4 justify-center">
          <Button
            onClick={onReset}
            className="bg-primary text-primary-foreground font-bold px-8 py-6 hover:bg-primary/90"
          >
            New Scan
          </Button>
          <Button
            variant="outline"
            className="border-primary/20 text-foreground hover:bg-primary/10 font-bold px-8 py-6"
          >
            Export Report
          </Button>
        </motion.div>

      </div>
    </motion.div>
  )
}
