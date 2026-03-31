import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, CheckCircle2, Loader2, RefreshCw, ShieldX, Scan, Utensils, Users, Settings2, Zap, Clock, ShieldAlert } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { getAccessToken } from '../../services/auth';

// ... (Types and helper functions remain exactly the same as provided)
type MealType = 'breakfast' | 'lunch' | 'dinner';
type AttendanceFilter = 'all' | 'present' | 'absent';
type MealStatusFilter = 'all' | 'claimed' | 'unclaimed';
type ParticipantStatus = 'all' | 'pending' | 'registered' | 'shortlisted' | 'finalist' | 'winner';
type SortBy = 'name' | 'email' | 'status' | 'attendance' | 'breakfast' | 'lunch' | 'dinner';
type SortOrder = 'asc' | 'desc';
type ScanMode = 'auto' | 'entry' | 'food';

interface CommitteeStudent {
  _id: string;
  name: string;
  email: string;
  participantStatus: ParticipantStatus;
  attendance: { present: boolean; timestamp: string | null };
  meals: { breakfast: boolean; lunch: boolean; dinner: boolean; claimedAt: Partial<Record<MealType, string>> };
}

interface MealSession { isActive: boolean; startsAt: string | null; endsAt: string | null }
interface CommitteeStudentsResponse { success: boolean; students: CommitteeStudent[]; mealSessions?: Record<MealType, MealSession> }
interface VerifyResponse { success: boolean; result: { type: 'entry' | 'food'; message: string; mealType?: MealType } }

