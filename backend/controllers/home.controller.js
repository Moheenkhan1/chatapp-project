const User = require('../models/user.js');

module.exports.getContacts = async (req, res) => {
    try {
      const contacts = await User.find({ _id: { $ne: req.user._id } }); // Get all users except the current user
      res.status(200).json({ contacts });
    } catch (error) {
      res.status(500).send("Error fetching contacts");
    }
  };
  