import { motion } from 'motion/react';
import { Search, ArrowUpDown, Zap, CalendarDays, Sparkles, X, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HackathonCard } from '../../components/HackathonCard';
import { useState, useMemo, useEffect } from 'react';
import { getHackathons, StudentHackathon } from '../../services/student';

interface HackathonsPageProps {
  onSelectHackathon: (hackathonId: string) => void;
}

export function HackathonsPage({ onSelectHackathon }: HackathonsPageProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [hackathons, setHackathons] = useState<StudentHackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const domains = ['All', 'Web3', 'AI/ML', 'Fintech', 'Open Innovation', 'Healthtech'];

  useEffect(() => {
    const loadHackathons = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getHackathons();
        setHackathons(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unable to load hackathons');
      } finally {
        setLoading(false);
      }
    };

    loadHackathons();
  }, []);

  const filteredHackathons = useMemo(() => {
    return hackathons
      .filter((h) => {
        const matchesSearch =
          h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.hostedBy.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDomain =
          selectedDomain === 'All' || h.description.toLowerCase().includes(selectedDomain.toLowerCase());
        return matchesSearch && matchesDomain;
      })
      .sort((a, b) => {
        const dateA = new Date(a.startDate).getTime();
        const dateB = new Date(b.startDate).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [hackathons, searchQuery, selectedDomain, sortOrder]);

  const openHackathons = filteredHackathons.filter((h) => h.status === 'open' || h.status === 'ongoing');
  const upcomingHackathons = filteredHackathons.filter((h) => h.status === 'upcoming');

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate('/student/dashboard')}
          className="group flex items-center gap-2 text-zinc-600 hover:text-white transition-all"
        >
          <div className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center group-hover:border-violet-500/50 group-hover:bg-violet-500/10 transition-all">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Return to Dashboard</span>
        </motion.button>

        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800/80">
          <LayoutDashboard className="w-3 h-3 text-zinc-500" />
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Main Terminal</span>
          <span className="text-zinc-700">/</span>
          <span className="text-[9px] font-bold text-violet-400 uppercase tracking-widest">Hackathons</span>
        </div>
      </div>

      <div className="relative">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Global Registry</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">Arena</span>
          </h1>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${searchQuery ? 'text-violet-500' : 'text-zinc-600'}`} />
            <input
              type="text"
              placeholder="SEARCH BY NAME OR COLLEGE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-12 py-5 bg-zinc-900/40 border border-zinc-800/80 rounded-[2rem] text-xs font-bold text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:bg-zinc-900/60 transition-all uppercase tracking-widest"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className={`px-8 py-5 rounded-[2rem] border transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-widest ${
              sortOrder === 'oldest' ? 'bg-violet-500/10 border-violet-500 text-violet-400' : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'
            }`}
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
          </motion.button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {domains.map((domain) => (
          <button
            key={domain}
            onClick={() => setSelectedDomain(domain)}
            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
              selectedDomain === domain
                ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20'
                : 'bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
            }`}
          >
            {domain}
          </button>
        ))}
      </div>

      <div className="space-y-20 min-h-[400px]">
        {loading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Loading Arenas...</h3>
          </motion.div>
        ) : error ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
            <h3 className="text-2xl font-black text-rose-400 uppercase italic tracking-tighter">Failed to load</h3>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2">{error}</p>
          </motion.div>
        ) : filteredHackathons.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-800">
              <Search className="w-8 h-8 text-zinc-700" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">No Arenas Found</h3>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2">Try clearing your filters</p>
          </motion.div>
        ) : (
          <>
            {openHackathons.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-8 border-b border-zinc-900 pb-4">
                  <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                    <Zap className="w-6 h-6 text-amber-500 fill-amber-500" />
                    Live & Active <span className="text-zinc-700">({openHackathons.length})</span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {openHackathons.map((hackathon) => (
                    <HackathonCard key={hackathon.id} hackathon={hackathon} onClick={() => onSelectHackathon(hackathon.id)} />
                  ))}
                </div>
              </section>
            )}

            {upcomingHackathons.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-8 border-b border-zinc-900 pb-4">
                  <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                    <CalendarDays className="w-6 h-6 text-violet-500" />
                    Upcoming Ops
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {upcomingHackathons.map((hackathon) => (
                    <HackathonCard key={hackathon.id} hackathon={hackathon} onClick={() => onSelectHackathon(hackathon.id)} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

