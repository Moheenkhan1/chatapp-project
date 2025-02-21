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
  profilePicture:{
    type:String,
    default:'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
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
