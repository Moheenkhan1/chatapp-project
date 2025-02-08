const Message = require('../models/messages.model.js');
const User = require('../models/user.js');
const jwt = require('jsonwebtoken'); 


module.exports.getContacts = async (req, res) => {
    try {
      const contacts = await User.find({ _id: { $ne: req.user._id } }); // Get all users except the current user
      res.status(200).json({ contacts });
    } catch (error) {
      res.status(500).send("Error fetching contacts");
    }
  };
  
  
module.exports.authHome = async (req, res) => {
    try {
      // Get token from cookies
      const token = req.cookies.token;

      console.log('token',token)
      
      if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
      }
  
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET is in .env

      console.log("decoded",decoded)
  
      // Find user by ID from decoded token
      const user = await User.findById(decoded.userId).select("-password"); // Exclude password for security

      console.log('authuser',user)
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Send user data
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  