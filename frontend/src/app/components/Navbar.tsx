import { Flame, Bell, User, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { User as UserType } from '../data/mockData';

interface NavbarProps {
  user: UserType | null;
  onLogout: () => void;
  notificationCount?: number;
}

export function Navbar({ user, onLogout, notificationCount = 0 }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#0F0F0F] border-b border-[#FFB703]/10 z-50">
      <div className="h-full px-6 flex items-center justify-between">
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
        >
          <div className="relative">
            <Flame className="w-8 h-8 text-[#FFB703]" fill="#FFB703" />
            <div className="absolute inset-0 blur-lg bg-[#FFB703] opacity-50" />
          </div>
          <span className="text-xl font-bold text-white">HackFire</span>
        </motion.div>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 rounded-lg hover:bg-[#1A1A1A] transition-colors duration-200"
              >
                <Bell className="w-5 h-5 text-gray-300" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#FB8500] rounded-full text-[10px] flex items-center justify-center text-white">
                    {notificationCount}
                  </span>
                )}
              </motion.button>

              <div className="flex items-center gap-3 pl-3 border-l border-[#FFB703]/10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFB703] to-[#FB8500] flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-[#0F0F0F]" />
                  )}
                </div>
                <span className="text-sm text-gray-300">{user.name}</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors duration-200"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
