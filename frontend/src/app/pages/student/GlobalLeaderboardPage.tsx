import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Trophy, TrendingUp, Medal, Sparkles, BarChart3, Users, Zap, Globe } from 'lucide-react';
import { getCurrentUserProfile, getGlobalLeaderboard, GlobalLeaderboardEntry } from '../../services/student';

export function GlobalLeaderboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [entries, setEntries] = useState<GlobalLeaderboardEntry[]>([]);
  const [myScore, setMyScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      setError('');
      try {
        const leaderboard = await getGlobalLeaderboard();
        setEntries(leaderboard);

        // Profile is secondary for this page; leaderboard should still load if profile fails.
        try {
          const profile = await getCurrentUserProfile();
          setMyScore(profile?.hackScore || 0);
        } catch {
          setMyScore(0);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unable to synchronize leaderboard data');
      } finally {
        setLoading(false);
      }
    };
    loadLeaderboard();
  }, []);

  const filtered = useMemo(
    () => entries.filter((entry) => (entry.name || '').toLowerCase().includes(searchQuery.toLowerCase())),
    [entries, searchQuery],
  );

  const userRank = useMemo(() => {
    const rank = entries.findIndex((entry) => entry.hackScore === myScore);
    return rank >= 0 ? rank + 1 : '-';
  }, [entries, myScore]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Zap className="w-12 h-12 text-violet-500 animate-pulse" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Syncing Global Intel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 max-w-6xl mx-auto">
      {/* ══════════ Header ══════════ */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-violet-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Global Command Terminal</span>
        </div>
        <h1 className="text-6xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">
          Hack <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">Score</span>
        </h1>
        <p className="text-zinc-400 text-sm mt-4 font-medium max-w-xl">
          Elite operatives across the HackFire network. Rankings are recalculated in real-time based on tactical performance.
        </p>
      </motion.div>

      {/* ══════════ Error Handle ══════════ */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            className="px-6 py-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-3"
          >
            <Zap className="w-4 h-4" /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════ Your Identity Card ══════════ */}
      <div className="bg-zinc-900/20 rounded-[2.5rem] p-10 border border-zinc-800/60 relative overflow-hidden group">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-600/5 blur-[100px]" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between relative z-10 gap-8">
          <div>
            <div className="flex items-baseline gap-4">
              <span className="text-7xl font-black text-white italic tracking-tighter">#1</span>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter italic">Rising</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800 text-center min-w-[140px] shadow-xl">
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">HackScore</p>
              <p className="text-4xl font-black text-violet-400 italic">250</p>
            </div>
            <div className="hidden lg:block">
               <Medal className="w-32 h-32 text-violet-500 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ Search Dock ══════════ */}
      <div className="relative group max-w-md">
        <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${searchQuery ? 'text-violet-500' : 'text-zinc-600'}`} />
        <input
          type="text"
          placeholder="FILTER OPERATIVE INTEL..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-6 py-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl text-[10px] font-black text-white placeholder-zinc-700 focus:outline-none focus:border-violet-500 transition-all uppercase tracking-widest"
        />
      </div>

      {/* ══════════ Leaderboard Terminal ══════════ */}
      <div className="bg-zinc-900/20 rounded-[2.5rem] border border-zinc-800/60 overflow-hidden">
        <div className="p-8 border-b border-zinc-800/60 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-3">
             <BarChart3 className="w-5 h-5 text-violet-500" />
             <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Elite Standings</h2>
          </div>
          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">{entries.length} Active Operatives</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-950/50">
                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Rank</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Operative Identification</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">HackScore</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student, index) => {
                const isUser = student.hackScore === myScore;
                return (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`border-b border-zinc-800/40 group transition-all ${
                      isUser ? 'bg-violet-500/5' : 'hover:bg-zinc-800/20'
                    }`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        {index < 3 ? (
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black italic text-lg ${
                            index === 0 ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 
                            index === 1 ? 'bg-zinc-300 text-black' : 
                            'bg-orange-600 text-white'
                          }`}>
                            {index + 1}
                          </div>
                        ) : (
                          <span className={`text-lg font-black italic ${isUser ? 'text-violet-400' : 'text-zinc-700'}`}>
                            #{index + 1}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl border-2 overflow-hidden transition-transform group-hover:scale-110 ${
                          isUser ? 'border-violet-500 shadow-lg shadow-violet-500/20' : 'border-zinc-800 group-hover:border-zinc-700'
                        }`}>
                          {student.avatar ? (
                            <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-zinc-500 font-black">
                              {(student.name || '?').charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className={`text-lg font-black uppercase italic tracking-tighter ${isUser ? 'text-violet-400' : 'text-white'}`}>
                            {student.name}
                          </span>
                          {isUser && <p className="text-[9px] font-black text-violet-500 uppercase tracking-widest mt-1">DJS UNICODE MENTEE</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                         <span className={`text-2xl font-black italic tracking-tighter ${isUser ? 'text-violet-400' : 'text-white'}`}>
                          {student.hackScore}
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
