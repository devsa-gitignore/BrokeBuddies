'use client'

import { useState } from 'react'
import { EntryPage } from './components/entry-page'
import { ScanTerminal } from './components/scan-terminal'
import { ProfileConfirmation } from './components/profile-confirmation'
import { ResultsDashboard } from './components/results-dashboard'

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
  repoUrl: string
  logs: TerminalLine[]
  progress: number
  exposureScore: number
  // Raw scan results (all found profiles, before user confirmation)
  allProfiles: Profile[]
  breaches: any[]
  // Confirmed results (after user selects which profiles are theirs)
  confirmedProfiles: Profile[]
  secrets: any[]
  scanError: string | null
  isGlitchTriggered: boolean
}

export default function Home() {
  const [state, setState] = useState<ScanState>({
    stage: 'entry',
    email: '',
    username: '',
    repoUrl: '',
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

  const timestamp = () =>
    new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

  const addLog = (message: string, type: TerminalLine['type'] = 'log') => {
    setState((prev) => ({
      ...prev,
      logs: [...prev.logs, { type, message, timestamp: timestamp() }],
    }))
  }

  const handleScanStart = async (email: string, username: string, repoUrl: string) => {
    setState((prev) => ({
      ...prev,
      stage: 'scanning',
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
      }).catch((err) => {
        throw new Error(
          `Cannot reach backend at localhost:8000. Is the Python server running?\n(${err.message})`
        )
      })

      if (!response.ok) {
        const text = await response.text().catch(() => '')
        throw new Error(`Backend returned ${response.status}: ${text || response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body from backend')

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
          try {
            const data = JSON.parse(line.slice(6))

            if (data.type === 'status') {
              addLog(data.message, 'progress')
              setState((prev) => ({ ...prev, progress: data.progress }))
            } else if (data.type === 'hibp') {
              hibpResults = data.data || { breaches: [] }
              addLog(`Found ${hibpResults.total_breaches ?? 0} breaches`, 'success')
            } else if (data.type === 'sherlock') {
              sherlockResults = data.data || { profiles: [] }
              addLog(`Found ${sherlockResults.platforms_found ?? 0} social profiles`, 'success')
            } else if (data.type === 'trufflehog') {
              trufflehoResults = data.data || { secrets: [] }
              const highSeverityFound = (trufflehoResults.secrets || []).some(
                (s: any) => s.severity === 'high' || s.severity === 'critical'
              )

              if (highSeverityFound) {
                setState((prev) => ({ ...prev, isGlitchTriggered: true }))
                setTimeout(() => {
                  setState((prev) => ({ ...prev, isGlitchTriggered: false }))
                }, 3000)
              }

              addLog(
                trufflehoResults.secrets_found > 0
                  ? `Found ${trufflehoResults.secrets_found} exposed secrets`
                  : 'No exposed secrets detected',
                trufflehoResults.secrets_found > 0 ? 'error' : 'success'
              )
            } else if (data.type === 'warning') {
              addLog(`⚠ ${data.message}`, 'log')
            } else if (data.type === 'error') {
              addLog(`Backend error: ${data.message}`, 'error')
            }
          } catch {
            // skip malformed JSON chunks
          }
        }
      }

      addLog('Scan complete! Confirm your profiles to continue…', 'success')

      // Move to confirmation stage — don't go to results yet
      setState((prev) => ({
        ...prev,
        stage: 'confirming',
        progress: 100,
        allProfiles: sherlockResults.profiles ?? [],
        breaches: hibpResults.breaches ?? [],
        secrets: trufflehoResults.secrets ?? [],
        scanError: null,
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setState((prev) => ({
        ...prev,
        logs: [
          ...prev.logs,
          { type: 'error', message: `✗ Scan failed: ${message}`, timestamp: timestamp() },
        ],
        scanError: message,
      }))
    }
  }

  // Called when user confirms their profiles on the ProfileConfirmation screen
  const handleConfirmProfiles = (confirmedProfiles: Profile[]) => {
    const breachCount = state.breaches.length
    const profileCount = confirmedProfiles.length
    const secretCount = state.secrets.length

    let score = 0
    score += Math.min(breachCount * 15, 40)
    score += Math.min(profileCount * 5, 30)
    score += Math.min(secretCount * 10, 30)

    setState((prev) => ({
      ...prev,
      stage: 'results',
      confirmedProfiles,
      exposureScore: Math.min(score, 100),
    }))
  }

  const handleReset = () => {
    setState({
      stage: 'entry',
      email: '',
      username: '',
      repoUrl: '',
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
  }

  return (
    <>
      {state.stage === 'entry' && <EntryPage onScanStart={handleScanStart} />}

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
