'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { User, Github, Globe, ShieldAlert, ArrowRight, Lock, Eye, Terminal } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
}

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const features = [
  {
    icon: User,
    label: 'Personal Scan',
    color: 'text-primary',
    border: 'border-primary/20 hover:border-primary/50',
    glow: 'shadow-primary/10',
    href: '/personal/login',
    cta: 'Go to Personal Scan',
    description:
      'Map your full digital footprint. We cross-reference your email and social handles against breach databases (HIBP), discover your public profiles across 300+ platforms via Sherlock, and surface any leaked credentials or secrets.',
    badges: ['Breach Detection', 'Profile Discovery', 'Credential Exposure'],
  },
  {
    icon: Github,
    label: 'Git Scan',
    color: 'text-chart-4',
    border: 'border-chart-4/20 hover:border-chart-4/50',
    glow: 'shadow-chart-4/10',
    href: '/git/login',
    cta: 'Go to Git Scan',
    description:
      'Run Trufflehog against any public GitHub repository to detect hardcoded secrets, API keys, tokens, and credentials committed to version history — even if they were deleted from the latest commit.',
    badges: ['Secret Detection', 'API Key Leaks', 'Commit History'],
  },
  {
    icon: Globe,
    label: 'Domain Scan',
    color: 'text-accent',
    border: 'border-accent/20 hover:border-accent/50',
    glow: 'shadow-accent/10',
    href: '/domain/login',
    cta: 'Go to Domain Scan',
    description:
      'Identify the weakest link across an entire organisation. Provide a company domain and ShadowSelf will enumerate all associated employee emails, run concurrent OSINT scans, and rank individuals by exposure risk.',
    badges: ['Weakest Link Analysis', 'Employee Exposure', 'Bulk OSINT'],
  },
]

const stats = [
  { value: '15B+', label: 'Records Breached (2024)' },
  { value: '33%', label: 'of breaches use stolen creds' },
  { value: '287', label: 'Days avg. breach detection time' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(#00ff41 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />
      {/* Glow orb */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-6 py-24">
        <Section className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 border border-primary/20 rounded-full px-4 py-1.5 mb-8 bg-primary/5">
            <ShieldAlert className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-mono text-primary tracking-widest uppercase">OSINT Intelligence Platform</span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-none">
            <span className="text-primary">Shadow</span>
            <span className="text-foreground">Self</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed">
            Every login you've ever made, every platform you've touched — your digital shadow exists whether you manage it or not.
          </motion.p>

          <motion.p variants={fadeUp} className="text-base text-muted-foreground/70 max-w-xl mx-auto mb-12 leading-relaxed">
            Data breaches expose billions of credentials every year. Attackers use this leaked data to access accounts, steal identities, and infiltrate organisations.{' '}
            <span className="text-foreground font-semibold">ShadowSelf maps your exposure before they do.</span>
          </motion.p>

          {/* Stats */}
          <motion.div variants={stagger} className="flex flex-wrap justify-center gap-10 mb-14">
            {stats.map(({ value, label }) => (
              <motion.div key={label} variants={fadeUp} className="text-center">
                <div className="text-3xl font-black text-primary font-mono mb-1">{value}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest">{label}</div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
            <Link
              href="/personal/login"
              className="flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40"
            >
              Start Scanning <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/domain/login"
              className="flex items-center gap-2 border border-muted text-muted-foreground font-bold px-6 py-3 rounded-lg hover:border-foreground hover:text-foreground transition-all"
            >
              Enterprise Mode <Globe className="w-4 h-4" />
            </Link>
          </motion.div>
        </Section>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/40"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <span className="text-[10px] font-mono uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-muted-foreground/40 to-transparent" />
        </motion.div>
      </section>

      {/* ── Why It Matters ── */}
      <section className="px-6 py-24 border-t border-primary/5">
        <Section className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-primary/60 uppercase tracking-widest mb-4">
              <Lock className="w-3 h-3" /> The Threat Is Real
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
              Your data is already out there.
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              When a service is breached, your email, password hash, and personal details get packaged and sold on dark web markets within hours. Attackers use credential stuffing to try those leaked passwords across hundreds of other platforms — automatically.
            </p>
          </motion.div>

          <motion.div variants={stagger} className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Eye, title: 'You Are Visible', body: 'Your profiles, handles, and email addresses are publicly indexed across the web, whether you remember creating those accounts or not.' },
              { icon: ShieldAlert, title: 'Breaches Are Silent', body: "Most people don't find out their credentials were leaked until an attacker has already used them. Detection gaps average 9+ months." },
              { icon: Terminal, title: 'Secrets Get Committed', body: "API keys, tokens, and passwords accidentally pushed to GitHub repositories persist forever in commit history — even after being deleted." },
            ].map(({ icon: Icon, title, body }) => (
              <motion.div key={title} variants={fadeUp} className="p-6 border border-white/5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                <Icon className="w-6 h-6 text-primary mb-4" />
                <h3 className="font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </motion.div>
        </Section>
      </section>

      {/* ── Features ── */}
      <section className="px-6 py-24 border-t border-primary/5">
        <Section className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-primary/60 uppercase tracking-widest mb-4">
              <ShieldAlert className="w-3 h-3" /> Choose Your Scan Mode
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">
              Three attack surfaces. One platform.
            </h2>
          </motion.div>

          <motion.div variants={stagger} className="grid md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, label, color, border, glow, href, cta, description, badges }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                className={`relative flex flex-col p-8 border ${border} rounded-2xl bg-white/[0.02] shadow-xl ${glow} hover:bg-white/[0.04] transition-all group`}
              >
                <div className="mb-6">
                  <Icon className={`w-8 h-8 ${color} mb-4`} />
                  <h3 className="text-xl font-black tracking-tight mb-3">{label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  {badges.map((b) => (
                    <span key={b} className={`text-[10px] font-bold font-mono uppercase tracking-widest px-2 py-1 rounded border border-white/10 bg-white/5 ${color}`}>
                      {b}
                    </span>
                  ))}
                </div>

                <Link
                  href={href}
                  className={`mt-auto flex items-center justify-between w-full px-5 py-3 rounded-lg border ${border} font-bold text-sm transition-all group-hover:bg-white/5`}
                >
                  <span className={color}>{cta}</span>
                  <ArrowRight className={`w-4 h-4 ${color} group-hover:translate-x-1 transition-transform`} />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </Section>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-primary/5 px-6 py-10 text-center">
        <p className="text-xs font-mono text-muted-foreground/40 uppercase tracking-widest">
          ShadowSelf · For educational & authorised security research only
        </p>
      </footer>
    </div>
  )
}
