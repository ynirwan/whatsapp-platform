const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { auth } = require('../middleware/auth');

router.post('/upload', auth, mediaController.upload.single('file'), mediaController.uploadMedia);
router.get('/', auth, mediaController.getMedia);
router.delete('/:id', auth, mediaController.deleteMedia);

module.exports = router;
