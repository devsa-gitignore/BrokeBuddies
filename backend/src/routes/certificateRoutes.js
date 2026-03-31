const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
    bulkGenerateCertificates,
    getStudentCertificates,
    verifyCertificate,
    downloadCertificate
} = require('../controllers/certificateController');

// Bulk Generate — Admin triggers from hackathon
router.post('/hackathons/:hackathonId/certificates/generate', protect, authorize('admin'), bulkGenerateCertificates);

// Public QR verification — no auth needed
router.get('/verify/:certificateId', verifyCertificate);

// Serve generated PNG file (Public for demo ease-of-use)
router.get('/file/:filename', downloadCertificate);

// Fetch all certs for a user in a specific hackathon
router.get('/:userId/:hackathonId', protect, getStudentCertificates);

module.exports = router;
