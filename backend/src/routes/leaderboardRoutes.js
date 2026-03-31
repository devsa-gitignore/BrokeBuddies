const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getRound1Leaderboard,
    getFinalLeaderboard,
    getGlobalLeaderboard,
    getGlobalUserRanking
} = require('../controllers/leaderboardController');

router.get('/round1/:hackathonId', protect, getRound1Leaderboard);
router.get('/final/:hackathonId', protect, getFinalLeaderboard);
router.get('/global', getGlobalLeaderboard);
router.get('/global/:userId', protect, getGlobalUserRanking);

module.exports = router;
