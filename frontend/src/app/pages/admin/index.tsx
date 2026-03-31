import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Edit, Trash2, Search, Linkedin, Star, Send, MessageSquare, AlertTriangle, FileBarChart, Calendar, Edit3,
  CheckCircle, Download, FileText, Users, Trophy, Utensils, Clock, Zap, Cpu, Box, AlertCircle, PieChartIcon,
  Target, Award, ShieldAlert, MousePointer2, GanttChartSquare, Wifi, RefreshCcw, Globe, Lock, Save, CalendarDays, Timer,
  QrCode, BarChart3, TrendingUp, Percent, Sparkles, ChevronRight, Binary, Settings, PlusCircle, MoreHorizontal,
  Terminal, Layers, Info, X, UserCheck, ExternalLink, ShieldCheck, Activity, Filter, ArrowUpRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useParams } from 'react-router';
import { apiRequest } from '../../services/api';
import { getAccessToken } from '../../services/auth';

const MatteBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#0A0A0A]">
    <div className="absolute inset-0 opacity-[0.05]"
      style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '80px 80px' }} />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] opacity-70" />
  </div>
);

// ═══════════════════ PROBLEMS MANAGEMENT ═══════════════════
const mockProblems = [
  { id: '1', title: 'Smart Traffic Management', difficulty: 'Hard', domain: 'IoT', teams: 8, description: 'Design an AI-powered traffic management system.' },
  { id: '2', title: 'Campus Food Waste Tracker', difficulty: 'Medium', domain: 'Sustainability', teams: 12, description: 'Build a solution to track and reduce food waste.' },
  { id: '3', title: 'Mental Health Chatbot', difficulty: 'Medium', domain: 'Healthcare', teams: 15, description: 'Create an empathetic AI chatbot for mental health.' },
  { id: '4', title: 'Decentralized Voting', difficulty: 'Hard', domain: 'Blockchain', teams: 6, description: 'A secure, transparent voting platform on blockchain.' },
];

