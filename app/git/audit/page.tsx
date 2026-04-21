'use client'

import { Github, Key } from 'lucide-react'
import Link from 'next/link'

export default function GitAuditPage() {
  return (
    <div className="min-h-screen bg-background p-8 flex flex-col items-center justify-center">
      <Github className="w-12 h-12 text-chart-4 mb-4" />
      <h1 className="text-3xl font-black tracking-tight mb-2"><span className="text-chart-4">Git</span> Secrets Audit</h1>
      <p className="text-muted-foreground text-sm mb-6 text-center max-w-md">
        Detailed per-secret analysis and remediation advice will appear here after a repository scan.
      </p>
      <Link href="/git/scan" className="flex items-center gap-2 bg-chart-4 text-background font-bold px-6 py-3 rounded-lg hover:bg-chart-4/90 transition-all">
        <Key className="w-4 h-4" /> Run a Repo Scan
      </Link>
    </div>
  )
}
