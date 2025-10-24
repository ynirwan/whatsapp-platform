const express = require('express');
const router = express.Router();
const automationController = require('../controllers/automationController');
const { auth } = require('../middleware/auth');

router.post('/auto-reply', auth, automationController.createAutoReply);
router.get('/auto-reply', auth, automationController.getAutoReplies);
router.put('/auto-reply/:id', auth, automationController.updateAutoReply);
router.delete('/auto-reply/:id', auth, automationController.deleteAutoReply);

module.exports = router;
