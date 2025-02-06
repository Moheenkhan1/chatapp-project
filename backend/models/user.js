const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    fileUrl: {
      type: String,
    },
    fileType: {
      type: String, 
    },
  },
  isOnline: { type: Boolean, default: false }, // Online status field
});

module.exports = mongoose.model('User', UserSchema);
