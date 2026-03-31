const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  inviteMember,
  joinTeam,
  removeMember,
  selectProblem,
  selectMentor,
  getTeamMentor,
  acceptInvitation,
  getPendingInvitations,
  joinTeamByCode,
} = require("../controllers/teamController");

router.post("/join-by-code", protect, joinTeamByCode);
router.post("/invitations/accept", protect, acceptInvitation);
router.get("/invitations/pending", protect, getPendingInvitations);
router.post("/:id/invite", protect, inviteMember);
router.post("/:id/join", protect, joinTeam);
router.delete("/:id/members/:userId", protect, removeMember);
router.post("/:id/select-problem", protect, selectProblem);
router.post("/:id/select-mentor", protect, selectMentor);
router.get("/:id/mentor", protect, getTeamMentor);

module.exports = router;
