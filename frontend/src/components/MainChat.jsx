import React, { useState, useEffect, useRef } from "react";
import { FiPaperclip, FiPhone, FiX } from "react-icons/fi";
import axios from "axios";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import { BsEmojiSmile } from "react-icons/bs";  
import EmojiPicker from "emoji-picker-react";
import { useOnlineUsers } from '../Contexts/OnlineUsersContext';
import { MdCancel } from "react-icons/md";
import { FiArrowLeft } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const MainChat = ({ selectedContact, currentUser, socket , setShowChat , showChat, unreadCounts , setUnreadCounts ,selectedContactId,setSelectedContactId }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Access env variable

  const scrollRef = useRef();
  const [messages, setMessages] = useState("");
  const [chat, setChat] = useState([]);
  const [incomingMsg, setIncomingMsg] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const [users, setUsers] = useState([]);
  const { setOnlineUsers } = useOnlineUsers();

  // Lightbox States
  const [lightboxMedia, setLightboxMedia] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false); 

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [reactions, setReactions] = useState({});



  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport.height < window.innerHeight) {
        setIsKeyboardOpen(true);
      } else {
        setIsKeyboardOpen(false);
      }
    };
  
    window.visualViewport.addEventListener("resize", handleResize);
    window.visualViewport.addEventListener("scroll", handleResize);
  
    return () => {
      window.visualViewport.removeEventListener("resize", handleResize);
      window.visualViewport.removeEventListener("scroll", handleResize);
    };
  }, []);


  
  


  // Fetch messages & mark as read
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedContact || !currentUser) return;

      try {
        // Fetch messages
        const response = await axios.get(
          `${API_BASE_URL}/messages/getMessages/${currentUser._id}/${selectedContact._id}`,
          { withCredentials: true }
        );
        setChat(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error.response?.data || error.message);
      }
    };

    fetchMessages();
  }, [currentUser, selectedContact,chat]);

  useEffect(() => {
    console.log("✅ Updated File State:", file); // Now it will show the correct value
  }, [file]);
  
  const markMessagesAsRead = async (contactId) => {
    if (!contactId) return;
  
    console.log("Marking messages as read for: ", contactId); // ✅ Debug Log
  
    try {
      const response = await axios.post(
        `${API_BASE_URL}/messages/mark-as-read`,
        { senderId: contactId },
        { withCredentials: true }
      );
  
      console.log("✅ Server Response for Marking Read:", response.data);
  
      // ✅ Update unread count in state
      if (setUnreadCounts) {
        setUnreadCounts((prev) => ({ ...prev, [contactId]: 0 }));
      }
  
      // ✅ Emit real-time update to all clients
      if (socket.current) {
        socket.current.emit("update-unread-count", { senderId: contactId, count: 0 });
      }
  
    } catch (error) {
      console.error(" Error marking messages as read:", error);
    }
  };
  

  useEffect(() => {
    if (selectedContact && currentUser) {
      console.log("🔹 Checking unread messages for", selectedContact.username);
      markMessagesAsRead(selectedContact._id);
    }
  }, [chat]); // ✅ Runs every time a new message is received
  
  
  
  // Handle sending messages
  const sendChat = async (e) => {
    e.preventDefault();
    if (!messages.trim() && !file) return;
  
    const formData = new FormData();
    formData.append("from", currentUser._id);
    formData.append("to", selectedContact._id);
    formData.append("message", messages);
    if (file) {
      formData.append("file", file); // ✅ Ensure file is properly attached
    }
  
    try {
      const response = await axios.post(
        `${API_BASE_URL}/messages/addMessages`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }, // ✅ Required for file uploads
          withCredentials: true,
        }
      );
  
      // ✅ Send file metadata via Socket.io
      socket.current.emit("send-msg", {
        from: currentUser._id,
        to: selectedContact._id,
        message: messages,
        fileUrl: response.data.message.fileUrl, // ✅ Ensure correct file URL
        fileType: response.data.message.fileType,
      });
      
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
        setChat((prevChat) => [...prevChat, msg]);
      });
    }
    return () => {
      if (socket.current) {
        socket.current.off("msg-receive");
      }
    };
  }, [socket, selectedContact]);



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

  const handleMediaClick = (src) => {
    const media = chat
      .filter((msg) => msg.message.fileType === "image" || msg.message.fileType === "video")
      .map((msg) => ({
        src: msg.message.fileUrl,
        type: msg.message.fileType,
      }));
  
    // Find correct index
    const index = media.findIndex((item) => item.src === src);
  
    if (index === -1) {
      console.error("Media not found:", src);
      return;
    } 
    setLightboxMedia([...media]);
    setCurrentMediaIndex(index);
    setIsLightboxOpen(true);
  };
  
  
  
  

  const deleteMessage = async (msgId) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/messages/deleteMessage/${msgId}/${currentUser._id}`,
        { withCredentials: true } 
      );
      toast.success("Message deleted successfully ", { position: "top-center", autoClose: 3000, });
      setChat((prev) => prev.filter((msg) => msg._id !== msgId));
    } catch (error) {
      console.error("Error deleting message:", error.response?.data || error.message);
      toast.error("Failed to copy message.", { position: "top-center", autoClose: 3000 });
    }
  };

  // Click outside to hide delete button
  useEffect(() => {
    const handleClickOutside = () => {
    setSelectedMessage(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleRightClick = (e, messageId, message) => {
    e.preventDefault();
    setSelectedMessage(messageId); // Set the selected message
    setForwardingMessage(message); // Set the message being forwarded
  };
  
  const handleDelete = (messageId) => {
    deleteMessage(messageId);
    setSelectedMessage(null);
  };

   // Copy 
   const copyMessageToClipboard = (messageText) => {
    navigator.clipboard.writeText(messageText).then(() => {
      toast.success("Message copied to clipboard!", { position: "top-center", autoClose: 3000 });
    }).catch((error) => {
      console.error("Error copying message:", error);
      toast.error("Failed to copy message.", { position: "top-center", autoClose: 3000 });
    });
  };
  
  

  if (!selectedContact || !currentUser) {
    return (
      <div className={`flex flex-col flex-1 bg-white text-black items-center justify-center ${showChat ? "max-sm:flex max-md:flex max-lg-flex max-xl-flex  max-[768px]:flex max-[1024px]:flex max-[912px]:flex max-[853px]:flex" : "max-sm:hidden max-md:hidden max-lg-hidden max-xl-hidden max-[768px]:hidden max-[1024px]:hidden max-[912px]:hidden max-[853px]:hidden"} `}>
        <h2 className="text-xl font-bold text-[#385AC2]  text-center">
          PLEASE SELECT A CONTACT TO START CHATTING
        </h2>
      </div>
    );
  }
  //emoji
   const handleEmojiSelect = (emoji, messageId) => {
    setReactions((prev) => ({
      ...prev,
      [messageId]: prev[messageId] === emoji ? null : emoji, // Toggle emoji selection
    }));
    setSelectedMessage(null); // Hide menu after selecting an emoji
  };


  const handleEmojiClick = (emojiObject) => {
    setMessages((prev) => prev + emojiObject.emoji);
  };

  const handleEmojiClickReaction = (emoji) => {
    setSelectedEmoji(emoji); // Set selected emoji
    handleEmojiSelect(emoji, selectedMessage); // Update reaction
  };

  const handleEmojiPickerClose = () => {
    setShowEmojiPicker(false); // Close emoji picker when clicking outside
  };
  
  

  return (
    <div className={`flex flex-col flex-1 bg-white ${showChat ? "max-sm:flex max-md:flex max-lg-flex max-xl-flex  max-[768px]:flex max-[1024px]:flex max-[912px]:flex max-[853px]:flex" : "max-sm:hidden max-md:hidden max-lg-hidden max-xl-hidden max-[768px]:hidden max-[1024px]:hidden max-[912px]:hidden max-[853px]:hidden"}`}>
      {/* Chat Header with Profile Picture */}
      
      <div className="bg-[#385AC2] text-black p-4 border-b border-gray-700 flex items-center max-sm:h-[10%] max-md:h-[10%] max-lg:h-[8%] max-xl:h-[10%] max-sm:fixed max-md:fixed max-lg:fixed max-xl:fixed max-sm:w-[100%] max-md:w-[100%] max-lg:w-[100%] max-xl:w-[100%]">
  <button
    className="max-sm:block max-md:block max-lg-block max-xl-block max-[768px]:block max-[1024px]:block max-[912px]:block max-[853px]:block hidden text-white text-xl mr-3 max-sm:fixed max-md:fixed max-lg:fixed max-xl:fixed md:left-0"
    onClick={() => setShowChat(false)}
  >
    <FiArrowLeft size={24} />
  </button>
  <div className="flex justify-start gap-3 max-sm:ml-[2rem] max-md:ml-[1rem] max-lg:ml-[1rem] max-xl:ml-[1rem] max-sm:fixed max-md:fixed max-lg:fixed">
    <div className="relative w-[3.5rem] h-[3.5rem] max-sm:w-[3rem] max-sm:h-[3rem]">
      {/* Profile Picture */}
      <img
        className="w-full h-full rounded-full object-cover ring"
        src={selectedContact.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
        alt="Profile"
      />
      {/* Online/Offline Dot */}
      <span
        className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white max-sm:w-3 max-sm:h-3
          ${users.some((user) => user._id === selectedContact._id && user.isOnline) 
            ? "bg-green-500" 
            : "bg-red-500"
          }`}
      ></span>
    </div>
    <div className="flex gap-4 ml-4 max-md:ml-2 max-lg:ml-2 max-xl:ml-2">
      <h2 className="text-[1.2rem] font-bold text-white">{selectedContact.username}</h2>
    </div>
  </div>
