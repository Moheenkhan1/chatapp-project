const messageModel = require('../models/messages.model')
const mongoose = require('mongoose');

module.exports.getMessages = async (req,res,next) => {
}

module.exports.addMessage = async (req, res, next) => {
    try {
        const { currentUser, to, chat } = req.body;

        const from = currentUser._id;
        const message = chat;

        console.log(currentUser,to,message)
 
        // Validate sender (from) as ObjectId
        if (!mongoose.Types.ObjectId.isValid(from) || !mongoose.Types.ObjectId.isValid(to)) {
            return res.status(400).json({ message: "Invalid sender or recipient ID" });
        }

        // Ensure message text is present
        if (!message || typeof message !== 'string' || message.trim() === '') {
            return res.status(400).json({ message: "Message text is required" });
        }

        const data = await messageModel.create({
            message: { text: message },
            users: [from, to],
            sender: new mongoose.Types.ObjectId(from), // Convert to ObjectId
        });

        res.status(200).json({ message: "Message added successfully" });
    } catch (error) {
        next(error);
    }
};
