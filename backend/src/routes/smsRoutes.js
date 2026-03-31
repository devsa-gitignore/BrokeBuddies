const express = require('express');
const router = express.Router();
const { sendOTP, sendShortlistNotification, sendBroadcastSMS } = require('../controllers/smsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/send-otp', sendOTP);
router.post('/send-shortlist', protect, authorize('admin'), sendShortlistNotification);
router.post('/send-broadcast', protect, authorize('admin'), sendBroadcastSMS);

module.exports = router;
