import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Clock, Users, FileText, Award, ArrowLeft, Upload, UserCheck, Sparkles, Send, ChevronRight, Target, ShieldCheck, Zap } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { CountdownTimer } from '../../components/CountdownTimer';
import { getHackathonById, registerForHackathon, StudentHackathon } from '../../services/student';

interface HackathonDetailPageProps {
  hackathonId?: string;
  onBack: () => void;
  onMyTeam: () => void;
  onRound1Details: () => void;
  onMentorSelection: () => void;
  onCampusEvent: () => void;
  onFinalSubmission: () => void;
}

export function HackathonDetailPage({
  hackathonId,
  onBack,
  onMyTeam,
  onRound1Details,
  onMentorSelection,
  onCampusEvent,
  onFinalSubmission,
}: HackathonDetailPageProps) {
  const params = useParams();
  const effectiveHackathonId = params.hackathonId || hackathonId || '';

  const [hackathon, setHackathon] = useState<StudentHackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (!effectiveHackathonId) return;

    const loadHackathon = async () => {
      setLoading(true);
      setMessage('');
      try {
        const data = await getHackathonById(effectiveHackathonId);
        setHackathon(data);
        localStorage.setItem('selectedHackathonId', data.id);
      } catch (e) {
        setMessage(e instanceof Error ? e.message : 'Unable to load hackathon data');
      } finally {
        setLoading(false);
      }
    };

    loadHackathon();
  }, [effectiveHackathonId]);

  const handleRegister = async () => {
    if (!hackathon) return;
    setRegistering(true);
    setMessage('');
    try {
      const result = await registerForHackathon(hackathon.id);
      setMessage(result.message || 'Registration request acknowledged by command.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Registration sync failed');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Zap className="w-12 h-12 text-violet-500 animate-pulse" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Syncing Mission Intel...</p>
      </div>
    );
  }

  if (!hackathon) {
    return <div className="text-rose-500 font-black uppercase italic p-20 text-center tracking-widest">Error: Asset Not Found</div>;
  }

  return (
    <div className="space-y-12 pb-20">
      {/* ══════════ Exit Protocol ══════════ */}
      <motion.button 
        whileHover={{ x: -4 }}
        onClick={onBack} 
        className="group flex items-center gap-3 text-zinc-500 hover:text-white transition-all"
      >
        <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center group-hover:border-violet-500/50 group-hover:bg-violet-500/10 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </div>
        <div className="flex flex-col items-start leading-none">
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Exit Terminal</span>
          <span className="text-[9px] font-bold text-zinc-600 uppercase mt-1">Back to Rankings</span>
        </div>
      </motion.button>

      {/* ══════════ Hero Section ══════════ */}
      <div className="relative h-[480px] rounded-[3.5rem] overflow-hidden border-2 border-zinc-900 group shadow-2xl">
        {hackathon.bannerImage ? (
          <img src={hackathon.bannerImage} alt={hackathon.name} className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000" />
        ) : (
          <div className="w-full h-full bg-zinc-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />

        <div className="absolute bottom-0 left-0 p-16 w-full flex flex-col md:flex-row md:items-end justify-between gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="px-4 py-1.5 bg-violet-600 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.4)]">
                <span className="text-[10px] font-black uppercase tracking-widest text-white italic">Featured Ops</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Mission Active</span>
            </div>
            <h1 className="text-7xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-none mb-6">
              {hackathon.name}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-5 py-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                <MapPin className="w-4 h-4 text-violet-500" />
                <span className="text-xs font-black uppercase tracking-widest text-zinc-200">{hackathon.hostedBy}</span>
              </div>
            </div>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRegister}
            disabled={registering || !hackathon.isRegistrationOpen}
            className="px-14 py-6 rounded-full bg-white text-black font-black uppercase italic tracking-tighter text-lg flex items-center gap-4 shadow-2xl disabled:bg-zinc-800 disabled:text-zinc-600 transition-all"
          >
            {registering ? 'Processing...' : (hackathon.isRegistrationOpen ? 'Deploy Credentials' : 'Ops Closed')}
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </div>
      </div>

      {/* ══════════ Command Dock ══════════ */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { icon: Users, label: 'SQUAD', action: onMyTeam },
          { icon: Target, label: 'INTEL', action: onRound1Details },
          { icon: UserCheck, label: 'EXPERTS', action: onMentorSelection },
          { icon: Send, label: 'FINAL PUSH', action: onFinalSubmission },
        ].map((btn, i) => (
          <motion.button
            key={i}
            whileHover={{ y: -5, borderColor: '#8B5CF6' }}
            onClick={btn.action}
            className="flex flex-col items-center justify-center gap-3 p-8 rounded-[2.5rem] bg-zinc-900/20 border border-zinc-800/60 backdrop-blur-xl transition-all group"
          >
            <btn.icon className="w-6 h-6 text-zinc-600 group-hover:text-violet-500 transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-white transition-colors">{btn.label}</span>
          </motion.button>
        ))}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCampusEvent}
          className="relative col-span-1 md:col-span-1 flex flex-col items-center justify-center gap-3 p-8 rounded-[2.5rem] font-black text-black text-xs uppercase italic tracking-tighter overflow-hidden group shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 animate-gradient-x" />
          <Sparkles className="w-8 h-8 relative z-10 animate-pulse" />
          <span className="relative z-10 text-center leading-tight">Venue<br/>Terminal</span>
        </motion.button>
      </div>

      {message && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-8 py-4 rounded-2xl bg-zinc-950 border border-violet-500/30 text-violet-400 text-[10px] font-black uppercase tracking-widest text-center italic shadow-[0_0_20px_rgba(139,92,246,0.1)]">
          &gt; {message}
        </motion.div>
      )}

      {/* ══════════ Tactical Intel Grid ══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <section className="bg-zinc-900/20 rounded-[3rem] p-12 border border-zinc-800/60 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <FileText className="w-40 h-40 text-violet-500" />
            </div>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-8 flex items-center gap-4">
              <FileText className="w-6 h-6 text-violet-500" /> Mission Briefing
            </h2>
            <p className="text-zinc-400 leading-relaxed font-medium text-base max-w-2xl">{hackathon.description}</p>
          </section>

          <div className="grid md:grid-cols-2 gap-10">
            <section className="bg-zinc-900/20 rounded-[3rem] p-10 border border-zinc-800/60">
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-8 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-violet-500" /> Security Protocol
              </h2>
              <ul className="space-y-6">
                {hackathon.rules.length > 0 ? (
                  hackathon.rules.map((rule, index) => (
                    <li key={index} className="flex items-start gap-4 text-[11px] font-bold text-zinc-500 leading-relaxed uppercase tracking-tight group">
                      <span className="text-violet-500 mt-1 shrink-0 font-black">/</span>
                      {rule}
                    </li>
                  ))
                ) : (
                  <li className="text-zinc-700 text-[10px] font-black uppercase tracking-widest italic">Protocol pending release...</li>
                )}
              </ul>
            </section>

            <section className="bg-zinc-900/20 rounded-[3rem] p-10 border border-zinc-800/60">
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-8 flex items-center gap-3">
                <Clock className="w-5 h-5 text-violet-500" /> Mission Timeline
              </h2>
              <div className="space-y-10 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-800">
                {hackathon.timeline.map((item, index) => (
                  <div key={index} className="flex items-start gap-8 relative z-10 group">
                    <div className="w-4 h-4 bg-[#050505] border-2 border-violet-500 rounded-full mt-1 shrink-0 group-hover:scale-125 transition-transform shadow-[0_0_10px_rgba(139,92,246,0.3)]" />
                    <div>
                      <p className="text-white font-black uppercase italic tracking-tighter text-sm group-hover:text-violet-400 transition-colors">{item.event}</p>
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mt-1.5">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="space-y-10">
          {/* Status Bento */}
          <section className="bg-zinc-900/20 rounded-[3rem] p-12 border border-zinc-800/60 relative overflow-hidden">
            <div className="absolute inset-0 bg-violet-600/5 blur-[80px]" />
            <div className="space-y-8 mb-12 relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-xl">
                  <Calendar className="w-6 h-6 text-violet-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Window</p>
                  <p className="text-xs font-black text-zinc-100 uppercase tracking-tighter mt-1">
                    {hackathon.startDate ? new Date(hackathon.startDate).toLocaleDateString() : 'TBD'} - {hackathon.endDate ? new Date(hackathon.endDate).toLocaleDateString() : 'TBD'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-xl">
                  <Clock className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Final Sync</p>
                  <p className="text-xs font-black text-zinc-100 uppercase tracking-tighter mt-1">
                    {hackathon.registrationDeadline ? new Date(hackathon.registrationDeadline).toLocaleString() : 'TBD'}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 bg-zinc-950/80 p-8 rounded-[2rem] border border-zinc-800">
               <CountdownTimer deadline={hackathon.registrationDeadline || new Date().toISOString()} label="System Lock In" />
            </div>
          </section>

          {/* Reward Terminal */}
          <section className="bg-zinc-900/20 rounded-[3rem] p-12 border border-zinc-800/60">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Award className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">The Spoils</h3>
            </div>
            <div className="space-y-6">
              {[
                { rank: '1ST PLACE', prize: 'INR 50,000', color: 'text-amber-500', bg: 'bg-amber-500/5' },
                { rank: '2ND PLACE', prize: 'INR 30,000', color: 'text-zinc-300', bg: 'bg-white/5' },
                { rank: '3RD PLACE', prize: 'INR 20,000', color: 'text-orange-500', bg: 'bg-orange-500/5' },
              ].map((p, i) => (
                <div key={i} className={`flex items-center justify-between p-6 rounded-3xl ${p.bg} border border-zinc-800/50 hover:border-zinc-700 transition-all`}>
                  <span className="text-[10px] font-black text-zinc-500 tracking-[0.3em]">{p.rank}</span>
                  <span className={`text-xl font-black italic tracking-tighter ${p.color}`}>{p.prize}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}