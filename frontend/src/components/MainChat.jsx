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

const MainChat = ({ selectedContact, currentUser, socket , setShowChat , showChat }) => {
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
        `${API_BASE_URL}/messages/addMessages`,
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
    console.log('sekk',selectedFile)
    setFile(selectedFile);

    console.log('bvuvhv',file)

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
      src: `${API_BASE_URL}${msg.message.fileUrl}`,
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
        `${API_BASE_URL}/messages/deleteMessage/${msgId}/${currentUser._id}`,
        { withCredentials: true } 
      );
      setChat((prev) => prev.filter((msg) => msg._id !== msgId));
    } catch (error) {
      console.error("Error deleting message:", error.response?.data || error.message);
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

  const handleRightClick = (e, messageId) => {
    e.preventDefault(); // Prevents the default context menu
    setSelectedMessage(messageId);
  };
  
  const handleDelete = (messageId) => {
    deleteMessage(messageId);
    setSelectedMessage(null);
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
  const handleEmojiClick = (emojiObject) => {
    setMessages((prev) => prev + emojiObject.emoji);
  };
  

  return (
    <div className={`flex flex-col flex-1 bg-white ${showChat ? "max-sm:flex max-md:flex max-lg-flex max-xl-flex  max-[768px]:flex max-[1024px]:flex max-[912px]:flex max-[853px]:flex" : "max-sm:hidden max-md:hidden max-lg-hidden max-xl-hidden max-[768px]:hidden max-[1024px]:hidden max-[912px]:hidden max-[853px]:hidden"}`}>
      {/* Chat Header with Profile Picture */}
      <div className="bg-[#385AC2] text-black p-4 border-b border-gray-700 flex items-center max-sm:h-[10%] max-md:h-[10%] max-lg:h-[10%] max-xl:h-[10%] max-sm:fixed  max-md:fixed max-lg:fixed max-xl:fixed max-sm:w-[100%] max-md:w-[100%] max-lg:w-[100%] max-xl:w-[100%]">
      <button className="max-sm:block max-md:block max-lg-block max-xl-block max-[768px]:block max-[1024px]:block max-[912px]:block max-[853px]:block  hidden text-white text-xl mr-3 max-sm:fixed max-md:fixed max-lg:fixed max-xl:fixed" onClick={() => setShowChat(false)}>
          <FiArrowLeft size={24} />
        </button>
        <div className="flex justify start gap-3 max-sm:ml-[1rem] max-md:ml-[1rem] max-lg:ml-[1rem] max-xl:ml-[1rem] max-sm:fixed max-md:fixed max-lg:fixed">
          <img
            className="w-[3.5rem] h-[3.5rem] rounded-full object-cover ml-6 max-sm:ml-4 max-md:ml-0 max-xl:ml-0 ring max-sm:h-[3rem] max-sm:w-[3rem] max-sm:mt-[-0.7rem]  max-md:mt-[-0.7rem]  max-lg:mt-[-0.7rem]  max-xl:mt-[-0.7rem] md:h-[3rem] md:w-[3rem] md:mt-0.9 md:ml-[1rem] max-lg:h-[3rem] max-lg:w-[3rem] max-sm:fixed max-md:fixed max-lg:fixed max-xl:fixed "
            src={selectedContact.profilePicture}
            alt="Profile"
          />
          <div className=" ml-4 max-md:ml-2 max-lg:ml-2 max-xl:ml-2" >

          <h2 className="text-[1.2rem] font-bold text-white max-sm:fixed max-sm:ml-[4rem] max-sm:mt-[-0.7rem] max-md:ml-[4rem] max-md:mt-[-0.7rem] max-lg:ml-[4rem] max-lg:mt-[-0.7rem] max-xl:ml-[4rem] max-xl:mt-[-0.7rem] max-md:fixed max-lg:fixed max-xl:fixed ">{selectedContact.username}</h2>
          <span
              className={`max-sm:ml-[4rem] max-md:ml-[4rem] max-lg:ml-[4rem] max-xl:ml-[4rem] 
                sm:mt-4 md:mt-6 lg:mt-8 xl:mt-10
                ${users.some((user) => user._id === selectedContact._id && user.isOnline)
                  ? "text-green-500"
                  : "text-red-500"
                }`}
            >
              {users.some((user) => user._id === selectedContact._id && user.isOnline)
                ? "Online"
                : "Offline"
              }
            </span>



          </div>
        </div>
        {/* <button className="text-cyan-400 hover:text-cyan-300">
          <FiPhone size={24} />
        </button> */}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-white text-black max-sm:mt-[5rem] max-md:mt-[6rem] max-lg:mt-[6rem] max-xl:mt-[6rem]">
        {chat.map((msg, index) => (
          <div
          key={index}
          className={`flex mb-2 ${msg.sender === currentUser._id ? "justify-end" : "justify-start"}`}
          onContextMenu={(e) => handleRightClick(e, msg._id)}
        >

            {msg.message.fileUrl !== null && msg.message.fileUrl && (
              <div className="mt-2 max-sm:w-[40%] max-md:w-[40%] max-lg:w-[40%] max-xl:w-[40%]  ">
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

      {/* Text Only Messages */}
      {msg.message?.text && !msg.message.fileUrl && (
        <div
          className={`p-3 rounded-lg max-w-xs ${
            msg.sender === currentUser._id ? "bg-[#4169E1] text-white" : "bg-gray-700 text-white"
          }`}
        >
          <p>{msg.message.text}</p>
        </div>
      )}


            

            {/* Delete button */}
            {msg.sender === currentUser._id && selectedMessage === msg._id && (
              <button
               className="text-red-500 ml-2 "
               onClick={() => handleDelete(msg._id)}
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
          <div className="p-3 bg-white border-t border-gray-700 flex items-center gap-2">
            <div className="flex items-center gap-2 w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex gap-2">
                  <div className="max-w-xs w-full">
                    {/* Centering the image in the preview */}
                    <div className="flex justify-center">
                      {/* Responsive size adjustments */}
                      <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
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
      <form onSubmit={sendChat} className="bg-[#E8E8E8] border-t-2 border-[#4169E1] p-4 flex items-center">
      <label
          htmlFor="file-input"
          className="cursor-pointer ml-2 text-[#4169E1] hover:text-[#4169E1]-300 pr-3"
        >
          <FiPaperclip size={23} />
        </label>
        <button
          type="button"
          className="text-xl mr-2 text-[#4169E1] hover:text-[#4169E1]-400"
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
          className="bg-white text-black w-full max-sm:w-[60%] p-3 rounded-md focus:outline-none"
        />
        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          id="file-input"
        />
        <button
          className="custom-class shadow-lg shadow-indigo-500/50 ml-3 w-[10%] max-sm:w-[20%]  p-[10px] rounded-[10px] text-[#fff] text-[1.2rem] bg-[royalblue] hover:bg-[#385AC2]  "
           type="submit"   
          >
            Send
        </button>
                
        
      </form>
    </div>
  );
};


export default MainChat;



