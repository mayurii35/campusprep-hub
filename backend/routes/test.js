const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/list', authMiddleware, testController.getTestsList);
router.get('/:id', authMiddleware, testController.getTestDetails);
router.post('/:id/submit', authMiddleware, testController.submitTestResult);

module.exports = router;
