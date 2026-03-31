import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Users, Plus, Trash2, Mail, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  createTeam,
  getCurrentUserProfile,
  getMyTeams,
  inviteTeamMember,
  joinTeamByCode,
  removeTeamMember,
  StudentTeam,
} from '../../services/student';

export function TeamManagementPage() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<StudentTeam[]>([]);
  const [viewerId, setViewerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [teamName, setTeamName] = useState('');
  const [foodPreference, setFoodPreference] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hackathonId = localStorage.getItem('selectedHackathonId') || '';
  const team = teams[0] || null;
  const isLeader = !!team && !!viewerId && viewerId === team.leaderId;

  const maxSquadSize = 4;
  const isOverCapacity = (team?.members.length || 0) > maxSquadSize;

  const loadTeams = async () => {
    if (!hackathonId) {
      setError('Please open a hackathon first, then manage your team.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await getMyTeams(hackathonId);
      setTeams(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load team');
    } finally {
      setLoading(false);
    }
  };

  const loadViewer = async () => {
    try {
      const profile = await getCurrentUserProfile();
      const id = String(profile?._id || profile?.id || '');
      setViewerId(id);
    } catch {
      setViewerId('');
    }
  };

  useEffect(() => {
    void Promise.all([loadViewer(), loadTeams()]);
  }, []);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !hackathonId) return;
    setIsSubmitting(true);
    setError('');
    setMessage('');
    try {
      await createTeam(hackathonId, teamName.trim(), foodPreference);
      setTeamName('');
      setFoodPreference('');
      setMessage('Team created successfully');
      await loadTeams();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to create team');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team || !newMemberEmail.trim()) return;
    setIsSubmitting(true);
    setError('');
    setMessage('');
    try {
      await inviteTeamMember(team.id, newMemberEmail.trim());
      setNewMemberEmail('');
      setMessage('Member added successfully');
      await loadTeams();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to add member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    setIsSubmitting(true);
    setError('');
    setMessage('');
    try {
      const result = await joinTeamByCode(joinCode);
      setJoinCode('');
      const joinedHackathonId = result.team.hackathonId;
      if (joinedHackathonId && joinedHackathonId !== hackathonId) {
        localStorage.setItem('selectedHackathonId', joinedHackathonId);
      }
      setMessage(result.message || 'Joined team successfully');
      await loadTeams();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unable to join team';
      if (errorMessage.toLowerCase().includes('already a member of this team')) {
        setMessage('You are already in this team. Syncing team details...');
        setError('');
        await loadTeams();
        return;
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!team) return;
    setIsSubmitting(true);
    setError('');
    setMessage('');
    try {
      await removeTeamMember(team.id, userId);
      setMessage('Member removed successfully');
      await loadTeams();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to remove member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inviteCode = useMemo(() => (team?.teamCode ? team.teamCode : 'N/A'), [team]);

  if (loading) {
    return <div className="text-white p-10">Loading team...</div>;
  }

  return (
    <div className="space-y-8 pb-20">
      <motion.button whileHover={{ x: -4 }} onClick={() => navigate(-1)} className="group flex items-center gap-3 text-zinc-500 hover:text-white transition-all">
        <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center group-hover:border-violet-500/50 group-hover:bg-violet-500/10 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Arena</span>
      </motion.button>

      <div>
        <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter">Squad Command</h1>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2">
          {hackathonId ? `Hackathon: ${hackathonId}` : 'No hackathon selected'}
        </p>
      </div>

      {error && <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">{error}</div>}
      {message && <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">{message}</div>}

      {!team ? (
        <div className="bg-zinc-900/20 rounded-[2rem] p-8 border border-zinc-800/60 max-w-xl space-y-6">
          <div>
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-4">Create Team</h2>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
                required
              />
              <select
                value={foodPreference}
                onChange={(e) => setFoodPreference(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
              >
                <option value="">Select food preference</option>
                <option value="veg">Vegetarian</option>
                <option value="non-veg">Non-Vegetarian</option>
                <option value="jain">Jain</option>
              </select>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-white text-black font-bold uppercase tracking-widest disabled:opacity-60"
              >
                {isSubmitting ? 'Creating...' : 'Create Team'}
              </button>
            </form>
          </div>

          <div className="pt-6 border-t border-zinc-800">
            <h3 className="text-sm font-black text-white uppercase italic tracking-tighter mb-3">Join Team By Code</h3>
            <form onSubmit={handleJoinByCode} className="space-y-4">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter team code"
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white uppercase font-mono tracking-wider"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl border border-zinc-700 text-white font-bold uppercase tracking-widest hover:border-violet-500/60 disabled:opacity-60"
              >
                {isSubmitting ? 'Joining...' : 'Join Team'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900/20 rounded-[2rem] p-8 border border-zinc-800/60 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">{team.name}</h2>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">
                Members: {team.members.length} / {maxSquadSize}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isOverCapacity ? 'bg-rose-500/10 text-rose-400 border-rose-500/40' : 'bg-violet-500/10 text-violet-400 border-violet-500/40'}`}>
              {isOverCapacity ? 'Over Capacity' : 'Active'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.members.map((member) => (
              <div key={member.userId} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-white font-black">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  {isLeader && member.userId !== team.leaderId && (
                    <button onClick={() => handleRemoveMember(member.userId)} className="p-2 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-white font-bold">{member.name}</p>
                <p className="text-zinc-500 text-xs mt-1">{member.email}</p>
                {member.userId === team.leaderId && (
                  <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-[10px] font-bold uppercase tracking-widest">
                    <ShieldCheck className="w-3 h-3" />
                    Leader
                  </div>
                )}
              </div>
            ))}
          </div>

          {isLeader && (
            <form onSubmit={handleInvite} className="space-y-3">
              <label className="text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Mail className="w-3 h-3" />
                Add Member by Email
              </label>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="member@email.com"
                  className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting || team.members.length >= maxSquadSize}
                  className="px-5 py-3 rounded-xl bg-white text-black font-bold uppercase tracking-widest disabled:opacity-60 inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Invite
                </button>
              </div>
            </form>
          )}

          <div className="pt-4 border-t border-zinc-800">
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Team Signature</p>
            <code className="block px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-violet-300 font-mono">{inviteCode}</code>
          </div>
        </div>
      )}
    </div>
  );
}
