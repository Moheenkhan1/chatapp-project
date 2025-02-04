// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const multer = require("multer");
const path = require("path");

const {registerUser,loginUser,logoutUser} = require('../controllers/user.controller.js')

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "profilePic/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const profilePic = multer({ storage: storage });

// Signup Route
router.post('/register',profilePic.single("file"),registerUser);

// Login Route
router.post('/login', loginUser);

//logout route
router.post('/logout', logoutUser);

module.exports = router;
