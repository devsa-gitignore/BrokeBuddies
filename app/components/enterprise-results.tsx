'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Users, ShieldAlert, ArrowRight, ExternalLink } from 'lucide-react'

interface EmployeeResult {
  email: string
  exposure_score: {
    score: number
    total_breaches: int
    secrets_found: int
  }
}

interface EnterpriseResultsProps {
  domain: string
  results: EmployeeResult[]
  onViewEmployee: (email: string) => void
}

export function EnterpriseResults({ domain, results, onViewEmployee }: EnterpriseResultsProps) {
  const sorted = [...results].sort((a, b) => b.exposure_score.score - a.exposure_score.score)
  const weakestLink = sorted[0]

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-destructive'
    if (score >= 50) return 'text-accent'
    return 'text-primary'
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass p-6 border-primary/20">
          <div className="flex items-center gap-3 mb-2 text-muted-foreground text-xs font-mono uppercase tracking-widest">
            <Users size={14} />
            EMPLOYEES MAPPED
          </div>
          <div className="text-3xl font-bold font-mono">{results.length}</div>
        </Card>

        <Card className="glass p-6 border-destructive/30 bg-destructive/5">
          <div className="flex items-center gap-3 mb-2 text-destructive text-xs font-mono uppercase tracking-widest">
            <ShieldAlert size={14} />
            WEAKEST LINK IDENTIFIED
          </div>
          <div className="text-xl font-bold truncate mb-1">{weakestLink?.email}</div>
          <div className={`text-2xl font-bold font-mono ${getScoreColor(weakestLink?.exposure_score.score || 0)}`}>
            SCORE: {weakestLink?.exposure_score.score}
          </div>
        </Card>

        <Card className="glass p-6 border-accent/20">
          <div className="flex items-center gap-3 mb-2 text-muted-foreground text-xs font-mono uppercase tracking-widest">
            <AlertTriangle size={14} />
            TOTAL SECRETS EXPOSED
          </div>
          <div className="text-3xl font-bold font-mono">
            {results.reduce((acc, r) => acc + r.exposure_score.secrets_found, 0)}
          </div>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card className="glass border-primary/10 overflow-hidden">
        <div className="p-6 border-b border-primary/10 bg-primary/5">
          <h3 className="text-lg font-bold flex items-center gap-2">
            Employee Exposure Ranking: <span className="text-primary">{domain}</span>
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-sm">
            <thead>
              <tr className="border-b border-primary/10 bg-black/20">
                <th className="px-6 py-4 font-semibold opacity-60">RANK</th>
                <th className="px-6 py-4 font-semibold opacity-60">IDENTITY</th>
                <th className="px-6 py-4 font-semibold opacity-60">BREACHES</th>
                <th className="px-6 py-4 font-semibold opacity-60">SECRETS</th>
                <th className="px-6 py-4 font-semibold opacity-60 text-right">SCORE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {sorted.map((res, idx) => (
                <tr 
                  key={res.email} 
                  className={`group hover:bg-primary/5 transition-colors cursor-pointer ${idx === 0 ? 'bg-destructive/5' : ''}`}
                  onClick={() => onViewEmployee(res.email)}
                >
                  <td className="px-6 py-4">
                    {idx === 0 ? <Badge variant="destructive" className="animate-pulse">#1 RISK</Badge> : `#${idx + 1}`}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className="text-foreground group-hover:text-primary transition-colors">{res.email}</span>
                       <ExternalLink size={12} className="opacity-0 group-hover:opacity-60" />
                    </div>
                  </td>
                  <td className="px-6 py-4">{res.exposure_score.total_breaches}</td>
                  <td className="px-6 py-4">
                    {res.exposure_score.secrets_found > 0 ? (
                      <span className="text-destructive font-bold">{res.exposure_score.secrets_found}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${getScoreColor(res.exposure_score.score)}`}>
                    {res.exposure_score.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
