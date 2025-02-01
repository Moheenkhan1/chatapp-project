const mongoose = require('mongoose');
const Message = require('../models/messages.model');

module.exports.getMessages = async (req, res) => {
  const { sender, receiver } = req.params;

  // Check if sender and receiver are valid ObjectIds
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
    res.status(500).send('Error fetching messages');
  }
};

// Add a new message
module.exports.addMessage = async (req, res) => {
    const { from, to, message } = req.body;
  
    if (!from || !to || !message) {
      return res.status(400).send('Sender, receiver, and message are required');
    }
  
    try {
      const newMessage = await Message.create({
        message: { text: message },
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
  