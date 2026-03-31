/**
 * Face Verification Middleware
 * Validates face match between ID card photo and live selfie.
 */

const verifyFace = async (req, res, next) => {
    // TODO: implement face comparison logic
    next();
};

module.exports = { verifyFace };
