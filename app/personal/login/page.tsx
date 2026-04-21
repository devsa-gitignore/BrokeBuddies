'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Mail, Lock, ArrowRight } from 'lucide-react'

export default function PersonalLoginPage() {
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
    router.push('/personal/scan')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 neo-box-primary mb-6">
            <User className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">
            <span className="text-primary">Personal</span> Scan
          </h1>
          <p className="text-muted-foreground text-sm">Map your digital footprint across the open web.</p>
        </div>

        {/* Card */}
        <div className="neo-box p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-background border-2 pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-all ${
                    errors.email ? 'border-destructive focus:shadow-[4px_4px_0px_0px_var(--destructive)]' : 'border-foreground focus:border-primary focus:shadow-[4px_4px_0px_0px_var(--primary)]'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-background border-2 pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-all ${
                    errors.password ? 'border-destructive focus:shadow-[4px_4px_0px_0px_var(--destructive)]' : 'border-foreground focus:border-primary focus:shadow-[4px_4px_0px_0px_var(--primary)]'
                  }`}
                />
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <button
              type="submit"
              className="neo-btn-primary w-full flex items-center justify-center gap-2 py-4 mt-4 text-base"
            >
              Continue to Scan <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
