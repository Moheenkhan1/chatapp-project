// messages.routes.js (Backend Routes)
const express = require("express");
const { getMessages, addMessage, deleteMessage } = require("../controllers/message.controller");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const {uploadChatFile} = require("../config/multer");

// Configure Multer Storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage: storage });

const router = express.Router();

// Route for fetching messages between the sender and receiver
router.get("/getMessages/:sender/:receiver", authMiddleware, getMessages);

// Route for adding a new message
router.post("/addMessages", authMiddleware,uploadChatFile.single('file'), addMessage);

router.delete('/deleteMessage/:messageId/:userId', authMiddleware,  deleteMessage);


module.exports = router;
