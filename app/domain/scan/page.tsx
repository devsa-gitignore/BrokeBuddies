'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Shield, Users, ChevronRight, Search, BarChart2 } from 'lucide-react'

interface ScannedEmployee {
  email: string
  score: number
  breaches: number
  secrets: number
  profiles: number
  status: 'scanning' | 'complete' | 'failed'
}

export default function DomainScanPage() {
  const [domain, setDomain] = useState('')
  const [stage, setStage] = useState<'input' | 'scanning' | 'results'>('input')
  const [employees, setEmployees] = useState<ScannedEmployee[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [isGlitch, setIsGlitch] = useState(false)
  const terminalEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [logs])

  const startDomainScan = async () => {
    if (!domain) return
    setStage('scanning')
    setEmployees([])
    setLogs(['Initiating domain wide reconnaissance...', `Target: ${domain}`])
    setProgress(5)
    try {
      const response = await fetch('http://localhost:8000/scan-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      })
      if (!response.ok) throw new Error('Failed to connect to backend')
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      while (true) {
        const { done, value } = await reader?.read()!
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = JSON.parse(line.slice(6))
          if (data.type === 'status') {
            setLogs(prev => [...prev, `[SYSTEM] ${data.message}`])
            setProgress(data.progress)
          } else if (data.type === 'emails_found') {
            setLogs(prev => [...prev, `[INFO] Identified ${data.count} potential targets.`])
            setEmployees(data.emails.map((e: string) => ({ email: e, status: 'scanning', score: 0, breaches: 0, secrets: 0, profiles: 0 })))
          } else if (data.type === 'scan_result') {
            const res = data.data
            setEmployees(prev => prev.map(emp =>
              emp.email === res.email
                ? { ...emp, status: 'complete', score: res.exposure_score.score, breaches: res.exposure_score.total_breaches, secrets: res.exposure_score.secrets_found, profiles: res.exposure_score.platforms_found }
                : emp
            ))
            if (res.exposure_score.score > 70) { setIsGlitch(true); setTimeout(() => setIsGlitch(false), 1000) }
          } else if (data.type === 'final_report') {
            setLogs(prev => [...prev, 'Domain analysis finalized. Ranking employees...'])
            setStage('results')
          }
        }
      }
    } catch (err) { setLogs(prev => [...prev, `[ERROR] Scan failed: ${err}`]) }
  }

  return (
    <div className={`min-h-screen bg-black text-white p-8 font-mono ${isGlitch ? 'animate-pulse' : ''}`}>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,#1a1a1a,black)] -z-10" />
      <div className="fixed inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <Shield className="w-10 h-10 text-red-500" />
          <div>
            <h1 className="text-2xl font-pixel uppercase tracking-widest mt-1">
              <span className="text-red-500">SHADOW</span>SELF
            </h1>
            <p className="text-xs text-red-500/60 font-bold uppercase tracking-widest">Insider Threat Analytics</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-white/40 uppercase">Domain Analysis Module v4.2</p>
          <p className="text-sm font-bold text-white/60 tabular-nums">{new Date().toISOString().split('T')[0]}</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {stage === 'input' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20">
            <div className="w-full max-w-2xl bg-white/5 border border-white/10 p-10 rounded-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><Search className="text-red-500" /> Target Domain Discovery</h2>
              <p className="text-white/60 mb-8 leading-relaxed">Enter a company domain to identify the weakest link. ShadowSelf will scrape all associated employee emails and run high-velocity OSINT scans simultaneously.</p>
              <div className="relative">
                <input type="text" placeholder="startup.com" value={domain} onChange={(e) => setDomain(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 p-5 rounded-xl text-xl font-bold focus:outline-none focus:border-red-500/50 transition-all placeholder:text-white/20" />
                <button onClick={startDomainScan} className="absolute right-2 top-2 bottom-2 px-8 bg-red-600 hover:bg-red-500 text-white rounded-lg font-black uppercase text-sm tracking-widest transition-all hover:scale-[1.02] active:scale-95">
                  Initiate Scan
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {stage === 'scanning' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/5 border border-white/10 p-6 rounded-xl flex items-center justify-between">
                <div><h3 className="text-xs font-black text-red-500 uppercase mb-1">Target Identity</h3><p className="text-2xl font-black">{domain}</p></div>
                <div className="text-right"><h3 className="text-xs font-black text-white/40 uppercase mb-1">Fleet Scanned</h3><p className="text-2xl font-black">{employees.filter(e => e.status === 'complete').length} / {employees.length}</p></div>
              </div>
              <div className="bg-black border border-white/10 rounded-xl overflow-hidden h-[500px] flex flex-col">
                <div className="bg-white/5 p-3 flex items-center justify-between border-b border-white/10">
                  <div className="flex gap-2"><div className="w-2 h-2 rounded-full bg-red-600" /><div className="w-2 h-2 rounded-full bg-orange-600" /><div className="w-2 h-2 rounded-full bg-green-600" /></div>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">OSINT_TERMINAL_RECON</span>
                </div>
                <div className="p-4 flex-1 overflow-y-auto space-y-2 text-sm">
                  {logs.map((log, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="text-red-500/50">[{new Date().toLocaleTimeString()}]</span>
                      <span className={log.includes('ERROR') ? 'text-red-500' : log.includes('INFO') ? 'text-blue-400' : 'text-white/80'}>{log}</span>
                    </div>
                  ))}
                  <div ref={terminalEndRef} />
                </div>
                <div className="p-4 bg-white/5 border-top border-white/10">
                  <div className="flex justify-between text-[10px] font-bold uppercase mb-2"><span>Global Progress</span><span>{progress}%</span></div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden"><motion.div className="h-full bg-red-600" initial={{ width: 0 }} animate={{ width: `${progress}%` }} /></div>
                </div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-black uppercase mb-6 flex items-center gap-2"><Users className="text-red-500" /> Live Feed</h3>
              <div className="space-y-3">
                {employees.map((emp, i) => (
                  <div key={i} className="bg-black/40 border border-white/5 p-3 rounded-lg flex items-center justify-between">
                    <div className="text-xs truncate w-32">{emp.email}</div>
                    {emp.status === 'scanning' ? (
                      <div className="w-20 bg-white/5 h-2 rounded-full overflow-hidden"><motion.div className="bg-orange-500 h-full" animate={{ x: [-20, 80] }} transition={{ duration: 1.5, repeat: Infinity }} /></div>
                    ) : (
                      <div className={`text-[10px] font-black px-2 py-0.5 rounded ${emp.score > 60 ? 'bg-red-500' : 'bg-green-500'} text-black`}>SCORE: {emp.score}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {stage === 'results' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-black uppercase tracking-tighter">Weakest Link Found</h2>
              <p className="text-white/60">ShadowSelf analysis complete for {domain}. Ranking internal assets by risk exposure.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {employees.sort((a, b) => b.score - a.score).map((emp, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className={`bg-white/5 border ${i === 0 ? 'border-red-500' : 'border-white/10'} p-6 rounded-2xl relative overflow-hidden hover:bg-white/[0.07] transition-all`}>
                  {i === 0 && <div className="absolute top-0 right-0 bg-red-500 text-black px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-bl-xl">Critical Risk</div>}
                  <div className="mb-6"><p className="text-[10px] text-white/40 font-bold uppercase mb-1">Target #{i + 1}</p><h3 className="text-lg font-black truncate">{emp.email}</h3></div>
                  <div className="flex items-end justify-between mb-8">
                    <div><p className="text-[10px] text-white/40 uppercase font-black mb-1">Exposure Score</p><div className="text-4xl font-black">{emp.score}</div></div>
                    <BarChart2 className={`w-10 h-10 ${emp.score > 60 ? 'text-red-500' : 'text-blue-500'}`} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-6">
                    <div className="text-center"><p className="text-s text-white/40 uppercase mb-1">Breaches</p><p className="font-bold text-s-red-400">{emp.breaches}</p></div>
                    <div className="text-center border-x border-white/10"><p className="text-s text-white/40 uppercase mb-1">Secrets</p><p className="font-bold text-s-orange-400">{emp.secrets}</p></div>
                    <div className="text-center"><p className="text-s text-white/40 uppercase mb-1">Social</p><p className="font-bold text-s-blue-400">{emp.profiles}</p></div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-center">
              <button onClick={() => setStage('input')} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
                <ChevronRight className="w-4 h-4 rotate-180" /> Return to Target Discovery
              </button>
            </div>
          </motion.div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black to-transparent pointer-events-none">
        <div className="flex justify-between items-end opacity-20 text-[10px] font-black uppercase tracking-[0.5em]">
          <span>Security Protocol 119-B</span><span>Access Level: REDACTED</span>
        </div>
      </footer>
    </div>
  )
}
