
import { useState } from 'react';
import { Flame, ArrowLeft, LogIn, Eye, EyeOff, Mail, Lock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  onBack: () => void;
  onNavigateToRegister: () => void;
  initialRole: 'student' | 'admin';
}

export function LoginPage({ onLogin, onBack, onNavigateToRegister, initialRole }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isStudent = initialRole === 'student';
  const accentGradient = isStudent
    ? 'from-violet-500 via-fuchsia-500 to-pink-500'
    : 'from-amber-500 via-orange-500 to-rose-500';
  const accentColor = isStudent ? 'violet' : 'amber';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await onLogin(email, password);
      if (!result.success) {
        setError(result.message || 'Invalid credentials for selected role');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        <div className={`absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br ${isStudent ? 'from-violet-600/[0.08] via-fuchsia-500/[0.04]' : 'from-amber-600/[0.08] via-orange-500/[0.04]'} to-transparent blur-[120px]`} />
        <div className={`absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-gradient-to-tr ${isStudent ? 'from-cyan-500/[0.06]' : 'from-rose-500/[0.06]'} to-transparent blur-[100px]`} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Flame className="w-8 h-8 text-amber-500" fill="#f59e0b" />
              <div className="absolute inset-0 blur-lg bg-amber-500 opacity-40" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic">HackFire</span>
          </div>
          <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.4em] font-bold">Multi-Hackathon Platform</p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-zinc-950/60 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-zinc-800/80 relative overflow-hidden"
        >
          {/* Subtle inner glow */}
          <div className={`absolute -top-10 -right-10 w-40 h-40 bg-${accentColor}-500/5 blur-[60px] pointer-events-none`} />

          {/* Back button */}
          <button
            onClick={onBack}
            className="group flex items-center gap-2 mb-8 text-zinc-600 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[11px] font-mono uppercase tracking-widest">Back</span>
          </button>

          {/* Role Indicator */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">
                Sign In
              </h2>
              <p className="text-zinc-400 text-xs mt-1 font-medium">Welcome back, let's get started</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-${accentColor}-500/10 border border-${accentColor}-500/20`}>
              <Sparkles className={`w-3 h-3 text-${accentColor}-500`} />
              <span className={`text-[10px] font-black uppercase tracking-widest text-${accentColor}-400`}>
                {isStudent ? 'Student' : 'Admin'}
              </span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                <Mail className="w-4 h-4 text-zinc-600 group-focus-within:text-zinc-400 transition-colors" />
              </div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`w-full pl-12 pr-4 py-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white placeholder-zinc-500 text-sm font-medium focus:outline-none focus:border-${accentColor}-500/40 transition-all`}
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                <Lock className="w-4 h-4 text-zinc-600 group-focus-within:text-zinc-400 transition-colors" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={`w-full pl-12 pr-12 py-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white placeholder-zinc-600 text-sm font-medium focus:outline-none focus:border-${accentColor}-500/40 transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
              className={`w-full py-4 rounded-full bg-gradient-to-r ${accentGradient} text-${isStudent ? 'white' : 'black'} font-black uppercase italic tracking-tighter text-sm flex items-center justify-center gap-3 shadow-xl ${isStudent ? 'shadow-violet-500/20' : 'shadow-amber-500/20'} transition-all`}
            >
              <LogIn className="w-5 h-5" />
              <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
              <motion.span animate={{ x: isHovering ? 4 : 0 }} transition={{ duration: 0.2 }}>→</motion.span>
            </motion.button>
          </form>

          {/* Register Link */}
          {isStudent && (
  <div className="mt-8 text-center">
    <button
      onClick={onNavigateToRegister}
      className="text-xs text-zinc-400 hover:text-white transition-colors font-medium"
    >
      Don't have an account?{' '}
      <span className={`text-${accentColor}-500 font-bold`}>
        Register here
      </span>
    </button>
  </div>
)}
          
        </motion.div>
      </div>
    </div>
  );
}
