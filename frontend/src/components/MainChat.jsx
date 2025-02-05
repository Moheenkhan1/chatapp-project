import React, { useState, useEffect, useRef } from "react";
import { FiPaperclip, FiPhone } from "react-icons/fi";
import axios from "axios";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import StarBorder from "../components/StarBorderButton";

const MainChat = ({ selectedContact, currentUser, socket }) => {
  const scrollRef = useRef();
  const [messages, setMessages] = useState("");
  const [chat, setChat] = useState([]);
  const [incomingMsg, setIncomingMsg] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  // Lightbox States
  const [lightboxMedia, setLightboxMedia] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedContact || !currentUser) return;

      try {
        const response = await axios.get(
          `http://localhost:5000/messages/getMessages/${currentUser._id}/${selectedContact._id}`,
          { withCredentials: true }
        );
        setChat(response.data);
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

  useEffect(() => {
    incomingMsg && setChat((prev) => [...prev, incomingMsg]);
  }, [incomingMsg]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
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
  const handleMediaClick = (src) => {
    const media = chat
      .filter((msg) => msg.message.fileType === "image" || msg.message.fileType === "video")
      .map((msg) => ({
        src: `http://localhost:5000${msg.message.fileUrl}`,
        type: msg.message.fileType,
      }));

    const index = media.findIndex((item) => item.src === src);

    setLightboxMedia(media);
    setCurrentMediaIndex(index);
    setIsLightboxOpen(true);
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

  return (
    <div className="flex flex-col flex-1 bg-black">
      {/* Chat Header */}
      <div className="bg-black text-white p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-bold text-cyan-400">{selectedContact.username}</h2>
        <button className="text-cyan-400 hover:text-cyan-300">
          <FiPhone size={24} />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-black text-white">
        {chat.map((msg, index) => (
          <div key={index} className={`flex mb-2 ${msg.sender === currentUser._id ? "justify-end" : "justify-start"}`}>
            {msg.message.text && (
              <div className={`p-3 rounded-lg max-w-xs ${msg.sender === currentUser._id ? "bg-cyan-400 text-black" : "bg-gray-700 text-white"}`}>
                <p>{msg.message.text}</p>
              </div>
            )}

            {msg.message.fileUrl && (
              <div className="mt-2">
                {msg.message.fileType === "image" && (
                  <img
                    className="max-w-xs rounded-lg cursor-pointer"
                    src={`http://localhost:5000${msg.message.fileUrl}`}
                    alt="Shared"
                    onClick={() => handleMediaClick(`http://localhost:5000${msg.message.fileUrl}`)}
                  />
                )}

                {msg.message.fileType === "video" && (
                  <video
                    className="max-w-xs rounded-lg cursor-pointer"
                    src={`http://localhost:5000${msg.message.fileUrl}`}
                    controls
                    onClick={() => handleMediaClick(`http://localhost:5000${msg.message.fileUrl}`)}
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
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <Lightbox
          open={isLightboxOpen}
          close={() => setIsLightboxOpen(false)}
          slides={lightboxMedia}
          index={currentMediaIndex}
          plugins={[Zoom]}
          render={{
            slide: ({ slide }) =>
              slide.type === "video" ? (
                <video src={slide.src} controls className="w-full" />
              ) : (
                <img src={slide.src} alt="" className="w-full" />
              ),
          }}
        />
      )}

      {/* Message Input Area */}
      <div className="bg-black p-3 flex flex-col gap-3">
        {/* File Preview Section */}
        {filePreview && (
          <div className="relative p-2 bg-gray-800 rounded-lg flex justify-center items-center mx-auto">
            <div className="max-w-xs">{filePreview}</div>
            <button
              className="text-red-500 absolute top-2 right-2"
              onClick={removeFile}
            >
              ✖
            </button>
          </div>
        )}

        {/* Input & Send Section */}
        <div className="flex items-center gap-3 mt-2">
          {/* File Attachment */}
          <label className="cursor-pointer text-cyan-400">
            <FiPaperclip size={24} />
            <input type="file" className="hidden" onChange={handleFileChange} />
          </label>

          {/* Text Input */}
          <input
            type="text"
            className="flex-1 bg-gray-800 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Type a message..."
            value={messages}
            onChange={(e) => setMessages(e.target.value)}
            style={{ width: "80%" }}
          />

          {/* Send Button */}
          <StarBorder
            as="button"
            className="custom-class ml-2 w-[15%]"
            color="cyan"
            speed="5s"
            onClick={sendChat}
          >
            Send
          </StarBorder>
        </div>
      </div>
    </div>
  );
};

export default MainChat;
