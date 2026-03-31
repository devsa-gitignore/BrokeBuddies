const { sendSMS, sendBulkSMS } = require('../services/smsService');
const { generateOTP } = require('../services/otpService');

// @desc    Send OTP via SMS
// @route   POST /api/sms/send-otp
// @access  Public
exports.sendOTP = async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        const otp = generateOTP();
        const message = `Your HackFire OTP is: ${otp}. Valid for 10 minutes.`;

        await sendSMS(phoneNumber, message);

        res.status(200).json({ message: 'OTP sent successfully', otp }); // Return OTP for testing
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send Shortlist Notification via SMS
// @route   POST /api/sms/send-shortlist
// @access  Admin
exports.sendShortlistNotification = async (req, res) => {
    try {
        const { phoneNumbers, hackathonName } = req.body;
        const message = `Congratulations! Your team has been shortlisted for ${hackathonName}. Check the portal for next steps.`;

        const result = await sendBulkSMS(phoneNumbers, message);

        res.status(200).json({ message: 'Shortlist notifications sent', result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send Broadcast via SMS
// @route   POST /api/sms/send-broadcast
// @access  Admin
exports.sendBroadcastSMS = async (req, res) => {
    try {
        const { phoneNumbers, broadcastMessage } = req.body;
        const message = `HackFire Broadcast: ${broadcastMessage}`;

        const result = await sendBulkSMS(phoneNumbers, message);

        res.status(200).json({ message: 'Broadcast sent via SMS', result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
