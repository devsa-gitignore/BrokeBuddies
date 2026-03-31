const express = require("express");
const router = express.Router();
const {
  getMe,
  updateMe,
  updatePassword,
  getUserById,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.put("/me/password", protect, updatePassword);
router.get("/:userId", protect, getUserById);

// Attendance
const { getStudentAttendance } = require("../controllers/attendanceController");
router.get("/:userId/attendance/:hackathonId", protect, getStudentAttendance);

module.exports = router;
