import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, Github, Link as LinkIcon, FileText, 
  CheckCircle2, Trash2, Sparkles, ArrowLeft, 
  ShieldCheck, Globe, Zap, AlertCircle, ArrowRight,
  Radio
} from 'lucide-react';
import { CountdownTimer } from '../../components/CountdownTimer';
import confetti from 'canvas-confetti';
import { getFinalSubmission, getHackathonById, getMyTeams, submitFinalRound, uploadFile } from '../../services/student';

export function FinalSubmissionPage() {
  const navigate = useNavigate();
  const [ppt, setPpt] = useState<File | null>(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [deadline, setDeadline] = useState('2026-03-17T16:00:00');
  const [teamId, setTeamId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
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
      setError('');
      try {
        const [hackathon, myTeams] = await Promise.all([
          getHackathonById(hackathonId),
          getMyTeams(hackathonId),
        ]);
        setDeadline(hackathon.finalRoundDate || deadline);
        const activeTeamId = myTeams[0]?.id || '';
        setTeamId(activeTeamId);
        if (!activeTeamId) {
          setError('Create or join a team first to submit final round.');
        } else {
          try {
            const existing = await getFinalSubmission(hackathonId, activeTeamId);
            if (existing?.submission) {
              setSubmitted(true);
              setMessage('Final submission already exists.');
            }
          } catch {
            // No prior submission; keep submission form active.
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unable to load submission context');
      } finally {
        setLoading(false);
      }
    };
    void loadContext();
  }, [hackathonId]);

  const handleSubmit = async () => {
    if (!teamId) {
      setError('Create or join a team first to submit final round.');
      return;
    }
    if (!ppt || !githubUrl || !hackathonId) return;

    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const uploadResult = await uploadFile(ppt, 'hackfire_final');
      await submitFinalRound(hackathonId, teamId, {
        pptUrl: uploadResult.fileUrl,
        githubLink: githubUrl.trim(),
        demoLink: demoUrl.trim() || undefined,
      });
      setSubmitted(true);
      setMessage('Final submission uploaded successfully');
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#D946EF', '#F59E0B']
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit final round');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 pb-20 max-w-5xl mx-auto">
      {loading && <div className="text-white p-4">Loading submission context...</div>}
      {error && <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">{error}</div>}
      {message && <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">{message}</div>}
      {!submitted ? (
        <>
          {/* ══════════ Navigation ══════════ */}
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 text-zinc-600 hover:text-white transition-all"
          >
            <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center group-hover:border-violet-500/50 group-hover:bg-violet-500/10 transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Exit Terminal</span>
          </motion.button>

          {/* ══════════ Header ══════════ */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Final Protocol</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">
              Project <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">Submission</span>
            </h1>
            <p className="text-zinc-400 text-sm mt-4 font-medium max-w-xl">Transmit your project's final architecture, source code, and live demonstration for grand evaluation.</p>
          </motion.div>

          {/* ══════════ Deadline Clock ══════════ */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-6 backdrop-blur-xl">
            <CountdownTimer deadline={deadline} label="Time Until System Lock" />
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-zinc-900/20 rounded-[2.5rem] p-10 border border-zinc-800/60 relative overflow-hidden group">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-500/5 blur-[80px]" />
                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase italic tracking-widest mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-violet-500" /> Final Presentation
                    </h3>
                    <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-zinc-800 rounded-[2rem] cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/[0.02] transition-all bg-zinc-950/50 group/upload">
                      <div className="text-center p-6">
                        <Upload className={`w-12 h-12 mx-auto mb-4 transition-all duration-500 ${ppt ? 'text-emerald-500' : 'text-zinc-700 group-hover/upload:text-violet-500 group-hover/upload:scale-110'}`} />
                        {ppt ? (
                          <div className="space-y-1">
                            <p className="text-white font-black uppercase italic tracking-tighter">{ppt.name}</p>
                            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Payload Ready ({(ppt.size / 1024 / 1024).toFixed(2)} MB)</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-white font-black uppercase italic tracking-tighter">Upload PPTX Signature</p>
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1">Maximum 50MB</p>
                          </div>
                        )}
                      </div>
                      <input type="file" className="hidden" accept=".ppt,.pptx" onChange={(e) => setPpt(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 block flex items-center gap-2">
                      <Github className="w-4 h-4 text-white" /> GitHub Repository
                    </label>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="HTTPS://GITHUB.COM/SQUAD/PROJECT"
                      className="w-full px-6 py-5 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs font-bold text-white placeholder-zinc-700 focus:outline-none focus:border-violet-500 transition-all uppercase tracking-widest"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 block flex items-center gap-2">
                      <Globe className="w-4 h-4 text-violet-400" /> Live Demo Link (Optional)
                    </label>
                    <input
                      type="url"
                      value={demoUrl}
                      onChange={(e) => setDemoUrl(e.target.value)}
                      placeholder="HTTPS://PROJECT-LIVE.COM"
                      className="w-full px-6 py-5 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs font-bold text-white placeholder-zinc-700 focus:outline-none focus:border-violet-500 transition-all uppercase tracking-widest"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-zinc-900/20 rounded-[2.5rem] p-8 border border-zinc-800/60">
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-6 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-violet-500" /> Checklist
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Tactical PPT Uploaded', checked: !!ppt },
                    { label: 'Source Code Linked', checked: !!githubUrl },
                    { label: 'Live Demo Configured', checked: !!demoUrl, optional: true },
                  ].map((item, index) => (
                    <div key={index} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${item.checked ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-zinc-950 border-zinc-800/50'}`}>
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-800'}`}>
                        {item.checked && <CheckCircle2 className="w-4 h-4 text-black" strokeWidth={3} />}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${item.checked ? 'text-emerald-400' : 'text-zinc-600'}`}>
                        {item.label} {item.optional && <span className="opacity-50">(OPT)</span>}
                      </span>
                    </div>
                  ))}
                </div>
                <motion.button
                  onClick={handleSubmit}
                  disabled={!ppt || !githubUrl || !teamId || submitting || loading}
                  whileHover={ppt && githubUrl && teamId && !submitting ? { scale: 1.02, boxShadow: '0 0 40px rgba(139, 92, 246, 0.2)' } : {}}
                  whileTap={ppt && githubUrl && teamId && !submitting ? { scale: 0.98 } : {}}
                  className={`w-full mt-10 py-6 px-6 rounded-full font-black uppercase italic tracking-tighter text-lg transition-all ${
                    ppt && githubUrl && teamId && !submitting
                      ? 'bg-white text-black hover:bg-violet-400 shadow-2xl'
                      : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  {submitting ? 'Submitting...' : 'Deploy Final Project'}
                </motion.button>
              </div>
              <div className="p-8 rounded-[2.5rem] bg-rose-500/[0.02] border border-rose-500/20">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight leading-relaxed">
                    Once deployed, the project signature is <span className="text-rose-500">locked</span> for evaluation. Verify all assets before initialization.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900/20 rounded-[3rem] p-16 border border-emerald-500/30 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] pointer-events-none" />
          <CheckCircle2 className="w-24 h-24 text-emerald-500 mx-auto mb-8 animate-pulse" />
          <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-4">Submission <span className="text-emerald-500">Complete</span></h2>
          
          <div className="flex items-center justify-center gap-3 mb-10">
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            <p className="text-zinc-500 text-sm font-black uppercase tracking-[0.4em] italic">
              Stay tuned for results
            </p>
          </div>

          <div className="bg-zinc-950/80 rounded-[2rem] p-8 border border-zinc-800 max-w-xl mx-auto space-y-4 mb-10 backdrop-blur-xl">
            <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Presentation</span>
              <span className="text-xs font-bold text-white italic">{ppt?.name}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">GitHub Repository</span>
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-violet-400 hover:text-white transition-colors underline decoration-2 underline-offset-4">VIEW REPO</a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/student/dashboard')}
              className="px-12 py-5 bg-white text-black rounded-full font-black uppercase italic tracking-tighter text-sm hover:bg-emerald-400 transition-all flex items-center gap-3"
            >
              <ArrowLeft className="w-5 h-5" /> Return to Dashboard
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
