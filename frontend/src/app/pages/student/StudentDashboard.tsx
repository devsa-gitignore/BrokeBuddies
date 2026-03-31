import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Users, Clock, Bell, ArrowRight, Sparkles, Zap } from 'lucide-react';
import { mockNotifications } from '../../data/mockData';
import { HackathonCard } from '../../components/HackathonCard';
import { getHackathons, getMyTeams, StudentHackathon } from '../../services/student';

interface StudentDashboardProps {
  onNavigateToHackathon: (hackathonId: string) => void;
}

export function StudentDashboard({ onNavigateToHackathon }: StudentDashboardProps) {
  const [hackathons, setHackathons] = useState<StudentHackathon[]>([]);
  const [teamCount, setTeamCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getHackathons();
        setHackathons(data);

        const open = data.filter((h) => h.status !== 'closed');
        if (open[0]?.id) {
          const myTeams = await getMyTeams(open[0].id).catch(() => []);
          setTeamCount(myTeams.length);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unable to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const activeHackathons = useMemo(() => hackathons.filter((h) => h.status !== 'closed'), [hackathons]);

  return (
    <div className="space-y-12 pb-20">
      <div className="relative">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Student Terminal</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">
            Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500 text-6xl">Back</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-2 font-medium">Monitoring your active missions.</p>
        </motion.div>
      </div>

      {error && <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active Missions', value: activeHackathons.length, icon: Trophy, color: 'from-violet-500 to-fuchsia-600', shadow: 'shadow-violet-500/10' },
          { label: 'Squads Joined', value: teamCount, icon: Users, color: 'from-cyan-500 to-blue-600', shadow: 'shadow-cyan-500/10' },
          { label: 'Intel Alerts', value: unreadCount, icon: Bell, color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -5, borderColor: 'rgba(255,255,255,0.1)' }}
            className={`group bg-zinc-900/20 border border-zinc-800/60 rounded-[2.5rem] p-8 relative overflow-hidden transition-all ${stat.shadow}`}
          >
            <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-5 blur-3xl group-hover:opacity-20 transition-opacity`} />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{stat.label}</p>
                <h3 className="text-5xl font-black text-white italic tracking-tighter">{stat.value}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-12">
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-black uppercase italic tracking-tight">Open Arenas</h2>
            </div>

            {loading ? (
              <div className="text-zinc-400 text-sm">Loading hackathons...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeHackathons.slice(0, 4).map((hackathon) => (
                  <HackathonCard key={hackathon.id} hackathon={hackathon} onClick={() => onNavigateToHackathon(hackathon.id)} />
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-12">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black uppercase italic tracking-tight text-white">Live Intel</h2>
              <span className="px-2 py-0.5 bg-rose-500 text-white text-[9px] font-black rounded uppercase tracking-tighter">Live</span>
            </div>
            <div className="space-y-3">
              {mockNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  whileHover={{ x: 5 }}
                  className={`p-5 rounded-3xl bg-zinc-900/20 border transition-colors ${notification.read ? 'border-zinc-800/50' : 'border-violet-500/30 bg-violet-500/5'}`}
                >
                  <p className="text-white text-xs font-bold leading-relaxed mb-2">{notification.message}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase">{new Date(notification.timestamp).toLocaleTimeString()}</span>
                    {!notification.read && <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-lg shadow-violet-500/50" />}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section>
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-rose-500/10 to-transparent border border-rose-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:rotate-12 transition-transform">
                <Clock className="w-12 h-12 text-rose-500" />
              </div>
              <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] mb-4">Critical Deadline</h3>
              <p className="text-white font-black italic uppercase tracking-tighter text-xl mb-1">Round 1 Submission</p>
              <p className="text-zinc-400 text-xs mb-4">Check selected hackathon timeline</p>
              <button onClick={() => onNavigateToHackathon(activeHackathons[0]?.id || '')} className="text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-white flex items-center gap-2">
                Open Hackathon <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

