const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
    runBulkPlagiarismCheck,
    getPlagiarismReport
} = require('../controllers/plagiarismController');

// Run bulk check (Admin only)
router.post('/hackathons/:hackathonId/run', protect, authorize('admin'), runBulkPlagiarismCheck);

// Get flagged report (Admin only)
router.get('/hackathons/:hackathonId/report', protect, authorize('admin'), getPlagiarismReport);

module.exports = router;
