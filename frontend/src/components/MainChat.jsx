import React, { useState, useEffect, useRef } from "react";
import { FiPaperclip, FiPhone, FiX } from "react-icons/fi";
import axios from "axios";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import StarBorder from "../components/StarBorderButton";
import { BsEmojiSmile } from "react-icons/bs";  
import EmojiPicker from "emoji-picker-react";
import { useOnlineUsers } from '../Contexts/OnlineUsersContext';
import { MdCancel } from "react-icons/md";

const MainChat = ({ selectedContact, currentUser, socket }) => {
  const scrollRef = useRef();
  const [messages, setMessages] = useState("");
  const [chat, setChat] = useState([]);
  const [incomingMsg, setIncomingMsg] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const [users, setUsers] = useState([]);
  const { setOnlineUsers } = useOnlineUsers();

  // Lightbox States
  const [lightboxMedia, setLightboxMedia] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false); 
  


  // Fetch messages & mark as read
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedContact || !currentUser) return;

      try {
        // Fetch messages
        const response = await axios.get(
          `http://localhost:5000/messages/getMessages/${currentUser._id}/${selectedContact._id}`,
          { withCredentials: true }
        );
        setChat(response.data);

        // Mark messages as read
  
          // await axios.post(
          //   "http://localhost:5000/api/mark-messages-read",
          //   { senderId: selectedContact._id },
          //   { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          // );


      } catch (error) {
        console.error("Error fetching messages:", error.response?.data || error.message);
      }
    };

    fetchMessages();
  }, [currentUser, selectedContact]);

  // Handle sending messages
  const sendChat = async (e) => {
    e.preventDefault();
    if (!messages.trim() && !file) return;

    const formData = new FormData();
    formData.append("from", currentUser._id);
    formData.append("to", selectedContact._id);
    formData.append("message", messages);
    if (file) formData.append("file", file);

    try {
      socket.current.emit("send-msg", {
        from: currentUser._id,
        to: selectedContact._id,
        message: messages,
        file,
      });

      const response = await axios.post(
        "http://localhost:5000/messages/addMessages",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      setMessages("");
      setFile(null);
      setFilePreview(null);
      setChat((prevChat) => [...prevChat, response.data]);
    } catch (error) {
      console.error("Error sending message:", error.response?.data || error.message);
    }
  };

  // Handle incoming messages
  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-receive", (msg) => {
        setIncomingMsg({ fromSelf: false, message: msg });
      });
    }
  }, []);


  // online users
  useEffect(() => {
    if (!socket.current || !currentUser?._id) {
      console.log("Socket or user not available");
      return;
    }

    // Get stored online users from localStorage
    const storedUsers = JSON.parse(localStorage.getItem('onlineUsers') || '[]');
    
    // Update local state only
    setUsers(storedUsers);

    console.log("Initializing online status for user:", currentUser._id);

    // Request current online users from server
    socket.current.emit('get-online-users');

    const handleStatusUpdate = (data) => {
      console.log("Received status update:", data);
      
      if (!data || !data.userId) {
        console.error("Received invalid data in handleStatusUpdate:", data);
        return;
      }

      setUsers((prevUsers) => {
        const updatedUsers = prevUsers.filter(user => user._id !== data.userId);
        const newUsers = [...updatedUsers, { _id: data.userId, isOnline: data.isOnline }];
        // Store in localStorage
        localStorage.setItem('onlineUsers', JSON.stringify(newUsers));
        return newUsers;
      });
    };

    const handleOnlineUsers = (onlineUsers) => {
      console.log("Received online users list:", onlineUsers);
      setUsers(onlineUsers);
      localStorage.setItem('onlineUsers', JSON.stringify(onlineUsers));
    };

    // Set up socket listeners
    socket.current.on("update-user-status", handleStatusUpdate);
    socket.current.on("online-users", handleOnlineUsers);

    // Emit user online status
    socket.current.emit("user-online", currentUser._id);

    // Cleanup function
    return () => {
      if (socket.current && currentUser?._id) {
        console.log("Cleaning up socket listeners for user:", currentUser._id);
        socket.current.off("update-user-status", handleStatusUpdate);
        socket.current.off("online-users", handleOnlineUsers);
        socket.current.emit("user-offline", currentUser._id);
      }
    };
  }, [currentUser?._id, socket.current]);

  // Add a separate useEffect to update the context when users state changes
  useEffect(() => {
    setOnlineUsers(users);
  }, [users, setOnlineUsers]);

  useEffect(() => {
    incomingMsg && setChat((prev) => [...prev, incomingMsg]);
    console.log('users:',users)
  }, [incomingMsg]);

  // useEffect(() => {
  //   scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [chat]);
  useEffect(() => {
    const chatContainer = scrollRef.current?.parentElement;
    
    if (!chatContainer) return;
  
    // Check if the user is near the bottom
    const isAtBottom = chatContainer.scrollHeight - chatContainer.scrollTop <= chatContainer.clientHeight + 50;
  
    if (isAtBottom) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat]);
  
