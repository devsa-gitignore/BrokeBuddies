import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import { Plus, Edit, Trash2, Calendar, MapPin, Sparkles, X, LayoutGrid, Clock, Globe, ArrowUpRight } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { getAccessToken } from '../../services/auth';

export function ManageHackathonsPage() {
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'upcoming' | 'open' | 'ongoing' | 'closed'>('upcoming');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadHackathons = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest<any[]>('/hackathons');
      setHackathons(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load hackathons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHackathons();
  }, []);

  const handleCreate = async () => {
    const token = getAccessToken();
    if (!token) {
      setError('Please login again');
      return;
    }
    if (!name.trim()) {
      setError('Hackathon name is required');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await apiRequest('/hackathons', {
        method: 'POST',
        token,
        body: {
          name: name.trim(),
          description: description.trim(),
          status,
          dates: {
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            registrationDeadline: registrationDeadline || undefined,
          },
        },
      });
      setName('');
      setDescription('');
      setStatus('upcoming');
      setStartDate('');
      setEndDate('');
      setRegistrationDeadline('');
      setShowForm(false);
      await loadHackathons();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create hackathon');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const token = getAccessToken();
    if (!token) {
      setError('Please login again');
      return;
    }
    try {
      await apiRequest(`/hackathons/${id}`, { method: 'DELETE', token });
      await loadHackathons();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete hackathon');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-6 pt-6 bg-transparent min-h-screen text-zinc-300">

      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900 pb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-mono text-amber-500 uppercase tracking-[0.4em] mb-2 font-bold">
            <Globe className="w-3 h-3 animate-pulse" /> Infrastructure Registry
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
            EVENT <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">ENGINE</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium">Orchestrate and deploy new hackathon nodes to the network.</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(251, 133, 0, 0.3)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="px-8 py-4 bg-white text-black rounded-full font-black uppercase italic tracking-tighter flex items-center gap-3 transition-all"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Close Terminal' : 'Initialize New Event'}
        </motion.button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* 2. Deployment Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            className="overflow-hidden"
          >
            <div className="bg-zinc-900/30 border border-amber-500/20 rounded-[2.5rem] p-10 backdrop-blur-xl relative mb-10">
              <div className="absolute top-0 right-10 h-1 w-24 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase ml-4">Hackathon_Identifier</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. GLOBAL_RECODE_2024" className="w-full px-6 py-4 bg-black/40 border border-zinc-800 rounded-2xl text-white focus:outline-none focus:border-amber-500 transition-all font-medium" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase ml-4">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full px-6 py-4 bg-black/40 border border-zinc-800 rounded-2xl text-white focus:outline-none focus:border-amber-500 transition-all font-medium">
                    <option value="upcoming">upcoming</option>
                    <option value="open">open</option>
                    <option value="ongoing">ongoing</option>
                    <option value="closed">closed</option>
                  </select>
                </div>
                <div className="space-y-1 md:col-span-3">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase ml-4">Description</label>
                  <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" className="w-full px-6 py-4 bg-black/40 border border-zinc-800 rounded-2xl text-white focus:outline-none focus:border-amber-500 transition-all font-medium" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase ml-4">Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-6 py-4 bg-black/40 border border-zinc-800 rounded-2xl text-white focus:outline-none focus:border-amber-500 transition-all font-medium [color-scheme:dark]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase ml-4">End Date</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-6 py-4 bg-black/40 border border-zinc-800 rounded-2xl text-white focus:outline-none focus:border-amber-500 transition-all font-medium [color-scheme:dark]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase ml-4">Registration Deadline</label>
                  <input type="date" value={registrationDeadline} onChange={(e) => setRegistrationDeadline(e.target.value)} className="w-full px-6 py-4 bg-black/40 border border-zinc-800 rounded-2xl text-white focus:outline-none focus:border-amber-500 transition-all font-medium [color-scheme:dark]" />
                </div>
              </div>
              <div className="mt-10 flex gap-4">
                <button onClick={handleCreate} disabled={submitting} className="px-10 py-4 bg-gradient-to-r from-amber-400 to-orange-600 text-black font-black uppercase italic tracking-tighter rounded-full shadow-lg shadow-amber-500/20 disabled:opacity-60">
                  {submitting ? 'Deploying...' : 'Deploy Event'}
                </button>
                <button onClick={() => setShowForm(false)} className="px-10 py-4 bg-zinc-800/50 text-zinc-400 rounded-full font-black uppercase italic tracking-tighter hover:bg-zinc-800 transition-all">Abort</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Hackathon Grid */}
      {loading ? (
        <div className="text-zinc-400 text-sm">Loading hackathons...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {hackathons.map((hackathon) => (
            <motion.div
              key={hackathon._id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5, borderColor: 'rgba(251, 183, 3, 0.3)' }}
              onClick={() => navigate(`/admin/hackathon/${hackathon._id}`)}
              className="group bg-zinc-900/10 border border-zinc-800 rounded-[2.5rem] p-8 transition-all hover:bg-zinc-900/20 relative overflow-hidden cursor-pointer"
            >
              <div className={`absolute -top-24 -right-24 w-48 h-48 blur-[80px] opacity-10 ${hackathon.status === 'open' ? 'bg-emerald-500' : 'bg-amber-500'}`} />

              <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter group-hover:text-amber-400 transition-colors">
                      {hackathon.name}
                    </h3>
                    <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all text-amber-500" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                      <MapPin className="w-3 h-3 text-amber-500" /> {hackathon.hostedBy}
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                      <Calendar className="w-3 h-3 text-amber-500" /> {hackathon.dates?.startDate ? new Date(hackathon.dates.startDate).toLocaleDateString() : 'TBD'}
                    </div>
                  </div>
                </div>

                {/* Action Buttons with Propagation Stop */}
                <div className="flex md:flex-col gap-2 justify-end relative z-20">
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: '#ffffff', color: '#000000' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents navigating to Detail Page
                      navigate(`/admin/hackathon/${hackathon._id}/manage`);
                    }}
                    className="p-4 bg-zinc-950 border border-zinc-800 text-zinc-400 rounded-2xl transition-all"
                  >
                    <Edit className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: '#ef4444', color: '#ffffff', borderColor: '#ef4444' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents navigating to Detail Page
                      handleDelete(hackathon._id);
                    }}
                    className="p-4 bg-zinc-950 border border-zinc-800 text-zinc-400 rounded-2xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
