const express = require("express");
const {getAIResponse} = require("../controllers/ai.controller");

const router = express.Router();

// Route to handle AI chatbot requests
router.post("/ai-chat", getAIResponse);

module.exports = router;