const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { authorize, requireScanner } = require("../middleware/roleMiddleware");
const {
  generateEntryQR,
  verifyEntryQR,
  generateMealQRs,
  scanQR,
  getStudentQRs,
  getScanLogs,
  bulkGenerateQRs,
} = require("../controllers/qrController");

router.post(
  "/api/hackathons/:hackathonId/qr/entry/generate",
  protect,
  generateEntryQR,
);
router.post(
  "/api/hackathons/:hackathonId/qr/entry/verify",
  protect,
  requireScanner("entry-scan"),
  verifyEntryQR,
);

// Existing routes that might still be hooked up (with warning about shifted params for entry)
router.post("/generate-entry", protect, authorize("admin"), generateEntryQR);
router.post("/generate-meals", protect, authorize("admin"), generateMealQRs);
router.post("/scan", protect, authorize("admin"), scanQR);
router.get("/student/:userId/hackathon/:hackathonId", protect, getStudentQRs);
router.get("/logs/:hackathonId", protect, authorize("admin"), getScanLogs);
router.post(
  "/bulk-generate/:hackathonId",
  protect,
  authorize("admin"),
  bulkGenerateQRs,
);

module.exports = router;
