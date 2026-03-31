const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const {
  createHackathon,
  getAllHackathons,
  getHackathonById,
  updateHackathon,
  deleteHackathon,
  registerForHackathon,
  addSponsor,
  assignScanner,
  addJudge,
  addMentor,
  getHackathonMentors,
  getHackathonRoles,
  removeHackathonRole,
  lockRegistration,
  unlockRegistration,
  cancelRegistration,
  uploadBrochure,
} = require("../controllers/hackathonController");

const { getAvailableDomains } = require("../controllers/teamController");
const { upload } = require("../middleware/uploadMiddleware");

router.post("/", protect, authorize("admin"), createHackathon);
router.get("/", getAllHackathons);
router.get("/:id", getHackathonById);
router.get("/:id/domains", protect, getAvailableDomains);
router.post(
  "/:id/brochure",
  protect,
  authorize("admin"),
  upload.single("brochure"),
  uploadBrochure,
);
router.put("/:id", protect, authorize("admin"), updateHackathon);
router.delete("/:id", protect, authorize("admin"), deleteHackathon);
router.post("/:id/register", protect, registerForHackathon);
router.post("/:id/sponsors", protect, authorize("admin"), addSponsor);
router.post(
  "/:hackathonId/scanners",
  protect,
  authorize("admin"),
  assignScanner,
);

// Registration Control
router.post(
  "/:hackathonId/lock/registration",
  protect,
  authorize("admin"),
  lockRegistration,
);
router.post(
  "/:hackathonId/unlock/registration",
  protect,
  authorize("admin"),
  unlockRegistration,
);
router.post("/:hackathonId/registration/cancel", protect, cancelRegistration);

// Role Management
router.post("/:id/judges", protect, authorize("admin"), addJudge);
router.post("/:id/mentors", protect, authorize("admin"), addMentor);
router.get("/:id/mentors", protect, getHackathonMentors);
router.get("/:id/roles", protect, getHackathonRoles);
router.delete(
  "/:id/roles/:userId",
  protect,
  authorize("admin"),
  removeHackathonRole,
);

// Problem Statements
const {
  createProblem,
  getProblemsByHackathon,
  getProblemDomains,
} = require("../controllers/problemController");
router.post("/:id/problems", protect, authorize("admin"), createProblem);
router.get("/:id/problems", protect, getProblemsByHackathon);
router.get("/:id/problem-domains", protect, getProblemDomains);

// Teams
const {
  createTeam,
  getMyTeams,
  getTeamById,
  getHackathonTeams,
} = require("../controllers/teamController");
router.post("/:id/teams", protect, createTeam);
router.get("/:id/teams", protect, getHackathonTeams);
router.get("/:id/teams/my", protect, getMyTeams);
router.get("/:id/teams/:teamId", protect, getTeamById);

// Submissions
const {
  submitRound1,
  getSubmissionByTeam,
  lockRound1,
  submitFinalRound,
  getFinalSubmission,
  lockFinalSubmissions,
  getRound1SubmissionsByHackathon,
  getFinalSubmissionsByHackathon,
} = require("../controllers/submissionController");

// Round 1 Submissions
router.post("/:id/submissions/round1", protect, submitRound1);
router.get(
  "/:id/submissions/round1",
  protect,
  authorize("admin", "judge"),
  getRound1SubmissionsByHackathon,
);
router.get("/:id/submissions/round1/:teamId", protect, getSubmissionByTeam);
router.post("/:id/lock/round1", protect, authorize("admin"), lockRound1);

// Final Round Submissions
router.post("/:hackathonId/submissions/final", protect, submitFinalRound);
router.get(
  "/:hackathonId/submissions/final",
  protect,
  authorize("admin", "judge"),
  getFinalSubmissionsByHackathon,
);
router.get(
  "/:hackathonId/submissions/final/:teamId",
  protect,
  getFinalSubmission,
);
router.post(
  "/:hackathonId/lock/final",
  protect,
  authorize("admin"),
  lockFinalSubmissions,
);

