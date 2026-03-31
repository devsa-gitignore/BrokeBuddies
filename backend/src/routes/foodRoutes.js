const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
    claimMeal,
    getFoodAnalytics,
    getRemainingMeals,
    getStudentFoodLogs
} = require('../controllers/foodController');

router.post('/claim', protect, authorize('admin'), claimMeal);
router.get('/analytics/:hackathonId', protect, authorize('admin'), getFoodAnalytics);
router.get('/remaining/:hackathonId', protect, authorize('admin'), getRemainingMeals);
router.get('/student/:userId', protect, getStudentFoodLogs);

module.exports = router;
