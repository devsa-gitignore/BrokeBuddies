import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import {
    ArrowLeft, Settings, FileText, UserCheck, BarChart3, ShieldCheck,
    QrCode, Utensils, Megaphone, Award, GraduationCap, FileBarChart,
    Clock, Tent, MapPin, Calendar, Users, TrendingUp, ChevronRight,
    Zap, Activity, Sparkles, FileSearch // Added FileSearch for the summary button
} from 'lucide-react';
import { apiRequest } from '../../services/api';

type Phase = 'setup' | 'operations' | 'evaluation';

interface ManagementButton {
    icon: React.ElementType;
    label: string;
    description: string;
    route: string;
    color: string;
    phase: Phase;
    bgImage: string;
}

export function AdminHackathonDetailPage({ hackathonId }: { hackathonId: string }) {
    const navigate = useNavigate();
    const [activePhase, setActivePhase] = useState<Phase>('setup');
    const [hackathon, setHackathon] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
      const loadHackathon = async () => {
        setLoading(true);
        setError('');
        try {
          const data = await apiRequest<any>(`/hackathons/${hackathonId}`);
          setHackathon(data);
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Unable to load hackathon');
        } finally {
          setLoading(false);
        }
      };
      loadHackathon();
    }, [hackathonId]);

    if (loading) return <div className="text-white p-10 text-center">Loading hackathon...</div>;
    if (error) return <div className="text-rose-400 p-10 text-center">{error}</div>;
    if (!hackathon) return <div className="text-white p-10 text-center">Hackathon not found</div>;

    const managementButtons: ManagementButton[] = [
        // SETUP PHASE
        { 
  icon: Settings, 
  label: 'Core Config', 
  description: 'Deadlines, sponsors & branding', 
  route: `/admin/hackathon/${hackathonId}/config`, // Ensure this matches your App router
  color: 'text-amber-400', 
  phase: 'setup', 
  bgImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400' 
},
        { icon: FileText, label: 'Problem Statements', description: 'Curate tracks and challenges', route: `/admin/hackathon/${hackathonId}/problems`, color: 'text-blue-400', phase: 'setup', bgImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400' },
        { icon: UserCheck, label: 'Mentor Registry', description: 'LinkedIn profiles & expertise', route: `/admin/hackathon/${hackathonId}/mentors`, color: 'text-emerald-400', phase: 'setup', bgImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400' },
        
        // OPERATIONS PHASE
        { icon: ShieldCheck, label: 'Security Gate', description: 'Face verify & QR entry scan', route: `/admin/hackathon/${hackathonId}/verification`, color: 'text-red-400', phase: 'operations', bgImage: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=400' },
        { icon: QrCode, label: 'Smart Pass QR', description: 'Meal logs & entry pass logic', route: `/admin/hackathon/${hackathonId}/qr`, color: 'text-sky-400', phase: 'operations', bgImage: 'https://images.unsplash.com/photo-1590247813693-5541d1c609fd?auto=format&fit=crop&q=80&w=400' },
        { icon: Utensils, label: 'Food Analytics', description: 'Meal predictions & logs', route: `/admin/hackathon/${hackathonId}/food`, color: 'text-orange-400', phase: 'operations', bgImage: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=400' },
        { icon: Megaphone, label: 'Broadcast Hub', description: 'Global SMS & app alerts', route: `/admin/hackathon/${hackathonId}/broadcast`, color: 'text-pink-400', phase: 'operations', bgImage: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?auto=format&fit=crop&q=80&w=400' },
        { icon: Clock, label: 'Attendance', description: 'Real-time check-in stats', route: `/admin/hackathon/${hackathonId}/attendance`, color: 'text-teal-400', phase: 'operations', bgImage: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&q=80&w=400' },

        // EVALUATION PHASE
        { icon: BarChart3, label: 'Round 1 Eval', description: 'Shortlisting & SMS triggers', route: `/admin/hackathon/${hackathonId}/round1-eval`, color: 'text-violet-400', phase: 'evaluation', bgImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400' },
        { icon: Award, label: 'Final Judging', description: 'Leaderboards & plagiarism', route: `/admin/hackathon/${hackathonId}/final-eval`, color: 'text-yellow-400', phase: 'evaluation', bgImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=400' },
        { icon: GraduationCap, label: 'Credentialing', description: 'Bulk certificate generation', route: `/admin/hackathon/${hackathonId}/certificates`, color: 'text-indigo-400', phase: 'evaluation', bgImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=400' },
    ];

    const phases = [
        { id: 'setup', label: 'Architecture', icon: Settings, desc: 'Foundation' },
        { id: 'operations', label: 'Execution', icon: Zap, desc: 'Live Event' },
        { id: 'evaluation', label: 'Analytics', icon: Activity, desc: 'All Results' },
    ];

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20 px-6 pt-6 bg-transparent min-h-screen">
            {/* Header / Nav */}
            <div className="flex justify-between items-center">
                <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-all"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-mono uppercase tracking-widest">Back to Hub</span>
                </button>
                <div className="flex items-center gap-6">
                    {/* NEW VIEW SUMMARY BUTTON */}
                    <button 
                        onClick={() => navigate(`/admin/hackathon/${hackathonId}/summary`)}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-amber-500 hover:border-amber-500/50 transition-all group"
                    >
                        <FileSearch className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-mono uppercase tracking-widest">View Summary</span>
                    </button>
                    
                    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-600 uppercase tracking-widest border-l border-zinc-800 pl-6">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        System Status: Active
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative p-10 rounded-[2.5rem] border border-zinc-800 bg-zinc-900/20 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
                <div className="relative z-10 space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-amber-500" />
                            <span className="text-xs font-bold text-amber-500 uppercase tracking-[0.3em]">Administrator Console</span>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                            {hackathon.name}
                        </h1>
                    </div>
                    
                    <div className="flex flex-wrap gap-8 pt-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                                <Users className="w-4 h-4 text-zinc-400" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">Registrations</p>
                                <p className="text-lg font-bold text-white leading-tight">50 Teams</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">Engagement</p>
                                <p className="text-lg font-bold text-white leading-tight">92% Active</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modern Phase Stepper */}
            <div className="flex flex-col md:flex-row gap-3 bg-zinc-950 p-2 rounded-[2rem] border border-zinc-900 shadow-2xl">
                {phases.map((phase) => (
                    <button
                        key={phase.id}
                        onClick={() => setActivePhase(phase.id as Phase)}
                        className={`flex-1 relative px-8 py-5 rounded-[1.5rem] transition-all duration-500 text-left overflow-hidden ${
                            activePhase === phase.id ? 'bg-zinc-900' : 'hover:bg-zinc-900/40'
                        }`}
                    >
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-1">
                                <phase.icon className={`w-3.5 h-3.5 ${activePhase === phase.id ? 'text-amber-500' : 'text-zinc-600'}`} />
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${activePhase === phase.id ? 'text-amber-500' : 'text-zinc-600'}`}>
                                    {phase.label}
                                </span>
                            </div>
                            <div className={`text-sm font-bold ${activePhase === phase.id ? 'text-white' : 'text-zinc-500'}`}>
                                {phase.desc}
                            </div>
                        </div>
                        {activePhase === phase.id && (
                            <motion.div 
                                layoutId="glow"
                                className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Staggered Content Grid */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activePhase}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {managementButtons
                        .filter(btn => btn.phase === activePhase)
                        .map((btn) => {
                            const Icon = btn.icon;
                            return (
                                <motion.button
                                    key={btn.route}
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigate(btn.route)}
                                    className="group relative h-64 overflow-hidden rounded-[2rem] bg-zinc-900 border border-zinc-800 text-left shadow-xl"
                                >
                                    {/* Card Background Image */}
                                    <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                                        <img 
                                            src={btn.bgImage} 
                                            alt="" 
                                            className="w-full h-full object-cover opacity-20 grayscale group-hover:grayscale-0 transition-all duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
                                    </div>

                                    {/* Content */}
                                    <div className="relative h-full p-8 flex flex-col justify-between">
                                        <div className={`w-14 h-14 rounded-2xl bg-black border border-zinc-800 flex items-center justify-center shadow-2xl group-hover:border-zinc-500 transition-colors`}>
                                            <Icon className={`w-7 h-7 ${btn.color}`} />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-black text-white tracking-tight uppercase group-hover:text-amber-500 transition-colors flex items-center gap-2">
                                                {btn.label}
                                                <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                            </h3>
                                            <p className="text-zinc-400 text-xs font-medium leading-relaxed line-clamp-2">
                                                {btn.description}
                                            </p>
                                        </div>
                                    </div>
                                </motion.button>
                            );
                        })}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
