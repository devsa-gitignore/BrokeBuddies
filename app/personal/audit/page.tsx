'use client'

import { useEffect, useState } from 'react'
import { ThreatIntelligence } from '@/app/components/threat-intelligence'

export default function PersonalAuditPage() {
  const [scanData, setScanData] = useState<any>(null)

  useEffect(() => {
    const raw = localStorage.getItem('shadowself_scan_result')
    if (raw) setScanData(JSON.parse(raw))
  }, [])

  if (!scanData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm font-mono">
        No scan data found. <a href="/personal/scan" className="text-primary ml-2 underline">Run a scan first.</a>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-black tracking-tight mb-8"><span className="text-primary">Personal</span> Intelligence Audit</h1>
        <ThreatIntelligence scanData={scanData} />
      </div>
    </div>
  )
}
