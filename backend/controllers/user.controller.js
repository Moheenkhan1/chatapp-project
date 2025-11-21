// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/user.js');
// const authMiddleware = require('../middleware/authMiddleware.js')
// const multer = require("multer");
// const path = require("path");
// const upload = require("../config/multer.js"); // Import Cloudinary Multer config
// const nodemailer = require("nodemailer");
// const dns = require("dns");


// module.exports.registerUser = async (req, res) => {
//   // console.log(" Incoming Registration Request:", req.body);
//   // console.log(" File Received:", req.file);

//   const { username, email, password } = req.body;
//   const profilePicture = req.file ? req.file.path : null; // Get Cloudinary URL

//   if (!username || !email || !password) {
//     return res.status(400).json({ message: "Username, email, and password are required" });
//   }

//   try {
//     const existingUser = await User.findOne({ $or: [{ email }, { username }] });
//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists with this username or email" });
//     }

//     // Extract domain from email
//     const emailDomain = email.split("@")[1];

//     // Check if email domain has valid MX records (Mail Exchange)
//     dns.resolveMx(emailDomain, async (err, addresses) => {
//       if (err || !addresses || addresses.length === 0) {
//         return res.status(400).json({ message: "Email domain is invalid or doesn't accept emails" });
//       }

//       // Hash password
//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(password, salt);

//       const newUser = new User({
//         username,
//         email,
//         password: hashedPassword,
//         profilePicture,
//       });

//       await newUser.save();
//       return res.status(200).json({ message: "User successfully registered", newUser });
//     });
//   } catch (error) {
//     // console.error("Error registering user:", error);
//     return res.status(500).json({ message: "Server Error" });
//   }
// };

// module.exports.loginUser = async (req,res)=>{
//         const { username, password } = req.body;
      
//         if (!username || !password) {
//           return res.status(400).json({ message: 'Username and password are required' });
//         }
      
//         try {
//           const user = await User.findOne({ username });
      
//           if (!user) {
//             return res.status(400).json({ message: 'Invalid credentials' });
//           }
      
//           const isMatch = await bcrypt.compare(password, user.password);
//           if (!isMatch) {
//             return res.status(400).json({ message: 'Invalid credentials' });
//           }
      
//           const token = jwt.sign(
//             { userId: user._id, username: user.username },
//             process.env.JWT_SECRET,
//             { expiresIn: '1h' }
//           );
      
//           res.cookie('token', token, {
//             httpOnly: true,
//             secure: true, 
//             maxAge: 3600000, 
//             sameSite: 'None', 
//           });
      
//           res.status(200).json({ token, user });
//         } catch (error) {
//           // console.error(error);
//           res.status(500).json({ message: 'Server Error' });
//         }
// }

// module.exports.logoutUser = async (req,res)=>{
//   res.cookie("token", "", {
//     httpOnly: true,
//     secure: true, 
//     sameSite: "None",
//     expires: new Date(0),
//   });
  
//   res.status(200).json({ message: 'Logged out successfully' });
// }

// module.exports.changePassword = async (req, res) => {
//   try {
//     const { currentPassword, newPassword } = req.body;
//     const userId = req.user.id;

//     // Fetch the user from the database
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Compare the current password with the hashed password in the database
//     const isMatch = await bcrypt.compare(currentPassword, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Current password is incorrect" });
//     }

//     // Hash the new password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(newPassword, salt);

//     // Update the user's password in the database
//     user.password = hashedPassword;
//     await user.save();

//     res.status(200).json({ message: "Password updated successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// module.exports.updateProfilePicture = async (req, res) => {
//   try {
//     const userId = req.user.id; // Get user ID from authMiddleware
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Ensure a file was uploaded
//     if (!req.file || !req.file.path) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     const profilePicture = req.file.path; // Get Cloudinary URL

//     // Update the user's profile picture in the database
//     user.profilePicture = profilePicture;
//     await user.save();

//     res.status(200).json({
//       message: "Profile picture updated successfully",
//       profilePicture: profilePicture, // Send updated profile URL to frontend
//     });

//   } catch (error) {
//     console.error("Error updating profile picture:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

const express = require('express');
const bcrypt = require('bcryptjs');
const { SignJWT, jwtVerify } = require('jose');
const User = require('../models/user.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const multer = require('multer');
const path = require('path');
const upload = require('../config/multer.js'); // Import Cloudinary Multer config
const nodemailer = require('nodemailer');
const dns = require('dns');

// Helper: get HMAC secret as a KeyLike (Buffer works for HMAC algorithms)
function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment');
  }
  return Buffer.from(process.env.JWT_SECRET);
}

module.exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  const profilePicture = req.file ? req.file.path : null; // Get Cloudinary URL

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this username or email' });
    }

    // Extract domain from email
    const emailDomain = email.split('@')[1];

    // Check if email domain has valid MX records (Mail Exchange)
    dns.resolveMx(emailDomain, async (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        return res.status(400).json({ message: "Email domain is invalid or doesn't accept emails" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        profilePicture,
      });

      await newUser.save();
      return res.status(200).json({ message: 'User successfully registered', newUser });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error' });
  }
};

module.exports.loginUser = async (req, res) => {
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

    // Create JWT using jose SignJWT
    const secret = getJwtSecret();

    const token = await new SignJWT({ userId: user._id.toString(), username: user.username })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(secret);

    // Set cookie (keep same cookie options as before)
    res.cookie('token', token, {
      httpOnly: true,
      secure: true, // set to true if using HTTPS (recommended in production)
      maxAge: 3600000, // 1 hour
      sameSite: 'None',
    });

    res.status(200).json({ token, user });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error' });
  }
};

module.exports.logoutUser = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    expires: new Date(0),
  });

  res.status(200).json({ message: 'Logged out successfully' });
};

module.exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Fetch the user from the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare the current password with the hashed password in the database
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password in the database
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports.updateProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authMiddleware
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure a file was uploaded
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const profilePicture = req.file.path; // Get Cloudinary URL

    // Update the user's profile picture in the database
    user.profilePicture = profilePicture;
    await user.save();

    res.status(200).json({
      message: 'Profile picture updated successfully',
      profilePicture: profilePicture, // Send updated profile URL to frontend
    });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Optional: helper to verify token using jose (if you want to use it here)
module.exports.verifyToken = async (token) => {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (err) {
    throw err;
  }
};
