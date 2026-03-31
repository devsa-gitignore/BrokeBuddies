
import { Flame, Trophy, Users, Zap, Award, TrendingUp, ArrowRight, GraduationCap, Shield, Sparkles, ArrowUpRight, Play, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onStudentLogin: () => void;
  onAdminLogin: () => void;
  onStudentRegister: () => void;
  onAdminRegister: () => void;
}

export function LandingPage({ onStudentLogin, onAdminLogin, onStudentRegister, onAdminRegister }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      {/* Subtle grid background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '80px 80px' }} />
      </div>

      {/* Floating gradient orbs */}
      <div className="fixed inset-0 pointer-events-none -z-5 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-violet-600/[0.08] via-fuchsia-500/[0.05] to-transparent blur-[120px]" />
        <div className="absolute top-1/2 -left-60 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-cyan-500/[0.06] via-blue-500/[0.04] to-transparent blur-[100px]" />
        <div className="absolute -bottom-40 right-1/3 w-[600px] h-[600px] rounded-full bg-gradient-to-t from-amber-500/[0.05] via-orange-500/[0.03] to-transparent blur-[120px]" />
      </div>

      {/* ══════════ Hero Section — Center-Aligned ══════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Logo + Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative">
              <Flame className="w-12 h-12 text-amber-500" fill="#f59e0b" />
              <div className="absolute inset-0 blur-xl bg-amber-500 opacity-30" />
            </div>
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-zinc-900/60 border border-zinc-800">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-[10px] font-semibold text-zinc-300 uppercase tracking-[0.3em]">India's #1 Multi-Hackathon Platform</span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold leading-[0.9] tracking-tighter uppercase">
              <span className="block text-white italic">Stop</span>
              <span className="block text-white italic">Planning</span>
              <span className="block italic">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500">Start</span>
              </span>
              <span className="block italic">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-500 to-pink-500">Hacking</span>
              </span>
            </h1>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-zinc-300 text-lg md:text-xl max-w-xl mx-auto leading-relaxed font-medium"
          >
            One platform. Unlimited hackathons. Real-time leaderboards,
            team collaboration, and your global HackScore — all in one place.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <motion.button
              onClick={onStudentRegister}
              whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(251, 191, 36, 0.15)' }}
              whileTap={{ scale: 0.96 }}
              className="group px-10 py-5 rounded-full bg-white text-black font-extrabold uppercase italic tracking-tighter text-sm flex items-center gap-3 hover:bg-amber-400 transition-all"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button
              onClick={onAdminLogin}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="px-10 py-5 rounded-full border-2 border-zinc-700 text-zinc-300 font-bold uppercase tracking-tighter text-sm hover:border-zinc-500 hover:text-white transition-all flex items-center gap-3"
            >
              <Play className="w-4 h-4" />
              Organize Events
            </motion.button>
          </motion.div>

          {/* Quick login link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="pt-4"
          >
            <span className="text-zinc-400 text-sm">Already have an account?{' '}
              <button onClick={onStudentLogin} className="text-amber-500 font-bold hover:text-amber-400 transition-colors">
                Log In
              </button>
            </span>
          </motion.div>
        </div>
      </section>

      {/* ══════════ Role Selection — Bento Grid ══════════ */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.5em] text-center mb-12"
          >
            Choose Your Path
          </motion.p>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Student Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, borderColor: 'rgba(139, 92, 246, 0.3)' }}
              className="group relative bg-zinc-900/20 rounded-[2.5rem] border border-zinc-800 overflow-hidden transition-all duration-500"
            >
              {/* Background glow */}
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-violet-500/10 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="relative p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-xl shadow-violet-500/20 group-hover:scale-110 transition-transform duration-300">
                      <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold uppercase italic tracking-tighter">Student</h3>
                      <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">Participant Access</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-6 h-6 text-zinc-700 group-hover:text-violet-400 transition-colors" />
                </div>

                <p className="text-zinc-300 mb-8 leading-relaxed text-sm">
                  Compete in hackathons, form teams, submit projects, and climb the global leaderboard with your HackScore.
                </p>

                <div className="space-y-3 mb-10">
                  {[
                    'Join multiple hackathons nationwide',
                    'Build teams & collaborate in real-time',
                    'Track your HackScore & global rank',
                    'Earn certificates & recognition',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">
                      <ChevronRight className="w-3 h-3 text-violet-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <motion.button
                    onClick={onStudentLogin}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 py-4 px-6 rounded-full bg-white text-black font-extrabold uppercase italic tracking-tighter text-xs flex items-center justify-center gap-2 hover:bg-violet-400 transition-all"
                  >
                    Login <ArrowRight className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={onStudentRegister}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 py-4 px-6 rounded-full border-2 border-zinc-700 text-zinc-300 font-bold uppercase tracking-tighter text-xs hover:border-zinc-500 hover:text-white transition-all"
                  >
                    Sign Up
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Admin Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              whileHover={{ y: -8, borderColor: 'rgba(251, 191, 36, 0.3)' }}
              className="group relative bg-zinc-900/20 rounded-[2.5rem] border border-zinc-800 overflow-hidden transition-all duration-500"
            >
              {/* Background glow */}
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-amber-500/10 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="relative p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl shadow-amber-500/20 group-hover:scale-110 transition-transform duration-300">
                      <Shield className="w-8 h-8 text-black" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold uppercase italic tracking-tighter">Admin</h3>
                      <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">Organizer Access</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-6 h-6 text-zinc-700 group-hover:text-amber-400 transition-colors" />
                </div>

                <p className="text-zinc-300 mb-8 leading-relaxed text-sm">
                  Create and manage hackathons, verify participants, monitor analytics, and generate event reports seamlessly.
                </p>

                <div className="space-y-3 mb-10">
                  {[
                    'Create & manage hackathon events',
                    'Verify registrations & gate entry',
                    'Real-time food & attendance analytics',
                    'Generate certificates & reports',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">
                      <ChevronRight className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <motion.button
                    onClick={onAdminLogin}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 py-4 px-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-black font-extrabold uppercase italic tracking-tighter text-xs flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-amber-500/20 transition-all"
                  >
                    Login <ArrowRight className="w-4 h-4" />
                  </motion.button>
                  
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════ Features — Bento Grid ══════════ */}
      <section className="py-24 px-6 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tighter uppercase italic mb-4">
              Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-500">HackFire</span>?
            </h2>
            <p className="text-zinc-300 text-sm max-w-md mx-auto">Everything you need to run and participate in world-class hackathons.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Trophy, title: 'Multi-Hackathon', desc: 'Participate in unlimited hackathons from top colleges nationwide', color: 'text-amber-500', bg: 'from-amber-500/10' },
              { icon: Users, title: 'Team Collaboration', desc: 'Form teams, collaborate, and build amazing projects together', color: 'text-violet-500', bg: 'from-violet-500/10' },
              { icon: Zap, title: 'Real-Time Tracking', desc: 'Live leaderboards, instant updates, and dynamic QR systems', color: 'text-cyan-500', bg: 'from-cyan-500/10' },
              { icon: Award, title: 'Global Rankings', desc: 'Compete for the top spot on our prestigious global leaderboard', color: 'text-emerald-500', bg: 'from-emerald-500/10' },
              { icon: TrendingUp, title: 'HackScore System', desc: 'Build your reputation with our comprehensive scoring algorithm', color: 'text-rose-500', bg: 'from-rose-500/10' },
              { icon: Flame, title: 'End-to-End Platform', desc: 'Registration to certificates — everything in one seamless flow', color: 'text-orange-500', bg: 'from-orange-500/10' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -4, borderColor: 'rgba(255, 255, 255, 0.1)' }}
                className="group p-8 rounded-[2rem] bg-zinc-900/20 border border-zinc-800/60 transition-all duration-300 relative overflow-hidden"
              >
                <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${feature.bg} to-transparent blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-5 ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold uppercase tracking-tight mb-2">{feature.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA Section ══════════ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-zinc-900/30 rounded-[3rem] p-16 md:p-20 border border-zinc-800 overflow-hidden text-center"
          >
            {/* Background gradient shapes */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -left-20 w-80 h-80 bg-violet-500/10 rounded-full blur-[100px]" />
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-5xl md:text-6xl font-extrabold tracking-tighter uppercase italic mb-6 leading-[0.95]">
                Ready to
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500">Ignite</span> Your
                <br />Journey?
              </h2>
              <p className="text-zinc-300 mb-10 text-sm max-w-md mx-auto">Join thousands of students competing across India. Build your reputation, earn your rank.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button
                  onClick={onStudentRegister}
                  whileHover={{ scale: 1.04, boxShadow: '0 0 50px rgba(251, 191, 36, 0.15)' }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-white text-black font-extrabold uppercase italic tracking-tighter text-sm hover:bg-amber-400 transition-all"
                >
                  Start Competing
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
                <motion.button
                  onClick={onAdminRegister}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-3 px-10 py-5 rounded-full border-2 border-zinc-700 text-zinc-300 font-bold uppercase tracking-tighter text-sm hover:border-white hover:text-white transition-all"
                >
                  Organize a Hackathon
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════ Footer ══════════ */}
      <footer className="border-t border-zinc-900 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Flame className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-extrabold uppercase italic tracking-tighter text-zinc-400">HackFire</span>
          </div>
          <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium">© 2026 HackFire. Powering the future of competitive coding.</p>
        </div>
      </footer>
    </div>
  );
}