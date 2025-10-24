const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validation');
const validators = require('../utils/validators');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, validate(validators.register), authController.register);
router.post('/login', authLimiter, validate(validators.login), authController.login);
router.post('/refresh', validate(validators.refreshToken), authController.refreshToken);
router.get('/me', auth, authController.getMe);
router.post('/logout', auth, authController.logout);
router.put('/profile', auth, validate(validators.updateProfile), authController.updateProfile);
router.put('/password', auth, validate(validators.changePassword), authController.changePassword);

module.exports = router;
