const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
    getMyBroadcasts
} = require('../controllers/broadcastController');

router.get('/my', protect, getMyBroadcasts);

module.exports = router;
