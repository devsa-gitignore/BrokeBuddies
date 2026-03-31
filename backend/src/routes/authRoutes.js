const express = require('express');
const router = express.Router();
const {
    register,
    login,
    verifyOTP,
    resendOTP,
    logout,
    refreshToken
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);

module.exports = router;
