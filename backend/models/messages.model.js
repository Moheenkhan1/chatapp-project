const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  message: {
    text: { type: String },
    fileUrl: { type: String},
    fileType: { type: String},
    createdAt: { type: Date, default: Date.now },
  },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, {
  timestamps: true, // This ensures createdAt and updatedAt are automatically managed by Mongoose
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
