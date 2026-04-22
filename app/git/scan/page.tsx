'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Github, Key, AlertTriangle, Terminal, Search, ChevronRight } from 'lucide-react'

interface Secret {
  type: string
  value: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  file?: string
  commit?: string
}

const severityColor: Record<string, string> = {
  critical: 'text-red-400 border-red-500/30 bg-red-500/5',
  high: 'text-orange-400 border-orange-500/30 bg-orange-500/5',
  medium: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5',
  low: 'text-blue-400 border-blue-500/30 bg-blue-500/5',
}

export default function GitScanPage() {
  const [repoUrl, setRepoUrl] = useState('')
  const [stage, setStage] = useState<'input' | 'scanning' | 'results'>('input')
  const [secrets, setSecrets] = useState<Secret[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [error, setError] = useState('')
  const [isValidating, setIsValidating] = useState(false)

  const addLog = (msg: string) => setLogs(prev => [...prev, msg])

  /** Returns an error string if invalid, or null if the URL is a valid public GitHub repo. */
  const validateGithubUrl = async (url: string): Promise<string | null> => {
    let parsed: URL
    try {
      parsed = new URL(url.trim())
    } catch {
      return 'Enter a valid URL (e.g. https://github.com/owner/repo)'
    }

    if (parsed.hostname !== 'github.com' && parsed.hostname !== 'www.github.com') {
      return 'URL must be a github.com repository link'
    }

    // Path must be /owner/repo — exactly two non-empty segments
    const parts = parsed.pathname.replace(/\.git$/, '').split('/').filter(Boolean)
    if (parts.length < 2) {
      return 'URL must point to a specific repository (github.com/owner/repo)'
    }
    if (parts.length > 2) {
      return 'Point to the repository root, not a subdirectory (github.com/owner/repo)'
    }

    const [owner, repo] = parts
    // Quick live check via GitHub API (unauthenticated, no CORS issue)
    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: { Accept: 'application/vnd.github+json' },
      })
      if (res.status === 404) return `Repository "${owner}/${repo}" not found or is private`
      if (!res.ok) return `GitHub API returned ${res.status} — try again`
    } catch {
      return 'Could not reach GitHub API to verify the repository'
    }

    return null
  }

  const startScan = async () => {
    setError('')
    if (!repoUrl.trim()) { setError('Repository URL is required'); return }

    setIsValidating(true)
    const validationError = await validateGithubUrl(repoUrl)
    setIsValidating(false)
    if (validationError) { setError(validationError); return }

    setStage('scanning')
    setSecrets([])
    setLogs([`Targeting: ${repoUrl}`, 'Running Trufflehog secrets scan...'])

    try {
      addLog('Connecting to backend...')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'git@scan.local', username: 'git-scanner', repo_url: repoUrl }),
      })
      if (!response.ok) throw new Error(`Backend returned ${response.status}`)
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''
      let foundSecrets: Secret[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = JSON.parse(line.slice(6))
          if (data.type === 'status') addLog(`[SCAN] ${data.message}`)
          else if (data.type === 'trufflehog') {
            foundSecrets = data.data?.secrets || []
            addLog(`[RESULT] ${foundSecrets.length} secrets detected.`)
          }
        }
      }
      setSecrets(foundSecrets)
      setStage('results')
    } catch (err: any) {
      addLog(`[ERROR] ${err.message}`)
      setStage('results')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,#00d9ff08,transparent)] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-10 flex items-center gap-3">
          <Github className="w-8 h-8 text-chart-4" />
          <div>
            <h1 className="text-3xl font-black tracking-tight"><span className="text-chart-4">Git</span> Secrets Scanner</h1>
            <p className="text-muted-foreground text-sm font-mono">Powered by Trufflehog · Detects keys across commit history</p>
          </div>
        </div>

        {/* Input stage */}
        {stage === 'input' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="neo-box p-8">
              <h2 className="font-bold text-lg mb-2 flex items-center gap-2"><Search className="w-5 h-5 text-chart-4" /> Target Repository</h2>
              <p className="text-muted-foreground text-sm mb-6">Enter any public GitHub repository URL to scan all commits for hardcoded secrets, tokens, and credentials.</p>
              <div className="relative">
                <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                <input
                  type="text"
                  placeholder="https://github.com/owner/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && startScan()}
                  className={`w-full bg-background border-2 pl-12 pr-4 py-4 font-mono text-sm text-foreground placeholder:text-muted-foreground/30 outline-none transition-all ${error ? 'border-destructive focus:shadow-[4px_4px_0px_0px_var(--destructive)]' : 'border-foreground focus:border-chart-4 focus:shadow-[4px_4px_0px_0px_var(--chart-4)]'}`}
                />
              </div>
              {error && <p className="text-xs text-destructive mt-2">{error}</p>}
              <button onClick={startScan} disabled={isValidating} className="mt-4 neo-btn-chart-4 w-full flex items-center justify-center gap-2 py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_white] shadow-[4px_4px_0px_0px_white] hover:shadow-[2px_2px_0px_0px_white]">
                {isValidating ? (
                  <><div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" /> Verifying repo…</>
                ) : (
                  <><Terminal className="w-4 h-4" /> Initiate Scan</>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Scanning stage */}
        {stage === 'scanning' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-chart-4/10 rounded-2xl bg-black/40 overflow-hidden">
            <div className="bg-white/5 p-3 flex items-center justify-between border-b border-white/10">
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-chart-4 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/40" />
                <div className="w-2 h-2 rounded-full bg-white/10" />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">TRUFFLEHOG_RECON</span>
            </div>
            <div className="p-6 space-y-2 font-mono text-sm min-h-64">
              {logs.map((log, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
                  <span className="text-chart-4/40">&gt;</span>
                  <span className={log.includes('ERROR') ? 'text-destructive' : log.includes('RESULT') ? 'text-chart-4' : 'text-muted-foreground'}>{log}</span>
                </motion.div>
              ))}
              <div className="flex items-center gap-2 text-chart-4/60">
                <div className="w-2 h-2 border border-chart-4 border-t-transparent rounded-full animate-spin" />
                <span>Scanning...</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results stage */}
        {stage === 'results' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Summary */}
            <div className="neo-box p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">Scan Target</p>
                <p className="font-mono text-sm text-chart-4 truncate max-w-xs">{repoUrl}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">Secrets Found</p>
                <p className={`text-3xl font-black ${secrets.length > 0 ? 'text-destructive' : 'text-primary'}`}>{secrets.length}</p>
              </div>
            </div>

            {secrets.length === 0 ? (
              <div className="neo-box p-8 text-center border-primary shadow-[4px_4px_0px_0px_var(--primary)]">
                <Key className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-1">No secrets detected</h3>
                <p className="text-muted-foreground text-sm">No exposed API keys, tokens, or credentials were found in this repository's history.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-destructive" /> Detected Secrets ({secrets.length})
                </h3>
                {secrets.map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className={`border-2 rounded-none p-4 font-mono text-xs ${severityColor[s.severity] || severityColor.low}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black uppercase tracking-widest">{s.type}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${severityColor[s.severity]}`}>{s.severity}</span>
                    </div>
                    <p className="opacity-60 truncate">{s.value}</p>
                    {s.file && <p className="opacity-40 mt-1">File: {s.file}</p>}
                    {s.commit && <p className="opacity-40">Commit: {s.commit}</p>}
                  </motion.div>
                ))}
              </div>
            )}

            <button onClick={() => { setStage('input'); setLogs([]) }} className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-bold uppercase tracking-widest text-xs transition-colors">
              <ChevronRight className="w-4 h-4 rotate-180" /> Scan another repository
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
