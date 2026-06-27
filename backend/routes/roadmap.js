const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/generate', authMiddleware, roadmapController.generateRoadmap);

module.exports = router;
