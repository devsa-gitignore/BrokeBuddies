import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, CheckCircle, AlertCircle, Trash2, Sparkles, Clock, ArrowRight, ShieldAlert } from 'lucide-react';
import { CountdownTimer } from '../../components/CountdownTimer';
import { apiRequest } from '../../services/api';
import { getAccessToken } from '../../services/auth';
import { getHackathonById, getMyTeams, getRound1Submission, submitRound1, uploadFile } from '../../services/student';

export function Round1SubmissionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [deadline, setDeadline] = useState(new Date().toISOString());
  const [teamId, setTeamId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const hackathonId = localStorage.getItem('selectedHackathonId') || '';

  useEffect(() => {
    const loadContext = async () => {
      if (!hackathonId) {
        setError('Please open a hackathon first.');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [hackathon, myTeams] = await Promise.all([
          getHackathonById(hackathonId),
          getMyTeams(hackathonId),
        ]);
        setDeadline(hackathon.round1Deadline || new Date().toISOString());
        const activeTeamId = myTeams[0]?.id || '';
        setTeamId(activeTeamId);
        if (!activeTeamId) {
          setError('Create or join a team first to submit Round 1.');
        } else {
          try {
            await getRound1Submission(hackathonId, activeTeamId);
            setSubmitted(true);
            setMessage('Round 1 submission already exists.');
          } catch {
            // No prior submission; keep upload form active.
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unable to load submission context');
      } finally {
        setLoading(false);
      }
    };
    loadContext();
  }, [hackathonId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
    }
  };

  const handleSubmit = async () => {
    if (!teamId) {
      setError('Create or join a team first to submit Round 1.');
      return;
    }
    if (!file || !hackathonId) return;
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const uploadResult = await uploadFile(file, 'hackfire_round1');
      await submitRound1(hackathonId, teamId, uploadResult.fileUrl);
      setSubmitted(true);
      setMessage('Round 1 submission uploaded successfully');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit round 1');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!hackathonId) return;
    if (confirm('Are you sure you want to cancel your registration? This action cannot be undone.')) {
      try {
        await apiRequest<{ message: string }>(`/hackathons/${hackathonId}/registration/cancel`, { method: 'POST', token: getAccessToken() || undefined });
        setMessage('Registration cancelled successfully');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unable to cancel registration');
      }
    }
  };

  if (loading) {
    return <div className="text-white p-10">Loading submission context...</div>;
  }

  return (
    <div className="space-y-10 pb-20 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-violet-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Submission Terminal</span>
        </div>
        <h1 className="text-6xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">
          Round 1 <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">Submissions </span>
        </h1>
        <p className="text-zinc-400 text-sm mt-4 font-medium max-w-xl">Upload your round 1 PPT for evaluation.</p>
      </motion.div>

      {error && <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">{error}</div>}
      {message && <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">{message}</div>}

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-[2rem] blur-xl group-hover:opacity-100 transition duration-1000 group-hover:duration-200 opacity-0" />
        <div className="relative bg-zinc-900/40 border border-zinc-800 rounded-[2rem] p-6 backdrop-blur-xl">
          <CountdownTimer deadline={deadline} label="Time Left" />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-zinc-900/20 rounded-[2.5rem] p-10 border border-zinc-800/60 relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-500/5 blur-[80px]" />

            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-8 flex items-center gap-3">
              <Upload className="w-5 h-5 text-violet-500" /> Upload Document
            </h2>

            {!submitted ? (
              <div className="space-y-6">
                <label className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-zinc-800 rounded-[2.5rem] cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/[0.02] transition-all bg-zinc-950/50 group/upload">
                  <div className="text-center p-6">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-violet-500 blur-2xl opacity-0 group-hover/upload:opacity-20 transition-opacity" />
                      <Upload className="w-16 h-16 text-zinc-700 group-hover/upload:text-violet-500 group-hover/upload:scale-110 transition-all duration-500 mx-auto" />
                    </div>

                    {file ? (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 font-bold text-xs">
                          <FileText className="w-3 h-3" />
                          {file.name}
                        </div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Click to switch file</p>
                      </motion.div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xl font-black text-white uppercase italic tracking-tighter">Drop PPT Signature</p>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">or browse local secure storage</p>
                      </div>
                    )}
                  </div>
                  <input type="file" className="hidden" accept=".ppt,.pptx,.pdf" onChange={handleFileUpload} />
                </label>

                <AnimatePresence>
                  {file && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
                      <div className="flex items-center justify-between p-6 bg-zinc-950 rounded-3xl border border-zinc-800">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-violet-500" />
                          </div>
                          <div>
                            <p className="text-white font-black uppercase italic text-sm tracking-tight">{file.name}</p>
                            <p className="text-zinc-600 text-[10px] font-bold uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button onClick={() => setFile(null)} className="p-3 hover:bg-rose-500/10 rounded-xl text-zinc-600 hover:text-rose-500 transition-all">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <motion.button
                        onClick={handleSubmit}
                        disabled={submitting || !teamId}
                        whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(139, 92, 246, 0.2)' }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-full font-black uppercase italic tracking-tighter text-lg shadow-xl flex items-center justify-center gap-3 disabled:opacity-60"
                      >
                        {submitting ? 'Submitting...' : 'Submit'}
                        <ArrowRight className="w-6 h-6" />
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20" />
                  <CheckCircle className="w-24 h-24 text-emerald-500 mx-auto relative z-10" />
                </div>
                <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-3">Submission Locked</h3>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-10">Data Transmitted: {new Date().toLocaleTimeString()}</p>

                <div className="p-8 bg-zinc-950/80 rounded-[2rem] border border-emerald-500/20 backdrop-blur-md max-w-sm mx-auto">
                  <p className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> Finalized
                  </p>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">Evaluation engine is processing your brief.</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <section className="bg-zinc-900/20 rounded-[2.5rem] p-8 border border-zinc-800/60">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-violet-500" /> Guidelines
            </h2>
            <ul className="space-y-5">
              {['PPT/PPTX/PDF FORMAT', '50MB PAYLOAD LIMIT'].map((protocol, i) => (
                <li key={i} className="flex items-center gap-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  {protocol}
                </li>
              ))}
            </ul>
          </section>

          {!submitted && (
            <section className="bg-rose-500/[0.02] rounded-[2.5rem] p-8 border border-rose-500/20">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <h3 className="text-rose-500 font-black uppercase italic tracking-tighter text-sm">Cancel Registration</h3>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-tight leading-relaxed mt-1">Irreversible removal from event roster.</p>
                </div>
              </div>
              <motion.button
                onClick={handleCancelRegistration}
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(244, 63, 94, 0.1)' }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-transparent border border-rose-500/40 text-rose-500 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                Cancel Registration
              </motion.button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
