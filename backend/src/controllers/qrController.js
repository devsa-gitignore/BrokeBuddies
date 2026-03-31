/**
 * QR Controller
 * Generate and scan QR codes for entry and meals.
 */

const qrService = require("../services/qrService");
const User = require("../models/User");
const Team = require("../models/Team");
const Attendance = require("../models/Attendance");
const FoodLog = require("../models/FoodLog");

const hasScannerAccess = (user, hackathonId, permission) => {
  if (!user) return false;

  const isAdmin = user.role === "admin";
  const isGlobalScanner = user.role === "scanner";

  const hackathonScannerRole = (user.hackathonRoles || []).find(
    (roleObj) =>
      roleObj.role === "scanner" &&
      roleObj.hackathonId.toString() === hackathonId.toString(),
  );

  const hasPermission =
    !permission ||
    !hackathonScannerRole ||
    (hackathonScannerRole.permissions || []).includes(permission);

  return isAdmin || isGlobalScanner || (hackathonScannerRole && hasPermission);
};

// @desc    Generate entry QR for a student
// @route   POST /api/hackathons/:hackathonId/qr/entry/generate
// @access  Private
exports.generateEntryQR = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const userId = req.user.id;

    const qrData = await qrService.generateEntryQR(userId, hackathonId);

    res.status(200).json({
      success: true,
      token: qrData.token,
      qrImageUrl: qrData.imageUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Server Error",
    });
  }
};

// @desc    Verify/scan entry QR for a student
// @route   POST /api/hackathons/:hackathonId/qr/entry/verify
// @access  Private (Scanner)
exports.verifyEntryQR = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { token } = req.body;

    const user = await User.findById(req.user.id).select("role hackathonRoles");
    if (!hasScannerAccess(user, hackathonId, "entry-scan")) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to scan for this hackathon",
      });
    }

    const scannerId = req.user.id;

    await qrService.verifyEntryQR(token, scannerId, hackathonId);

    res.status(200).json({
      success: true,
      message: "Entry authorized and attendance recorded",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || "Invalid QR Request",
    });
  }
};

// @desc    Generate food QR for a student
// @route   POST /api/hackathons/:hackathonId/qr/food/generate
// @access  Private
exports.generateFoodQR = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { mealType } = req.body;
    const userId = req.user.id;

    if (!mealType || !qrService.VALID_MEAL_TYPES.includes(mealType)) {
      return res.status(400).json({
        success: false,
        message: "Valid mealType (breakfast, lunch, dinner) is required",
      });
    }

    const qrData = await qrService.generateFoodQR(
      userId,
      hackathonId,
      mealType,
    );

    res.status(200).json({
      success: true,
      token: qrData.token,
      qrImageUrl: qrData.imageUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Server Error",
    });
  }
};

// @desc    Verify/scan food QR
// @route   POST /api/hackathons/:hackathonId/qr/food/validate
// @access  Private (Scanner)
exports.validateFoodQR = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { token, mealType } = req.body;

    if (!mealType || !qrService.VALID_MEAL_TYPES.includes(mealType)) {
      return res.status(400).json({
        success: false,
        message: "Valid mealType (breakfast, lunch, dinner) is required",
      });
    }

    const user = await User.findById(req.user.id).select("role hackathonRoles");
    if (!hasScannerAccess(user, hackathonId, "food-scan")) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to scan food QRs",
      });
    }

    const scannerId = req.user.id;
    const foodLog = await qrService.validateFoodQR(
      token,
      scannerId,
      hackathonId,
      mealType,
    );

    res.status(200).json({
      success: true,
      message: `${foodLog.mealType} successfully claimed!`,
      foodLog,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || "Invalid or Expired QR Request",
    });
  }
};

// @desc    Verify any scanned token (entry or meal) for committee scanner app
// @route   POST /api/hackathons/:hackathonId/committee/verify
// @access  Private (Admin/Scanner)
exports.verifyCommitteeScan = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { token, mealType, scanMode = "auto" } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    if (mealType && !qrService.VALID_MEAL_TYPES.includes(mealType)) {
      return res.status(400).json({
        success: false,
        message: "Valid mealType (breakfast, lunch, dinner) is required",
      });
    }

    if (!["auto", "entry", "food"].includes(scanMode)) {
      return res.status(400).json({
        success: false,
        message: "Valid scanMode (auto, entry, food) is required",
      });
    }

    const user = await User.findById(req.user.id).select("role hackathonRoles");
    if (!hasScannerAccess(user, hackathonId)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to scan for this hackathon",
      });
    }

    let result;
    if (scanMode === "entry") {
      await qrService.verifyEntryQR(token, req.user.id, hackathonId);
      result = { type: "entry", message: "Entry authorized and attendance recorded" };
    } else if (scanMode === "food") {
      if (!mealType) {
        return res.status(400).json({
          success: false,
          message: "mealType is required when scanMode is food",
        });
      }
      const foodLog = await qrService.validateFoodQR(
        token,
        req.user.id,
        hackathonId,
        mealType,
      );
      result = {
        type: "food",
        mealType: foodLog.mealType,
        message: `${foodLog.mealType} successfully claimed`,
      };
    } else {
      result = await qrService.verifyScannedQR(
        token,
        req.user.id,
        hackathonId,
        mealType,
      );
    }

    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || "Invalid QR Request",
    });
  }
};