// Round 1 Evaluation
const {
  setEvaluationMatrix,
  getEvaluationMatrix,
  getLeaderboardRound1,
  setEvaluationMatrixFinal,
  getEvaluationMatrixFinal,
  getLeaderboardFinal,
  shortlistTeam,
  getShortlistedTeams,
  aiPptEvaluation,
  aiPptEvaluationUpload,
  publishRound1,
  unpublishRound1,
  publishFinal,
  unpublishFinal,
} = require("../controllers/evaluationController");

// Round 1 Evaluation
router.post(
  "/:id/evaluation-matrix/round1",
  protect,
  authorize("admin"),
  setEvaluationMatrix,
);
router.get("/:id/evaluation-matrix/round1", protect, getEvaluationMatrix);
router.get("/:id/leaderboard/round1", protect, getLeaderboardRound1);

// Final Round Evaluation
router.post(
  "/:hackathonId/evaluation-matrix/final",
  protect,
  authorize("admin"),
  setEvaluationMatrixFinal,
);
router.get(
  "/:hackathonId/evaluation-matrix/final",
  protect,
  getEvaluationMatrixFinal,
);
router.get("/:hackathonId/leaderboard/final", protect, getLeaderboardFinal);

// Shortlisting
router.post(
  "/:id/shortlist/:teamId",
  protect,
  authorize("admin"),
  shortlistTeam,
);
router.get("/:id/shortlist", protect, getShortlistedTeams);

// Admin Score Publication Control
router.post("/:id/publish/round1", protect, authorize("admin"), publishRound1);
router.post("/:id/unpublish/round1", protect, authorize("admin"), unpublishRound1);
router.post("/:id/publish/final", protect, authorize("admin"), publishFinal);
router.post("/:id/unpublish/final", protect, authorize("admin"), unpublishFinal);

// AI PPT Evaluation (text input)
router.post(
  "/:hackathonId/ai/ppt-evaluation/:teamId",
  protect,
  authorize("admin", "judge"),
  aiPptEvaluation,
);

// AI PPT Evaluation (file upload — PPTX/PDF)
router.post(
  "/:hackathonId/ai/ppt-evaluation-upload/:teamId",
  protect,
  authorize("admin", "judge"),
  upload.single("file"),
  aiPptEvaluationUpload,
);

// Broadcasts
const {
  sendBroadcast,
  getBroadcastHistory,
} = require("../controllers/broadcastController");
router.post(
  "/:hackathonId/broadcast",
  protect,
  authorize("admin"),
  sendBroadcast,
);
router.get("/:hackathonId/broadcast/history", protect, getBroadcastHistory);

// Help System
const {
  requestHelp,
  getHelpRequests,
} = require("../controllers/helpController");
router.post("/:hackathonId/help", protect, requestHelp);
router.get(
  "/:hackathonId/help",
  protect,
  authorize("admin", "mentor"),
  getHelpRequests,
);

// QR Entry System
const {
  generateEntryQR,
  verifyEntryQR,
  generateFoodQR,
  validateFoodQR,
  verifyCommitteeScan,
  getCommitteeStudents,
  startMealSession,
  extendMealSession,
} = require("../controllers/qrController");
router.post("/:hackathonId/qr/entry/generate", protect, generateEntryQR);
router.post("/:hackathonId/qr/entry/verify", protect, verifyEntryQR);
router.post("/:hackathonId/qr/food/generate", protect, generateFoodQR);
router.post("/:hackathonId/qr/food/validate", protect, validateFoodQR);
router.post("/:hackathonId/committee/verify", protect, verifyCommitteeScan);
router.get("/:hackathonId/committee/students", protect, getCommitteeStudents);
router.post("/:hackathonId/committee/meal/start", protect, startMealSession);
router.post("/:hackathonId/committee/meal/extend", protect, extendMealSession);

// Food Analytics
const { getFoodAnalytics } = require("../controllers/foodController");
router.get(
  "/:hackathonId/food/analytics",
  protect,
  authorize("admin"),
  getFoodAnalytics,
);

// Attendance
const {
  getAttendanceByHackathon,
} = require("../controllers/attendanceController");
router.get(
  "/:hackathonId/attendance",
  protect,
  authorize("admin"),
  getAttendanceByHackathon,
);

// Admin Analytics
router.use("/:hackathonId/admin/analytics", require("./analyticsRoutes"));

module.exports = router;
