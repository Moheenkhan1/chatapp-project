const { createServer } = require("http");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoutes = require("./routes/user.routes");
const homeRoutes = require("./routes/home.routes");
const messagesRoutes = require("./routes/messages.routes");
const aiRoutes = require("./routes/ai.routes.js")
const socket = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const Message = require("./models/messages.model");
const authMiddleware = require("./middleware/authMiddleware");
// const jwt = require("jsonwebtoken");

const connectTodb = require("./config/db");
const path = require("path");
const User = require('./models/user')

dotenv.config();  
const app = express();

// Middleware and configurations
// ---- robust CORS setup (put this near the top, before routes) ----
// const allowedOrigins = (process.env.FRONTEND_URI || '')
//   .split(',')
//   .map(s => s.trim())
//   .filter(Boolean);

// const corsOptions = {
  //   origin: (origin, callback) => {
    //     // allow requests with no origin (e.g. curl, Postman, mobile apps)
    //     if (!origin) return callback(null, true);
    //     if (allowedOrigins.includes(origin)) return callback(null, true);
    //     console.warn('Blocked CORS origin:', origin);
    //     return callback(new Error('Not allowed by CORS'), false);
    //   },
    //   credentials: true,
    //   methods: ['GET','POST','PUT','DELETE','OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
//   preflightContinue: false,
// }; 


app.set('trust proxy', 1);

app.use(cors({
  origin: `${process.env.FRONTEND_URI}`,
  credentials: true,
}));

app.options('*', cors());


// const isProd = process.env.APP_ENV === 'production';

// const prodOrigins = (process.env.FRONTEND_URI || '')
// .split(',')
// .map(o => o.trim())
// .filter(Boolean);

// const corsOptions = {
//   origin: (origin, callback) => {
//     // Allow non-browser clients (Postman, curl, server-to-server)
//     if (!origin) return callback(null, true);
    
//     // Development: allow ALL origins
//     if (!isProd) {
//       return callback(null, true);
//     }

//     // Production: allow only configured frontend(s)
//     if (prodOrigins.includes(origin)) {
//       return callback(null, true);
//     }
    
//     // Production: silently block others (NO errors, NO redirects)
//     return callback(null, false);
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// };




app.set('trust proxy', 1);

// // CORS MUST come first
// app.use(cors(corsOptions));
// app.options('*', cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
// MongoDB connection

connectTodb();

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/profilePic", express.static(path.join(__dirname, "profilePic")));



// Routes
app.use("/user", userRoutes);
app.use("/home", authMiddleware, homeRoutes);
app.use("/messages", authMiddleware, messagesRoutes);
app.use("/ai", authMiddleware, aiRoutes);


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

app.set("socketio", io);

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  // console.log(`User connected: ${socket.id}`);


  // Handle user going online
  socket.on("add-user", async (userId) => {
    if (!userId) return;

    onlineUsers.set(userId, socket.id);
    await User.findByIdAndUpdate(userId, { isOnline: true });

    // console.log(`User ${userId} is now online`);

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
      // console.log('Sent online users:', onlineUsersArray);
    } catch (error) {
      // console.error('Error fetching online users:', error);
      socket.emit('online-users', []);
    }
  });

  // Handle message sending
  socket.on("send-msg", async (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    const senderUser = await User.findById(data.from)
  
    if (sendUserSocket) {
      io.to(sendUserSocket).emit("msg-receive", {
        from: data.from,
        message: data.message,
        file: data.file,
        username: senderUser.username,
      });
    }
  
    // ✅ Get updated unread message count
    const unreadCount = await Message.countDocuments({
      sender: data.from,
      receiver: data.to,
      read: false,
    });
  
    // console.log(`📩 Updated Unread Count: ${unreadCount} for sender ${data.from}`);
  
    // ✅ Emit real-time update to ALL clients
    io.emit("update-unread-count", { senderId: data.from, count: unreadCount });
  
  });

  

  // Handle user disconnect
  socket.on("disconnect", async () => {
    const userId = [...onlineUsers.entries()].find(([_, id]) => id === socket.id)?.[0];

    if (userId) {
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { isOnline: false });

      // console.log(`User ${userId} went offline`);

      // ✅ Send real-time update to ALL connected clients
      io.emit("update-user-status", { userId, isOnline: false });
    }

    // console.log(`User disconnected: ${socket.id}`);
  });

});
