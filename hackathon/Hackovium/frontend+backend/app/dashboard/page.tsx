'use client';

import { useState, useRef, useCallback } from 'react';
import { Menu, X, AlertTriangle } from 'lucide-react';
import gsap from 'gsap';
import FileTree from '@/components/FileTree';
import CommitHistory from '@/components/CommitHistory';
import RetroChat from '@/components/RetroChat';
import PixelRatingModal from '@/components/PixelRatingModal';

export default function Dashboard() {
  const [stage, setStage] = useState<1 | 2>(1);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [repoData, setRepoData] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [chatLogs, setChatLogs] = useState<any[]>([]);

  const scanTextRef = useRef<HTMLDivElement>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setError('');

    if (scanTextRef.current) {
      gsap.to(scanTextRef.current, {
        x: () => Math.random() * 10 - 5,
        y: () => Math.random() * 10 - 5,
        duration: 0.1,
        repeat: -1,
        yoyo: true,
      });
    }

    try {
      const res = await fetch('/api/repo-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to scan repository');

      setRepoData(data);
      if (data.passed) {
        setStage(2);
      } else {
        setError('GAME OVER: FAILED CHECKS (PLAGIARISM DETECTED)');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      if (scanTextRef.current) gsap.killTweensOf(scanTextRef.current);
    }
  };

  const handleFinish = async (rating: number) => {
    try {
      const res = await fetch('/api/save-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl: url,
          rating,
          chatLogs,
        }),
      });
      
      if (res.ok) {
      setShowRating(false);
      setStage(1);
      setUrl('');
      setRepoData(null);
      setChatLogs([]);
      window.location.href = '/dashboard/history';
}
    } catch (err) {
      console.error(err);
      alert('FAILED TO SAVE REVIEW');
    }
  };

  // Fix 4: memoize so RetroChat doesn't infinite loop
  const handleChatUpdate = useCallback((msgs: any[]) => setChatLogs(msgs), []);

  // Fix 9: trim repoContext before passing to chat
  const repoContext = repoData ? JSON.stringify({
    tree: repoData.tree?.slice(0, 50).map((t: any) => t.path),
    readme: repoData.readmeContent,
    metrics: repoData.metrics,
  }) : '';

  return (
    <div className="h-full flex relative">
      {/* Sidebar */}
      {stage === 2 && (
        <>
          <button 
            className="md:hidden absolute top-4 left-4 z-50 bg-retro-purple p-2 pixel-border"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X /> : <Menu />}
          </button>
          
          <div className={`
            absolute md:static inset-y-0 left-0 w-80 bg-retro-black z-40 transform transition-transform duration-300 ease-in-out flex flex-col p-4 border-r-2 border-retro-purple
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-hidden">
                <FileTree tree={repoData?.tree} />
              </div>
              <div className="flex-1 overflow-hidden mt-4">
                <CommitHistory commits={repoData?.commits} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-4 md:p-8">
        {stage === 1 && (
          <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
            <h2 className="text-4xl md:text-6xl text-retro-purple mb-12 text-center glitch-text" data-text="ENTER REPOSITORY">
              ENTER REPOSITORY
            </h2>
            
            {error ? (
              <div className="bg-retro-red/20 pixel-border-red p-8 text-center w-full">
                <AlertTriangle className="w-16 h-16 text-retro-red mx-auto mb-4" />
                <h3 className="text-2xl text-retro-red mb-8">{error}</h3>
                <button 
                  onClick={() => setError('')}
                  className="bg-retro-red text-white px-8 py-4 pixel-shadow-red pixel-shadow-red-hover text-xl"
                >
                  TRY AGAIN
                </button>
              </div>
            ) : (
              <form onSubmit={handleScan} className="w-full flex flex-col gap-8">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo"
                  className="w-full bg-retro-black pixel-border p-6 text-xl text-white outline-none focus:pixel-border-green placeholder:text-gray-600"
                  required
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-retro-purple text-white px-8 py-6 text-2xl pixel-shadow pixel-shadow-hover disabled:opacity-50 flex justify-center items-center"
                >
                  {loading ? (
                    <div ref={scanTextRef} className="text-retro-green">SCANNING...</div>
                  ) : (
                    'SCAN'
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {stage === 2 && (
          <div className="flex-1 flex flex-col h-full gap-4">
            {/* Top Panel: Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-retro-black/80 pixel-border p-4 text-center">
                <div className="text-gray-500 text-sm mb-1">LANGUAGE</div>
                <div className="text-retro-green text-xl">{repoData?.metrics.mainLanguage}</div>
              </div>
              <div className="bg-retro-black/80 pixel-border p-4 text-center">
                <div className="text-gray-500 text-sm mb-1">FILES</div>
                <div className="text-retro-purple text-xl">{repoData?.metrics.fileCount}</div>
              </div>
              <div className="bg-retro-black/80 pixel-border p-4 text-center">
                <div className="text-gray-500 text-sm mb-1">LINES OF CODE</div>
                <div className="text-retro-purple text-xl">{repoData?.metrics.linesOfCode}</div>
              </div>
              <div className="bg-retro-black/80 pixel-border p-4 text-center">
                <div className="text-gray-500 text-sm mb-1">PLAGIARISM</div>
                <div className="text-retro-green text-xl">{repoData?.plagiarismScore}%</div>
              </div>
            </div>

            {/* Bottom Panel: Chat */}
            <div className="flex-1 overflow-hidden">
              <RetroChat 
                repoContext={repoContext}
                onChatUpdate={handleChatUpdate}
              />
            </div>

            {/* Finish Button */}
            <button 
              onClick={() => setShowRating(true)}
              className="bg-retro-green text-black px-8 py-4 text-xl pixel-shadow-green pixel-shadow-green-hover w-full animate-pulse"
            >
              FINISH REVIEW
            </button>
          </div>
        )}
      </div>

      {showRating && (
        <PixelRatingModal 
          onSubmit={handleFinish}
          onCancel={() => setShowRating(false)}
        />
      )}
    </div>
  );
}