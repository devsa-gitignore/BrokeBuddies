const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
    generateSummary,
    getSummary,
    exportSummaryPDF
} = require('../controllers/summaryController');

router.post('/generate/:hackathonId', protect, authorize('admin'), generateSummary);
router.get('/:hackathonId', protect, authorize('admin'), getSummary);
router.get('/export/:hackathonId', protect, authorize('admin'), exportSummaryPDF);

module.exports = router;
