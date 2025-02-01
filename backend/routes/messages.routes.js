const express = require("express");
const { getMessages, addMessage } = require("../controllers/message.controller");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Route for fetching messages between the sender and receiver
router.get("/getMessages/:sender/:receiver", authMiddleware, getMessages);

// Route for adding a new message
router.post("/addMessages", authMiddleware, addMessage);

module.exports = router;
