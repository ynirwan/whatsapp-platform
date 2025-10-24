const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Media, Message } = require('../models');
const WhatsAppService = require('../services/whatsappService');
const logger = require('../utils/logger');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|mp4|mp3|wav/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 16 * 1024 * 1024 }, // 16MB
  fileFilter
});

exports.upload = upload;

// @desc    Upload media file
// @route   POST /api/v1/media/upload
// @access  Private
exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { accountId } = req.body;

    // Get WhatsApp account
    const WhatsAppAccount = require('../models').WhatsAppAccount;
    const account = await WhatsAppAccount.findOne({
      where: { id: accountId, userId: req.user.id }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'WhatsApp account not found'
      });
    }

    // Upload to WhatsApp
    const whatsappService = new WhatsAppService(account.accessToken, account.phoneNumberId);
    
    const fileBuffer = fs.readFileSync(req.file.path);
    const whatsappResponse = await whatsappService.uploadMedia(fileBuffer, req.file.mimetype);

    // Save media record
    const media = await Media.create({
      messageId: null, // Will be linked when message is sent
      mediaId: whatsappResponse.id,
      mimeType: req.file.mimetype,
      localPath: req.file.path,
      filename: req.file.originalname,
      size: req.file.size
    });

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        media: {
          id: media.id,
          mediaId: media.mediaId,
          filename: media.filename,
          mimeType: media.mimeType,
          size: media.size,
          url: `/uploads/${req.file.filename}`
        }
      }
    });
  } catch (error) {
    logger.error('Upload media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file'
    });
  }
};

// @desc    Get media library
// @route   GET /api/v1/media
// @access  Private
exports.getMedia = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const media = await Media.findAndCountAll({
      include: [{
        model: Message,
        as: 'message',
        attributes: ['id', 'type', 'createdAt']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: media
    });
  } catch (error) {
    logger.error('Get media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch media'
    });
  }
};

// @desc    Delete media
// @route   DELETE /api/v1/media/:id
// @access  Private
exports.deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;

    const media = await Media.findByPk(id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Delete local file
    if (media.localPath && fs.existsSync(media.localPath)) {
      fs.unlinkSync(media.localPath);
    }

    await media.destroy();

    res.json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    logger.error('Delete media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete media'
    });
  }
};
