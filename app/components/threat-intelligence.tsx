'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Brain, ShieldAlert, Terminal, Lock, ChevronRight, Zap, AlertTriangle } from 'lucide-react'

interface Mutation {
  value: string
  type: string
  risk: string
  difficulty: string
}

interface ThreatIntelligenceProps {
  scanData: any
}

export function ThreatIntelligence({ scanData }: ThreatIntelligenceProps) {
  const [mounted, setMounted] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [password, setPassword] = useState('')
  const [mutations, setMutations] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'ai' | 'stress'>('ai')
  const [isAiAuditing, setIsAiAuditing] = useState(false)
  const [aiReport, setAiReport] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    console.log('ThreatIntelligence mounted')
  }, [])

  const fetchAiAnalysis = async () => {
    setIsAnalyzing(true)
    try {
      const response = await fetch('http://localhost:8000/analyze-threats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scanData),
      })
      const data = await response.json()
      setAiAnalysis(data.analysis || 'Analysis unavailable.')
    } catch (error) {
      setAiAnalysis('AI Analysis engine offline. Verify OpenRouter API Key.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleMutate = async (val: string) => {
    setPassword(val)
    if (!val) {
      setMutations([])
      return
    }
    try {
      const response = await fetch('http://localhost:8000/mutate-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: val }),
      })
      const data = await response.json()
      setMutations(data.mutations || [])
    } catch (error) {
      console.error('Mutation failed')
    }
  }

  const handleDeepAudit = async () => {
    if (!password || mutations.length === 0) return
    setIsAiAuditing(true)
    try {
      const response = await fetch('http://localhost:8000/analyze-password-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, mutations }),
      })
      const data = await response.json()
      setAiReport(data)
    } catch (error) {
      console.error('AI Audit failed')
    } finally {
      setIsAiAuditing(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (password && mutations.length > 0) {
        handleDeepAudit()
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [password])

  useEffect(() => {
    if (activeTab === 'ai' && !aiAnalysis && !isAnalyzing) {
      fetchAiAnalysis()
    }
  }, [activeTab])

  if (!mounted) {
    return <div className="h-20 bg-primary/5 rounded-lg animate-pulse" />
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-primary/10 mb-2">
        <button
          onClick={() => setActiveTab('ai')}
          className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'ai' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Predictive Attack Scenario
        </button>
        <button
          onClick={() => setActiveTab('stress')}
          className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'stress' ? 'text-accent border-b-2 border-accent' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Credential Stress Test
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'ai' ? (
          <motion.div
            key="ai"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* AI Output */}
            <Card className="glass border-primary/20 p-8 flex flex-col justify-between min-h-[300px]">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Brain className="text-primary" size={24} />
                  </div>
                  <h3 className="text-xl font-bold font-mono tracking-tight">Grok Intelligence Audit</h3>
                </div>
                
                {isAnalyzing ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-6 bg-primary/5 animate-pulse rounded overflow-hidden relative">
                         <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                         />
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground italic">Consulting predictive threat models...</p>
                  </div>
                ) : (
                  <div className="space-y-4 text-sm text-foreground/80 leading-relaxed font-mono">
                    {aiAnalysis.split('\n').filter(l => l.trim()).map((line, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: -5 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ delay: i * 0.2 }}
                        className="flex gap-3"
                      >
                        <span className="text-primary font-bold">{i + 1}.</span>
                        <p>{line.replace(/^\d+\.\s*/, '')}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              
              {!isAnalyzing && (
                <div className="mt-8 pt-4 border-t border-primary/10 text-[10px] text-muted-foreground uppercase tracking-tighter">
                  Caution: AI predictions are probabilistic. These scenarios represent the most efficient path an attacker could take based on your current exposure score.
                </div>
              )}
            </Card>

            {/* Visualizer Placeholder */}
            <div className="hidden md:flex items-center justify-center relative">
               <div className="absolute inset-0 bg-primary/5 rounded-full blur-[100px] animate-pulse" />
               <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                className="relative z-10 w-64 h-64 border-2 border-dashed border-primary/20 rounded-full flex items-center justify-center"
               >
                 <div className="w-48 h-48 border-2 border-primary/40 rounded-full flex items-center justify-center">
                    <ShieldAlert className="text-primary animate-bounce" size={48} />
                 </div>
               </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="stress"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-6"
          >
            <Card className="glass border-accent/20 p-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Input Panel */}
                <div className="flex-1 space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Terminal className="text-accent" size={18} />
                      <h3 className="text-lg font-bold font-mono">Credential Stress Test</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Enter a base password pattern you commonly use to see how attackers will mutate it.
                    </p>
                    <div className="relative">
                       <Input 
                        placeholder="e.g. MyPassword2024"
                        value={password}
                        onChange={(e) => handleMutate(e.target.value)}
                        className="bg-black/40 border-accent/30 focus:border-accent text-accent font-mono py-6 pl-10"
                       />
                       <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-accent/40" size={16} />
                    </div>
                  </div>

                  {password && (
                    <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
                       <div className="text-[10px] uppercase font-bold text-accent mb-2 tracking-widest flex items-center gap-2">
                        <Zap size={10} /> Mutation Entropy Matrix
                       </div>
                       <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                          <div className="flex justify-between border-b border-accent/10 pb-1">
                             <span className="opacity-50">Variations:</span>
                             <span className="text-accent">{mutations.length}</span>
                          </div>
                          <div className="flex justify-between border-b border-accent/10 pb-1">
                             <span className="opacity-50">Exploitability:</span>
                             <span className={isAiAuditing ? "text-muted-foreground animate-pulse" : (aiReport ? "text-primary font-bold" : (mutations.some(m => m.difficulty === 'seconds') ? "text-destructive font-bold" : "text-primary font-bold"))}>
                                {isAiAuditing ? 'ANALYZING...' : (aiReport?.global_risk || (mutations.some(m => m.difficulty === 'seconds') ? 'CRITICAL' : 'MODERATE'))}
                             </span>
                          </div>
                       </div>
                    </div>
                  )}

                  {password && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-xs"
                    >
                      <div className="text-primary font-bold mb-1 uppercase tracking-tighter flex items-center gap-2">
                        {isAiAuditing ? (
                           <div className="w-2 h-2 border border-primary border-t-transparent rounded-full animate-spin" />
                        ) : (
                           <Brain size={12} />
                        )}
                        AI Adversary Verdict: {isAiAuditing ? 'Analyzing...' : (aiReport?.global_risk || 'Awaiting Input')}
                      </div>
                      <p className="text-muted-foreground italic">
                        {isAiAuditing ? 'Consulting predictive threat models...' : (aiReport?.summary || 'The AI will automatically audit your pattern for vulnerabilities.')}
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Real-time Matrix Output */}
                <div className="flex-1 min-h-[300px] bg-black/60 rounded-md border border-accent/10 p-4 font-mono text-xs overflow-y-auto max-h-[400px]">
                  {!password ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground/30 italic">
                      Awaiting target pattern initialization...
                    </div>
                  ) : (
                    <div className="space-y-2">
                       {mutations.map((m, i) => (
                         <motion.div 
                          key={i}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center justify-between group py-1 border-b border-white/5 hover:bg-accent/5 px-2"
                         >
                           <div className="flex items-center gap-3">
                             <span className="text-[10px] opacity-30">{String(i+1).padStart(2, '0')}</span>
                             <span className="text-accent group-hover:text-white transition-colors">{m.value}</span>
                           </div>
                           <div className="flex items-center gap-3">
                              <span className="text-[9px] opacity-40 uppercase">{m.type}</span>
                                <Badge 
                                variant={m.risk === 'High' ? 'destructive' : 'outline'} 
                                className={`text-[8px] h-4 px-1 ${m.risk !== 'High' ? 'border-accent/30 text-accent' : ''}`}
                              >
                                {m.difficulty}
                              </Badge>
                              {aiReport?.evaluations?.find((e: any) => e.value === m.value) && (
                                <Badge className="text-[8px] h-4 px-1 bg-primary/20 text-primary border-primary/30">
                                  AI {aiReport.evaluations.find((e: any) => e.value === m.value).ai_score}%
                                </Badge>
                              )}
                           </div>
                         </motion.div>
                       ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
