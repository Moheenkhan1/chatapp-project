// Corrected message.controller.js
const mongoose = require("mongoose");
const Message = require("../models/messages.model");
const multer = require("multer");
const path = require("path");
const upload = require("../config/multer"); // Cloudinary Multer config


// Fetch messages between sender and receiver
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
  // console.log(" Received Chat Message:", req.body);
  // console.log(" File Received:", req.file);

  const { from, to, message } = req.body;

  if (!from || !to || (!message && !req.file)) {
    return res.status(400).json({ message: "Sender, receiver, and message or file are required" });
  }

  let fileUrl = null;
  let fileType = null;

  if (req.file) {
    fileUrl = req.file.path ; // Cloudinary file URL
    fileType = req.file.mimetype.split("/")[0];
  }

  try {

    // Get the Socket.IO instance from app
    const io = req.app.get("socketio");
    if (!io) {
      // console.error("❌ Socket.IO instance not found");
      return res.status(500).json({ message: "Internal Server Error" });
    }

    // Emit the new message event only to the receiver
    // console.log('notify to :',to)
    io.to(to).emit("newMessage", {
      from,
      message,
      timestamp: new Date(),
    });

    const newMessage = await Message.create({
      message: { text: message, fileUrl, fileType },
      users: [from, to],
      sender: from,
      receiver: to,
    });



    return res.status(200).json(newMessage);
  } catch (error) {
    // console.error("❌ Error saving message:", error);
    return res.status(500).json({ message: "Error saving message" });
  }
};

// Delete a message
module.exports.deleteMessage = async (req, res) => {
  const { messageId, userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    return res.status(400).send("Invalid message ID");
  }

  try {
    // Find the message by ID and check if it belongs to the user
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).send("Message not found");
    }

    if (message.sender.toString() !== userId) {
      return res.status(403).send("You are not authorized to delete this message");
    }

    // Delete the message
    await Message.findByIdAndDelete(messageId);

    res.status(200).send("Message deleted successfully");
  } catch (error) {
    res.status(500).send("Error deleting message");
  }
};


module.exports.getUnreadMessages = async (req, res) => {
  try {
    // console.log("🟢 Incoming request to /messages/unread");

    // Extract user ID
    const userId = req.user._id || req.user.id;
    // console.log("🔍 Extracted user ID:", userId);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized - No user ID found" });
    }

    // Ensure userId is always an ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId.toString());

    console.log("🔹 Converted User ObjectId:", userObjectId);

    // Group unread messages by sender
    const unreadCounts = await Message.aggregate([
      { $match: { receiver: userObjectId, read: false } }, // ✅ Match unread messages for this user
      { $group: { _id: "$sender", count: { $sum: 1 } } } // ✅ Count messages per sender
    ]);

    // console.log("✅ Unread Messages Count:", unreadCounts);

    res.status(200).json(unreadCounts);
  } catch (error) {
    // console.error("❌ Error fetching unread messages:", error);
    res.status(500).json({ message: "Error fetching unread messages" });
  }
};





module.exports.markMessagesAsRead = async (req, res) => {
  try {
    const { senderId } = req.body;
    const userId = req.user._id || req.user.id;

    if (!senderId || !userId) {
      return res.status(400).json({ message: "Missing senderId or userId" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const senderObjectId = new mongoose.Types.ObjectId(senderId);

    // ✅ Mark all unread messages as read
    await Message.updateMany(
      { sender: senderObjectId, receiver: userObjectId, read: false },
      { $set: { read: true } }
    );

    // ✅ Get updated unread count
    const unreadCount = await Message.countDocuments({
      sender: senderObjectId,
      receiver: userObjectId,
      read: false,
    });

    // console.log(`📩 Marked messages as read. Updated unread count: ${unreadCount}`);

    // ✅ Emit real-time update
    req.app.get("socketio").emit("update-unread-count", { senderId, count: unreadCount });

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    // console.error("❌ Error marking messages as read:", error);
    res.status(500).json({ message: "Error marking messages as read" });
  }
};