</div>



      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-scroll bg-white text-black max-sm:mt-[5.5rem]  mb-[4rem] max-sm:mb-[5rem] max-md:mt-[6rem] max-md:mb-[5rem] max-lg:mt-[6rem] max-lg:mb-[6rem] max-xl:mt-[8rem] max-xl:mb-[6rem]">
        {chat.map((msg, index) => (
          <div
          key={index}
          className={`flex mb-2 ${msg.sender === currentUser._id ? "justify-end" : "justify-start"}`}
          onContextMenu={(e) => handleRightClick(e, msg._id)}
        >

            {msg.message.fileUrl !== null && msg.message.fileUrl && (
              <div className="mt-2 max-sm:w-[40%] max-md:w-[40%] max-lg:w-[40%] max-xl:w-[40%]">
               <div
            className={`rounded-lg p-0.5 bg-[#4169E1] shadow-md flex flex-col items-center`} 
          >
            {/* Image File */}
            {msg.message.fileType === "image" && (
              <img
                className="max-w-xs max-sm:w-full max-md:w-full max-lg:w-full max-xl:w-full rounded-lg cursor-pointer"
                src={msg.message.fileUrl}
                alt="Shared"
                onClick={() => handleMediaClick(msg.message.fileUrl, "image")}
              />
            )}

            {/* Video File */}
            {msg.message.fileType === "video" && (
              <video
                className="max-w-xs max-sm:w-full max-md:w-full max-lg:w-full max-xl:w-full rounded-lg cursor-pointer"
                src={msg.message.fileUrl}
                controls
                onClick={() => handleMediaClick(msg.message.fileUrl, "video")}
              />
            )}

            {/* Audio File */}
            {msg.message.fileType === "audio" && (
              <audio
                className="max-w-xs rounded-lg cursor-pointer"
                controls
                src={msg.message.fileUrl}
              />
            )}

            {/* Text Below Media */}
            {msg.message?.text && <p className="mt-1 mb-1 text-white">{msg.message.text}</p>} {/* Text is now below the media, with white text on a blue background */}
          </div>
        </div>
      )}

      {/* Text Messages */}
      {msg.message?.text && !msg.message.fileUrl && (
            <div className={`relative p-3 rounded-lg max-w-xs ${msg.sender === currentUser._id ? "bg-[#4169E1] text-white" : "bg-gray-700 text-white"}`}>
              <p>{msg.message.text}</p>
            </div>
          )}

                  {/* Right-Click Menu (Delete & Emoji Reactions) */}
        {selectedMessage === msg._id && (
          <div className="absolute top-[] flex items-center space-x-2 bg-white shadow-md p-2 rounded-lg">
           
            {/* Emoji Reaction Options */}
            <div className="flex space-x-2">
              {["👍", "😂", "❤️", "🔥", "😮"].map((emoji) => (
                <button key={emoji} className="text-xl" onClick={() => handleEmojiSelect(emoji, msg._id)}>
                  {emoji}
                </button>
              ))}
              
            </div>


             {/* Copy Button */}
             <button
                className="text-blue-500 ml-2"
                onClick={() => copyMessageToClipboard(msg.message.text)}
              >
                Copy
              </button>
              
             {/* Show Delete Button only for sender */}
            {msg.sender === currentUser._id && (
              <button className="text-red-500 ml-2" onClick={() => deleteMessage(msg._id)}>
                Delete
              </button>
            )}
      
          </div>
        )}
          {/* Display Reaction at Bottom-Left */}
          {reactions[msg._id] && (
            <span className="relative bottom-[-5px] left-2 text-xl">{reactions[msg._id]}</span>
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
          type: media.type === "video" ? "video" : "image",
        }))}
        index={currentMediaIndex} // ✅ Ensure Lightbox starts at the correct image
        on={{
          view: ({ index }) => {
            setCurrentMediaIndex(index); // ✅ Updates current index properly
          }
        }}
        plugins={[Zoom]}
      />



        {/* File Preview Section */}
                {filePreview && (
          <div className="p-3 bg-white border-t border-gray-700 flex items-center gap-2">
            <div className="flex items-center gap-2 w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex gap-2">
                  <div className="max-w-xs w-full">
                    {/* Centering the image in the preview */}
                    <div className="flex justify-center">
                      {/* Responsive size adjustments */}
                      <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mb-[5rem] max-lg:mb-[7rem] max-xl:mb-[5rem]">
                        {filePreview}
                      </div>
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
      {/* <form onSubmit={sendChat} className="bg-[#E8E8E8] border-t-2 border-[#4169E1] p-4 flex items-center max-sm:fixed max-sm:bottom-0 max-sm:w-[100%] max-md:fixed max-md:bottom-0 max-md:w-[100%] max-lg:fixed max-lg:bottom-0 max-lg:w-[100%] max-xl:fixed max-xl:bottom-0 max-xl:w-[100%] max-sm:h-[10%] max-md:h-[10%] max-lg:h-[8%] max-xl:h-[10%] "> */}
      <form
  onSubmit={sendChat}
  className={`bg-[#E8E8E8] border-t-2 border-[#4169E1] p-4 flex items-center fixed bottom-0 w-full h-[10vh] transition-all duration-300 `}
  style={{ bottom: "env(safe-area-inset-bottom)" }}
>


      <label
          htmlFor="file-input"
          className="cursor-pointer ml-2 text-[#4169E1] hover:text-[#4169E1]-300 pr-3 max-sm:fixed max-sm:left-2 max-md:fixed max-md:left-2 max-lg:fixed max-lg:left-2 max-xl:fixed max-xl:left-2"
        >
          <FiPaperclip size={23} />
        </label>
        <button
          type="button"
          className="text-xl mr-2 text-[#4169E1] hover:text-[#4169E1]-400 max-sm:fixed max-sm:ml-[1.6rem] max-md:fixed max-md:ml-[1.6rem] max-lg:fixed max-sm:lg-[1.6rem] max-xl:fixed max-xl:ml-[1.6rem]"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <BsEmojiSmile />
        </button>
        {showEmojiPicker && (
          <div className="absolute bottom-20 ">
            <EmojiPicker 
            onEmojiClick={handleEmojiClick}
            />
          </div>
        )}
        <input
          type="text"
          value={messages}
          onChange={(e) => setMessages(e.target.value)}
          placeholder="Type a message"
          className="bg-white text-black w-[60%] max-sm:w-[60%] p-3 rounded-md focus:outline-none max-sm:fixed max-sm:ml-[3.3rem] max-md:fixed max-md:ml-[3.3rem] max-lg:fixed max-lg:ml-[3.3rem] max-xl:fixed max-xl:ml-[3.3rem] max-md:w-[80%] max-lg:w-[80%] max-xl:w-[80%]"
        />
        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          id="file-input"
        />
        <button
          className="custom-class shadow-lg shadow-indigo-500/50 ml-3 w-[10%] max-sm:w-[20%]  p-[10px] rounded-[10px] text-[#fff] text-[1.2rem] bg-[royalblue] hover:bg-[#385AC2] max-sm:fixed max-sm:ml-[17.6rem] max-md:fixed max-md:ml-[17.6rem] max-lg:fixed max-lg:right-0   max-xl:fixed max-xl:right-10"
           type="submit"   
          >
            Send
        </button>
                
        
      </form>
    </div>
  );
};


export default MainChat;



