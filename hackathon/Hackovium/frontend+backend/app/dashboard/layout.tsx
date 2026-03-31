import { UserButton } from '@clerk/nextjs';
import VoxelBackground from '@/components/VoxelBackground';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <VoxelBackground />
      <header className="p-4 flex justify-between items-center bg-retro-black/80 border-b-2 border-retro-purple z-10">
        <h1 className="text-2xl text-retro-green tracking-widest">REPO_REVIEWER_OS</h1>
        <UserButton />
      </header>
      <main className="flex-1 overflow-hidden z-10">
        {children}
      </main>
    </div>
  );
}
