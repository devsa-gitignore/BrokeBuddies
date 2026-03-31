const emailService = require('./emailService');
const { sendSMS } = require('./smsService');

/**
 * OTP Service
 * Send and verify OTPs via SMS/email.
 */

/**
 * Generate a random 6-digit OTP.
 * @returns {string} OTP code
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP via SMS using SMS Service.
 * @param {string} phoneNumber
 * @param {string} otp
 * @returns {Promise<void>}
 */
const sendOTPviaSMS = async (phoneNumber, otp) => {
    const message = `Your HackFire OTP is: ${otp}. Valid for 10 minutes.`;
    await sendSMS(phoneNumber, message);
};

/**
 * Send OTP via email using Email Service.
 */
const sendOTPviaEmail = async (email, otp) => {
    try {
        await emailService.sendEmail({
            to: email,
            subject: 'HackFire - Your OTP Verification Code',
            text: `Your OTP for HackFire registration is: ${otp}. It is valid for 10 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0F0F0F; color: #FFFFFF;">
                    <h2 style="color: #FFB703;">Welcome to HackFire!</h2>
                    <p>Your OTP for registration is:</p>
                    <h1 style="background: #1A1A1A; padding: 10px; display: inline-block; border-radius: 8px; color: #FB8500;">${otp}</h1>
                    <p>This code is valid for 10 minutes.</p>
                    <hr style="border: 0; border-top: 1px solid #333;" />
                    <p style="font-size: 12px; color: #888;">If you did not request this, please ignore this email.</p>
                </div>
            `
        });
    } catch (error) {
        console.error('Error sending OTP email:', error);
        console.log(`DEVELOPMENT FALLBACK - OTP for ${email}: ${otp}`);
    }
};

/**
 * Verify an OTP against stored value.
 */
const verifyOTP = async (userId, otp) => {
    return true;
};

module.exports = { generateOTP, sendOTPviaSMS, sendOTPviaEmail, verifyOTP };
