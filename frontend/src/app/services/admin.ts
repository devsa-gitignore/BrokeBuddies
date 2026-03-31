import { apiRequest } from "./api";
import { getAccessToken } from "./auth";

const ensureToken = () => {
    const token = getAccessToken();
    if (!token) throw new Error("Please login again");
    return token;
};

/* ───────────────── Hackathon CRUD ───────────────── */

export async function createHackathon(data: Record<string, unknown>) {
    const token = ensureToken();
    return apiRequest<any>("/hackathons", { method: "POST", token, body: data });
}

export async function updateHackathon(id: string, data: Record<string, unknown>) {
    const token = ensureToken();
    return apiRequest<any>(`/hackathons/${id}`, { method: "PUT", token, body: data });
}

export async function deleteHackathon(id: string) {
    const token = ensureToken();
    return apiRequest<any>(`/hackathons/${id}`, { method: "DELETE", token });
}

/* ───────────────── Problem CRUD ───────────────── */

export async function createProblem(hackathonId: string, data: { title: string; description: string; difficulty?: string }) {
    const token = ensureToken();
    return apiRequest<any>(`/hackathons/${hackathonId}/problems`, { method: "POST", token, body: data });
}

export async function getProblems(hackathonId: string) {
    const token = ensureToken();
    return apiRequest<any[]>(`/hackathons/${hackathonId}/problems`, { token });
}

/* ───────────────── Mentor CRUD ───────────────── */

export async function addMentor(hackathonId: string, data: { name: string; domain: string; linkedinUrl?: string; profilePhotoUrl?: string; capacity?: number }) {
    const token = ensureToken();
    return apiRequest<any>(`/hackathons/${hackathonId}/mentors`, { method: "POST", token, body: data });
}

export async function getMentors(hackathonId: string) {
    const token = ensureToken();
    return apiRequest<any>(`/hackathons/${hackathonId}/mentors`, { token });
}

export async function updateMentor(mentorId: string, data: Record<string, unknown>) {
    const token = ensureToken();
    return apiRequest<any>(`/mentors/${mentorId}`, { method: "PUT", token, body: data });
}

export async function deleteMentor(mentorId: string) {
    const token = ensureToken();
    return apiRequest<any>(`/mentors/${mentorId}`, { method: "DELETE", token });
}

/* ───────────────── Teams ───────────────── */

export async function getHackathonTeams(hackathonId: string) {
    const token = ensureToken();
    return apiRequest<any[]>(`/hackathons/${hackathonId}/teams`, { token });
}

/* ───────────────── Evaluation ───────────────── */

export async function setEvaluationMatrix(hackathonId: string, round: "round1" | "final", criteria: Array<{ name: string; maxScore: number }>) {
    const token = ensureToken();
    return apiRequest<any>(`/hackathons/${hackathonId}/evaluation-matrix/${round}`, {
        method: "POST", token, body: { criteria },
    });
}

export async function getEvaluationMatrix(hackathonId: string, round: "round1" | "final") {
    const token = ensureToken();
    return apiRequest<any>(`/hackathons/${hackathonId}/evaluation-matrix/${round}`, { token });
}

export async function submitEvaluation(round: "round1" | "final", teamId: string, criteria: Array<{ name: string; maxScore: number; score: number }>, remarks?: string) {
    const token = ensureToken();
    return apiRequest<any>(`/evaluations/${round}/${teamId}`, {
        method: "POST", token, body: { criteria, remarks },
    });
}

/* ───────────────── Score Publication ───────────────── */

export async function publishScores(hackathonId: string, round: "round1" | "final") {
    const token = ensureToken();
    return apiRequest<any>(`/hackathons/${hackathonId}/publish/${round}`, { method: "POST", token });
}

export async function unpublishScores(hackathonId: string, round: "round1" | "final") {
    const token = ensureToken();
    return apiRequest<any>(`/hackathons/${hackathonId}/unpublish/${round}`, { method: "POST", token });
}

/* ───────────────── Shortlisting ───────────────── */

export async function shortlistTeam(hackathonId: string, teamId: string) {
    const token = ensureToken();
    return apiRequest<any>(`/hackathons/${hackathonId}/shortlist/${teamId}`, { method: "POST", token });
}

export async function getShortlistedTeams(hackathonId: string) {
    const token = ensureToken();
    return apiRequest<any[]>(`/hackathons/${hackathonId}/shortlist`, { token });
}

/* ───────────────── Submissions ───────────────── */

export async function getRound1Submissions(hackathonId: string) {
    const token = ensureToken();
    return apiRequest<any>(`/hackathons/${hackathonId}/submissions/round1`, { token });
}

