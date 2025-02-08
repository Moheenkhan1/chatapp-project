const { createServer } = require("http");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoutes = require("./routes/user.routes");
const homeRoutes = require("./routes/home.routes");
const messagesRoutes = require("./routes/messages.routes");
const socket = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const Message = require("./models/messages.model");
const authMiddleware = require("./middleware/authMiddleware");
const jwt = require("jsonwebtoken");
const connectTodb = require("./config/db");
const path = require("path");
const User = require('./models/user')

dotenv.config();  
const app = express();

// Middleware and configurations
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: `${process.env.FRONTEND_URI}`, // Adjust this to your front-end URL
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

// MongoDB connection

connectTodb();

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/profilePic", express.static(path.join(__dirname, "profilePic")));



// Routes
app.use("/user", userRoutes);
app.use("/home", authMiddleware, homeRoutes);
app.use("/messages", authMiddleware, messagesRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const io = socket(server, {
  cors: {
    origin: `${process.env.FRONTEND_URI}`,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);


  // Handle user going online
  socket.on("add-user", async (userId) => {
    if (!userId) return;

    onlineUsers.set(userId, socket.id);
    await User.findByIdAndUpdate(userId, { isOnline: true });

    console.log(`User ${userId} is now online`);

    // ✅ Send real-time update to ALL connected clients
    io.emit("update-user-status", { userId, isOnline: true });
  });


  socket.on('get-online-users', async () => {
    try {
      const onlineUserIds = Array.from(onlineUsers.keys());
      const onlineUserDetails = await User.find(
        { _id: { $in: onlineUserIds } },
        '_id username isOnline'
      );

      const onlineUsersArray = onlineUserDetails.map(user => ({
        _id: user._id,
        username: user.username,
        isOnline: true
      }));

      socket.emit('online-users', onlineUsersArray);
      console.log('Sent online users:', onlineUsersArray);
    } catch (error) {
      console.error('Error fetching online users:', error);
      socket.emit('online-users', []);
    }
  });

  // Handle message sending
  socket.on("send-msg", async (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      io.to(sendUserSocket).emit("msg-receive", {
        from: data.from,
        message: data.message,
        file: data.file,
      });
    }
  });

  // Handle user disconnect
  socket.on("disconnect", async () => {
    const userId = [...onlineUsers.entries()].find(([_, id]) => id === socket.id)?.[0];

    if (userId) {
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { isOnline: false });

      console.log(`User ${userId} went offline`);

      // ✅ Send real-time update to ALL connected clients
      io.emit("update-user-status", { userId, isOnline: false });
    }

    console.log(`User disconnected: ${socket.id}`);
  });

});
