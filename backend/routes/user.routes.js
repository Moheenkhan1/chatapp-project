// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
const authMiddleware = require('../middleware/authMiddleware.js'); 

const router = express.Router();

// Signup Route
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required' });
  }
  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this username or email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(200).json({ message: "User successfully registered", newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: false, 
      maxAge: 3600000, 
      sameSite: 'lax', 
    });

    res.status(200).json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

//logout route
router.post('/logout', async (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
});

// Profile Route 
router.post('/home', authMiddleware, async (req, res) => {
  try {
    res.status(200).json({ message: 'You have access to your profile', user: req.user });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
