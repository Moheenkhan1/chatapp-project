const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

// Profile Picture Storage
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'profile_pictures',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    public_id: (req, file) => `profile-${Date.now()}-${file.originalname}`,
  },
});

// Chat File Storage
const chatStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'chat_files',
      upload_preset: 'my_preset', // Use your actual preset name
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'mp4', 'mp3', 'wav', 'ogg', 'mov'],
      resource_type: 'auto',
      public_id: (req, file) => `chat-${Date.now()}-${file.originalname.replace(/\s/g, "_")}`,
    },
  });

// Middleware for uploads
const uploadProfile = multer({ storage: profileStorage });
const uploadChatFile = multer({ storage: chatStorage });

module.exports = { uploadProfile, uploadChatFile};