// @desc    List student attendance + meal status for committee app
// @route   GET /api/hackathons/:hackathonId/committee/students
// @access  Private (Admin/Scanner)
exports.getCommitteeStudents = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const {
      search = "",
      attendance: attendanceFilter = "all",
      mealType,
      mealStatus = "all",
      participantStatus = "all",
      sortBy = "name",
      sortOrder = "asc",
    } = req.query;

    if (mealType && !qrService.VALID_MEAL_TYPES.includes(mealType)) {
      return res.status(400).json({
        success: false,
        message: "Valid mealType (breakfast, lunch, dinner) is required",
      });
    }

    const user = await User.findById(req.user.id).select("role hackathonRoles");
    if (!hasScannerAccess(user, hackathonId)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this hackathon scanner view",
      });
    }

    const teams = await Team.find({
      hackathon: hackathonId,
    })
      .select("leader members")
      .select("status")
      .lean();

    const studentIdSet = new Set();
    const teamStatusByStudent = new Map();
    teams.forEach((team) => {
      if (team.leader) studentIdSet.add(team.leader.toString());
      if (team.leader && !teamStatusByStudent.has(team.leader.toString())) {
        teamStatusByStudent.set(team.leader.toString(), team.status);
      }
      (team.members || []).forEach((memberId) => {
        studentIdSet.add(memberId.toString());
        if (!teamStatusByStudent.has(memberId.toString())) {
          teamStatusByStudent.set(memberId.toString(), team.status);
        }
      });
    });

    const studentIds = Array.from(studentIdSet);
    if (studentIds.length === 0) {
      return res.status(200).json({ success: true, students: [] });
    }

    const users = await User.find({ _id: { $in: studentIds } })
      .select("name email")
      .lean();

    const attendances = await Attendance.find({
      hackathonId,
      userId: { $in: studentIds },
    })
      .select("userId timestamp")
      .lean();

    const foodLogs = await FoodLog.find({
      hackathon: hackathonId,
      user: { $in: studentIds },
    })
      .select("user mealType claimedAt")
      .lean();

    const attendanceMap = new Map(
      attendances.map((record) => [record.userId.toString(), record]),
    );

    const mealMap = new Map();
    foodLogs.forEach((log) => {
      const id = log.user.toString();
      const current = mealMap.get(id) || {
        breakfast: false,
        lunch: false,
        dinner: false,
        claimedAt: {},
      };
      current[log.mealType] = true;
      current.claimedAt[log.mealType] = log.claimedAt;
      mealMap.set(id, current);
    });

    let students = users.map((student) => {
      const sid = student._id.toString();
      const attendance = attendanceMap.get(sid);
      const meals = mealMap.get(sid) || {
        breakfast: false,
        lunch: false,
        dinner: false,
        claimedAt: {},
      };

      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        participantStatus: teamStatusByStudent.get(sid) || "pending",
        attendance: {
          present: Boolean(attendance),
          timestamp: attendance?.timestamp || null,
        },
        meals: {
          breakfast: meals.breakfast,
          lunch: meals.lunch,
          dinner: meals.dinner,
          claimedAt: meals.claimedAt,
        },
      };
    });

    const normalizedSearch = search.trim().toLowerCase();
    if (normalizedSearch) {
      students = students.filter(
        (student) =>
          student.name.toLowerCase().includes(normalizedSearch) ||
          student.email.toLowerCase().includes(normalizedSearch),
      );
    }

    if (attendanceFilter === "present") {
      students = students.filter((student) => student.attendance.present);
    } else if (attendanceFilter === "absent") {
      students = students.filter((student) => !student.attendance.present);
    }

    if (participantStatus !== "all") {
      students = students.filter(
        (student) => student.participantStatus === participantStatus,
      );
    }

    if (mealType && (mealStatus === "claimed" || mealStatus === "unclaimed")) {
      const shouldBeClaimed = mealStatus === "claimed";
      students = students.filter(
        (student) => student.meals[mealType] === shouldBeClaimed,
      );
    }

    const normalize = (value) =>
      typeof value === "string" ? value.toLowerCase() : value;
    const direction = String(sortOrder).toLowerCase() === "desc" ? -1 : 1;

    students.sort((a, b) => {
      let left;
      let right;

      switch (sortBy) {
        case "email":
          left = normalize(a.email);
          right = normalize(b.email);
          break;
        case "status":
          left = normalize(a.participantStatus);
          right = normalize(b.participantStatus);
          break;
        case "attendance":
          left = a.attendance.present ? 1 : 0;
          right = b.attendance.present ? 1 : 0;
          break;
        case "breakfast":
        case "lunch":
        case "dinner":
          left = a.meals[sortBy] ? 1 : 0;
          right = b.meals[sortBy] ? 1 : 0;
          break;
        case "name":
        default:
          left = normalize(a.name);
          right = normalize(b.name);
          break;
      }

      if (left < right) return -1 * direction;
      if (left > right) return 1 * direction;
      return 0;
    });

    const mealSessions = await qrService.getMealSessionsForHackathon(hackathonId);
    res.status(200).json({ success: true, students, mealSessions });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Server Error",
    });
  }
};

