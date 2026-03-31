import type {Metadata} from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { VT323 } from 'next/font/google';
import './globals.css'; // Global styles

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-vt323',
});

export const metadata: Metadata = {
  title: 'GitHub Repo Reviewer',
  description: 'Retro Game Pixel GitHub Repo Reviewer',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${vt323.variable} font-sans`}>
        <body suppressHydrationWarning className="bg-retro-black text-white font-vt323 antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
