import { motion } from 'motion/react';
import { Trophy, Award, TrendingUp, Github, ExternalLink } from 'lucide-react';
import { mockTeams } from '../../data/mockData';

export function FinalLeaderboardPage() {
  const finalLeaderboard = [...mockTeams].sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));
  const userTeamRank = 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Final Leaderboard</h1>
        <p className="text-gray-400">Final rankings and winners of InnovateTech 2026</p>
      </div>

      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-xl p-8 border border-[#FFB703]/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg text-gray-400 mb-2">Your Team Rank</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-bold text-[#FFB703]">#{userTeamRank}</span>
              <Trophy className="w-12 h-12 text-[#FFB703]" fill="#FFB703" />
            </div>
          </div>
          
          <div className="bg-[#0F0F0F] rounded-lg p-6 border border-[#FFB703]/20">
            <h4 className="text-sm text-gray-400 mb-4">Your Evaluation Matrix</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Innovation</span>
                <span className="text-white font-semibold">28/30</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Implementation</span>
                <span className="text-white font-semibold">35/40</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Presentation</span>
                <span className="text-white font-semibold">23/30</span>
              </div>
              <div className="border-t border-[#FFB703]/20 pt-2 mt-2 flex justify-between">
                <span className="text-[#FFB703] font-semibold">Total Score</span>
                <span className="text-[#FFB703] font-bold text-xl">86/100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {userTeamRank === 1 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-yellow-500/10 via-[#FFB703]/10 to-orange-500/10 border-2 border-[#FFB703] rounded-xl p-8 text-center"
        >
          <Trophy className="w-24 h-24 text-[#FFB703] mx-auto mb-4" fill="#FFB703" />
          <h2 className="text-4xl font-bold text-white mb-2">🎉 Congratulations! 🎉</h2>
          <p className="text-2xl text-[#FFB703] mb-4">You Won InnovateTech 2026!</p>
          <p className="text-gray-400">Prize: ₹50,000 + Certificate + Goodies</p>
        </motion.div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Award className="w-8 h-8 text-[#FFB703]" />
          Winners Podium
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {finalLeaderboard.slice(0, 3).map((team, index) => {
            const medals = ['🥇', '🥈', '🥉'];
            const prizes = ['₹50,000', '₹30,000', '₹20,000'];
            const heights = ['h-80', 'h-72', 'h-64'];

            return (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-xl p-6 border-2 ${
                  index === 0 ? 'border-[#FFB703]' : 'border-[#FFB703]/30'
                } ${heights[index]} flex flex-col justify-between`}
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">{medals[index]}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{team.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{team.members.length} members</p>
                  
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {team.members.slice(0, 3).map((member) => (
                      <div key={member.userId} className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#FFB703]/30">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#FFB703] to-[#FB8500]" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-center mb-4">
                    <p className="text-[#FFB703] text-2xl font-bold mb-1">{prizes[index]}</p>
                    <p className="text-gray-500 text-sm">Prize Money</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Final Score</span>
                      <span className="text-white font-bold">{team.finalScore || 86}/100</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="bg-[#1A1A1A] rounded-xl border border-[#FFB703]/10 overflow-hidden">
        <div className="p-6 border-b border-[#FFB703]/10">
          <h2 className="text-xl font-bold text-white">Complete Rankings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#FFB703]/10 bg-[#0F0F0F]">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Team</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Innovation</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Implementation</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Presentation</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Total</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Links</th>
              </tr>
            </thead>
            <tbody>
              {finalLeaderboard.map((team, index) => {
                const isUserTeam = index === 0;
                return (
                  <motion.tr
                    key={team.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className={`border-b border-[#FFB703]/5 ${
                      isUserTeam ? 'bg-[#FFB703]/10' : 'hover:bg-[#0F0F0F]'
                    }`}
                  >
                    <td className="px-6 py-4">
                      {index < 3 ? (
                        <span className="text-2xl">{['🥇', '🥈', '🥉'][index]}</span>
                      ) : (
                        <span className={`font-bold ${isUserTeam ? 'text-[#FFB703]' : 'text-gray-400'}`}>
                          #{index + 1}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${isUserTeam ? 'text-[#FFB703]' : 'text-white'}`}>
                        {team.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white">28/30</td>
                    <td className="px-6 py-4 text-white">35/40</td>
                    <td className="px-6 py-4 text-white">23/30</td>
                    <td className="px-6 py-4">
                      <span className={`text-lg font-bold ${isUserTeam ? 'text-[#FFB703]' : 'text-white'}`}>
                        {team.finalScore || 86}/100
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <a
                          href="#"
                          className="p-1.5 hover:bg-[#FFB703]/20 rounded text-gray-400 hover:text-[#FFB703] transition-colors"
                          title="GitHub"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                        <a
                          href="#"
                          className="p-1.5 hover:bg-[#FFB703]/20 rounded text-gray-400 hover:text-[#FFB703] transition-colors"
                          title="Demo"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
