import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Target, Zap, ArrowRight, Info, 
  Search, Cpu, Globe, Database, ShieldCheck, 
  Layout, BarChart4, ArrowLeft, CheckCircle2,
  Clock, Shield
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function MentorSelectionPage() {
  const navigate = useNavigate();
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const domainAssets = [
    { id: 'ai-ml', name: 'AI & Machine Learning', icon: Cpu, desc: 'Neural architectures and predictive modeling.' },
    { id: 'web3', name: 'Web3 & Blockchain', icon: Globe, desc: 'Decentralized protocols and smart contracts.' },
    { id: 'fullstack', name: 'Full Stack Systems', icon: Layout, desc: 'Scalable architecture and end-to-end deployment.' },
    { id: 'cloud', name: 'Cloud Native', icon: Database, desc: 'Infrastructure as code and container orchestration.' },
    { id: 'cyber', name: 'Cybersecurity', icon: ShieldCheck, desc: 'Penetration testing and defensive security protocols.' },
    { id: 'fintech', name: 'Fintech Innovation', icon: BarChart4, desc: 'High-frequency systems and financial data logic.' },
  ];

  const filteredDomains = domainAssets.filter(domain =>
    domain.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInitialize = () => {
    setIsConfirmed(true);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8B5CF6', '#D946EF', '#F59E0B']
    });
  };

  if (isConfirmed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900/20 rounded-[3rem] p-16 border border-emerald-500/30 text-center max-w-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] pointer-events-none" />
          <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-8 animate-pulse" />
          <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-4">
            Preference <span className="text-emerald-500">Stored</span>
          </h1>
          <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest leading-relaxed mb-10">
            Domain parameters have been synced with the command center. <br />
            Mentor assignment is now in queue.
          </p>
          <button 
            onClick={() => navigate('/student/dashboard')}
            className="px-12 py-5 bg-white text-black rounded-full font-black uppercase italic tracking-tighter text-sm hover:bg-emerald-400 transition-all flex items-center gap-3 mx-auto"
          >
            Return to Dashboard <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 max-w-6xl mx-auto">
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Resource Procurement</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">
            Domain <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">Preference</span>
          </h1>
        </motion.div>

        {/* Subtle FCFS Indicator */}
        
      </div>

      {/* ══════════ Search Dock ══════════ */}
      <div className="relative group max-w-md">
        <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${searchQuery ? 'text-violet-500' : 'text-zinc-600'}`} />
        <input
          type="text"
          placeholder="Search Domains..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-6 py-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl text-[10px] font-black text-white placeholder-zinc-700 focus:outline-none focus:border-violet-500 transition-all uppercase tracking-widest"
        />
      </div>

      {/* ══════════ Domain Selection Grid ══════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDomains.map((domain) => {
          const isSelected = selectedDomain === domain.id;
          return (
            <motion.button
              key={domain.id}
              onClick={() => setSelectedDomain(domain.id)}
              whileHover={{ y: -5, borderColor: isSelected ? '#a78bfa' : '#3f3f46' }}
              className={`text-left rounded-[2.5rem] p-8 border transition-all duration-300 relative overflow-hidden group ${
                isSelected 
                ? 'bg-violet-600 border-violet-400 shadow-2xl shadow-violet-600/20' 
                : 'bg-zinc-900/20 border-zinc-800/60'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                isSelected ? 'bg-white text-black' : 'bg-zinc-950 border border-zinc-800 text-violet-500'
              }`}>
                <domain.icon className="w-6 h-6" />
              </div>
              <h3 className={`text-xl font-black uppercase italic tracking-tighter mb-2 ${
                isSelected ? 'text-white' : 'text-zinc-300'
              }`}>
                {domain.name}
              </h3>
              <p className={`text-[10px] font-bold uppercase tracking-widest leading-relaxed ${
                isSelected ? 'text-violet-100' : 'text-zinc-600 group-hover:text-zinc-400'
              }`}>
                {domain.desc}
              </p>
            </motion.button>
          );
        })}
      </div>

      {/* ══════════ Subtle Info Footnote ══════════ */}
      <div className="flex items-center justify-center gap-2 text-zinc-600">
        <Info className="w-3 h-3" />
        <p className="text-[9px] font-bold uppercase tracking-widest">
          Mentor synchronization is automated based on available capacity and entry timestamps.
        </p>
      </div>

      {/* ══════════ Action Footer ══════════ */}
      <AnimatePresence>
        {selectedDomain && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col items-center pt-10"
          >
            <motion.button
              onClick={handleInitialize}
              whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(139, 92, 246, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              className="px-16 py-6 bg-white text-black rounded-full font-black uppercase italic tracking-tighter text-xl shadow-2xl flex items-center gap-4 transition-all"
            >
              Initialize Allocation <ArrowRight className="w-6 h-6" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}