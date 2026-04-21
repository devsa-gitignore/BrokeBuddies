'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Github, Mail, Lock, ArrowRight } from 'lucide-react'

export default function GitLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!email.trim()) errs.email = 'Email is required'
    if (!password.trim()) errs.password = 'Password is required'
    if (Object.keys(errs).length) { setErrors(errs); return }
    router.push('/git/scan')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-chart-4/5 via-transparent to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-chart-4/10 border border-chart-4/20 mb-4">
            <Github className="w-6 h-6 text-chart-4" />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">
            <span className="text-chart-4">Git</span> Scan
          </h1>
          <p className="text-muted-foreground text-sm">Detect secrets and leaked keys in any public repository.</p>
        </div>

        <div className="border border-chart-4/10 rounded-2xl bg-white/[0.02] backdrop-blur-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-black/40 border rounded-lg pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors ${
                    errors.email ? 'border-destructive' : 'border-white/10 focus:border-chart-4/50'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-black/40 border rounded-lg pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors ${
                    errors.password ? 'border-destructive' : 'border-white/10 focus:border-chart-4/50'
                  }`}
                />
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-chart-4 text-background font-bold py-3 rounded-lg hover:bg-chart-4/90 transition-all shadow-lg shadow-chart-4/20 mt-2"
            >
              Continue to Scan <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
