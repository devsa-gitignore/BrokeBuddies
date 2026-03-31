const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
    updateSubmission
} = require('../controllers/submissionController');

router.put('/:id', protect, updateSubmission);

module.exports = router;
