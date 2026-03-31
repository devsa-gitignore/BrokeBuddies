const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
    generateBulkFeedbackRound1,
    getTeamFeedback,
    generateTeamFeedbackRound1
} = require('../controllers/aiController');

// Bulk Generate AI Feedback (Admin only)
router.post('/hackathons/:hackathonId/round1/generate-feedback', protect, authorize('admin'), generateBulkFeedbackRound1);

// Get AI Feedback for a specific team
router.get('/teams/:teamId/feedback/:round', protect, getTeamFeedback);
router.post('/teams/:teamId/feedback/round1/generate', protect, authorize('admin'), generateTeamFeedbackRound1);

module.exports = router;