// Handle file selection 
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const fileType = selectedFile.type.split("/")[0];
      const fileUrl = URL.createObjectURL(selectedFile);

      if (fileType === "image") {
        setFilePreview(<img src={fileUrl} alt="Selected" className="max-w-xs rounded-lg" />);
      } else if (fileType === "video") {
        setFilePreview(<video controls className="max-w-xs rounded-lg" src={fileUrl} />);
      } else if (fileType === "audio") {
        setFilePreview(<audio controls className="max-w-xs rounded-lg" src={fileUrl} />);
      } else {
        setFilePreview(null);
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
  };

 // Handle Image/Video Click for Lightbox
 const handleMediaClick = (src, type) => {
  const media = chat
    .filter((msg) => msg.message.fileType === "image" )
    .map((msg) => ({
      src: `http://localhost:5000${msg.message.fileUrl}`,
      type: msg.message.fileType,
    }));

  const index = media.findIndex((item) => item.src === src);
  setLightboxMedia(media);
  setCurrentMediaIndex(index);
  setIsLightboxOpen(true);
};
  
  

  const deleteMessage = async (msgId) => {
    try {
      await axios.delete(
        `http://localhost:5000/messages/deleteMessage/${msgId}/${currentUser._id}`,
        { withCredentials: true } 
      );
      setChat((prev) => prev.filter((msg) => msg._id !== msgId));
    } catch (error) {
      console.error("Error deleting message:", error.response?.data || error.message);
    }
  };
  
  

  if (!selectedContact || !currentUser) {
    return (
      <div className="flex flex-col flex-1 bg-black text-white items-center justify-center">
        <h2 className="text-xl font-bold text-cyan-400 text-center">
          PLEASE SELECT A CONTACT TO START CHATTING
        </h2>
      </div>
    );
  }
  //emoji
  const handleEmojiClick = (emojiObject) => {
    setMessages((prev) => prev + emojiObject.emoji);
  };
  

  return (
    <div className="flex flex-col flex-1 bg-black">
      {/* Chat Header with Profile Picture */}
      <div className="bg-black text-white p-4 border-b border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img
            className="w-10 h-10 rounded-full object-cover"
            src={`http://localhost:5000${selectedContact.avatar.fileUrl}`}
            alt="Profile"
          />
          <h2 className="text-lg font-bold text-cyan-400">{selectedContact.username}</h2>
          <span
            className={
              users.some((user) => user._id === selectedContact._id && user.isOnline)
                ? "text-green-500"
                : "text-red-500"
            }
          >
            {users.some((user) => user._id === selectedContact._id && user.isOnline)
              ? "Online"
              : "Offline"}
          </span>
        </div>
        <button className="text-cyan-400 hover:text-cyan-300">
          <FiPhone size={24} />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-black text-white">
        {chat.map((msg, index) => (
          <div
            key={index}
            className={`flex mb-2 ${msg.sender === currentUser._id ? "justify-end" : "justify-start"}`}
          >
            {msg.message?.text && (
              <div
                className={`p-3 rounded-lg max-w-xs ${
                  msg.sender === currentUser._id ? "bg-cyan-400 text-black" : "bg-gray-700 text-white"
                }`}
              >
                <p>{msg.message.text}</p>
              </div>
            )}

            {msg.message.fileUrl !== null && msg.message.fileUrl && (
              <div className="mt-2">
              {msg.message.fileType === "image" && (
  <img
    className="max-w-xs rounded-lg cursor-pointer bg-cyan-400/20 p-1 shadow-md block"
    src={`http://localhost:5000${msg.message.fileUrl}`}
    alt="Shared"
    onClick={() => handleMediaClick(`http://localhost:5000${msg.message.fileUrl}`, 'image')}
  />
)}
{/* Video File */}
{msg.message.fileType === "video" && (
  <video
    className="max-w-xs rounded-lg cursor-pointer bg-cyan-400/20 p-1 shadow-md block"
    src={`http://localhost:5000${msg.message.fileUrl}`}
    controls
    onClick={() => handleMediaClick(`http://localhost:5000${msg.message.fileUrl}`, 'video')}
  />
)}

                {msg.message.fileType === "audio" && (
                  <audio
                    className="max-w-xs rounded-lg cursor-pointer"
                    controls
                    src={`http://localhost:5000${msg.message.fileUrl}`}
                  />
                )}
              </div>
            )}

            {/* Delete button */}
            {msg.sender === currentUser._id && (
              <button
                className="text-red-500 ml-2"
                onClick={() => deleteMessage(msg._id)}
              >
                Delete
              </button>
            )}
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      <Lightbox
  open={isLightboxOpen}
  close={() => setIsLightboxOpen(false)}
  slides={lightboxMedia.map((media) => ({
    src: media.src,
    type: media.type === "video" ? "video" : "image", // Ensure that type is passed as either 'image' or 'video'
  }))}
  currentIndex={currentMediaIndex}
  plugins={[Zoom]}
/>


        {/* File Preview Section */}
        {filePreview && (
        <div className="p-3 bg-black border-t border-gray-700 flex items-center gap-2">
          <div className="flex items-center gap-2 w-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex gap-2">
                <div className="max-w-xs">
                  {/* Centering the image in the preview */}
                  <div className="flex justify-center">
                    {filePreview}
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="text-red-500 text-xl"
                >
                  <MdCancel />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={sendChat} className="bg-black p-4 flex items-center">
      <label
          htmlFor="file-input"
          className="cursor-pointer ml-2 text-cyan-400 hover:text-cyan-300 pr-3"
        >
          <FiPaperclip size={23} />
        </label>
        <button
          type="button"
          className="text-xl mr-2 text-gray-400 hover:text-cyan-400"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <BsEmojiSmile />
        </button>
        {showEmojiPicker && (
          <div className="absolute bottom-20 ">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
        <input
          type="text"
          value={messages}
          onChange={(e) => setMessages(e.target.value)}
          placeholder="Type a message"
          className="bg-gray-700 text-white w-full p-3 rounded-md focus:outline-none"
        />
        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          id="file-input"
        />
        <StarBorder
          as="button"
          className="custom-class ml-[1.2rem] w-[15%]  text-black px-4 py-2 rounded-md"
          color="cyan"
          speed="5s"
          type="submit"
          >
          Send
          </StarBorder>
                
        
      </form>
    </div>
  );
};


export default MainChat;



