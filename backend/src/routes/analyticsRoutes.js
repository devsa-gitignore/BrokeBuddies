const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access :hackathonId from parent
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
    getOverview,
    getRegistrationAnalytics,
    getAttendanceAnalytics,
    getFoodAnalytics,
    getEvaluationAnalytics
} = require('../controllers/analyticsController');

router.get('/overview', protect, authorize('admin'), getOverview);
router.get('/registrations', protect, authorize('admin'), getRegistrationAnalytics);
router.get('/attendance', protect, authorize('admin'), getAttendanceAnalytics);
router.get('/food', protect, authorize('admin'), getFoodAnalytics);
router.get('/evaluations', protect, authorize('admin'), getEvaluationAnalytics);

module.exports = router;
