import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Trophy,
  Globe,
  User,
  Shield,
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  role: 'student' | 'admin';
}

const studentItems = [
  { path: '/student/dashboard', label: 'DASHBOARD', icon: LayoutDashboard, color: 'violet' },
  { path: '/student/hackathons', label: 'HACHATHONS', icon: Trophy, color: 'amber' },
  { path: '/student/global-leaderboard', label: 'RANKINGS', icon: Globe, color: 'cyan' },
  { path: '/student/profile', label: 'PROFILE', icon: User, color: 'rose' },
];

const adminItems = [
  { path: '/admin/dashboard', label: 'COMMAND', icon: LayoutDashboard, color: 'orange' },
  // { path: '/admin/profile', label: 'PROFILE', icon: Shield, color: 'emerald' },
];

export function Sidebar({ role }: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const menuItems = role === 'student' ? studentItems : adminItems;
  
  const isStudent = role === 'student';
  const themeBase = isStudent ? 'violet' : 'amber';

  return (
    <motion.aside
      initial={{ width: 80 }}
      animate={{ width: isHovered ? 240 : 80 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      // Thinner Profile & Sharper Glass
      className="fixed left-4 top-24 bottom-6 bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[2rem] z-50 overflow-hidden shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.2,1,0.2,1)]"
    >
      <div className="flex flex-col h-full">
        {/* ══════════ Navigation Section ══════════ */}
        <div className="flex-1 py-10 px-3 space-y-6">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link key={item.path} to={item.path} className="block group">
                <motion.div
                  whileHover={{ x: 4 }}
                  className="relative flex items-center gap-4 px-2"
                >
                  {/* Ultra-Thin Active Marker */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActivePill"
                      className={`absolute inset-y-1 -left-3 w-[2px] bg-${themeBase}-500/80 rounded-full blur-[1px]`}
                    />
                  )}

                  {/* Minimalist Icon Box */}
                  <div className={`
                    relative w-11 h-11 shrink-0 flex items-center justify-center rounded-xl transition-all duration-500
                    ${isActive 
                      ? `bg-white/[0.05] border border-white/10` 
                      : `bg-transparent border border-transparent group-hover:border-white/5 group-hover:bg-white/[0.02]`}
                  `}>
                    <Icon 
                      className={`w-[18px] h-[18px] stroke-[1.25] transition-all duration-500
                        ${isActive ? `text-${themeBase}-400` : `text-zinc-500 group-hover:text-zinc-300`}
                      `} 
                    />
                  </div>

                  {/* Thinner, More Spaced Typography */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col flex-1"
                      >
                        <span className={`text-[10px] font-medium uppercase tracking-[0.3em] whitespace-nowrap transition-colors
                          ${isActive ? 'text-zinc-100' : 'text-zinc-500 group-hover:text-zinc-300'}
                        `}>
                          {item.label}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.aside>
  );
}