const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner'];
const toLocalDateTime = (value?: string | null) => value ? new Date(value).toLocaleString() : '--';
const extractToken = (raw: string) => {
  const value = raw.trim();
  if (!value) return '';
  if (!/^https?:\/\//i.test(value)) return value;
  try { const url = new URL(value); return url.searchParams.get('token') || value; } catch { return value; }
};

export function VerificationsPage() {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  const token = useMemo(() => getAccessToken() || undefined, []);

  // State
  const [students, setStudents] = useState<CommitteeStudent[]>([]);
  const [mealSessions, setMealSessions] = useState<Record<MealType, MealSession>>({
    breakfast: { isActive: false, startsAt: null, endsAt: null },
    lunch: { isActive: false, startsAt: null, endsAt: null },
    dinner: { isActive: false, startsAt: null, endsAt: null },
  });
  const [search, setSearch] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState<AttendanceFilter>('all');
  const [mealFilter, setMealFilter] = useState<MealType>('breakfast');
  const [mealStatusFilter, setMealStatusFilter] = useState<MealStatusFilter>('all');
  const [participantStatus, setParticipantStatus] = useState<ParticipantStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [scanMode, setScanMode] = useState<ScanMode>('auto');
  const [scanMealType, setScanMealType] = useState<MealType>('breakfast');
  const [sessionMealType, setSessionMealType] = useState<MealType>('breakfast');
  const [sessionMinutes, setSessionMinutes] = useState<number>(30);
  const [extendMinutes, setExtendMinutes] = useState<number>(10);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [detectorAvailable, setDetectorAvailable] = useState<boolean>(true);
  const [busy, setBusy] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState('');
  const [lastResult, setLastResult] = useState<{ ok: boolean; message: string } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);
  const scanTimerRef = useRef<number | null>(null);
  const lastScannedRef = useRef<{ token: string; at: number } | null>(null);

  // Logic Functions (Functionally identical to your original code)
  const fetchStudents = async () => {
    if (!hackathonId || !token) return;
    setLoadingStudents(true);
    try {
      const params = new URLSearchParams({ search, attendance: attendanceFilter, mealType: mealFilter, mealStatus: mealStatusFilter, participantStatus, sortBy, sortOrder });
      const response = await apiRequest<CommitteeStudentsResponse>(`/hackathons/${hackathonId}/committee/students?${params.toString()}`, { token });
      setStudents(response.students || []);
      if (response.mealSessions) setMealSessions(response.mealSessions);
    } catch (e) { setError(e instanceof Error ? e.message : 'Sync Failed'); } finally { setLoadingStudents(false); }
  };

  const verifyToken = async (rawToken: string) => {
    if (!hackathonId || !token) return;
    const parsedToken = extractToken(rawToken);
    if (!parsedToken) return;
    setBusy(true); setLastResult(null);
    try {
      const payload: any = { token: parsedToken, scanMode };
      if (scanMode !== 'entry') payload.mealType = scanMealType;
      const response = await apiRequest<VerifyResponse>(`/hackathons/${hackathonId}/committee/verify`, { method: 'POST', token, body: payload });
      setLastResult({ ok: true, message: response.result.message });
      fetchStudents();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Auth Failure';
      setLastResult({ ok: false, message });
    } finally { setBusy(false); }
  };

  const startMealSession = async () => {
    if (!hackathonId || !token) return;
    setBusy(true);
    try {
      await apiRequest(`/hackathons/${hackathonId}/committee/meal/start`, { method: 'POST', token, body: { mealType: sessionMealType, durationMinutes: sessionMinutes } });
      fetchStudents();
      setLastResult({ ok: true, message: `${sessionMealType} active: ${sessionMinutes}m` });
    } catch (e) { setError('Session init failed'); } finally { setBusy(false); }
  };

  const extendMealSession = async () => {
    if (!hackathonId || !token) return;
    setBusy(true);
    try {
      await apiRequest(`/hackathons/${hackathonId}/committee/meal/extend`, { method: 'POST', token, body: { mealType: sessionMealType, extendMinutes } });
      fetchStudents();
      setLastResult({ ok: true, message: `Extended ${sessionMealType}: ${extendMinutes}m` });
    } catch { setError('Extension failed'); } finally { setBusy(false); }
  };

  const syncCameraDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === 'videoinput');
      setCameraDevices(videoDevices);
      if (!selectedDeviceId && videoDevices.length > 0) setSelectedDeviceId(videoDevices[0].deviceId);
    } catch { setError('Camera hardware sync failed'); }
  };

  const stopCamera = () => {
    if (scanTimerRef.current) window.clearInterval(scanTimerRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
  };

  const startCamera = async () => {
    if (!videoRef.current) return;
    if (!('BarcodeDetector' in window)) { setDetectorAvailable(false); return; }
    setDetectorAvailable(true); stopCamera();
    try {
      detectorRef.current = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
      const stream = await navigator.mediaDevices.getUserMedia({ video: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : { facingMode: 'environment' } });
      streamRef.current = stream; videoRef.current.srcObject = stream;
      await videoRef.current.play(); await syncCameraDevices();
      scanTimerRef.current = window.setInterval(async () => {
        if (!videoRef.current || busy || !detectorRef.current) return;
        try {
          const codes = await detectorRef.current.detect(videoRef.current);
          const val = codes?.[0]?.rawValue?.trim();
          if (!val) return;
          const parsed = extractToken(val);
          if (lastScannedRef.current?.token === parsed && Date.now() - lastScannedRef.current.at < 2000) return;
          lastScannedRef.current = { token: parsed, at: Date.now() };
          verifyToken(parsed);
        } catch {}
      }, 650);
    } catch { setError('Camera blocked by hardware/OS'); }
  };

  useEffect(() => { fetchStudents(); }, [hackathonId, token]);
  useEffect(() => { const t = setTimeout(fetchStudents, 250); return () => clearTimeout(t); }, [search, attendanceFilter, mealFilter, mealStatusFilter, participantStatus, sortBy, sortOrder]);
  useEffect(() => { startCamera(); return () => stopCamera(); }, [hackathonId, token, selectedDeviceId, busy]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-20">
      {/* ══════════ Header ══════════ */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Security Terminal v4.0</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">
            Committee <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Verifications</span>
          </h1>
        </div>
        <button onClick={fetchStudents} className="group flex items-center gap-3 px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-amber-500/50 transition-all shadow-xl">
          <RefreshCw className={`w-4 h-4 text-amber-500 ${loadingStudents ? 'animate-spin' : ''}`} />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Resync Database</span>
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ══════════ Left: Live Scanner ══════════ */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-zinc-900/20 rounded-[2.5rem] p-8 border border-zinc-800 relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-600/5 blur-[100px]" />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-inner">
                  <Camera className="w-6 h-6 text-amber-500" />
                </div>
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Live Scan Ops</h2>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-zinc-950 border border-emerald-500/30 rounded-full">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Active Stream</span>
              </div>
            </div>

            <div className="relative aspect-video w-full rounded-[2rem] border-2 border-zinc-800 overflow-hidden bg-black shadow-2xl group-hover:border-amber-500/30 transition-all duration-700">
              <video ref={videoRef} playsInline muted autoPlay className="h-full w-full object-cover opacity-80" />
              <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-amber-500/20 rounded-3xl pointer-events-none">
                 <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-500 rounded-tl-lg" />
                 <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-500 rounded-tr-lg" />
                 <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-500 rounded-bl-lg" />
                 <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-500 rounded-br-lg" />
              </div>
            </div>

            <AnimatePresence>
              {lastResult && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className={`mt-6 p-6 rounded-3xl border-2 flex items-center justify-between ${lastResult.ok ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                  <div className="flex items-center gap-4">
                    {lastResult.ok ? <CheckCircle2 className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status Feedback</p>
                      <p className="text-lg font-black uppercase italic tracking-tight">{lastResult.message}</p>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-black/20 flex items-center justify-center">
                    <Scan className="w-5 h-5" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        {/* ══════════ Right: Configuration Dock ══════════ */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-zinc-900/20 rounded-[2.5rem] p-8 border border-zinc-800 space-y-6 relative overflow-hidden">
             <h3 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
               <Settings2 className="w-5 h-5 text-amber-500" /> Scanner Config
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Target Logic</label>
                  <select value={scanMode} onChange={(e) => setScanMode(e.target.value as ScanMode)}
                    className="w-full h-14 bg-zinc-950 border border-zinc-800 rounded-2xl px-5 text-xs font-bold text-white focus:border-amber-500 outline-none transition-all appearance-none italic">
                    <option value="auto">Auto Intelligence</option>
                    <option value="entry">Gate Entry Only</option>
                    <option value="food">Meal Verification</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Hardware ID</label>
                  <select value={selectedDeviceId} onChange={(e) => setSelectedDeviceId(e.target.value)}
                    className="w-full h-14 bg-zinc-950 border border-zinc-800 rounded-2xl px-5 text-xs font-bold text-white focus:border-amber-500 outline-none transition-all appearance-none italic">
                    {cameraDevices.length === 0 && <option value="">Primary Core</option>}
                    {cameraDevices.map((d, idx) => <option key={d.deviceId || idx} value={d.deviceId}>{d.label || `Camera ${idx + 1}`}</option>)}
                  </select>
                </div>
             </div>

             {scanMode !== 'entry' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Active Meal Buffer</label>
                  <div className="flex gap-2">
                    {mealTypes.map(m => (
                      <button key={m} onClick={() => setScanMealType(m)}
                        className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-tighter transition-all border ${scanMealType === m ? 'bg-amber-500 border-amber-400 text-black shadow-lg shadow-amber-500/20 italic' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-white'}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
             )}
          </section>

          {/* ══════════ Admin: Session Controls ══════════ */}
          <section className="bg-zinc-900/40 rounded-[2.5rem] p-8 border-2 border-zinc-800 space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-500" /> Session Protocols
                </h3>
                <ShieldAlert className="w-5 h-5 text-rose-500" />
             </div>

             <div className="grid grid-cols-3 gap-2">
                {mealTypes.map((meal) => (
                  <div key={meal} className={`rounded-2xl border p-3 flex flex-col items-center justify-center gap-1 ${mealSessions[meal]?.isActive ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'bg-zinc-950 border-zinc-900 opacity-40'}`}>
                    <Utensils className={`w-4 h-4 ${mealSessions[meal]?.isActive ? 'text-amber-500' : 'text-zinc-600'}`} />
                    <span className="text-[9px] font-black text-white uppercase tracking-tighter">{meal}</span>
                    {mealSessions[meal]?.isActive && <span className="text-[8px] font-bold text-emerald-500 uppercase animate-pulse">Live</span>}
                  </div>
                ))}
             </div>

             <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <select value={sessionMealType} onChange={(e) => setSessionMealType(e.target.value as MealType)}
                    className="h-12 bg-zinc-950 border border-zinc-800 rounded-xl px-4 text-xs font-black text-white outline-none uppercase italic tracking-tighter">
                    {mealTypes.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <div className="relative">
                    <input type="number" value={sessionMinutes} onChange={(e) => setSessionMinutes(Number(e.target.value))}
                      className="w-full h-12 bg-zinc-950 border border-zinc-800 rounded-xl px-4 text-xs font-black text-white outline-none uppercase italic tracking-tighter" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] text-zinc-600 font-black">MIN</span>
                  </div>
                </div>
                <button onClick={startMealSession} disabled={busy}
                  className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase italic tracking-tighter text-sm shadow-2xl hover:bg-amber-400 transition-all flex items-center justify-center gap-3">
                  {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                  Authorize New Session
                </button>
             </div>
          </section>
        </div>
      </div>

      {/* ══════════ Participants Table Terminal ══════════ */}
      <section className="bg-zinc-900/20 rounded-[2.5rem] border border-zinc-800 overflow-hidden">
        <div className="p-8 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-900/40">
           <div className="flex items-center gap-4">
             <Users className="w-6 h-6 text-amber-500" />
             <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Database Monitor</h2>
           </div>
           
           <div className="flex flex-wrap gap-2">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="IDENTIFY TARGET..."
                className="w-48 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-[10px] font-black text-white placeholder-zinc-700 outline-none focus:border-amber-500 transition-all uppercase italic tracking-widest" />
              <select value={participantStatus} onChange={(e) => setParticipantStatus(e.target.value as ParticipantStatus)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-[10px] font-black text-zinc-500 outline-none focus:border-amber-500 uppercase italic">
                <option value="all">Rank: All</option>
                {['pending', 'registered', 'shortlisted', 'finalist', 'winner'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={mealFilter} onChange={(e) => setMealFilter(e.target.value as MealType)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-[10px] font-black text-zinc-500 outline-none focus:border-amber-500 uppercase italic">
                {mealTypes.map(m => <option key={m} value={m}>Check: {m}</option>)}
              </select>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-950/50">
              <tr className="border-b border-zinc-800 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">
                <th className="px-8 py-6">Operative Identification</th>
                <th className="px-8 py-6">Mission Status</th>
                <th className="px-8 py-6">Attendance</th>
                <th className="px-8 py-6">BFK</th>
                <th className="px-8 py-6">LCH</th>
                <th className="px-8 py-6">DNR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/50">
              {loadingStudents ? (
                 <tr><td colSpan={6} className="px-8 py-20 text-center"><Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto opacity-20" /></td></tr>
              ) : students.length === 0 ? (
                 <tr><td colSpan={6} className="px-8 py-20 text-center text-zinc-700 font-black uppercase italic tracking-widest">No target matches found</td></tr>
              ) : students.map((student) => (
                <tr key={student._id} className="group hover:bg-white/[0.02] transition-colors border-b border-zinc-900/50">
                  <td className="px-8 py-5">
                    <p className="text-base font-black text-white uppercase italic tracking-tighter group-hover:text-amber-400 transition-colors leading-none">{student.name}</p>
                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1.5">{student.email}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[9px] font-black text-zinc-400 uppercase tracking-widest italic">{student.participantStatus}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${student.attendance.present ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
                       <span className={`text-[10px] font-black uppercase italic ${student.attendance.present ? 'text-emerald-400' : 'text-zinc-700'}`}>{student.attendance.present ? 'Verified' : 'Ghost'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">{student.meals.breakfast ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-zinc-800" />}</td>
                  <td className="px-8 py-5">{student.meals.lunch ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-zinc-800" />}</td>
                  <td className="px-8 py-5">{student.meals.dinner ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-zinc-800" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}