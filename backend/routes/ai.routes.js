const express = require("express");
const {getAIResponse} = require("../controllers/ai.controller");
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router();

// Route to handle AI chatbot requests
router.post("/ai-chat",authMiddleware, getAIResponse);

module.exports = router;