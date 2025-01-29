const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
const authMiddleware = require('../middleware/authMiddleware.js'); 

const router = express.Router();

router.post('/contacts', authMiddleware, async (req, res) => {
  const contacts = await User.find({})
  res.status(200).json({contacts})
});

module.exports = router;