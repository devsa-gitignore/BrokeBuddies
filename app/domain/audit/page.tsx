'use client'

import { Globe, BarChart2 } from 'lucide-react'
import Link from 'next/link'

export default function DomainAuditPage() {
  return (
    <div className="min-h-screen bg-background p-8 flex flex-col items-center justify-center">
      <Globe className="w-12 h-12 text-accent mb-4" />
      <h1 className="text-3xl font-black tracking-tight mb-2"><span className="text-accent">Domain</span> Audit Report</h1>
      <p className="text-muted-foreground text-sm mb-6 text-center max-w-md">
        Full organisational exposure rankings and employee-level threat intelligence will be displayed here after a domain scan completes.
      </p>
      <Link href="/domain/scan" className="flex items-center gap-2 bg-accent text-accent-foreground font-bold px-6 py-3 rounded-lg hover:bg-accent/90 transition-all">
        <BarChart2 className="w-4 h-4" /> Run a Domain Scan
      </Link>
    </div>
  )
}
