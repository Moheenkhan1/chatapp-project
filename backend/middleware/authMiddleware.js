const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    // console.log("authMiddleware",user)

    if (!user) {
      return res.status(401).json({ message: "User not found"});
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
