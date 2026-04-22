import type { Metadata } from 'next'
import { Geist, Geist_Mono, Press_Start_2P } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Navbar } from './components/navbar'
import TargetCursor from './components/animations/TargetCursor'
import './globals.css'

const _geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const _geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
const _pixel = Press_Start_2P({ subsets: ["latin"], weight: "400", variable: "--font-pixel" });

export const metadata: Metadata = {
  title: 'ShadowSelf - OSINT Dashboard',
  description: 'Advanced OSINT intelligence dashboard for digital footprint analysis',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark bg-background ${_geist.variable} ${_geistMono.variable} ${_pixel.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <TargetCursor targetSelector="a, button, input, textarea, select, .cursor-target, .neo-box, .neo-btn" />
        <Navbar />
        <div className="pt-14">{children}</div>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
