import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, TrendingUp } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { getAccessToken } from '../../services/auth';
import { getMyTeams } from '../../services/student';

interface EvaluationRow {
  _id: string;
  totalScore: number;
  team: {
    _id: string;
    name: string;
    members: string[];
    status?: string;
  };
}

export function Round1LeaderboardPage() {
  const [rows, setRows] = useState<EvaluationRow[]>([]);
  const [myTeamId, setMyTeamId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hackathonId = localStorage.getItem('selectedHackathonId') || '';

  useEffect(() => {
    const loadLeaderboard = async () => {
      if (!hackathonId) {
        setError('Please open a hackathon first.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const token = getAccessToken();
        const [leaderboard, myTeams] = await Promise.all([
          apiRequest<EvaluationRow[]>(`/hackathons/${hackathonId}/leaderboard/round1`, { token: token || undefined }),
          getMyTeams(hackathonId),
        ]);
        setRows(leaderboard);
        setMyTeamId(myTeams[0]?.id || '');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unable to load leaderboard');
      } finally {
        setLoading(false);
      }
    };
    loadLeaderboard();
  }, [hackathonId]);

  const userTeamRank = useMemo(() => {
    if (!myTeamId) return -1;
    return rows.findIndex((row) => String(row.team?._id) === myTeamId) + 1;
  }, [rows, myTeamId]);

  if (loading) return <div className="text-white p-10">Loading leaderboard...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Round 1 Leaderboard</h1>
        <p className="text-gray-400">Check your team's ranking after initial evaluation</p>
      </div>

      {error && <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">{error}</div>}

      {userTeamRank > 0 && (
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-xl p-6 border border-[#FFB703]/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg text-gray-400 mb-1">Your Team Rank</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-[#FFB703]">#{userTeamRank}</span>
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <Trophy className="w-20 h-20 text-[#FFB703] opacity-20" />
          </div>
        </div>
      )}

      {userTeamRank > 0 && userTeamRank <= 10 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 flex items-center justify-between"
        >
          <div>
            <h3 className="text-green-400 font-semibold text-lg mb-1">Congratulations! You are in top 10</h3>
            <p className="text-gray-400">You may proceed to mentor selection and final round prep.</p>
          </div>
        </motion.div>
      )}

      <div className="bg-[#1A1A1A] rounded-xl border border-[#FFB703]/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#FFB703]/10">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Team Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Members</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Total Score</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const isUserTeam = String(row.team?._id) === myTeamId;
                return (
                  <motion.tr
                    key={row._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`border-b border-[#FFB703]/5 ${isUserTeam ? 'bg-[#FFB703]/10' : 'hover:bg-[#0F0F0F]'} transition-colors`}
                  >
                    <td className="px-6 py-4">
                      <span className={`text-lg font-bold ${isUserTeam ? 'text-[#FFB703]' : 'text-gray-400'}`}>#{index + 1}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${isUserTeam ? 'text-[#FFB703]' : 'text-white'}`}>{row.team?.name || 'Unknown Team'}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{row.team?.members?.length || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`text-lg font-bold ${isUserTeam ? 'text-[#FFB703]' : 'text-white'}`}>{row.totalScore || 0}</span>
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
