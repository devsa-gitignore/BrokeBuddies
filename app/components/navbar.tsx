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
    <nav className="fixed top-0 left-0 right-0 z-50 border-b-2 border-foreground bg-background">
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
          {links.map(({ href, label, icon: Icon, base }) => {
            const active = pathname.startsWith(base)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 border-2 text-l font-bold font-mono uppercase tracking-widest transition-all ${active
                  ? 'border-primary bg-primary text-primary-foreground shadow-[2px_2px_0px_0px_var(--primary)]'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-foreground hover:shadow-[2px_2px_0px_0px_var(--foreground)]'
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
