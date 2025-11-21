// const jwt = require("jsonwebtoken");
// const User = require("../models/user");

// const authMiddleware = async (req, res, next) => {
//   try {
//     const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

//     if (!token) {
//       return res.status(401).json({ message: "Access denied. No token provided" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.userId);

//     // console.log("authMiddleware",user)

//     if (!user) {
//       return res.status(401).json({ message: "User not found"});
//     }

//     req.user = user;
//     next();
//   } catch (err) {
//     return res.status(400).json({ message: "Invalid or expired token" });
//   }
// };

// module.exports = authMiddleware;


const { jwtVerify } = require('jose');
const User = require('../models/user');

// Helper to get secret key
function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return Buffer.from(process.env.JWT_SECRET);
}

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided' });
    }

    const secret = getJwtSecret();

    // Verify token using jose
    const { payload } = await jwtVerify(token, secret);

    const user = await User.findById(payload.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
