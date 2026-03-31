const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
    submitEvaluationRound1,
    updateEvaluationRound1,
    submitEvaluationFinal,
    getEvaluationFinal
} = require('../controllers/evaluationController');

router.post('/round1/:teamId', protect, authorize('admin', 'judge'), submitEvaluationRound1);
router.put('/round1/:teamId', protect, authorize('admin', 'judge'), updateEvaluationRound1);

// Final Evaluation
router.post('/final/:teamId', protect, authorize('admin', 'judge'), submitEvaluationFinal);
router.get('/final/:teamId', protect, getEvaluationFinal);

module.exports = router;
