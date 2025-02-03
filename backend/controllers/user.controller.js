const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
const authMiddleware = require('../middleware/authMiddleware.js')
const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "profilePic/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const profilePic = multer({ storage: storage });


module.exports.registerUser = async (req,res)=>{
    const { username, email, password } = req.body;
    let fileUrl = null;
    let fileType = null;
    if (req.file) {
      fileUrl = `/profilePic/${req.file.filename}`;
      fileType = req.file.mimetype.split("/")[0];
    }
    console.log(req.file)
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
      avatar: {
        fileUrl:fileUrl, fileType:fileType 
      },
    });

    await newUser.save();

    res.status(200).json({ message: "User successfully registered", newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

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
            secure: false, 
            maxAge: 3600000, 
            sameSite: 'lax', 
          });
      
          res.status(200).json({ token, user });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Server Error' });
        }
}

module.exports.logoutUser = async (req,res)=>{
    async (req, res) => {
        res.clearCookie('token');
        res.status(200).json({ message: 'Logged out successfully' });
    }
}
