import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { 
  HelpCircle, Utensils, DoorOpen, Clock, 
  Sparkles, ChevronRight, AlertTriangle, 
  ArrowLeft, RefreshCcw 
} from 'lucide-react';

export function CampusEventPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'entry' | 'breakfast' | 'lunch' | 'dinner'>('entry');
  
  // Feature F: Secure Refresh State
  const [progress, setProgress] = useState(100);
  const [refreshKey, setRefreshKey] = useState(0);

  // Simulated dynamic QR token rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          setRefreshKey((k) => k + 1);
          return 100;
        }
        return prev - 0.4; // Speed of the refresh cycle
      });
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const qrData = {
    entry: `HACKFIRE-ENT-${refreshKey}-TEAM1-INNOV2026`,
    breakfast: `HACKFIRE-BFK-${refreshKey}-TEAM1-INNOV2026`,
    lunch: `HACKFIRE-LCH-${refreshKey}-TEAM1-INNOV2026`,
    dinner: `HACKFIRE-DIN-${refreshKey}-TEAM1-INNOV2026`,
  };

  const eventSchedule = [
    { time: '09:00 AM', event: 'Registration & Entry', status: 'completed' },
    { time: '09:30 AM', event: 'Breakfast Service', status: 'completed' },
    { time: '10:00 AM', event: 'Main Opening Ceremony', status: 'active' },
    { time: '11:00 AM', event: 'Hacking Phase 01', status: 'upcoming' },
    { time: '01:00 PM', event: 'Lunch Service', status: 'upcoming' },
    { time: '07:00 PM', event: 'Dinner Service', status: 'upcoming' },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* ══════════ Navigation & Back Button ══════════ */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="group flex items-center gap-3 text-zinc-500 hover:text-white transition-all"
      >
        <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center group-hover:border-amber-500/50 group-hover:bg-amber-500/10 transition-all">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        </div>
        <div className="flex flex-col items-start leading-none">
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Exit Protocol</span>
          <span className="text-[9px] font-bold text-zinc-600 uppercase mt-1">Return to Mission</span>
        </div>
      </motion.button>

      {/* ══════════ Header ══════════ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Venue Terminal v2.6</span>
        </div>
        <h1 className="text-6xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">
          Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-500">Access</span>
        </h1>
        <p className="text-zinc-400 text-sm mt-2 font-medium">Verify credentials for entry and meal services.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-8">
          {/* ══════════ QR Card Center ══════════ */}
          <div className="bg-zinc-900/20 rounded-[2.5rem] p-10 border border-zinc-800/60 relative overflow-hidden group">
            {/* Feature F: Animated Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-zinc-950">
              <motion.div 
                className="h-full bg-gradient-to-r from-amber-500 to-rose-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex gap-2 mb-10 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800">
              {['entry', 'breakfast', 'lunch', 'dinner'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab as any);
                    setProgress(100);
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-white text-black italic'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + refreshKey}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="space-y-8 text-center"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RefreshCcw className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Token Rotated</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                    {activeTab === 'entry' ? <DoorOpen className="w-5 h-5" /> : <Utensils className="w-5 h-5" />}
                  </div>
                </div>

                <div className="bg-white p-10 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-black/50 relative">
                  <QRCodeSVG value={qrData[activeTab]} size={240} level="H" fgColor="#050505" />
                  <motion.div 
                    animate={{ top: ['10%', '90%', '10%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute left-10 right-10 h-[2px] bg-amber-500/20 blur-sm pointer-events-none"
                  />
                </div>

                <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800">
                  <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-1">Encrypted Payload</p>
                  <code className="text-amber-500 font-mono text-xs break-all tracking-tighter">{qrData[activeTab]}</code>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-6 px-8 bg-rose-600 text-white rounded-[2rem] font-black uppercase italic tracking-tighter text-sm flex items-center justify-center gap-3 shadow-2xl shadow-rose-600/20 transition-all"
          >
            <AlertTriangle className="w-5 h-5" />
            Emergency Protocol / Venue Help
          </motion.button>
        </div>

        {/* ══════════ Schedule & Info ══════════ */}
        <div className="space-y-8">
          <div className="bg-zinc-900/20 rounded-[2.5rem] p-10 border border-zinc-800/60">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-amber-500">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Event Protocol</h3>
            </div>

            <div className="space-y-4">
              {eventSchedule.map((item, index) => (
                <motion.div
                  key={index}
                  className={`flex items-center gap-6 p-5 rounded-2xl border transition-all ${
                    item.status === 'active'
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : item.status === 'completed'
                      ? 'bg-zinc-900/40 border-emerald-500/20 opacity-50'
                      : 'bg-zinc-950 border-zinc-800/50'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    item.status === 'active' ? 'bg-amber-500 animate-pulse' : 
                    item.status === 'completed' ? 'bg-emerald-500' : 'bg-zinc-700'
                  }`} />
                  <div className="flex-1">
                    <p className={`text-xs font-black uppercase tracking-tight ${
                      item.status === 'active' ? 'text-amber-500' : 'text-white'
                    }`}>
                      {item.event}
                    </p>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase mt-1 tracking-widest">{item.time}</p>
                  </div>
                  {item.status === 'active' && (
                    <span className="text-[9px] font-black bg-amber-500 text-black px-3 py-1 rounded italic uppercase tracking-tighter">Live</span>
                  )}
                  {item.status === 'completed' && <ChevronRight className="w-4 h-4 text-emerald-500" />}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900/40 rounded-[2.5rem] p-10 border border-zinc-800/80 relative overflow-hidden">
            <h3 className="text-base font-black text-white uppercase italic tracking-tighter mb-6">Security Guidelines</h3>
            <ul className="space-y-4">
              {[
                'Keep QR codes confidential until scanning',
                'Each meal QR is single-use only',
                'Venue entry requires active ID verification'
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-4 text-[11px] font-bold text-zinc-500 uppercase tracking-tight">
                  <span className="text-amber-500 mt-0.5 font-black">/</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}