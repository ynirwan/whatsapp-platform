const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { auth } = require('../middleware/auth');

router.get('/dashboard', auth, analyticsController.getDashboardStats);
router.get('/trends', auth, analyticsController.getMessageTrends);

module.exports = router;
