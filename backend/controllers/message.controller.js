// messages.controller.js (Backend Controller)
const mongoose = require("mongoose");
const Message = require("../models/messages.model");
const multer = require("multer");
const path = require("path");

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

module.exports.getMessages = async (req, res) => {
  const { sender, receiver } = req.params;

  if (!mongoose.Types.ObjectId.isValid(sender) || !mongoose.Types.ObjectId.isValid(receiver)) {
    return res.status(400).send("Invalid sender or receiver ID");
  }

  try {
    const messages = await Message.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).send("Error fetching messages");
  }
};

// Add a new message
module.exports.addMessage = async (req, res) => {
  console.log("Received Body:", req.body);
  console.log("Received File:", req.file);

  const { from, to, message } = req.body;

  if (!from || !to || (!message && !req.file)) {
    return res.status(400).send("Sender, receiver, and message or file are required");
  }

  let fileUrl = null;
  let fileType = null;

  if (req.file) {
    fileUrl = `/uploads/${req.file.filename}`;
    fileType = req.file.mimetype.split("/")[0];
  }

  try {
    const newMessage = await Message.create({
      message: { text: message, fileUrl, fileType },
      users: [from, to],
      sender: from,
      receiver: to,
    });

    res.status(200).json(newMessage);
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).send("Error saving message");
  }
};
