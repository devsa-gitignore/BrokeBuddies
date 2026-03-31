import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import {
  Megaphone, Search, ArrowUpRight, LayoutGrid, Lock, Zap, 
  Radio, Clock, History, Send, Terminal, Activity, 
  ChevronRight, X, Plus, ShieldAlert, ListChecks, 
  ShieldCheck, Trophy, Globe
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import { getAccessToken } from '../../services/auth';
import { getCurrentUser } from '../../data/mockData';

interface AdminHackathon {
  _id: string;
  name: string;
  hostedBy: string;
  status: 'upcoming' | 'open' | 'ongoing' | 'closed';
  dates?: { startDate?: string; };
}

interface CreateHackathonForm {
  name: string;
  description: string;
  rules: string;
  status: 'upcoming' | 'open' | 'ongoing' | 'closed';
  isRegistrationOpen: boolean;
  registrationDeadline: string;
  round1Deadline: string;
  finalRoundDate: string;
  startDate: string;
  endDate: string;
}

const initialForm: CreateHackathonForm = {
  name: '', description: '', rules: '', status: 'upcoming',
  isRegistrationOpen: true, registrationDeadline: '',
  round1Deadline: '', finalRoundDate: '', startDate: '', endDate: '',
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [hackathons, setHackathons] = useState<AdminHackathon[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateHackathonForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const quickAlerts = [
    { label: 'PRESENTATIONS', msg: 'The final presentations are starting now. Please gather in the main area.' },
    { label: 'MENTORING', msg: 'Mentoring sessions are now open. You can now talk to your assigned mentors.' },
    { label: 'LUNCH', msg: 'Lunch is now being served. Please proceed to the dining hall.' },
    { label: 'DEADLINE', msg: 'Warning: You have only 30 minutes left to submit your project.' },
  ];

  const metrics = useMemo(() => ({
    past: hackathons.filter(h => h.status === 'closed').length,
    ongoing: hackathons.filter(h => h.status === 'ongoing' || h.status === 'open').length,
    upcoming: hackathons.filter(h => h.status === 'upcoming').length,
  }), [hackathons]);

  const loadHackathons = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<AdminHackathon[]>('/hackathons');
      setHackathons(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('System Error: Could not load the hackathon list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadHackathons(); }, []);

  const handleInput = (key: keyof CreateHackathonForm, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleCreateHackathon = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAccessToken();
    if (!token) return setError('Login Error: Your session has expired.');
    
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        rules: formData.rules.trim(),
        status: formData.status,
        isRegistrationOpen: formData.isRegistrationOpen,
        dates: {
          registrationDeadline: formData.registrationDeadline || null,
          round1Deadline: formData.round1Deadline || null,
          finalRoundDate: formData.finalRoundDate || null,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
        }
      };

      await apiRequest('/hackathons', { 
        method: 'POST', 
        token, 
        body: payload 
      });

      setMessage('Success: New hackathon has been created.');
      setFormData(initialForm);
      setShowCreateForm(false);
      loadHackathons();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error: Could not create hackathon.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredHackathons = hackathons.filter(h => 
    h.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-20 px-8 pt-8 selection:bg-amber-500/30">
      
      {/* ══════════ Header ══════════ */}
      <header className="flex items-center justify-between bg-[#0a0a0a]/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 shadow-2xl">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)] shrink-0 border border-white/10">
            <Lock className="w-5 h-5 text-black" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-widest uppercase italic leading-none">
              Admin <span className="text-zinc-600 not-italic font-light">Panel</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em]">Logged in as: {currentUser?.name || 'Admin'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex bg-black/40 border border-white/5 px-4 py-2 rounded-xl items-center gap-3">
             <Activity className="w-3 h-3 text-zinc-600" />
             <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{hackathons.length} Total Events</span>
          </div>
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={`px-5 py-2.5 rounded-xl font-black uppercase italic tracking-tighter text-[10px] transition-all flex items-center gap-2 ${showCreateForm ? 'bg-rose-600 text-white' : 'bg-white text-black hover:bg-amber-500'}`}
          >
             {showCreateForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
             {showCreateForm ? 'Cancel' : 'New Hackathon'}
          </button>
        </div>
      </header>

      {/* ══════════ Deployment Form ══════════ */}
      <AnimatePresence>
        {showCreateForm && (
            <motion.form 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                onSubmit={handleCreateHackathon}
                className="bg-[#0D0D0D] border border-white/10 rounded-[2rem] p-10 space-y-10 overflow-hidden shadow-2xl"
            >
                <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                    <Terminal className="w-6 h-6 text-amber-500" />
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Event Details</h2>
                </div>

                <div className="grid lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-7 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Event Name</label>
                                <input required type="text" placeholder="Enter name here..." className="w-full bg-black border border-white/5 p-4 rounded-xl text-xs font-bold text-white focus:border-amber-500 outline-none uppercase transition-all" value={formData.name} onChange={e => handleInput('name', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Current Status</label>
                                <select className="w-full bg-black border border-white/5 p-4 rounded-xl text-xs font-bold text-zinc-400 outline-none focus:border-amber-500 appearance-none uppercase italic" value={formData.status} onChange={e => handleInput('status', e.target.value)}>
                                    <option value="upcoming">upcoming</option>
                                    <option value="open">open</option>
                                    <option value="ongoing">ongoing</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Description</label>
                            <textarea required placeholder="Write about the event..." className="w-full h-32 bg-black border border-white/5 p-4 rounded-xl text-xs font-medium text-zinc-300 focus:border-amber-500 outline-none resize-none" value={formData.description} onChange={e => handleInput('description', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2"><ListChecks className="w-3 h-3" /> Event Rules</label>
                            <textarea placeholder="List rules here..." className="w-full h-24 bg-black border border-white/5 p-4 rounded-xl text-[10px] font-mono text-emerald-500 focus:border-amber-500 outline-none resize-none uppercase" value={formData.rules} onChange={e => handleInput('rules', e.target.value)} />
                        </div>
                    </div>

                    <div className="lg:col-span-5 bg-black/40 border border-white/5 p-8 rounded-3xl space-y-6">
                        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-4"><Clock className="w-3 h-3 text-amber-500" /> Important Dates</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { l: 'Registration Ends', k: 'registrationDeadline', icon: Lock },
                                { l: 'Round 1 Deadline', k: 'round1Deadline', icon: ShieldCheck },
                                { l: 'Final Evaluation', k: 'finalRoundDate', icon: Trophy },
                                { l: 'Event Start', k: 'startDate', icon: Zap },
                                { l: 'Event End', k: 'endDate', icon: History },
                            ].map(d => (
                                <div key={d.k} className="relative group">
                                    <div className="flex items-center gap-2 mb-1.5 ml-1">
                                        <d.icon className="w-3 h-3 text-zinc-600 group-focus-within:text-amber-500 transition-colors" />
                                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{d.l}</label>
                                    </div>
                                    <input 
                                      type="datetime-local" 
                                      value={formData[d.k as keyof CreateHackathonForm] as string}
                                      className="w-full bg-zinc-950 border border-white/5 p-3 rounded-xl text-[10px] font-bold text-zinc-300 uppercase outline-none focus:border-amber-500/50 transition-all [&::-webkit-calendar-picker-indicator]:invert-[0.8]" 
                                      onChange={e => handleInput(d.k as any, e.target.value)} 
                                    />
                                </div>
                            ))}
                            <label className="flex items-center justify-between bg-black border border-white/5 p-4 rounded-2xl cursor-pointer group hover:border-amber-500/30 transition-all mt-2">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Enable Registration</span>
                                <input type="checkbox" className="sr-only peer" checked={formData.isRegistrationOpen} onChange={e => handleInput('isRegistrationOpen', e.target.checked)} />
                                <div className="w-10 h-5 bg-zinc-800 rounded-full relative peer-checked:bg-amber-600 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-zinc-400 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-5 peer-checked:after:bg-white" />
                            </label>
                        </div>
                        <button 
                          disabled={submitting || !formData.name || !formData.description} 
                          className="w-full py-4 mt-2 bg-white text-black font-black uppercase italic tracking-tighter text-xs rounded-xl hover:bg-amber-500 transition-all shadow-2xl disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Creating...' : 'Create Hackathon'}
                        </button>
                    </div>
                </div>
            </motion.form>
        )}
      </AnimatePresence>

      {/* ══════════ Alert Node ══════════ */}
      <AnimatePresence>
        {(error || message) && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0 }}
            className={`p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-3 italic ${error ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}
          >
            <ShieldAlert className="w-4 h-4" /> {error || message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════ Broadcast Terminal ══════════ */}
      <section className="bg-[#0A0A0A] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row items-stretch">
          <div className="flex-1 p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-3 h-3 text-rose-500 animate-pulse" />
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-[0.3em] italic">Send Announcement</span>
              </div>
              <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest">Send to all students</span>
            </div>
            <div className="relative">
              <textarea 
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                placeholder="Type your message here..."
                className="w-full h-32 bg-transparent border-none text-base font-bold text-zinc-200 placeholder-zinc-800 outline-none resize-none uppercase tracking-wide leading-relaxed"
              />
              <div className="absolute bottom-0 right-0 p-2">
                <button className="p-4 bg-rose-600 text-white rounded-2xl hover:bg-rose-500 transition-all shadow-lg">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:w-80 bg-white/[0.01] border-l border-white/5 p-8 flex flex-col gap-4">
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Terminal className="w-3 h-3" /> Quick Messages</span>
            <div className="flex flex-col gap-2">
              {quickAlerts.map((alert, i) => (
                <button key={i} onClick={() => setBroadcastMsg(alert.msg)} className="px-4 py-3 bg-[#111] border border-white/5 rounded-xl hover:border-rose-500/40 transition-all text-left">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">{alert.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ Metrics & Asset Browser ══════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="space-y-4">
          {[
            { label: 'Upcoming Events', val: metrics.upcoming, icon: Globe, color: 'text-blue-400' },
            { label: 'Ongoing Events', val: metrics.ongoing, icon: Zap, color: 'text-amber-400' },
            { label: 'Past Events', val: metrics.past, icon: History, color: 'text-zinc-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#111] border border-white/5 p-6 rounded-[1.5rem] flex items-center justify-between group">
              <div><p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p><h3 className={`text-3xl font-black ${stat.color} italic tracking-tighter`}>{stat.val}</h3></div>
              <stat.icon className={`w-5 h-5 ${stat.color} opacity-20 group-hover:opacity-100 transition-opacity`} />
            </div>
          ))}
        </div>

        <div className="xl:col-span-3 space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3"><LayoutGrid className="w-4 h-4 text-zinc-600" /><h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic">Hackathon List</h2></div>
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-700" /><input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search hackathons..." className="bg-black border border-white/5 rounded-xl py-2 pl-9 pr-4 text-[9px] font-black text-white outline-none focus:border-amber-500 transition-all uppercase italic" /></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHackathons.map((h) => (
              <motion.div key={h._id} whileHover={{ y: -4 }} onClick={() => navigate(`/admin/hackathon/${h._id}`)} className="bg-[#0D0D0D] border border-white/5 rounded-[1.5rem] p-6 hover:border-amber-500/40 transition-all group cursor-pointer relative overflow-hidden">
                <div className="flex justify-between items-start mb-8"><h3 className="text-sm font-black text-white uppercase italic tracking-tight group-hover:text-amber-500 transition-colors leading-none">{h.name}</h3><div className={`w-1.5 h-1.5 rounded-full ${h.status === 'ongoing' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-800'}`} /></div>
                <div className="flex items-end justify-between"><div><p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic leading-none">Start Date</p><p className="text-[10px] font-bold text-zinc-400 uppercase mt-2">{h.dates?.startDate ? new Date(h.dates.startDate).toLocaleDateString() : 'TBD'}</p></div><ArrowUpRight className="w-4 h-4 text-zinc-800 group-hover:text-amber-500 transition-all" /></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}