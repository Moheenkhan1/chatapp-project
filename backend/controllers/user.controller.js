const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
const authMiddleware = require('../middleware/authMiddleware.js')
const multer = require("multer");
const path = require("path");
const upload = require("../config/multer.js"); // Import Cloudinary Multer config


// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "profilePic/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const profilePic = multer({ storage: storage });


module.exports.registerUser = async (req, res) => {
  console.log("🔵 Incoming Registration Request:", req.body);
  console.log("📂 File Received:", req.file);

  const { username, email, password } = req.body;
  const profilePicture = req.file ? req.file.path : null; // Get Cloudinary URL

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Username, email, and password are required" });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this username or email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      profilePicture,
    });

    await newUser.save();
    return res.status(200).json({ message: "User successfully registered", newUser });
  } catch (error) {
    console.error("❌ Error registering user:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

module.exports.loginUser = async (req,res)=>{
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
            secure: true, 
            maxAge: 3600000, 
            sameSite: 'None', 
          });
      
          res.status(200).json({ token, user });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Server Error' });
        }
}

module.exports.logoutUser = async (req,res)=>{
        res.clearCookie('token');
        res.status(200).json({ message: 'Logged out successfully' });
}
