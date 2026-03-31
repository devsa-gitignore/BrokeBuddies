'use client';

import Link from 'next/link';
import { SignInButton, useUser } from '@clerk/nextjs';
import VoxelBackground from '@/components/VoxelBackground';

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <VoxelBackground />
      <div className="z-10 text-center p-8 bg-retro-black/80 pixel-border max-w-3xl w-full mx-4">
        <h1 className="text-5xl md:text-7xl text-retro-purple mb-6 glitch-text" data-text="REPO REVIEWER">
          REPO REVIEWER
        </h1>
        <p className="text-xl md:text-2xl text-retro-green mb-12">
          THE ULTIMATE HACKATHON JUDGING TOOL
        </p>

        {!isLoaded ? (
          <div className="text-retro-green text-xl animate-pulse">LOADING...</div>
        ) : isSignedIn ? (
          <div className="mb-4">
            <Link href="/dashboard" className="inline-block bg-retro-purple text-white px-12 py-6 text-2xl pixel-shadow pixel-shadow-hover">
              CONTINUE GAME
            </Link>
          </div>
        ) : (
          <div>
            <SignInButton>
              <button className="bg-retro-green text-black px-12 py-6 text-2xl pixel-shadow-green pixel-shadow-green-hover">
                START GAME (LOGIN)
              </button>
            </SignInButton>
          </div>
        )}
      </div>
    </div>
  );
}