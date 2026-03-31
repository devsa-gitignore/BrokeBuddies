const twilio = require('twilio');

/**
 * SMS Service
 * Send SMS notifications to students.
 */

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

let client;
if (accountSid && accountSid.startsWith('AC') && authToken) {
    try {
        client = twilio(accountSid, authToken);
    } catch (e) {
        console.error('Failed to initialize Twilio client:', e.message);
    }
} else {
    console.log('--- SMS SERVICE: TWILIO NOT CONFIGURED (Using Fallback) ---');
}

/**
 * Send an SMS message.
 * @param {string} phoneNumber
 * @param {string} message
 * @returns {Promise<void>}
 */
const sendSMS = async (phoneNumber, message) => {
    try {
        if (client) {
            console.log(`Attempting Twilio SMS to ${phoneNumber}...`);
            await client.messages.create({
                body: message,
                from: fromNumber,
                to: phoneNumber
            });
            console.log(`✅ Twilio SMS sent to ${phoneNumber}`);
        } else {
            console.log(`⚠️  [DEV MODE] Twilio not connected. SMS to ${phoneNumber}: ${message}`);
        }
    } catch (error) {
        console.error(`❌ Error sending SMS to ${phoneNumber}:`, error.message);
        // Fallback for development: log the SMS
        console.log(`DEVELOPMENT FALLBACK - SMS to ${phoneNumber}: ${message}`);
    }
};

/**
 * Send bulk SMS to shortlisted students.
 * @param {Array<string>} phoneNumbers
 * @param {string} message
 * @returns {Promise<{ sent: number, failed: number }>}
 */
const sendBulkSMS = async (phoneNumbers, message) => {
    let sentCount = 0;
    let failedCount = 0;

    const promises = phoneNumbers.map(async (number) => {
        try {
            await sendSMS(number, message);
            sentCount++;
        } catch (error) {
            failedCount++;
        }
    });

    await Promise.allSettled(promises);

    return { sent: sentCount, failed: failedCount };
};

module.exports = { sendSMS, sendBulkSMS };