export async function getFinalSubmissions(hackathonId: string) {
    const token = ensureToken();
    return apiRequest<any>(`/hackathons/${hackathonId}/submissions/final`, { token });
}

export async function lockRound1(hackathonId: string) {
    const token = ensureToken();
    return apiRequest<any>(`/hackathons/${hackathonId}/lock/round1`, { method: "POST", token });
}

export async function lockFinal(hackathonId: string) {
    const token = ensureToken();
    return apiRequest<any>(`/hackathons/${hackathonId}/lock/final`, { method: "POST", token });
}

/* ───────────────── Leaderboard ───────────────── */

export async function getLeaderboard(hackathonId: string, round: "round1" | "final") {
    const token = ensureToken();
    return apiRequest<any[]>(`/hackathons/${hackathonId}/leaderboard/${round}`, { token });
}

/* ───────────────── Broadcast ───────────────── */

export async function sendBroadcast(hackathonId: string, message: string, sendSMS = false) {
    const token = ensureToken();
    return apiRequest<any>(`/hackathons/${hackathonId}/broadcast`, {
        method: "POST", token, body: { message, sendSMS },
    });
}

export async function getBroadcastHistory(hackathonId: string) {
    const token = ensureToken();
    return apiRequest<any[]>(`/hackathons/${hackathonId}/broadcast/history`, { token });
}

/* ───────────────── QR / Attendance ───────────────── */

export async function getAttendance(hackathonId: string) {
    const token = ensureToken();
    return apiRequest<any>(`/hackathons/${hackathonId}/attendance`, { token });
}

export async function getCommitteeStudents(hackathonId: string) {
    const token = ensureToken();
    return apiRequest<any>(`/hackathons/${hackathonId}/committee/students`, { token });
}

export async function startMealSession(hackathonId: string, mealType: string, durationMinutes = 30) {
    const token = ensureToken();
    return apiRequest<any>(`/hackathons/${hackathonId}/committee/meal/start`, {
        method: "POST", token, body: { mealType, durationMinutes },
    });
}

/* ───────────────── Food Analytics ───────────────── */

export async function getFoodAnalytics(hackathonId: string) {
    const token = ensureToken();
    return apiRequest<any>(`/hackathons/${hackathonId}/food/analytics`, { token });
}

/* ───────────────── Certificates ───────────────── */

export async function generateCertificates(hackathonId: string) {
    const token = ensureToken();
    return apiRequest<any>(`/hackathons/${hackathonId}/certificates/generate`, {
        method: "POST", token,
    });
}

export async function getStudentCertificates(userId: string, hackathonId: string) {
    const token = ensureToken();
    return apiRequest<any>(`/certificates/${userId}/${hackathonId}`, { token });
}

/* ───────────────── Help Requests ───────────────── */

export async function getHelpRequests(hackathonId: string) {
    const token = ensureToken();
    return apiRequest<any[]>(`/hackathons/${hackathonId}/help`, { token });
}

export async function requestHelp(hackathonId: string, data: { subject: string; description?: string; location?: string }) {
    const token = ensureToken();
    return apiRequest<any>(`/hackathons/${hackathonId}/help`, { method: "POST", token, body: data });
}

export async function resolveHelpRequest(requestId: string) {
    const token = ensureToken();
    return apiRequest<any>(`/help/${requestId}/resolve`, { method: "PUT", token });
}

/* ───────────────── Verification (Admin) ───────────────── */

export async function getPendingVerifications() {
    const token = ensureToken();
    return apiRequest<any>("/verification/admin/pending", { token });
}

export async function approveVerification(userId: string) {
    const token = ensureToken();
    return apiRequest<any>(`/verification/admin/${userId}/approve`, { method: "PUT", token });
}

export async function rejectVerification(userId: string) {
    const token = ensureToken();
    return apiRequest<any>(`/verification/admin/${userId}/reject`, { method: "PUT", token });
}

/* ───────────────── Registration Control ───────────────── */

export async function lockRegistration(hackathonId: string) {
    const token = ensureToken();
    return apiRequest<any>(`/hackathons/${hackathonId}/lock/registration`, { method: "POST", token });
}

export async function unlockRegistration(hackathonId: string) {
    const token = ensureToken();
    return apiRequest<any>(`/hackathons/${hackathonId}/unlock/registration`, { method: "POST", token });
}

/* ───────────────── Analytics ───────────────── */

export async function getAnalytics(hackathonId: string, type: string) {
    const token = ensureToken();
    return apiRequest<any>(`/hackathons/${hackathonId}/admin/analytics/${type}`, { token });
}
