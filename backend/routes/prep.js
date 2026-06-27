const express = require('express');
const router = express.Router();
const prepController = require('../controllers/prepController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/questions', authMiddleware, prepController.getPrepQuestions);
router.get('/coding-problems', authMiddleware, prepController.getCodingProblems);
router.post('/submit', authMiddleware, prepController.submitAnswer);

module.exports = router;
