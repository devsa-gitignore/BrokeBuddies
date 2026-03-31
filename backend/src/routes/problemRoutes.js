const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { updateProblem, deleteProblem } = require('../controllers/problemController');

router.put('/:id', protect, authorize('admin'), updateProblem);
router.delete('/:id', protect, authorize('admin'), deleteProblem);

module.exports = router;
