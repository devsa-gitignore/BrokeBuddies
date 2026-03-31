/**
 * Face Match Service
 * Compare faces between ID card photo and live selfie.
 */

/**
 * Compare two face images and return match percentage.
 * @param {Buffer|string} idCardImage - ID card photo (buffer or URL)
 * @param {Buffer|string} selfieImage - Live selfie (buffer or URL)
 * @returns {Promise<{ match: boolean, confidence: number }>}
 */
const compareFaces = async (idCardImage, selfieImage) => {
    // TODO: implement using face recognition API
};

/**
 * Verify face at gate entry.
 * @param {string} userId
 * @param {Buffer} liveFeedImage
 * @returns {Promise<{ match: boolean, confidence: number }>}
 */
const verifyAtGate = async (userId, liveFeedImage) => {
    // TODO: implement
};

module.exports = { compareFaces, verifyAtGate };
