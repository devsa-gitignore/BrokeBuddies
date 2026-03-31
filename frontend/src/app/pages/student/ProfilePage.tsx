import { motion } from 'motion/react';
import { User, Mail, Phone, Trophy, Award, Download } from 'lucide-react';
import { User as UserType } from '../../data/mockData';

interface ProfilePageProps {
  user: UserType;
}

export function ProfilePage({ user }: ProfilePageProps) {
  const pastHackathons = [
    { name: 'HackTheChange 2025', rank: 1, prize: '₹50,000', date: '2025-12-12' },
    { name: 'CodeStorm Summer', rank: 3, prize: '₹20,000', date: '2025-08-20' },
    { name: 'InnovateFest', rank: 5, prize: 'Certificate', date: '2025-05-15' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
        <p className="text-gray-400">Manage your account and view your achievements</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-xl p-8 border border-[#FFB703]/20 text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#FFB703] to-[#FB8500] mx-auto mb-6 overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-16 h-16 text-[#0F0F0F]" />
                </div>
              )}
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">{user.name}</h2>
            <p className="text-gray-400 mb-6">{user.email}</p>

            <div className="bg-[#0F0F0F] rounded-lg p-4 border border-[#FFB703]/20 mb-4">
              <Trophy className="w-8 h-8 text-[#FFB703] mx-auto mb-2" />
              <p className="text-sm text-gray-400 mb-1">HackScore</p>
              <p className="text-3xl font-bold text-[#FFB703]">{user.hackScore}</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#FFB703] to-[#FB8500] text-[#0F0F0F] rounded-lg font-medium hover:shadow-lg hover:shadow-[#FFB703]/30 transition-all duration-200"
            >
              Edit Profile
            </motion.button>
          </div>

          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#FFB703]/10">
            <h3 className="text-lg font-bold text-white mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-400">
                <Mail className="w-5 h-5 text-[#FFB703]" />
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Phone className="w-5 h-5 text-[#FFB703]" />
                <span className="text-sm">+91 98765 43210</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#FFB703]/10">
            <h3 className="text-xl font-bold text-white mb-6">Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#0F0F0F] rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-[#FFB703] mb-1">5</p>
                <p className="text-sm text-gray-400">Hackathons</p>
              </div>
              <div className="bg-[#0F0F0F] rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-400 mb-1">2</p>
                <p className="text-sm text-gray-400">Wins</p>
              </div>
              <div className="bg-[#0F0F0F] rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-400 mb-1">1</p>
                <p className="text-sm text-gray-400">Top 3</p>
              </div>
              <div className="bg-[#0F0F0F] rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-purple-400 mb-1">3</p>
                <p className="text-sm text-gray-400">Teams Led</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#FFB703]/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Past Hackathons</h3>
              <Award className="w-6 h-6 text-[#FFB703]" />
            </div>

            <div className="space-y-4">
              {pastHackathons.map((hackathon, index) => (
                <motion.div
                  key={index}
                  whileHover={{ x: 4 }}
                  className="bg-[#0F0F0F] rounded-lg p-5 border border-[#FFB703]/10 hover:border-[#FFB703]/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-white font-semibold mb-1">{hackathon.name}</h4>
                      <p className="text-gray-500 text-sm">{new Date(hackathon.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#FFB703] font-bold mb-1">Rank #{hackathon.rank}</p>
                      <p className="text-gray-400 text-sm">{hackathon.prize}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 py-2 px-3 bg-gradient-to-r from-[#FFB703] to-[#FB8500] text-[#0F0F0F] rounded text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Certificate
                    </motion.button>
                    <button className="px-4 py-2 bg-[#1A1A1A] border border-[#FFB703]/20 text-gray-300 rounded text-sm hover:text-white hover:border-[#FFB703]/50 transition-colors">
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#FFB703]/10">
            <h3 className="text-xl font-bold text-white mb-4">Skills & Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {['React', 'Node.js', 'Python', 'Machine Learning', 'UI/UX', 'Cloud Computing', 'DevOps', 'Mobile Dev'].map((skill) => (
                <span
                  key={skill}
                  className="px-4 py-2 bg-[#0F0F0F] border border-[#FFB703]/30 text-gray-300 rounded-lg text-sm hover:border-[#FFB703] hover:text-white transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