export function ProblemsManagementPage() {
  const [problems, setProblems] = useState(mockProblems);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const filtered = problems.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-6 pt-6 bg-transparent min-h-screen text-zinc-300">

      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900 pb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400 uppercase tracking-[0.4em] mb-2 font-bold">
            <Terminal className="w-3 h-3 animate-pulse" /> Challenge_Repository
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
            PROBLEM <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent italic">VAULT</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium">Engineer and deploy technical challenges for the network.</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(6, 182, 212, 0.3)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className={`px-8 py-4 ${showForm ? 'bg-zinc-800 text-white' : 'bg-cyan-500 text-black'} rounded-full font-black uppercase italic tracking-tighter flex items-center gap-3 transition-all`}
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Close Terminal' : 'Inject New Problem'}
        </motion.button>
      </div>

      {/* 2. Creation Form (Technical Spec Terminal) */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-zinc-900/30 border border-cyan-500/20 rounded-[2.5rem] p-10 backdrop-blur-xl relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-32 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase ml-4">Problem_Title</label>
                  <input placeholder="Enter challenge name..." className="w-full px-6 py-4 bg-black/40 border border-zinc-800 rounded-2xl text-white focus:outline-none focus:border-cyan-500 transition-all font-medium" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase ml-4">Difficulty_Level</label>
                  <select className="w-full px-6 py-4 bg-black/40 border border-zinc-800 rounded-2xl text-zinc-400 focus:outline-none focus:border-cyan-500 transition-all appearance-none cursor-pointer">
                    <option>Easy</option><option>Medium</option><option>Hard</option>
                  </select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase ml-4">Domain_Category</label>
                  <input placeholder="e.g. Artificial Intelligence, Web3, FinTech" className="w-full px-6 py-4 bg-black/40 border border-zinc-800 rounded-2xl text-white focus:outline-none focus:border-cyan-500 transition-all font-medium" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase ml-4">Problem_Manifesto</label>
                  <textarea rows={3} placeholder="Describe the constraints and objectives..." className="w-full px-6 py-4 bg-black/40 border border-zinc-800 rounded-3xl text-white focus:outline-none focus:border-cyan-500 transition-all font-medium" />
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-10 py-4 bg-cyan-500 text-black font-black uppercase italic tracking-tighter rounded-full shadow-lg shadow-cyan-500/20">
                  Save Payload
                </motion.button>
                <button onClick={() => setShowForm(false)} className="px-10 py-4 bg-zinc-800/50 text-zinc-400 rounded-full font-black uppercase italic tracking-tighter hover:bg-zinc-800 transition-all">
                  Discard
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Search & Filters */}
      <div className="relative group max-w-xl">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover:text-cyan-400 transition-colors" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="SEARCH_PROBLEM_REGISTRY..."
          className="w-full pl-14 pr-6 py-4 bg-zinc-950 border border-zinc-900 rounded-full text-xs font-mono tracking-widest text-zinc-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
        />
      </div>

      {/* 4. Problem Grid (System Spec Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(p => (
          <motion.div
            key={p.id}
            whileHover={{ y: -5, borderColor: 'rgba(6, 182, 212, 0.3)' }}
            className="group bg-zinc-900/10 border border-zinc-800 rounded-[2.5rem] p-8 transition-all relative overflow-hidden flex flex-col justify-between"
          >
            {/* Status Glow Overlay */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 blur-[80px] opacity-10 transition-opacity group-hover:opacity-20 ${p.difficulty === 'Hard' ? 'bg-red-500' : p.difficulty === 'Medium' ? 'bg-amber-500' : 'bg-cyan-500'
              }`} />

            <div className="relative z-10 space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-3 h-3 text-cyan-500" />
                    <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest font-bold">{p.domain}</span>
                  </div>
                  <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none group-hover:text-cyan-400 transition-colors">
                    {p.title}
                  </h3>
                </div>
                <div className="flex gap-2">
                  <button className="p-3 bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-white rounded-2xl transition-all"><Edit className="w-4 h-4" /></button>
                  <button className="p-3 bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-red-500 rounded-2xl transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              <p className="text-zinc-500 text-sm font-medium leading-relaxed line-clamp-2">
                {p.description}
              </p>

              <div className="flex items-center justify-between border-t border-zinc-900 pt-6">
                <div className="flex items-center gap-4">
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${p.difficulty === 'Hard' ? 'border-red-500/30 text-red-500 bg-red-500/10' :
                    p.difficulty === 'Medium' ? 'border-amber-500/30 text-amber-500 bg-amber-500/10' :
                      'border-cyan-500/30 text-cyan-500 bg-cyan-500/10'
                    }`}>
                    {p.difficulty}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-600">
                    <Sparkles className="w-3 h-3" />
                    <span className="text-[10px] font-mono uppercase tracking-wider">{p.teams} Teams_Active</span>
                  </div>
                </div>
                <div className="h-2 w-2 rounded-full bg-zinc-800 group-hover:bg-cyan-500 transition-colors" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════ MENTORS MANAGEMENT ═══════════════════
const mockMentors = [
  { id: '1', name: 'Dr. Sarah Chen', linkedin: 'linkedin.com/in/sarahchen', expertise: 'Machine Learning', assignedTeams: 3, rating: 4.8 },
  { id: '2', name: 'Raj Patel', linkedin: 'linkedin.com/in/rajpatel', expertise: 'Blockchain', assignedTeams: 2, rating: 4.5 },
  { id: '3', name: 'Emily Wright', linkedin: 'linkedin.com/in/emilywright', expertise: 'UX Design', assignedTeams: 4, rating: 4.9 },
  { id: '4', name: 'Alex Kumar', linkedin: 'linkedin.com/in/alexkumar', expertise: 'Cloud Architecture', assignedTeams: 2, rating: 4.6 },
];

export function MentorsManagementPage() {
  const [mentors] = useState(mockMentors);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-6 pt-6 bg-transparent min-h-screen text-zinc-300">

      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900 pb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 uppercase tracking-[0.4em] mb-2 font-bold">
            <UserCheck className="w-3 h-3 animate-pulse" /> Personnel_Registry
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
            MENTOR <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent italic">NETWORK</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium">Verify and authorize industry experts to guide hackathon nodes.</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(16, 185, 129, 0.3)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className={`px-8 py-4 ${showForm ? 'bg-zinc-800 text-white' : 'bg-emerald-500 text-black'} rounded-full font-black uppercase italic tracking-tighter flex items-center gap-3 transition-all`}
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Abort Entry' : 'Authorize Mentor'}
        </motion.button>
      </div>

      {/* 2. Creation Terminal (Glass-Morphism Form) */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-zinc-900/30 border border-emerald-500/20 rounded-[2.5rem] p-10 backdrop-blur-xl relative">
              <div className="absolute top-0 left-10 h-1 w-32 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase ml-4">Full_Identity</label>
                  <input placeholder="Enter legal name..." className="w-full px-6 py-4 bg-black/40 border border-zinc-800 rounded-2xl text-white focus:outline-none focus:border-emerald-500 transition-all font-medium" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase ml-4">LinkedIn_Handshake</label>
                  <div className="relative">
                    <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input placeholder="linkedin.com/in/username" className="w-full pl-12 pr-6 py-4 bg-black/40 border border-zinc-800 rounded-2xl text-white focus:outline-none focus:border-emerald-500 transition-all font-medium" />
                  </div>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase ml-4">Specialization_Tags</label>
                  <input placeholder="e.g. Distributed Systems, ML Ops, Product Design" className="w-full px-6 py-4 bg-black/40 border border-zinc-800 rounded-2xl text-white focus:outline-none focus:border-emerald-500 transition-all font-medium" />
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-10 py-4 bg-emerald-500 text-black font-black uppercase italic tracking-tighter rounded-full shadow-lg shadow-emerald-500/20">
                  Sync Profile
                </motion.button>
                <button onClick={() => setShowForm(false)} className="px-10 py-4 bg-zinc-800/50 text-zinc-400 rounded-full font-black uppercase italic tracking-tighter hover:bg-zinc-800 transition-all">
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Mentor Grid (Bento Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.map(m => (
          <motion.div
            key={m.id}
            whileHover={{ y: -8, borderColor: 'rgba(16, 185, 129, 0.3)' }}
            className="group bg-zinc-900/10 border border-zinc-800 rounded-[2.5rem] p-8 transition-all hover:bg-zinc-900/20 relative overflow-hidden"
          >
            {/* Background Pop Color */}
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-500/5 blur-[60px] group-hover:bg-emerald-500/10 transition-all" />

            <div className="relative z-10 flex flex-col h-full justify-between gap-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-black font-black text-xl shadow-lg group-hover:rotate-3 transition-transform">
                      {m.name[0]}
                    </div>
                    <div className="absolute -bottom-1 -right-1 p-1 bg-black rounded-lg border border-zinc-800">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">{m.name}</h3>
                    <p className="text-[10px] font-mono font-bold text-zinc-600 uppercase mt-2 tracking-widest">{m.expertise}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 rounded-xl border border-zinc-800">
                  <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                  <span className="text-sm font-black text-white">{m.rating}</span>
                </div>
              </div>

              <div className="space-y-4">
                <a
                  href={m.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-2xl border border-zinc-900 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group/link"
                >
                  <div className="flex items-center gap-3">
                    <Linkedin className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-zinc-400 group-hover/link:text-white transition-colors">Digital Footprint</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-zinc-700 group-hover/link:text-blue-400" />
                </a>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{m.assignedTeams} Load_Capacity</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2.5 bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-white rounded-xl transition-all"><Edit className="w-4 h-4" /></button>
                    <button className="p-2.5 bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-red-500 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════ ROUND 1 EVALUATION ═══════════════════
export function Round1EvaluationPage() {
  const { hackathonId: routeHackathonId } = useParams<{ hackathonId: string }>();
  const hackathonId = routeHackathonId || localStorage.getItem('selectedHackathonId') || '';

  type Round1Row = {
    id: string;
    teamId: string;
    team: string;
    problem: string;
    score: number;
    status: 'scored' | 'pending';
    shortlisted: boolean;
  };

  type TeamApiRow = {
    _id: string;
    name: string;
    status?: string;
    problemStatement?: { title?: string } | null;
  };

  type LeaderboardApiRow = {
    team?: { _id?: string };
    totalScore?: number;
  };

  type BulkAiResponse = {
    success: boolean;
    message: string;
    results?: {
      total: number;
      generated: number;
      failed: number;
      alreadyExists: number;
      details?: Array<{ team?: string; reason?: string; error?: string; note?: string }>;
    };
  };

  type TeamFeedbackResponse = {
    success: boolean;
    feedback?: {
      summary?: string;
      finalAdvice?: string;
      strengths?: string[];
      weaknesses?: string[];
    };
  };

  type GenerateTeamFeedbackResponse = {
    success: boolean;
    message: string;
    feedback?: {
      summary?: string;
      finalAdvice?: string;
      strengths?: string[];
      weaknesses?: string[];
    };
  };

  const [submissions, setSubmissions] = useState<Round1Row[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [feedbackByTeam, setFeedbackByTeam] = useState<Record<string, { summary?: string; strengths?: string[]; weaknesses?: string[]; finalAdvice?: string }>>({});
  const [loadingFeedbackTeamId, setLoadingFeedbackTeamId] = useState<string | null>(null);

  const scored = submissions.filter(s => s.status === 'scored');
  const pending = submissions.filter(s => s.status === 'pending');
  const shortlistedCount = submissions.filter(s => s.shortlisted).length;
  const completionPercentage = submissions.length ? Math.round((scored.length / submissions.length) * 100) : 0;

  const filteredSubmissions = submissions.filter((row) =>
    `${row.team} ${row.problem}`.toLowerCase().includes(search.toLowerCase())
  );

  const loadRound1Data = async () => {
    if (!hackathonId) {
      setError('Hackathon ID missing in route/local storage.');
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setError('Admin session expired. Please login again.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [teams, leaderboard] = await Promise.all([
        apiRequest<TeamApiRow[]>(`/hackathons/${hackathonId}/teams`, { token }),
        apiRequest<LeaderboardApiRow[]>(`/hackathons/${hackathonId}/leaderboard/round1`, { token }),
      ]);

      const scoreByTeamId: Record<string, number> = {};
      leaderboard.forEach((entry) => {
        const tid = String(entry?.team?._id || '');
        if (!tid) return;
        scoreByTeamId[tid] = Number(entry.totalScore || 0);
      });

      const mapped: Round1Row[] = teams.map((team) => {
        const score = scoreByTeamId[String(team._id)] || 0;
        const teamStatus = String(team.status || '').toLowerCase();
        return {
          id: String(team._id),
          teamId: String(team._id),
          team: team.name || 'Unknown Team',
          problem: team.problemStatement?.title || 'Not selected',
          score,
          status: score > 0 ? 'scored' : 'pending',
          shortlisted: teamStatus === 'shortlisted' || teamStatus === 'finalist' || teamStatus === 'winner',
        };
      });

      mapped.sort((a, b) => b.score - a.score);
      setSubmissions(mapped);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load round 1 evaluation data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRound1Data();
  }, [hackathonId]);

  const handleGenerateAiFeedback = async () => {
    if (!hackathonId) {
      setError('Hackathon ID missing in route/local storage.');
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setError('Admin session expired. Please login again.');
      return;
    }

    setIsGeneratingAi(true);
    setError('');
    setMessage('');
    try {
      const response = await apiRequest<BulkAiResponse>(
        `/ai/hackathons/${hackathonId}/round1/generate-feedback`,
        { method: 'POST', token }
      );
      if (response.results) {
        const firstDetail = response.results.details?.[0];
        const detailText = firstDetail?.reason || firstDetail?.error || firstDetail?.note;
        setMessage(
          `AI feedback: generated ${response.results.generated}, already exists ${response.results.alreadyExists}, failed ${response.results.failed}${detailText ? ` | ${detailText}` : ''}`
        );
      } else {
        setMessage(response.message || 'AI feedback generation complete');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to generate AI feedback');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleGenerateAndViewAiFeedback = async (teamId: string, teamName: string) => {
    const token = getAccessToken();
    if (!token) {
      setError('Admin session expired. Please login again.');
      return;
    }

    setError('');
    setMessage('');
    try {
      const generated = await apiRequest<GenerateTeamFeedbackResponse>(
        `/ai/teams/${teamId}/feedback/round1/generate`,
        { method: 'POST', token }
      );

      let response = generated;
      if (!response.feedback) {
        response = await apiRequest<TeamFeedbackResponse>(`/ai/teams/${teamId}/feedback/round1`, { token });
      }

      const summary =
        response.feedback?.summary ||
        response.feedback?.finalAdvice ||
        (response.feedback?.strengths?.[0] || response.feedback?.weaknesses?.[0] || 'AI feedback available');
      setFeedbackByTeam((prev) => ({
        ...prev, [teamId]: {
          summary: response.feedback?.summary || summary,
          strengths: response.feedback?.strengths,
          weaknesses: response.feedback?.weaknesses,
          finalAdvice: response.feedback?.finalAdvice,
        }
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to generate AI feedback for this team');
    } finally {
      setLoadingFeedbackTeamId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-6 pt-6 bg-transparent min-h-screen text-zinc-300">

      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900 pb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-mono text-violet-400 uppercase tracking-[0.4em] mb-2 font-bold">
            <Activity className="w-3 h-3 animate-pulse" /> Grading_Session_Active
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
            EVALUATION <span className="bg-gradient-to-r from-violet-400 to-purple-600 bg-clip-text text-transparent italic">STAGE_01</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium">Analyze submissions, execute shortlists, and trigger SMS protocols.</p>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerateAiFeedback}
            disabled={isGeneratingAi || loading || !hackathonId}
            className="px-6 py-3 bg-violet-600 text-white rounded-full font-black uppercase italic tracking-tighter flex items-center gap-2 text-xs"
          >
            <Send className="w-4 h-4" /> {isGeneratingAi ? 'Generating AI...' : 'Generate AI Feedback'}
          </motion.button>
          <button
            onClick={() => void loadRound1Data()}
            className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-full hover:text-white transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
          </button>
        </div>
      </div>
      {(message || error || loading) && (
        <div className="px-2">
          {loading && <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Loading round1 data...</p>}
          {message && <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">{message}</p>}
          {error && <p className="text-[10px] font-mono text-rose-400 uppercase tracking-wider mt-1">{error}</p>}
        </div>
      )}

      {/* 2. HUD Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-900 border border-zinc-900 rounded-[2rem] overflow-hidden shadow-2xl">
        {[
          { label: 'Total Inbound', value: submissions.length, icon: Terminal, color: 'text-zinc-400' },
          { label: 'Validated', value: scored.length, icon: ShieldCheck, color: 'text-emerald-400' },
          { label: 'Pending Review', value: pending.length, icon: Activity, color: 'text-amber-400' },
          { label: 'Shortlisted', value: shortlistedCount, icon: CheckCircle, color: 'text-violet-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#050505] p-8 group hover:bg-zinc-900/20 transition-all">
            <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.2em] mb-4">{stat.label}</p>
            <div className="flex items-baseline gap-3">
              <span className={`text-4xl font-black text-white tracking-tighter ${stat.color}`}>{stat.value}</span>
              <stat.icon className={`w-4 h-4 ${stat.color} opacity-20`} />
            </div>
            {i === 1 && (
              <div className="mt-4 h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  className="h-full bg-emerald-500"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex gap-4">
        <div className="relative group flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="QUERY_TEAM_DATABASE..."
            className="w-full pl-14 pr-6 py-4 bg-zinc-950 border border-zinc-900 rounded-full text-xs font-mono tracking-widest text-zinc-400 focus:outline-none focus:border-violet-500/50 transition-all"
          />
        </div>
        <button className="px-6 py-4 bg-zinc-950 border border-zinc-900 rounded-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      {/* 4. Submission Interface (Integrated Table) */}
      <div className="border border-zinc-900 rounded-[2.5rem] overflow-hidden bg-zinc-900/10 backdrop-blur-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-900">
              <th className="p-6 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Identity_Team</th>
              <th className="p-6 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Problem_Track</th>
              <th className="p-6 text-[10px] font-mono text-zinc-600 uppercase tracking-widest text-center">Score_Value</th>
              <th className="p-6 text-[10px] font-mono text-zinc-600 uppercase tracking-widest text-center">Status</th>
              <th className="p-6 text-[10px] font-mono text-zinc-600 uppercase tracking-widest text-center">Shortlist</th>
              <th className="p-6 text-[10px] font-mono text-zinc-600 uppercase tracking-widest text-right">System_Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.map((s, index) => (
              <React.Fragment key={s.id}>
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group border-b border-zinc-900/50 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="p-6">
                    <span className="text-white font-black tracking-tight uppercase italic group-hover:text-violet-400 transition-colors">{s.team}</span>
                  </td>
                  <td className="p-6">
                    <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-tighter">{s.problem}</span>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`text-lg font-black font-mono ${s.score >= 85 ? 'text-emerald-400' : s.score >= 70 ? 'text-amber-400' : 'text-zinc-700'}`}>
                      {s.score || '00'}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${s.status === 'scored' ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' : 'border-amber-500/20 text-amber-500 bg-amber-500/5'
                      }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <div className="flex justify-center">
                      {s.shortlisted ? (
                        <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-800">
                          &mdash;
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <button
                      onClick={() => {
                        setLoadingFeedbackTeamId(s.teamId);
                        void handleGenerateAndViewAiFeedback(s.teamId, s.team);
                      }}
                      disabled={loadingFeedbackTeamId === s.teamId}
                      className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:border-violet-500 hover:text-violet-400 transition-all flex items-center gap-2 ml-auto disabled:opacity-50"
                    >
                      {loadingFeedbackTeamId === s.teamId ? 'Analyzing...' : feedbackByTeam[s.teamId] ? 'View Again' : 'AI Assist'} <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                </motion.tr>
                {feedbackByTeam[s.teamId] && (
                  <tr>
                    <td colSpan={6} className="px-6 pb-6 pt-0">
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-violet-500/5 border border-violet-500/20 rounded-2xl p-6 space-y-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-violet-400" />
                          <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest">AI Analysis &mdash; {s.team}</span>
                        </div>
                        {feedbackByTeam[s.teamId].summary && (
                          <p className="text-sm text-zinc-300 leading-relaxed">{feedbackByTeam[s.teamId].summary}</p>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {feedbackByTeam[s.teamId].strengths && feedbackByTeam[s.teamId].strengths!.length > 0 && (
                            <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4">
                              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Strengths</span>
                              <ul className="mt-2 space-y-1">
                                {feedbackByTeam[s.teamId].strengths!.map((str, i) => (
                                  <li key={i} className="text-xs text-zinc-400 flex items-start gap-2"><CheckCircle className="w-3 h-3 mt-0.5 text-emerald-500 shrink-0" />{str}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {feedbackByTeam[s.teamId].weaknesses && feedbackByTeam[s.teamId].weaknesses!.length > 0 && (
                            <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4">
                              <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Areas to Improve</span>
                              <ul className="mt-2 space-y-1">
                                {feedbackByTeam[s.teamId].weaknesses!.map((w, i) => (
                                  <li key={i} className="text-xs text-zinc-400 flex items-start gap-2"><AlertTriangle className="w-3 h-3 mt-0.5 text-amber-500 shrink-0" />{w}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        {feedbackByTeam[s.teamId].finalAdvice && (
                          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Recommendation</span>
                            <p className="text-xs text-zinc-300 mt-2 leading-relaxed">{feedbackByTeam[s.teamId].finalAdvice}</p>
                          </div>
                        )}
                      </motion.div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════ FINAL EVALUATION ═══════════════════
export function FinalEvaluationPage() {
  const { hackathonId: routeHackathonId } = useParams<{ hackathonId: string }>();
  const hackathonId = routeHackathonId || localStorage.getItem('selectedHackathonId') || '';

  type FinalTeam = {
    id: string;
    teamId: string;
    team: string;
    innovation: number;
    technical: number;
    presentation: number;
    impact: number;
    total: number;
    rank: number;
  };

  type PlagiarismRunResponse = {
    success: boolean;
    message: string;
    results?: { total: number; checked: number; flagged: number; errors: number };
  };

  type PlagiarismReportResponse = {
    success: boolean;
    count: number;
    flagged: Array<{
      team?: { _id?: string; name?: string };
      plagiarismReport?: { reason?: string };
    }>;
  };

  type FinalLeaderboardRow = {
    totalScore?: number;
    team?: { _id?: string; name?: string };
    criteria?: Array<{ name?: string; score?: number }>;
  };

  type FinalSubmissionRow = {
    team?: { _id?: string; name?: string };
    githubLink?: string;
    pptUrl?: string;
    demoLink?: string;
    submittedAt?: string;
  };

  type FinalSubmissionsResponse = {
    success: boolean;
    count: number;
    submissions: FinalSubmissionRow[];
  };

  const [finalTeams, setFinalTeams] = useState<FinalTeam[]>([]);

  const [isScanRunning, setIsScanRunning] = useState(false);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [reportLoaded, setReportLoaded] = useState(false);
  const [scanError, setScanError] = useState('');
  const [scanSummary, setScanSummary] = useState('');
  const [flaggedByTeam, setFlaggedByTeam] = useState<Record<string, string>>({});
  const [aiEvalByTeam, setAiEvalByTeam] = useState<Record<string, any>>({});
  const [aiLoadingTeamId, setAiLoadingTeamId] = useState<string | null>(null);

  const criteria = [
    { label: 'Innovation', icon: Zap, color: 'text-amber-400' },
    { label: 'Technical', icon: Cpu, color: 'text-blue-400' },
    { label: 'Presentation', icon: MousePointer2, color: 'text-purple-400' },
    { label: 'Impact', icon: Target, color: 'text-emerald-400' },
  ];

  const scoreFromCriteria = (
    list: Array<{ name?: string; score?: number }> | undefined,
    key: 'innovation' | 'technical' | 'presentation' | 'impact'
  ) => {
    const match = (list || []).find((item) => String(item.name || '').toLowerCase() === key);
    return Number(match?.score || 0);
  };

  const loadFinalLeaderboard = async () => {
    if (!hackathonId) return;
    const token = getAccessToken();
    if (!token) {
      setScanError('Admin session expired. Please login again.');
      return;
    }

    try {
      const [leaderboard, submissionData] = await Promise.all([
        apiRequest<FinalLeaderboardRow[]>(`/hackathons/${hackathonId}/leaderboard/final`, { token }),
        apiRequest<FinalSubmissionsResponse>(`/hackathons/${hackathonId}/submissions/final`, { token }),
      ]);

      const byTeamId: Record<string, FinalTeam> = {};

      leaderboard.forEach((entry, index) => {
        const teamId = String(entry.team?._id || '');
        if (!teamId) return;
        byTeamId[teamId] = {
          id: teamId,
          teamId,
          team: entry.team?.name || `Team ${index + 1}`,
          innovation: scoreFromCriteria(entry.criteria, 'innovation'),
          technical: scoreFromCriteria(entry.criteria, 'technical'),
          presentation: scoreFromCriteria(entry.criteria, 'presentation'),
          impact: scoreFromCriteria(entry.criteria, 'impact'),
          total: Number(entry.totalScore || 0),
          rank: index + 1,
        };
      });

      submissionData.submissions.forEach((submission) => {
        const teamId = String(submission.team?._id || '');
        if (!teamId) return;
        if (!byTeamId[teamId]) {
          byTeamId[teamId] = {
            id: teamId,
            teamId,
            team: submission.team?.name || 'Unknown Team',
            innovation: 0,
            technical: 0,
            presentation: 0,
            impact: 0,
            total: 0,
            rank: 0,
          };
        }
      });

      const mapped = Object.values(byTeamId).sort((a, b) => b.total - a.total);
      mapped.forEach((row, index) => {
        row.rank = index + 1;
      });
      setFinalTeams(mapped);
    } catch (error) {
      setScanError(error instanceof Error ? error.message : 'Unable to load final leaderboard');
    }
  };

  const loadPlagiarismReport = async () => {
    if (!hackathonId) return;
    const token = getAccessToken();
    if (!token) {
      setScanError('Admin session expired. Please login again.');
      return;
    }

    setIsReportLoading(true);
    setScanError('');
    try {
      const report = await apiRequest<PlagiarismReportResponse>(
        `/plagiarism/hackathons/${hackathonId}/report`,
        { token }
      );

      const nextFlaggedByTeam: Record<string, string> = {};
      report.flagged.forEach((submission) => {
        const teamId = String(submission.team?._id || '');
        const teamName = submission.team?.name?.trim();
        const reason = submission.plagiarismReport?.reason || 'Potential plagiarism detected';
        if (teamId) nextFlaggedByTeam[teamId] = reason;
        if (teamName) nextFlaggedByTeam[teamName] = reason;
      });

      setFlaggedByTeam(nextFlaggedByTeam);
      setScanSummary(`Flagged teams: ${report.count}`);
    } catch (error) {
      setScanError(error instanceof Error ? error.message : 'Unable to load plagiarism report');
    } finally {
      setReportLoaded(true);
      setIsReportLoading(false);
    }
  };

  useEffect(() => {
    void loadFinalLeaderboard();
    void loadPlagiarismReport();
  }, [hackathonId]);

  const runIntegrityScan = async () => {
    if (!hackathonId) {
      setScanError('No hackathon selected for plagiarism scan.');
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setScanError('Admin session expired. Please login again.');
      return;
    }

    setIsScanRunning(true);
    setScanError('');
    try {
      const response = await apiRequest<PlagiarismRunResponse>(
        `/plagiarism/hackathons/${hackathonId}/run`,
        { method: 'POST', token }
      );
      const results = response.results;
      if (results) {
        setScanSummary(
          `Checked ${results.checked}/${results.total} submissions, flagged ${results.flagged}, errors ${results.errors}`
        );
      } else {
        setScanSummary(response.message || 'Plagiarism scan completed');
      }
      await loadPlagiarismReport();
    } catch (error) {
      setScanError(error instanceof Error ? error.message : 'Integrity scan failed');
    } finally {
      setIsScanRunning(false);
    }
  };

  const getPlagiarismStatus = (team: FinalTeam) => {
    if (!reportLoaded) return 'Unchecked';
    if (flaggedByTeam[team.teamId] || flaggedByTeam[team.team]) return 'Flagged';
    return 'Clean';
  };

  const getPlagiarismClass = (status: string) => {
    if (status === 'Flagged') {
      return 'text-rose-400 bg-rose-500/10';
    }
    if (status === 'Clean') {
      return 'text-emerald-500 bg-emerald-500/10';
    }
    return 'text-zinc-400 bg-zinc-700/20';
  };

  const handleAiEvaluation = async (teamId: string) => {
    if (!hackathonId) {
      setScanError('Hackathon ID missing.');
      return;
    }
    const token = getAccessToken();
    if (!token) {
      setScanError('Admin session expired. Please login again.');
      return;
    }
    setAiLoadingTeamId(teamId);
    setScanError('');
    try {
      const response = await apiRequest<{ success: boolean; evaluation?: any; message?: string }>(
        `/hackathons/${hackathonId}/ai/ppt-evaluation/${teamId}`,
        {
          method: 'POST',
          token,
          body: { pptText: 'Evaluate this team based on their submission data available in the system.' },
        }
      );
      if (response.evaluation) {
        setAiEvalByTeam((prev) => ({ ...prev, [teamId]: response.evaluation }));
      } else {
        setScanError(response.message || 'No evaluation data returned');
      }
    } catch (e) {
      setScanError(e instanceof Error ? e.message : 'AI evaluation failed');
    } finally {
      setAiLoadingTeamId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-6 pt-6 bg-transparent min-h-screen text-zinc-300">

      {/* 1. Cinematic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900 pb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-mono text-amber-500 uppercase tracking-[0.4em] mb-2 font-bold">
            <Award className="w-3 h-3 animate-bounce" /> Final_Decision_Matrix
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
            CHAMPIONSHIP <span className="bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent italic">DECREE</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium">Weighted multi-variate scoring & cross-repo plagiarism detection.</p>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
            onClick={runIntegrityScan}
            disabled={isScanRunning || isReportLoading || !hackathonId}
            className="px-6 py-3 border border-red-500/30 text-red-500 rounded-full font-black uppercase italic tracking-tighter flex items-center gap-2 text-xs transition-all"
          >
            <ShieldAlert className="w-4 h-4" /> {isScanRunning ? 'Scanning...' : 'Integrity Scan'}
          </motion.button>
          <button className="px-6 py-3 bg-white text-black rounded-full font-black uppercase italic tracking-tighter flex items-center gap-2 text-xs">
            <Download className="w-4 h-4" /> Export Assets
          </button>
        </div>
      </div>
      {(scanSummary || scanError || !hackathonId) && (
        <div className="px-4">
          {scanSummary && <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{scanSummary}</p>}
          {scanError && <p className="text-[10px] font-mono text-rose-400 uppercase tracking-wider mt-1">{scanError}</p>}
          {!hackathonId && (
            <p className="text-[10px] font-mono text-amber-500 uppercase tracking-wider mt-1">
              Hackathon ID missing in route/local storage.
            </p>
          )}
        </div>
      )}

      {/* 2. Scoring Criteria HUD */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-900 border border-zinc-900 rounded-[2rem] overflow-hidden">
        {criteria.map((item, i) => (
          <div key={i} className="bg-[#050505] p-8 group hover:bg-zinc-900/20 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <item.icon className={`w-4 h-4 ${item.color}`} />
              <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.3em] font-bold">{item.label}</p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white tracking-tighter">10.0</span>
              <span className="text-xs font-mono text-zinc-800">MAX_VAL</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Leaderboard - High-Density Integrated Grid */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 px-2">
          <GanttChartSquare className="w-4 h-4 text-zinc-500" />
          <h2 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.5em]">Live_Leaderboard_Stream</h2>
          <div className="h-px flex-1 bg-zinc-900" />
        </div>

        <div className="border border-zinc-900 rounded-[2.5rem] bg-zinc-900/10 backdrop-blur-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 bg-black/20">
                <th className="p-6 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Rank</th>
                <th className="p-6 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Deployment_Team</th>
                {criteria.map(c => (
                  <th key={c.label} className="p-6 text-[10px] font-mono text-zinc-600 uppercase tracking-widest text-center">{c.label}</th>
                ))}
                <th className="p-6 text-[10px] font-mono text-amber-500 uppercase tracking-widest text-center">Total_Aggregate</th>
                <th className="p-6 text-[10px] font-mono text-zinc-600 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {finalTeams.map((t, index) => {
                  const plagiarismStatus = getPlagiarismStatus(t);
                  const plagiarismReason = flaggedByTeam[t.teamId] || flaggedByTeam[t.team];
                  return (
                    <React.Fragment key={t.id}>
                      <motion.tr
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group border-b border-zinc-900/50 hover:bg-amber-500/[0.02] transition-colors"
                      >
                        <td className="p-6">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black italic shadow-2xl transition-all group-hover:scale-110
                        ${t.rank === 1 ? 'bg-amber-500 text-black shadow-amber-500/20' :
                              t.rank === 2 ? 'bg-zinc-300 text-black shadow-zinc-300/20' :
                                'bg-orange-700 text-white shadow-orange-700/20'}`}>
                            {t.rank.toString().padStart(2, '0')}
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex flex-col">
                            <span className="text-white font-black uppercase italic tracking-tight text-xl group-hover:text-amber-500 transition-colors">
                              {t.team}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold tracking-tighter ${getPlagiarismClass(plagiarismStatus)}`}>
                                {plagiarismStatus}
                              </span>
                            </div>
                            {plagiarismReason && (
                              <span className="text-[9px] font-mono text-rose-400 mt-1 line-clamp-1 uppercase tracking-tight">
                                {plagiarismReason}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-6 text-center font-mono text-sm text-zinc-400">{t.innovation.toFixed(1)}</td>
                        <td className="p-6 text-center font-mono text-sm text-zinc-400">{t.technical.toFixed(1)}</td>
                        <td className="p-6 text-center font-mono text-sm text-zinc-400">{t.presentation.toFixed(1)}</td>
                        <td className="p-6 text-center font-mono text-sm text-zinc-400">{t.impact.toFixed(1)}</td>
                        <td className="p-6 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-2xl font-black text-white italic tracking-tighter">
                              {t.total}
                            </span>
                            <span className="text-[9px] font-mono text-zinc-700">OF_40.0</span>
                          </div>
                        </td>
                        <td className="p-6 text-right">
                          <button
                            onClick={() => void handleAiEvaluation(t.teamId)}
                            disabled={aiLoadingTeamId === t.teamId}
                            className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:border-amber-500 hover:text-amber-400 transition-all flex items-center gap-2 ml-auto disabled:opacity-50"
                          >
                            {aiLoadingTeamId === t.teamId ? 'Analyzing...' : aiEvalByTeam[t.teamId] ? 'View Again' : 'AI Assist'}
                            <Sparkles className="w-3 h-3" />
                          </button>
                        </td>
                      </motion.tr>
                      {aiEvalByTeam[t.teamId] && (
                        <tr>
                          <td colSpan={8} className="px-6 pb-6 pt-1">
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 space-y-5"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-amber-400" />
                                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">AI PPT Evaluation &mdash; {t.team}</span>
                                </div>
                                {aiEvalByTeam[t.teamId].recommendation && (
                                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${aiEvalByTeam[t.teamId].recommendation === 'Shortlist' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                                      aiEvalByTeam[t.teamId].recommendation === 'Reject' ? 'border-rose-500/30 text-rose-400 bg-rose-500/10' :
                                        'border-amber-500/30 text-amber-400 bg-amber-500/10'
                                    }`}>
                                    {aiEvalByTeam[t.teamId].recommendation}
                                  </span>
                                )}
                              </div>

                              {/* Score Cards */}
                              {aiEvalByTeam[t.teamId].scores && (
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                  {Object.entries(aiEvalByTeam[t.teamId].scores as Record<string, { score: number; justification: string }>).map(([key, val]) => (
                                    <div key={key} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{key}</span>
                                        <span className={`text-lg font-black ${val.score >= 8 ? 'text-emerald-400' : val.score >= 5 ? 'text-amber-400' : 'text-rose-400'}`}>{val.score}/10</span>
                                      </div>
                                      <p className="text-[10px] text-zinc-500 leading-relaxed">{val.justification}</p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Strengths + Weaknesses */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {aiEvalByTeam[t.teamId].strengths?.length > 0 && (
                                  <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4">
                                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Strengths</span>
                                    <ul className="mt-2 space-y-1">
                                      {aiEvalByTeam[t.teamId].strengths.map((s: string, i: number) => (
                                        <li key={i} className="text-xs text-zinc-400 flex items-start gap-2"><CheckCircle className="w-3 h-3 mt-0.5 text-emerald-500 shrink-0" />{s}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {aiEvalByTeam[t.teamId].weaknesses?.length > 0 && (
                                  <div className="bg-rose-500/5 border border-rose-500/15 rounded-xl p-4">
                                    <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Weaknesses</span>
                                    <ul className="mt-2 space-y-1">
                                      {aiEvalByTeam[t.teamId].weaknesses.map((w: string, i: number) => (
                                        <li key={i} className="text-xs text-zinc-400 flex items-start gap-2"><AlertTriangle className="w-3 h-3 mt-0.5 text-rose-500 shrink-0" />{w}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>

                              {/* Missing Elements + Risk Flags */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {aiEvalByTeam[t.teamId].missing_elements?.length > 0 && (
                                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Missing Elements</span>
                                    <ul className="mt-2 space-y-1">
                                      {aiEvalByTeam[t.teamId].missing_elements.map((m: string, i: number) => (
                                        <li key={i} className="text-xs text-zinc-500">&bull; {m}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {aiEvalByTeam[t.teamId].risk_flags?.length > 0 && (
                                  <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4">
                                    <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Risk Flags</span>
                                    <ul className="mt-2 space-y-1">
                                      {aiEvalByTeam[t.teamId].risk_flags.map((r: string, i: number) => (
                                        <li key={i} className="text-xs text-zinc-500">&bull; {r}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>

                              {/* Final Summary */}
                              {aiEvalByTeam[t.teamId].final_summary && (
                                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Final Summary</span>
                                  <p className="text-xs text-zinc-300 mt-2 leading-relaxed">{aiEvalByTeam[t.teamId].final_summary}</p>
                                </div>
                              )}
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════ QR MANAGEMENT ═══════════════════
export function QRManagementPage() {
  const scanLogs = [
    { time: '09:15:22', student: 'Alex Johnson', type: 'Entry', status: 'Valid', code: 'E-982' },
    { time: '12:30:05', student: 'Jane Smith', type: 'Lunch', status: 'Valid', code: 'M-102' },
    { time: '12:32:45', student: 'John Doe', type: 'Lunch', status: 'Conflict', code: 'M-102' },
    { time: '01:15:10', student: 'Mike Brown', type: 'Entry', status: 'Valid', code: 'E-441' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-6 pt-6 bg-transparent min-h-screen text-zinc-300">

      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900 pb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-mono text-sky-400 uppercase tracking-[0.4em] mb-2 font-bold">
            <Wifi className="w-3 h-3 animate-pulse" /> Signal_Active
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
            ENCRYPTION <span className="bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent italic">GATEWAY</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium">Provision unique access vectors and monitor real-time entry packets.</p>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(56, 189, 248, 0.2)" }}
            className="px-6 py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-full font-black uppercase italic tracking-tighter flex items-center gap-2 text-xs"
          >
            <RefreshCcw className="w-4 h-4" /> Reset Tokens
          </motion.button>
        </div>
      </div>

      {/* 2. QR Provisioning Grid - Grid Locked HUD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-900 border border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black">
        {[
          { label: 'Entry Protocol', desc: 'Main Gate Access', count: 150, color: 'text-sky-400', bg: 'bg-sky-500/5' },
          { label: 'A.M. Nutrition', desc: 'Breakfast Token', count: 50, color: 'text-amber-400', bg: 'bg-amber-500/5' },
          { label: 'P.M. Nutrition', desc: 'Lunch Token', count: 50, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
        ].map((qr, i) => (
          <motion.div
            key={i}
            className={`p-8 bg-[#050505] relative group hover:bg-zinc-900/20 transition-all`}
          >
            <div className="flex justify-between items-start mb-8">
              <div className={`p-3 rounded-2xl bg-zinc-950 border border-zinc-800 ${qr.color}`}>
                <QrCode className="w-6 h-6" />
              </div>
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-800 group-hover:bg-sky-500 transition-colors" />
            </div>

            <div className="space-y-1 mb-6">
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter italic">{qr.label}</h3>
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">{qr.desc}</p>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-900 pt-6">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white tracking-tighter">{qr.count}</span>
                <span className="text-[9px] font-mono text-zinc-700 uppercase">Tokens_Active</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className={`px-5 py-2 rounded-full border border-zinc-800 text-[10px] font-black uppercase tracking-widest hover:border-white transition-all`}
              >
                Generate
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3. Live Scan Logs - Integrated Terminal */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 px-2">
          <Activity className="w-4 h-4 text-sky-500" />
          <h2 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.5em]">Live_Packet_Stream</h2>
          <div className="h-px flex-1 bg-zinc-900" />
          <span className="text-[9px] font-mono text-zinc-700">NODE_04 // FREQ_2.4GHZ</span>
        </div>

        <div className="border border-zinc-900 rounded-[2.5rem] overflow-hidden bg-zinc-900/10 backdrop-blur-xl">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-900 bg-black/20">
                <th className="p-6 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Timestamp</th>
                <th className="p-6 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Subject</th>
                <th className="p-6 text-[10px] font-mono text-zinc-600 uppercase tracking-widest text-center">Vector</th>
                <th className="p-6 text-[10px] font-mono text-zinc-600 uppercase tracking-widest text-center">Identity_Token</th>
                <th className="p-6 text-[10px] font-mono text-zinc-600 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {scanLogs.map((log, i) => (
                <tr key={i} className="group border-b border-zinc-900/50 hover:bg-white/[0.01] transition-all">
                  <td className="p-6 text-xs font-mono text-zinc-500">{log.time}</td>
                  <td className="p-6">
                    <span className="text-white font-black uppercase italic tracking-tight group-hover:text-sky-400 transition-colors">
                      {log.student}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${log.type === 'Entry' ? 'border-sky-500/20 text-sky-400 bg-sky-500/5' : 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5'
                      }`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="p-6 text-center text-[10px] font-mono text-zinc-700 group-hover:text-zinc-500">
                    {log.code}
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`text-[10px] font-mono uppercase font-bold ${log.status === 'Valid' ? 'text-emerald-500' : 'text-rose-500 animate-pulse'
                        }`}>
                        {log.status === 'Valid' ? 'Authorized' : 'Conflict_Detected'}
                      </span>
                      <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'Valid' ? 'bg-emerald-500' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                        }`} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 bg-black/40 text-center border-t border-zinc-900">
            <button className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.3em] hover:text-white transition-colors">
              Fetch Full_History.log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════ ATTENDANCE ═══════════════════
export function AttendancePage() {
  const attendanceData = [
    { time: 'Day 1 AM', present: 142, absent: 8 },
    { time: 'Day 1 PM', present: 138, absent: 12 },
    { time: 'Day 2 AM', present: 140, absent: 10 },
    { time: 'Day 2 PM', present: 135, absent: 15 },
  ];

  const recentEntries = [
    { name: 'Alex Johnson', time: '09:02 AM', method: 'QR + Face', status: 'Verified' },
    { name: 'Jane Smith', time: '09:05 AM', method: 'QR + Face', status: 'Verified' },
    { name: 'Mike Brown', time: '09:12 AM', method: 'QR Only', status: 'Manual Override' },
    { name: 'Sara Wilson', time: '09:15 AM', method: 'QR + Face', status: 'Verified' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-6 pt-6 bg-transparent min-h-screen text-zinc-300">

      {/* 1. Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-500 uppercase tracking-[0.3em] mb-2">
            <Activity className="w-3 h-3 animate-pulse" /> Live Telemetry
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
            Attendance <span className="text-zinc-500 font-light text-3xl not-italic tracking-normal">Stream</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium">Real-time gate verification & flow analysis.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-full flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] font-mono text-zinc-400 tracking-widest uppercase">System Active</span>
          </div>
        </div>
      </header>

      {/* 2. HUD Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Present Today', value: '140', icon: CheckCircle, color: 'text-emerald-400', trend: 'Live' },
          { label: 'Absent/Pending', value: '10', icon: Clock, color: 'text-red-400', trend: 'Stage 1' },
          { label: 'Verified Rate', value: '93.3%', icon: Percent, color: 'text-amber-500', trend: 'Optimal' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group p-6 rounded-[2rem] bg-zinc-900/20 border border-zinc-800 hover:border-zinc-700 transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon className="w-16 h-16" />
            </div>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-xl bg-zinc-950 border border-zinc-800 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">{stat.trend}</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter leading-none">{stat.value}</h2>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-2">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* 3. Trend Analytics Section */}
      <div className="bg-zinc-900/20 border border-zinc-800 rounded-[2.5rem] p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none" />
        <div className="flex items-center justify-between mb-8 relative z-10">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Flux Pattern Analysis
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={attendanceData} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
            <XAxis dataKey="time" stroke="#3f3f46" fontSize={10} axisLine={false} tickLine={false} />
            <YAxis stroke="#3f3f46" fontSize={10} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '10px' }}
              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
            />
            <Bar dataKey="present" radius={[4, 4, 0, 0]}>
              {attendanceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="#10b981" fillOpacity={0.8} />
              ))}
            </Bar>
            <Bar dataKey="absent" fill="#ef4444" fillOpacity={0.5} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 4. Live Log Feed */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2">
            <UserCheck className="w-4 h-4" /> Sequential Logs
          </h2>
          <span className="text-[10px] font-mono text-zinc-700">BUFFER_AUTO_SYNC: ON</span>
        </div>

        <div className="border border-zinc-800 rounded-[2.5rem] overflow-hidden bg-zinc-900/10 backdrop-blur-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/30">
                <th className="p-5 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Identity_Team</th>
                <th className="p-5 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Timestamp</th>
                <th className="p-5 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Vector</th>
                <th className="p-5 text-[10px] font-mono text-zinc-500 uppercase tracking-widest text-right">Auth_Status</th>
              </tr>
            </thead>
            <tbody>
              {recentEntries.map((e, i) => (
                <tr key={i} className="group border-b border-zinc-800/50 hover:bg-white/[0.02] transition-colors">
                  <td className="p-5">
                    <span className="text-white font-black tracking-tight uppercase italic group-hover:text-emerald-400 transition-colors">
                      {e.name}
                    </span>
                  </td>
                  <td className="p-5 text-xs font-mono text-zinc-500">{e.time}</td>
                  <td className="p-5">
                    <span className="text-[10px] font-mono text-zinc-500 px-2 py-1 bg-zinc-950 rounded border border-zinc-800">
                      {e.method}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${e.status === 'Verified' ? 'text-emerald-400' : 'text-amber-500'
                        }`}>
                        {e.status}
                      </span>
                      <ShieldCheck className={`w-3.5 h-3.5 ${e.status === 'Verified' ? 'text-emerald-500' : 'text-amber-500'}`} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 bg-black/20 text-center border-t border-zinc-800">
            <button className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.3em] hover:text-white transition-colors">
              Fetch Full_Session_History.log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════ FOOD ANALYTICS ═══════════════════
export function FoodAnalyticsPage() {
  const mealData = [
    { meal: 'Breakfast', claimed: 120, remaining: 30, cancelled: 5 },
    { meal: 'Lunch', claimed: 135, remaining: 15, cancelled: 8 },
    { meal: 'Snacks', claimed: 98, remaining: 52, cancelled: 3 },
    { meal: 'Dinner', claimed: 110, remaining: 40, cancelled: 12 },
  ];

  const pieData = [
    { name: 'Claimed', value: 463, color: '#fbbf24' },
    { name: 'Remaining', value: 137, color: '#3b82f6' },
    { name: 'Cancelled', value: 28, color: '#f43f5e' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-6 pt-6 bg-transparent min-h-screen text-zinc-300">

      {/* 1. Header Section - Matched to your template */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900 pb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-mono text-amber-500 uppercase tracking-[0.4em] mb-2 font-bold">
            <Utensils className="w-3 h-3 animate-pulse" /> Resource_Logistics
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
            F <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent italic">ANALYTICS</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium">Verify and monitor real-time meal inventory and consumption vectors.</p>
        </div>

        {/* Optional Action Button to balance the layout like the Mentor page */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-full flex items-center gap-3">
            <Activity className="w-3 h-3 text-amber-500" />
            <span className="text-[10px] font-mono text-zinc-400 tracking-widest uppercase">Live Supply Feed</span>
          </div>
        </div>
      </header>

      {/* 2. Individual Meal Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mealData.map((m, i) => (
          <motion.div
            key={m.meal}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group p-6 rounded-[2rem] bg-zinc-900/20 border border-zinc-800 hover:border-zinc-700 transition-all relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-6">
              <h4 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">{m.meal}</h4>
              <Box className="w-4 h-4 text-zinc-700 group-hover:text-amber-500 transition-colors" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <p className="text-3xl font-black text-white tracking-tighter leading-none">{m.claimed}</p>
                <span className="text-[9px] font-mono text-zinc-600 uppercase">Claimed</span>
              </div>

              <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(m.claimed / (m.claimed + m.remaining)) * 100}%` }}
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-600"
                />
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono pt-2 border-t border-zinc-800/50">
                <div className="flex items-center gap-1.5 text-blue-400">
                  <span>REM: {m.remaining}</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-500/70">
                  <AlertCircle className="w-3 h-3" />
                  <span>{m.cancelled}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3. Detailed Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Consumption Bar Chart */}
        <div className="bg-zinc-900/20 border border-zinc-800 rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Consumption_Velocity
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mealData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
              <XAxis dataKey="meal" stroke="#3f3f46" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis stroke="#3f3f46" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '10px' }}
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              />
              <Bar dataKey="claimed" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              <Bar dataKey="remaining" fill="#3b82f6" fillOpacity={0.4} radius={[4, 4, 0, 0]} />
              <Bar dataKey="cancelled" fill="#f43f5e" fillOpacity={0.4} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution Pie Chart */}
        <div className="bg-zinc-900/20 border border-zinc-800 rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-blue-400" /> System_Allocation
            </h3>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>

            <div className="flex flex-row md:flex-col gap-4 w-full md:w-auto">
              {pieData.map((p) => (
                <div key={p.name} className="flex items-center gap-3 bg-black/20 p-2 pr-4 rounded-xl border border-zinc-800/50">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase">{p.name}</span>
                    <span className="text-xs font-bold text-white">{p.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ═══════════════════ BROADCAST ═══════════════════
export function BroadcastPage() {
  const [msgType, setMsgType] = useState<'announcement' | 'reminder' | 'emergency'>('announcement');
  const pastMessages = [
    { type: 'announcement', message: 'Round 1 results are out! Check the leaderboard.', time: '2 hours ago', recipients: 150 },
    { type: 'reminder', message: 'Final submission deadline: Tomorrow 11:59 PM', time: '5 hours ago', recipients: 45 },
    { type: 'emergency', message: 'Venue change: Hall B moved to Hall C', time: '1 day ago', recipients: 150 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Broadcast Panel</h1>
        <p className="text-gray-400">Send announcements, reminders & emergency updates</p>
      </div>

      <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#FFB703]/10">
        <h3 className="text-lg font-bold text-white mb-4">New Broadcast</h3>
        <div className="flex gap-2 mb-4">
          {(['announcement', 'reminder', 'emergency'] as const).map(type => (
            <button key={type} onClick={() => setMsgType(type)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${msgType === type
              ? type === 'emergency' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-[#FFB703]/20 text-[#FFB703] border border-[#FFB703]/30'
              : 'bg-[#0F0F0F] text-gray-400 border border-white/5 hover:text-white'}`}>
              {type === 'emergency' && <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />}
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        <textarea rows={4} placeholder="Type your message here..." className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#FFB703]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FFB703] mb-4" />
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-sm">Will be sent to all participants</span>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 ${msgType === 'emergency' ? 'bg-red-500 text-white' : 'bg-gradient-to-r from-[#FFB703] to-[#FB8500] text-[#0F0F0F]'}`}>
            <Send className="w-4 h-4" /> Send {msgType === 'emergency' ? 'Emergency Alert' : 'Broadcast'}
          </motion.button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-4">Past Broadcasts</h3>
        <div className="space-y-3">
          {pastMessages.map((msg, i) => (
            <div key={i} className={`bg-[#1A1A1A] rounded-xl p-5 border ${msg.type === 'emergency' ? 'border-red-500/20' : 'border-[#FFB703]/10'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium mb-2 inline-block ${msg.type === 'emergency' ? 'bg-red-500/20 text-red-400' : msg.type === 'reminder' ? 'bg-blue-500/20 text-blue-400' : 'bg-[#FFB703]/20 text-[#FFB703]'}`}>{msg.type}</span>
                  <p className="text-white mt-1">{msg.message}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-xs">{msg.time}</p>
                  <p className="text-gray-400 text-xs mt-1">{msg.recipients} recipients</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════ CERTIFICATES ═══════════════════
export function CertificatesPage() {
  const certTypes = [
    { type: 'PARTICIPATION_V1', ready: true, color: 'text-sky-400' },
    { type: 'WINNER_PODIUM', ready: true, color: 'text-amber-400' },
    { type: 'INNOVATION_ALPHA', ready: false, color: 'text-violet-400' },
    { type: 'MENTOR_CREDENTIAL', ready: false, color: 'text-emerald-400' },
    { type: 'VOLUNTEER_CORE', ready: true, color: 'text-zinc-400' },
    { type: 'SPONSOR_APPRECIATION', ready: true, color: 'text-rose-400' },
    { type: 'TECHNICAL_EXCELLENCE', ready: true, color: 'text-blue-400' },
    { type: 'COMMUNITY_IMPACT', ready: true, color: 'text-cyan-400' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-6 pt-6 min-h-screen text-zinc-200 font-sans">
      <MatteBackground />

      {/* 1. Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-900 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-500 uppercase tracking-[0.4em] font-bold">
            <Cpu className="w-4 h-4 animate-pulse" /> Credential_Engine_V2
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
            SMART <span className="bg-gradient-to-r from-emerald-400 to-teal-600 bg-clip-text text-transparent italic">MINT</span>
          </h1>
          <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest">Execute batch distribution protocols.</p>
        </div>

        <button className="px-8 py-4 bg-white text-black rounded-none font-black uppercase italic tracking-tighter flex items-center gap-3 text-xs hover:bg-emerald-500 transition-colors">
          <Download className="w-4 h-4" /> Bulk_Export_All
        </button>
      </header>

      {/* 2. High-Density Unified Table Module */}
      <div className="border border-zinc-800 rounded-none bg-black/40 overflow-hidden shadow-2xl">
        <div className="bg-zinc-900/50 p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Layers className="w-4 h-4 text-zinc-600" />
            <span className="text-[11px] font-mono font-black text-zinc-400 uppercase tracking-[0.3em]">Active_Registry_Nodes</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-700 font-bold uppercase">Visible_Teams: {certTypes.length}</span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800/50 text-[11px] font-mono text-zinc-500 uppercase tracking-widest bg-black/20">
              <th className="p-6 font-black">Deployment_Team_Identifier</th>
              <th className="p-6 font-black text-right">System_Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {certTypes.map((cert, i) => (
              <tr key={i} className="group hover:bg-zinc-900/30 transition-colors duration-200">
                <td className="p-6">
                  <div className="flex items-center gap-6">
                    <div className={`w-1.5 h-6 bg-zinc-800 group-hover:bg-emerald-500 transition-colors`} />
                    <span className="text-lg font-black text-white uppercase italic tracking-tighter group-hover:text-emerald-400 transition-colors">
                      {cert.type}
                    </span>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex items-center justify-end gap-3">
                    {cert.ready ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-2.5 bg-zinc-950 border-2 border-zinc-800 text-[10px] font-mono font-black uppercase tracking-widest text-zinc-300 hover:border-emerald-500 hover:text-emerald-400 transition-all flex items-center gap-3"
                      >
                        <Download className="w-4 h-4" /> Download_Asset
                      </motion.button>
                    ) : (
                      <div className="flex items-center gap-3 px-6 py-2.5 opacity-30 select-none">
                        <Terminal className="w-4 h-4 text-zinc-700" />
                        <span className="text-[10px] font-mono font-black uppercase tracking-widest text-zinc-700">Sync_In_Progress</span>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer info bar */}
        <div className="p-4 bg-zinc-900/30 border-t border-zinc-800 flex justify-between items-center px-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest">Uplink_Nominal</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-zinc-700" />
              <span className="text-[10px] font-mono text-zinc-600 font-bold uppercase tracking-tighter italic">P2P_Verified_Mints</span>
            </div>
          </div>
          <span className="text-[9px] font-mono text-zinc-800 uppercase tracking-[0.3em]">System_Ver: 2.0.4_BETA</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════ EVENT SUMMARY ═══════════════════
export function EventSummaryPage() {
  const summaryStats = [
    { label: 'Total_Registrations', value: '150 teams', icon: Users, change: '+12%' },
    { label: 'Peak_Attendance', value: '142/150', icon: TrendingUp, change: '94.7%' },
    { label: 'Resource_Provision', value: '1,256', icon: Utensils, change: '—' },
    { label: 'Payload_Success', value: '45/50', icon: FileText, change: '90%' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-6 pt-6 min-h-screen text-zinc-200">
      {/* 1. REFINED HEADER SECTION */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800 pb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-mono text-amber-500 uppercase tracking-[0.4em] mb-2 font-bold">
            <FileBarChart className="w-4 h-4" /> Mission_Debrief_Node
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
            MISSION <span className="text-zinc-800 not-italic">SUMMARY</span>
          </h1>
          <p className="text-zinc-400 text-sm font-bold uppercase tracking-tight">Auto-generated mission analytics and final deployment results.</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-10 py-5 bg-white text-black rounded-none font-black uppercase italic tracking-tighter flex items-center gap-3 text-sm hover:bg-amber-400 transition-colors"
        >
          <Download className="w-5 h-5" /> Intelligence_Report.pdf
        </motion.button>
      </header>

      {/* 2. GRID METRICS - BOLD INTERLOCKING STYLE */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-zinc-800 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black">
        {summaryStats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-[#0A0A0A] p-12 group hover:bg-zinc-900 transition-colors duration-500">
              <div className="flex items-center gap-3 mb-10">
                <Icon className="w-4 h-4 text-amber-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-[0.4em] font-black">{s.label}</span>
              </div>
              <p className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">{s.value.split(' ')[0]}</p>
              <p className="text-emerald-500 text-xs font-mono font-bold mt-2 tracking-widest uppercase">{s.change} flux</p>
            </div>
          );
        })}
      </div>

      {/* 3. PODIUM / WINNERS SECTION - HIGH CONTRAST */}
      <div className="bg-[#0A0A0A] border border-zinc-800 rounded-[3rem] p-12 relative overflow-hidden">
        <h3 className="text-[11px] font-mono text-amber-500 uppercase tracking-[0.6em] mb-12 font-black flex items-center gap-4">
          🏆 Podium_Entities_Registry
        </h3>
        <div className="space-y-6">
          {[
            { rank: '01', team: 'Byte Builders', prize: '₹50,000', problem: 'Campus Food Waste Tracker', color: 'bg-amber-500 text-black' },
            { rank: '02', team: 'Code Crusaders', prize: '₹30,000', problem: 'Smart Traffic Management', color: 'bg-zinc-300 text-black' },
            { rank: '03', team: 'Pixel Pirates', prize: '₹20,000', problem: 'Smart Traffic Management', color: 'bg-orange-800 text-white' },
          ].map(w => (
            <div key={w.rank} className="flex items-center justify-between p-10 bg-black/40 border border-zinc-800 rounded-none hover:border-white transition-all group">
              <div className="flex items-center gap-10">
                <span className={`w-16 h-16 rounded-none flex items-center justify-center font-black italic text-2xl shadow-2xl ${w.color}`}>
                  {w.rank}
                </span>
                <div className="space-y-1">
                  <p className="text-3xl font-black text-white uppercase italic tracking-tighter group-hover:text-amber-500 transition-colors">{w.team}</p>
                  <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-bold">{w.problem}</p>
                </div>
              </div>
              <span className="text-4xl font-black text-amber-500 italic tracking-tighter">{w.prize}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. ANALYTICS SUMMARY - HUD STYLE */}
      <div className="bg-[#0A0A0A] border border-zinc-800 rounded-[3rem] p-12">
        <h3 className="text-[11px] font-mono text-zinc-500 uppercase tracking-[0.6em] mb-12 font-black flex items-center gap-4">
          📊 Data_Verification_Matrix
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-zinc-800 border border-zinc-800 overflow-hidden">
          {[
            { label: 'Avg Score (R1)', value: '78.4/100' },
            { label: 'Avg Score (Final)', value: '33.7/40' },
            { label: 'Teams Shortlisted', value: '15/50' },
            { label: 'Mentors Assigned', value: '08' },
            { label: 'QR Scans Total', value: '2,450' },
            { label: 'Identity Mints', value: '153' },
          ].map(a => (
            <div key={a.label} className="p-10 bg-black hover:bg-zinc-900 transition-colors">
              <p className="text-zinc-600 text-[10px] font-mono font-bold uppercase tracking-widest mb-4">{a.label}</p>
              <p className="text-2xl font-black text-white italic font-mono tracking-tighter">{a.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


// ═══════════════════ CORE CONFIG PAGE ═══════════════════
export function CoreConfigPage() {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  const [isPublic, setIsPublic] = useState(false);

  // State for deadlines
  const [r1Date, setR1Date] = useState("2026-03-01");
  const [r1Time, setR1Time] = useState("23:59");
  const [finalDate, setFinalDate] = useState("2026-03-15");
  const [finalTime, setFinalTime] = useState("18:00");

  const [r1Matrix, setR1Matrix] = useState([
    { criterion: 'Technical Execution', weight: 60 },
    { criterion: 'Innovation', weight: 40 },
  ]);

  const [finalMatrix, setFinalMatrix] = useState([
    { criterion: 'Market Viability', weight: 50 },
    { criterion: 'Presentation', weight: 50 },
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24 px-8 pt-10 min-h-screen text-zinc-100 font-sans tracking-tight">

      {/* 1. Header Protocol */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-zinc-900">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
            CORE <span className="text-amber-500">PARAMS</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium">Manage deadlines, evaluation criteria, and partner nodes.</p>
        </div>

        <div className="flex items-center gap-4 bg-zinc-900/80 p-2 rounded-[2rem] border border-zinc-800">
          <button
            onClick={() => setIsPublic(!isPublic)}
            className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all font-bold text-xs ${isPublic ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-zinc-400 hover:text-white'
              }`}
          >
            {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {isPublic ? 'Scores: Public' : 'Scores: Internal'}
          </button>
          <button className="px-10 py-3 bg-white text-black font-black rounded-full flex items-center gap-3 text-sm hover:bg-amber-500 transition-all active:scale-95 shadow-xl shadow-white/5">
            <Save className="w-5 h-5" /> Save Changes
          </button>
        </div>
      </header>

      {/* 2. Round 1 Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center shadow-xl shadow-amber-500/10">
            <Layers className="w-6 h-6 text-black" />
          </div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase">Phase_01: Qualifier</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* SEPARATE DATE & TIME CONTAINERS */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[2.5rem] space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-500" /> Date Protocol
                </label>
                <div className="flex items-center gap-3">
                  <input type="date" value={r1Date} onChange={(e) => setR1Date(e.target.value)} className="flex-1 bg-black border border-zinc-800 rounded-xl p-4 text-lg font-bold text-white focus:border-amber-500 outline-none transition-all" />
                  <button className="px-4 py-4 bg-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-700 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all">
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-zinc-800/50">
                <label className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Timer className="w-4 h-4 text-amber-500" /> Time Protocol
                </label>
                <div className="flex items-center gap-3">
                  <input type="time" value={r1Time} onChange={(e) => setR1Time(e.target.value)} className="flex-1 bg-black border border-zinc-800 rounded-xl p-4 text-lg font-bold text-white focus:border-amber-500 outline-none transition-all" />
                  <button className="px-4 py-4 bg-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-700 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all">
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Matrix Module */}
          <div className="lg:col-span-7 bg-zinc-900/40 border border-zinc-800 p-8 rounded-[2.5rem] space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest">Evaluation_Matrix</p>
              <button onClick={() => setR1Matrix([...r1Matrix, { criterion: '', weight: 0 }])} className="p-2 bg-amber-500 text-black rounded-full hover:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {r1Matrix.map((m, i) => (
                <div key={i} className="flex items-center gap-3 bg-black/40 p-4 rounded-2xl border border-zinc-800 hover:border-zinc-600 transition-all">
                  <input value={m.criterion} placeholder="Criteria Name" onChange={(e) => {
                    const next = [...r1Matrix]; next[i].criterion = e.target.value; setR1Matrix(next);
                  }} className="flex-1 bg-transparent font-bold text-sm outline-none text-zinc-400 focus:text-white" />
                  <input type="number" value={m.weight} onChange={(e) => {
                    const next = [...r1Matrix]; next[i].weight = parseInt(e.target.value); setR1Matrix(next);
                  }} className="w-16 bg-zinc-900 border border-zinc-800 rounded-xl py-2 text-center font-mono font-black text-amber-500 outline-none" />
                  <button onClick={() => setR1Matrix(r1Matrix.filter((_, idx) => idx !== i))} className="p-2 text-zinc-700 hover:text-rose-500">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Final Round Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center shadow-xl shadow-violet-500/10">
            <Award className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase">Phase_02: Final_Pitch</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[2.5rem] space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-violet-500" /> Final Date
                </label>
                <div className="flex items-center gap-3">
                  <input type="date" value={finalDate} onChange={(e) => setFinalDate(e.target.value)} className="flex-1 bg-black border border-zinc-800 rounded-xl p-4 text-lg font-bold text-white focus:border-violet-500 outline-none transition-all" />
                  <button className="px-4 py-4 bg-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-700 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all">
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-zinc-800/50">
                <label className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Timer className="w-4 h-4 text-violet-500" /> Final Time
                </label>
                <div className="flex items-center gap-3">
                  <input type="time" value={finalTime} onChange={(e) => setFinalTime(e.target.value)} className="flex-1 bg-black border border-zinc-800 rounded-xl p-4 text-lg font-bold text-white focus:border-violet-500 outline-none transition-all" />
                  <button className="px-4 py-4 bg-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-700 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all">
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-zinc-900/40 border border-zinc-800 p-8 rounded-[2.5rem] space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest">Judging_Criteria</p>
              <button onClick={() => setFinalMatrix([...finalMatrix, { criterion: '', weight: 0 }])} className="p-2 bg-violet-600 text-white rounded-full hover:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {finalMatrix.map((m, i) => (
                <div key={i} className="flex items-center gap-3 bg-black/40 p-4 rounded-2xl border border-zinc-800 hover:border-zinc-600 transition-all">
                  <input value={m.criterion} placeholder="Criteria Name" onChange={(e) => {
                    const next = [...finalMatrix]; next[i].criterion = e.target.value; setFinalMatrix(next);
                  }} className="flex-1 bg-transparent font-bold text-sm outline-none text-zinc-400 focus:text-white" />
                  <input type="number" value={m.weight} onChange={(e) => {
                    const next = [...finalMatrix]; next[i].weight = parseInt(e.target.value); setFinalMatrix(next);
                  }} className="w-16 bg-zinc-900 border border-zinc-800 rounded-xl py-2 text-center font-mono font-black text-violet-500 outline-none" />
                  <button onClick={() => setFinalMatrix(finalMatrix.filter((_, idx) => idx !== i))} className="p-2 text-zinc-700 hover:text-rose-500">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Partner Registry */}
      <section className="pt-10 border-t border-zinc-900 space-y-8">
        <h3 className="text-xs font-mono text-zinc-500 font-bold uppercase tracking-[0.4em] flex items-center gap-3 px-2">
          <ShieldCheck className="w-4 h-4 text-sky-500" /> Partner_Node_Registry
        </h3>
        <div className="flex flex-wrap gap-4">
          {['Google Cloud', 'Intel AI', 'GitHub', 'Devfolio'].map(s => (
            <div key={s} className="group px-8 py-4 bg-zinc-900/50 border border-zinc-800 rounded-[1.5rem] hover:border-sky-500 transition-all cursor-default flex items-center gap-4">
              <span className="text-xs font-black text-zinc-400 uppercase tracking-tighter group-hover:text-white">{s}</span>
              <button className="p-1 hover:bg-rose-500/20 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4 text-zinc-700 group-hover:text-rose-500" />
              </button>
            </div>
          ))}
          <button className="px-8 py-4 bg-black border-2 border-dashed border-zinc-800 rounded-[1.5rem] text-xs font-bold text-zinc-600 hover:border-white hover:text-white transition-all">
            + New Entity
          </button>
        </div>
      </section>

    </div>
  );
}
