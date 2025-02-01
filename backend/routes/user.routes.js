// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
const authMiddleware = require('../middleware/authMiddleware.js');

const {registerUser,loginUser,logoutUser} = require('../controllers/user.controller.js')

const router = express.Router();

// Signup Route
router.post('/register',registerUser);

// Login Route
router.post('/login', loginUser);

//logout route
  router.post('/logout', logoutUser);

module.exports = router;
