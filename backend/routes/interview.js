const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/questions', authMiddleware, interviewController.getInterviewQuestions);
router.post('/submit', authMiddleware, interviewController.submitInterviewAnswer);

module.exports = router;
