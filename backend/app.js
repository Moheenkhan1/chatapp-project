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

dotenv.config();  
const app = express();

// Middleware and configurations
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173", // Adjust this to your front-end URL
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

// MongoDB connection

connectTodb();

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

global.onlineUsers = new Map();

io.on("connection",(socket)=>{
  global.chatSocket = socket;
  socket.on("add-user",(userId)=>{
    onlineUsers.set(userId,socket.id);
  })

  socket.on("send-msg",(data)=>{
    const sendUserSocket = onlineUsers.get(data.to);
    if(sendUserSocket){
      socket.to(sendUserSocket).emit("msg-receive",data.msg);
    }
  })
})