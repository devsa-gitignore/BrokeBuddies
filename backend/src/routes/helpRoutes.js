const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
    resolveHelpRequest
} = require('../controllers/helpController');

router.put('/:requestId/resolve', protect, authorize('admin', 'mentor'), resolveHelpRequest);

module.exports = router;
