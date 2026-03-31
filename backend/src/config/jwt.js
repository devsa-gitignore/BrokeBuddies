const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for the given user payload.
 * @param {Object} payload - User data to encode
 * @returns {string} Signed JWT token
 */
const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

/**
 * Verify and decode a JWT token.
 * @param {string} token - JWT token string
 * @returns {Object} Decoded payload
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = { generateToken, verifyToken };
