'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, User, Github, Globe } from 'lucide-react'

const links = [
  { 
    href: '/personal/scan', 
    label: 'Personal', 
    icon: User, 
    base: '/personal',
    color: 'text-primary',
    border: 'border-primary',
    bg: 'bg-primary',
    shadow: 'shadow-primary'
  },
  { 
    href: '/git/scan', 
    label: 'Git', 
    icon: Github, 
    base: '/git',
    color: 'text-blue-500',
    border: 'border-blue-500',
    bg: 'bg-blue-500',
    shadow: 'shadow-blue-500'
  },
  { 
    href: '/domain/scan', 
    label: 'Domain', 
    icon: Globe, 
    base: '/domain',
    color: 'text-orange-500',
    border: 'border-orange-500',
    bg: 'bg-orange-500',
    shadow: 'shadow-orange-500'
  },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b-2 border-foreground bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <Shield className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-pixel text-l text-foreground uppercase tracking-wider mt-1">
            <span className="text-primary">SHADOW</span>SELF
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-3">
          {links.map(({ href, label, icon: Icon, base, color, border, bg, shadow }) => {
            const active = pathname.startsWith(base)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 border-2 text-[11px] font-bold font-mono uppercase tracking-widest transition-all ${active
                  ? `${border} ${bg} text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]`
                  : `border-transparent ${color} hover:border-current hover:shadow-[2px_2px_0px_0px_currentColor]`
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
