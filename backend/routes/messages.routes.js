const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
const authMiddleware = require('../middleware/authMiddleware.js'); 
const Message = require('../models/messages.model.js');
const { getMessages, addMessage } = require('../controllers/message.controller.js');

const router = express.Router();

router.post('/getMessages', authMiddleware, getMessages)
router.post('/addMessages', authMiddleware, addMessage)

module.exports = router;

