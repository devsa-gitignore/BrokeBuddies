import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Trophy, 
  Users, 
  FileText, 
  Target,
  Upload,
  BarChart3,
  UserCheck,
  Send,
  Award,
  Globe,
  User,
  ChevronLeft
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface StudentSidebarProps {
  hackathonId?: string | null;
}

export default function StudentSidebar({ hackathonId }: StudentSidebarProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard', showAlways: true },
    { icon: Trophy, label: 'Hackathons', path: '/student/hackathons', showAlways: true },
    { icon: Users, label: 'My Team', path: '/student/team', showAlways: false },
    { icon: Target, label: 'Problems', path: '/student/problems', showAlways: false },
    { icon: Upload, label: 'Round 1 Submission', path: '/student/round1-submission', showAlways: false },
    { icon: BarChart3, label: 'Round 1 Leaderboard', path: '/student/round1-leaderboard', showAlways: false },
    { icon: UserCheck, label: 'Mentor Selection', path: '/student/mentor-selection', showAlways: false },
    { icon: FileText, label: 'On-Campus Event', path: '/student/on-campus', showAlways: false },
    { icon: Send, label: 'Final Submission', path: '/student/final-submission', showAlways: false },
    { icon: Award, label: 'Final Leaderboard', path: '/student/final-leaderboard', showAlways: false },
    { icon: Globe, label: 'Global Leaderboard', path: '/student/global-leaderboard', showAlways: true },
    { icon: User, label: 'Profile', path: '/student/profile', showAlways: true }
  ];

  const visibleItems = menuItems.filter(item => item.showAlways || hackathonId);

  return (
    <motion.aside 
      animate={{ width: collapsed ? '80px' : '280px' }}
      className="fixed left-0 top-16 bottom-0 bg-[#1A1A1A] border-r border-white/5 transition-all duration-300 z-40"
    >
      <div className="flex flex-col h-full">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 bg-[#1A1A1A] border border-white/10 rounded-full p-1 hover:bg-white/5 transition-colors"
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {visibleItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#FFB703]/10 to-[#FB8500]/10 text-[#FFB703] shadow-lg shadow-[#FFB703]/5' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-[#FFB703]/10 to-[#FB8500]/10 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={`h-5 w-5 relative z-10 ${isActive ? 'text-[#FFB703]' : ''}`} />
                {!collapsed && (
                  <span className="text-sm relative z-10 whitespace-nowrap">{item.label}</span>
                )}
                {isActive && !collapsed && (
                  <div className="absolute right-2 h-2 w-2 bg-[#FFB703] rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </motion.aside>
  );
}
