'use client';

import { GitCommit } from 'lucide-react';

interface Commit {
  sha: string;
  message: string;
  author: string;
}

export default function CommitHistory({ commits }: { commits: Commit[] }) {
  if (!commits || commits.length === 0) return <div className="text-gray-500">No commits found.</div>;

  return (
    <div className="p-4 pixel-border bg-retro-black/80 h-full overflow-y-auto mt-4">
      <h3 className="text-retro-purple mb-4 text-xl">COMMITS</h3>
      <ul className="space-y-4">
        {commits.map((commit, i) => (
          <li key={i} className="flex items-start gap-2 text-sm border-b border-retro-purple-dark pb-2">
            <GitCommit className="w-4 h-4 text-retro-green mt-1 shrink-0" />
            <div className="flex flex-col overflow-hidden">
              <span className="text-retro-green truncate">{commit.sha.substring(0, 7)}</span>
              <span className="truncate">{commit.message}</span>
              <span className="text-gray-500 text-xs truncate">by {commit.author}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
