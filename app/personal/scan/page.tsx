'use client'

// Migrated from app/page.tsx — personal OSINT scan flow.
// Components are not modified; only the route changes.

import { useState } from 'react'
import { motion } from 'framer-motion'
import { EntryPage } from '@/app/components/entry-page'
import { ScanTerminal } from '@/app/components/scan-terminal'
import { ProfileConfirmation } from '@/app/components/profile-confirmation'
import { ResultsDashboard } from '@/app/components/results-dashboard'
import { EnterpriseResults } from '@/app/components/enterprise-results'

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
  stage: 'entry' | 'scanning' | 'confirming' | 'results' | 'enterprise_results'
  isEnterpriseMode: boolean
  email: string
  username: string
  repoUrl: string
  domain: string
  webhookUrl: string
  logs: TerminalLine[]
  progress: number
  exposureScore: number
  allProfiles: Profile[]
  breaches: any[]
  confirmedProfiles: Profile[]
  secrets: any[]
  enterpriseResults: any[]
  scanError: string | null
  isGlitchTriggered: boolean
}

export default function PersonalScanPage() {
  const [state, setState] = useState<ScanState>({
    stage: 'entry',
    isEnterpriseMode: false,
    email: '',
    username: '',
    repoUrl: '',
    domain: '',
    webhookUrl: '',
    logs: [],
    progress: 0,
    exposureScore: 0,
    allProfiles: [],
    breaches: [],
    confirmedProfiles: [],
    secrets: [],
    enterpriseResults: [],
    scanError: null,
    isGlitchTriggered: false,
  })

  const timestamp = () =>
    new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })

  const addLog = (message: string, type: TerminalLine['type'] = 'log') => {
    setState((prev) => ({ ...prev, logs: [...prev.logs, { type, message, timestamp: timestamp() }] }))
  }

  const handleScanStart = async (email: string, username: string, repoUrl: string) => {
    setState((prev) => ({
      ...prev,
      stage: 'scanning',
      isEnterpriseMode: false,
      email,
      username,
      repoUrl,
      logs: [{ type: 'status', message: 'Initializing OSINT scan…', timestamp: timestamp() }],
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
        body: JSON.stringify({ email, username, repo_url: repoUrl }),
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
            setState((prev) => ({ ...prev, progress: data.progress }))
          } else if (data.type === 'hibp') {
            hibpResults = data.data
          } else if (data.type === 'sherlock') {
            sherlockResults = data.data
          } else if (data.type === 'trufflehog') {
            trufflehoResults = data.data
            if ((trufflehoResults.secrets || []).some((s: any) => s.severity === 'high' || s.severity === 'critical')) {
              setState((prev) => ({ ...prev, isGlitchTriggered: true }))
              setTimeout(() => setState((prev) => ({ ...prev, isGlitchTriggered: false })), 3000)
            }
          }
        }
      }

      const scanResult = {
        email,
        username,
        breaches: hibpResults.breaches || [],
        social_profiles: sherlockResults.profiles || [],
        secrets: trufflehoResults.secrets || [],
        exposure_score: { score: 0 },
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('shadowself_scan_result', JSON.stringify(scanResult))
      }

      setState((prev) => ({
        ...prev,
        stage: 'confirming',
        allProfiles: sherlockResults.profiles || [],
        breaches: hibpResults.breaches || [],
        secrets: trufflehoResults.secrets || [],
      }))
    } catch (error: any) {
      addLog(`Scan failed: ${error.message}`, 'error')
      setState((prev) => ({ ...prev, scanError: error.message }))
    }
  }

  const handleDomainScanStart = async (domain: string, webhookUrl: string) => {
    setState((prev) => ({
      ...prev,
      stage: 'scanning',
      isEnterpriseMode: true,
      domain,
      webhookUrl,
      logs: [{ type: 'status', message: `Initiating domain scan for ${domain}…`, timestamp: timestamp() }],
      progress: 0,
      scanError: null,
      enterpriseResults: [],
    }))

    try {
      const response = await fetch('http://localhost:8000/scan-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, webhook_url: webhookUrl }),
      })

      if (!response.ok) throw new Error(`Backend returned ${response.status}`)
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
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
            setState((prev) => ({ ...prev, progress: data.progress }))
          } else if (data.type === 'scan_result') {
            setState((prev) => ({ ...prev, enterpriseResults: [...prev.enterpriseResults, data.data] }))
            addLog(`Completed analysis for ${data.data.email}`, 'success')
          } else if (data.type === 'final_report') {
            setState((prev) => ({ ...prev, stage: 'enterprise_results', enterpriseResults: data.ranked_employees }))
          }
        }
      }
    } catch (error: any) {
      addLog(`Domain scan failed: ${error.message}`, 'error')
      setState((prev) => ({ ...prev, scanError: error.message }))
    }
  }

  const handleConfirmProfiles = (confirmedProfiles: Profile[]) => {
    const score = Math.min(state.breaches.length * 15 + confirmedProfiles.length * 5 + state.secrets.length * 10, 100)
    setState((prev) => ({ ...prev, stage: 'results', confirmedProfiles, exposureScore: score }))
  }

  const handleReset = () => {
    setState((prev) => ({
      ...prev,
      stage: 'entry',
      email: '',
      username: '',
      repoUrl: '',
      domain: '',
      webhookUrl: '',
      logs: [],
      progress: 0,
      exposureScore: 0,
      allProfiles: [],
      breaches: [],
      confirmedProfiles: [],
      secrets: [],
      enterpriseResults: [],
      scanError: null,
      isGlitchTriggered: false,
    }))
  }

  return (
    <>
      {state.stage === 'entry' && (
        <EntryPage onScanStart={handleScanStart} onDomainScanStart={handleDomainScanStart} />
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

      {state.stage === 'enterprise_results' && (
        <div className="min-h-screen bg-background p-8">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
              <h1 className="text-4xl font-bold text-foreground mb-2">Enterprise Security Audit</h1>
              <p className="text-muted-foreground">Domain: <span className="text-primary font-mono">{state.domain}</span></p>
            </motion.div>
            <EnterpriseResults
              domain={state.domain}
              results={state.enterpriseResults}
              onViewEmployee={(email) => {
                const res = state.enterpriseResults.find(r => r.email === email)
                if (res) {
                  setState(prev => ({
                    ...prev,
                    stage: 'results',
                    email: res.email,
                    breaches: res.breaches,
                    confirmedProfiles: res.social_profiles,
                    secrets: res.secrets,
                    exposureScore: res.exposure_score.score,
                  }))
                }
              }}
            />
          </div>
        </div>
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