// @desc    Admin starts meal session window
// @route   POST /api/hackathons/:hackathonId/committee/meal/start
// @access  Private (Admin)
exports.startMealSession = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { mealType, durationMinutes } = req.body;

    if (!mealType || !qrService.VALID_MEAL_TYPES.includes(mealType)) {
      return res.status(400).json({
        success: false,
        message: "Valid mealType (breakfast, lunch, dinner) is required",
      });
    }

    const user = await User.findById(req.user.id).select("role");
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can start meal sessions",
      });
    }

    const session = await qrService.startMealSession(
      hackathonId,
      mealType,
      durationMinutes,
    );
    res.status(200).json({ success: true, session });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || "Unable to start meal session",
    });
  }
};

// @desc    Admin extends active meal session window
// @route   POST /api/hackathons/:hackathonId/committee/meal/extend
// @access  Private (Admin)
exports.extendMealSession = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { mealType, extendMinutes } = req.body;

    if (!mealType || !qrService.VALID_MEAL_TYPES.includes(mealType)) {
      return res.status(400).json({
        success: false,
        message: "Valid mealType (breakfast, lunch, dinner) is required",
      });
    }

    const user = await User.findById(req.user.id).select("role");
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can extend meal sessions",
      });
    }

    const session = await qrService.extendMealSession(
      hackathonId,
      mealType,
      extendMinutes,
    );
    res.status(200).json({ success: true, session });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || "Unable to extend meal session",
    });
  }
};

// @desc    Generate meal QRs (breakfast, lunch, dinner) for a student
// @route   POST /api/qr/generate-meals
// @access  Private (Admin)
exports.generateMealQRs = async (req, res) => {
  res.status(301).json({
    success: false,
    message: "Use POST /api/hackathons/:hackathonId/qr/food/generate instead",
  });
};

// @desc    Scan / validate a QR code
// @route   POST /api/qr/scan
// @access  Private (Admin)
exports.scanQR = async (req, res) => {
  res.status(301).json({
    success: false,
    message: "Use POST /api/hackathons/:hackathonId/committee/verify instead",
  });
};

// @desc    Get all QRs for a student in a hackathon
// @route   GET /api/qr/student/:userId/hackathon/:hackathonId
// @access  Private
exports.getStudentQRs = async (req, res) => {
  try {
    const { userId, hackathonId } = req.params;
    const QR = require("../models/QR");
    const qrs = await QR.find({ user: userId, hackathon: hackathonId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, qrs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get scan logs for a hackathon
// @route   GET /api/qr/logs/:hackathonId
// @access  Private (Admin)
exports.getScanLogs = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const attendanceLogs = await Attendance.find({ hackathonId })
      .populate("userId", "name email")
      .sort({ timestamp: -1 });
    const foodLogs = await FoodLog.find({ hackathon: hackathonId })
      .populate("user", "name email")
      .populate("scannedBy", "name")
      .sort({ claimedAt: -1 });
    res.status(200).json({ success: true, attendanceLogs, foodLogs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Bulk generate QRs for all shortlisted students
// @route   POST /api/qr/bulk-generate/:hackathonId
// @access  Private (Admin)
exports.bulkGenerateQRs = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const teams = await Team.find({
      hackathon: hackathonId,
      status: { $in: ["shortlisted", "finalist"] },
    }).select("members");

    const memberIds = new Set();
    teams.forEach((team) => {
      (team.members || []).forEach((m) => memberIds.add(m.toString()));
    });

    if (memberIds.size === 0) {
      return res.status(404).json({ success: false, message: "No shortlisted teams found" });
    }

    const results = { generated: 0, skipped: 0, errors: 0 };
    for (const userId of memberIds) {
      try {
        await qrService.generateEntryQR(userId, hackathonId);
        results.generated++;
      } catch (err) {
        if (err.message && err.message.includes("already")) {
          results.skipped++;
        } else {
          results.errors++;
        }
      }
    }

    res.status(200).json({ success: true, message: "Bulk QR generation complete", results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
