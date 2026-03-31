const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const {
  submitVerification,
  getVerificationStatus,
  faceMatch,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
} = require("../controllers/verificationController");

// Student document submission
// Full path: /api/verification/submit/:userId
router.post("/submit/:userId", protect, submitVerification);

// Get verification status
// Full path: /api/verification/status/:userId
router.get("/status/:userId", protect, getVerificationStatus);

// Face match
// Full path: /api/verification/face-match
router.post("/face-match", protect, faceMatch);

// Admin: get pending verifications
// Full path: /api/verification/admin/pending
router.get(
  "/admin/pending",
  protect,
  authorize("admin"),
  getPendingVerifications,
);

// Admin: approve verification
// Full path: /api/verification/admin/:userId/approve
router.put(
  "/admin/:userId/approve",
  protect,
  authorize("admin"),
  approveVerification,
);

// Admin: reject verification
// Full path: /api/verification/admin/:userId/reject
router.put(
  "/admin/:userId/reject",
  protect,
  authorize("admin"),
  rejectVerification,
);

module.exports = router;
