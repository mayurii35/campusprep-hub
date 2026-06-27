const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/list', authMiddleware, jobController.getJobs);
router.post('/apply', authMiddleware, jobController.applyJob);
router.get('/companies', authMiddleware, jobController.getCompanies);

module.exports = router;
