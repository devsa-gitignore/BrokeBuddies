import { apiRequest } from "./api";
import { getAccessToken } from "./auth";

export interface StudentHackathon {
  id: string;
  name: string;
  hostedBy: string;
  description: string;
  status: "upcoming" | "open" | "ongoing" | "closed";
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  round1Deadline: string;
  finalRoundDate: string;
  isRegistrationOpen?: boolean;
  rules: string[];
  timeline: { date: string; event: string }[];
  bannerImage?: string;
}

export interface StudentTeam {
  id: string;
  name: string;
  leaderId: string;
  hackathonId?: string;
  teamCode?: string;
  members: Array<{ userId: string; name: string; email: string; avatar?: string | null }>;
  problemId?: string;
  status?: string;
}

export interface StudentProblem {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface GlobalLeaderboardEntry {
  id: string;
  name: string;
  hackScore: number;
  avatar?: string;
}

const ensureToken = () => {
  const token = getAccessToken();
  if (!token) throw new Error("Please login again");
  return token;
};

const toIso = (value?: string | Date | null) => {
  if (!value) return "";
  return new Date(value).toISOString();
};

const parseRules = (rules: unknown): string[] => {
  if (Array.isArray(rules)) return rules.filter(Boolean).map(String);
  if (typeof rules === "string") {
    return rules
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return [];
};

const mapHackathon = (hackathon: any): StudentHackathon => {
  const dates = hackathon?.dates || {};
  return {
    id: String(hackathon?._id || hackathon?.id),
    name: hackathon?.name || "Untitled Hackathon",
    hostedBy: hackathon?.hostedBy || "Unknown Host",
    description: hackathon?.description || "",
    status: hackathon?.status || "upcoming",
    startDate: toIso(dates?.startDate),
    endDate: toIso(dates?.endDate),
    registrationDeadline: toIso(dates?.registrationDeadline),
    round1Deadline: toIso(dates?.round1Deadline),
    finalRoundDate: toIso(dates?.finalRoundDate),
    isRegistrationOpen: hackathon?.isRegistrationOpen,
    rules: parseRules(hackathon?.rules),
    timeline: [
      dates?.registrationDeadline
        ? { date: toIso(dates.registrationDeadline), event: "Registration Deadline" }
        : null,
      dates?.round1Deadline ? { date: toIso(dates.round1Deadline), event: "Round 1 Deadline" } : null,
      dates?.startDate ? { date: toIso(dates.startDate), event: "Hackathon Starts" } : null,
      dates?.finalRoundDate ? { date: toIso(dates.finalRoundDate), event: "Final Round" } : null,
      dates?.endDate ? { date: toIso(dates.endDate), event: "Hackathon Ends" } : null,
    ].filter(Boolean) as Array<{ date: string; event: string }>,
    bannerImage: hackathon?.bannerImage,
  };
};

export async function getHackathons() {
  const response = await apiRequest<any[]>("/hackathons");
  return response.map(mapHackathon);
}

export async function getHackathonById(id: string) {
  const response = await apiRequest<any>(`/hackathons/${id}`);
  return mapHackathon(response);
}

export async function registerForHackathon(hackathonId: string) {
  const token = ensureToken();
  return apiRequest<{ message: string }>(`/hackathons/${hackathonId}/register`, {
    method: "POST",
    token,
  });
}

export async function getMyTeams(hackathonId: string) {
  const token = ensureToken();
  const response = await apiRequest<any[]>(`/hackathons/${hackathonId}/teams/my`, { token });
  return response.map((team) => ({
    id: String(team._id),
    name: team.name,
    hackathonId: String(team.hackathon || hackathonId),
    teamCode: team.teamCode,
    leaderId: String(team.leader),
    members: (team.members || []).map((member: any) => ({
      userId: String(member._id || member.id || member),
      name: member.name || "Unknown",
      email: member.email || "",
      avatar: null,
    })),
    problemId: team.problemStatement?._id ? String(team.problemStatement._id) : undefined,
    status: team.status,
  })) as StudentTeam[];
}

export async function joinTeamByCode(teamCode: string) {
  const token = ensureToken();
  const response = await apiRequest<any>("/teams/join-by-code", {
    method: "POST",
    token,
    body: { teamCode: teamCode.trim().toUpperCase() },
  });

  const rawTeam = response?.team || {};
  return {
    message: response?.message || "Joined team successfully",
    team: {
      id: String(rawTeam._id || ""),
      name: rawTeam.name || "",
      hackathonId: String(rawTeam.hackathon || ""),
      teamCode: rawTeam.teamCode || teamCode.trim().toUpperCase(),
    },
  };
}

export async function createTeam(hackathonId: string, name: string) {
  const token = ensureToken();
  return apiRequest<any>(`/hackathons/${hackathonId}/teams`, {
    method: "POST",
    token,
    body: { name },
  });
}

export async function inviteTeamMember(teamId: string, email: string) {
  const token = ensureToken();
  return apiRequest<any>(`/teams/${teamId}/invite`, {
    method: "POST",
    token,
    body: { email },
  });
}

export async function removeTeamMember(teamId: string, userId: string) {
  const token = ensureToken();
  return apiRequest<any>(`/teams/${teamId}/members/${userId}`, {
    method: "DELETE",
    token,
  });
}

export async function getProblemsByHackathon(hackathonId: string) {
  const token = ensureToken();
  const response = await apiRequest<any[]>(`/hackathons/${hackathonId}/problems`, { token });
  return response.map((problem) => ({
    id: String(problem._id),
    title: problem.title,
    description: problem.description,
    difficulty: problem.difficulty || "medium",
  })) as StudentProblem[];
}

export async function selectProblemForTeam(teamId: string, problemId: string) {
  const token = ensureToken();
  return apiRequest<any>(`/teams/${teamId}/select-problem`, {
    method: "POST",
    token,
    body: { problemId },
  });
}

export async function submitRound1(hackathonId: string, teamId: string, pptUrl: string) {
  const token = ensureToken();
  return apiRequest<any>(`/hackathons/${hackathonId}/submissions/round1`, {
    method: "POST",
    token,
    body: { teamId, pptUrl },
  });
}

export async function getRound1Submission(hackathonId: string, teamId: string) {
  const token = ensureToken();
  return apiRequest<any>(`/hackathons/${hackathonId}/submissions/round1/${teamId}`, { token });
}

export async function submitFinalRound(
  hackathonId: string,
  teamId: string,
  payload: { pptUrl: string; githubLink: string; demoLink?: string },
) {
  const token = ensureToken();
  return apiRequest<any>(`/hackathons/${hackathonId}/submissions/final`, {
    method: "POST",
    token,
    body: { teamId, ...payload },
  });
}

export async function getFinalSubmission(hackathonId: string, teamId: string) {
  const token = ensureToken();
  return apiRequest<{ success: boolean; submission: any }>(
    `/hackathons/${hackathonId}/submissions/final/${teamId}`,
    { token }
  );
}

export async function uploadFile(file: File, folder = "hackfire_submissions") {
  const token = ensureToken();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await fetch(
    `${(import.meta.env.VITE_API_BASE_URL || "https://whateveridk-loc8w2.onrender.com/api").replace(/\/+$/, "")}/uploads`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || "Upload failed");
  }
  return payload as { success: boolean; fileUrl: string; fileId: string; message: string };
}

export async function getGlobalLeaderboard() {
  const response = await apiRequest<any[]>("/leaderboard/global");
  return response.map((entry) => ({
    id: String(entry._id || entry.id),
    name: entry.name,
    hackScore: entry.hackScore || 0,
    avatar: entry?.registrationDetails?.selfieUrl,
  })) as GlobalLeaderboardEntry[];
}

export async function getCurrentUserProfile() {
  const token = ensureToken();
  return apiRequest<any>("/users/me", { token });
}
