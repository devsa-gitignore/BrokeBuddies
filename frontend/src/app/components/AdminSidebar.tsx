import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckCircle,
  Trophy,
  FileQuestion,
  Users,
  ClipboardCheck,
  Award,
  QrCode,
  ClipboardList,
  UtensilsCrossed,
  Radio,
  FileText,
  Globe,
  BarChart,
  ChevronLeft
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface AdminSidebarProps {
  hackathonId?: string | null;
}

export default function AdminSidebar({ hackathonId }: AdminSidebarProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard', showAlways: true },
    { icon: CheckCircle, label: 'Verifications', path: '/admin/verifications', showAlways: true },
    { icon: Trophy, label: 'Manage Hackathons', path: '/admin/hackathons', showAlways: true },
    { icon: FileQuestion, label: 'Problem Statements', path: '/admin/problems', showAlways: false },
    { icon: Users, label: 'Mentor Management', path: '/admin/mentors', showAlways: false },
    { icon: ClipboardCheck, label: 'Round 1 Evaluation', path: '/admin/round1-evaluation', showAlways: false },
    { icon: Award, label: 'Final Evaluation', path: '/admin/final-evaluation', showAlways: false },
    { icon: QrCode, label: 'QR Management', path: '/admin/qr-management', showAlways: false },
    { icon: ClipboardList, label: 'Attendance', path: '/admin/attendance', showAlways: false },
    { icon: UtensilsCrossed, label: 'Food Analytics', path: '/admin/food-analytics', showAlways: false },
    { icon: Radio, label: 'Broadcast', path: '/admin/broadcast', showAlways: false },
    { icon: FileText, label: 'Certificates', path: '/admin/certificates', showAlways: false },
    { icon: Globe, label: 'Global Leaderboard', path: '/student/global-leaderboard', showAlways: true },
    { icon: BarChart, label: 'Event Summary', path: '/admin/event-summary', showAlways: false }
  ];

  const visibleItems = menuItems.filter(item => item.showAlways || hackathonId);

  return (
    <motion.aside 
      animate={{ width: collapsed ? '80px' : '280px' }}
      className="fixed left-0 top-16 bottom-0 bg-[#1A1A1A] border-r border-white/5 transition-all duration-300 z-40 overflow-y-auto"
    >
      <div className="flex flex-col h-full">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 bg-[#1A1A1A] border border-white/10 rounded-full p-1 hover:bg-white/5 transition-colors z-50"
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>

        <div className="flex-1 py-6 px-3 space-y-1">
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
                <Icon className={`h-5 w-5 relative z-10 flex-shrink-0 ${isActive ? 'text-[#FFB703]' : ''}`} />
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
