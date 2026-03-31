import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Zap } from 'lucide-react';
import { getMyTeams, getProblemsByHackathon, selectProblemForTeam, StudentProblem } from '../../services/student';

export function ProblemSelectionPage() {
  const [problems, setProblems] = useState<StudentProblem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);
  const [teamId, setTeamId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const hackathonId = localStorage.getItem('selectedHackathonId') || '';

  useEffect(() => {
    const loadData = async () => {
      if (!hackathonId) {
        setError('Please open a hackathon first.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const [problemsData, teams] = await Promise.all([
          getProblemsByHackathon(hackathonId),
          getMyTeams(hackathonId),
        ]);
        setProblems(problemsData);
        if (teams[0]) {
          setTeamId(teams[0].id);
          setSelectedProblem(teams[0].problemId || null);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unable to load problems');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [hackathonId]);

  const handleConfirm = async () => {
    if (!teamId || !selectedProblem) return;
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      await selectProblemForTeam(teamId, selectedProblem);
      setMessage('Problem selection saved');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save selection');
    } finally {
      setSubmitting(false);
    }
  };

  const difficultyColors: Record<'easy' | 'medium' | 'hard', string> = {
    easy: 'bg-green-500/20 text-green-400 border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    hard: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  if (loading) {
    return <div className="text-white p-10">Loading problems...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Problem Statements</h1>
        <p className="text-gray-400">Choose a problem for your selected hackathon</p>
      </div>

      {error && <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">{error}</div>}
      {message && <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">{message}</div>}

      {selectedProblem && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3"
        >
          <CheckCircle className="w-6 h-6 text-green-400" />
          <div>
            <p className="text-green-400 font-medium">Problem Selected</p>
            <p className="text-gray-400 text-sm">You can change your selection until the deadline</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {problems.map((problem) => {
          const isSelected = selectedProblem === problem.id;

          return (
            <motion.div
              key={problem.id}
              whileHover={{ y: -4 }}
              className={`bg-[#1A1A1A] rounded-xl p-6 border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-[#FFB703] shadow-lg shadow-[#FFB703]/20'
                  : 'border-[#FFB703]/10 hover:border-[#FFB703]/30'
              }`}
              onClick={() => setSelectedProblem(problem.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-white pr-4">{problem.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs border ${difficultyColors[problem.difficulty]}`}>
                  {problem.difficulty}
                </span>
              </div>

              <p className="text-gray-400 mb-6 leading-relaxed">{problem.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#FFB703]">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm">Innovation Challenge</span>
                </div>

                <AnimatePresence mode="wait">
                  {isSelected ? (
                    <motion.div
                      key="selected"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex items-center gap-2 text-green-400"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Selected</span>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="select"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-gradient-to-r from-[#FFB703] to-[#FB8500] text-[#0F0F0F] rounded-lg text-sm font-medium"
                    >
                      Select
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {selectedProblem && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={submitting || !teamId}
            onClick={handleConfirm}
            className="px-8 py-3 bg-gradient-to-r from-[#FFB703] to-[#FB8500] text-[#0F0F0F] rounded-lg font-medium hover:shadow-lg hover:shadow-[#FFB703]/30 transition-all duration-200 disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Confirm Selection'}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

