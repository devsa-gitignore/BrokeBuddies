'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, User, Github, Globe } from 'lucide-react'

const links = [
  { href: '/personal/login', label: 'Personal', icon: User, base: '/personal' },
  { href: '/git/login', label: 'Git', icon: Github, base: '/git' },
  { href: '/domain/login', label: 'Domain', icon: Globe, base: '/domain' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-primary/10 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <Shield className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-bold font-mono text-foreground">
            <span className="text-primary">Shadow</span>Self
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon, base }) => {
            const active = pathname.startsWith(base)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold font-mono uppercase tracking-widest transition-all ${
                  active
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                <Icon className="w-3 h-3" />
                {label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
