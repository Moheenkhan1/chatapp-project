import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { FiPaperclip } from "react-icons/fi"; // Import the Paperclip icon
import StarBorder from "../components/StarBorderButton";

const MainChat = ({ selectedContact, currentUser, socket }) => {
  const scrollRef = useRef();

  const [messages, setMessages] = useState("");
  const [chat, setChat] = useState([]);
  const [incomingMsg, setIncomingMsg] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  // Fetch messages for the current chat (sender and receiver)
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedContact || !selectedContact._id || !currentUser || !currentUser._id) {
        console.log("Receiver or sender is not set properly.");
        return; // Early return if either selectedContact or currentUser is not set
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/messages/getMessages/${currentUser._id}/${selectedContact._id}`,
          { withCredentials: true }
        );
        setChat(response.data); // Populate chat with fetched messages
      } catch (error) {
        console.error("Error fetching messages:", error.response?.data || error.message);
      }
    };

    fetchMessages();
  }, [currentUser, selectedContact, chat]); // Only re-run when these change

  const sendChat = async (e) => {
    e.preventDefault();
    if (!messages.trim() && !file) return;

    const formData = new FormData();
    formData.append("from", currentUser._id);
    formData.append("to", selectedContact._id);
    formData.append("message", messages);
    if (file) formData.append("file", file);

    try {
      socket.current.emit("send-msg", { from: currentUser._id, to: selectedContact._id, message: messages, file });

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
      setFilePreview(null); // Reset file preview after sending
      setChat((prevChat) => [...prevChat, response.data]);
    } catch (error) {
      console.error("Error sending message:", error.response?.data || error.message);
    }
  };

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

  // If selectedContact or currentUser is not set, show a loading or error message
  if (!selectedContact || !selectedContact._id || !currentUser || !currentUser._id) {
    return (
      <div className="flex flex-col flex-1 bg-black text-white items-center justify-center">
        <h2 className="text-xl font-bold text-cyan-400 text-center">PLEASE SELECT A CONTACT TO START CHATTING</h2>
      </div>
    );
  }

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
        setFilePreview(<audio controls className="max-w-xs" src={fileUrl} />);
      } else {
        setFilePreview(null); // No preview for unsupported file types
      }
    }
  };

  // Function to remove file preview and reset the file state
  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  return (
    <div className="flex flex-col flex-1 bg-black">
      <div className="bg-black text-white p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold text-cyan-400">{selectedContact.username}</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto bg-black text-white">
        {chat.map((msg, index) => (
          <div key={index} className={`flex mb-2 ${msg.sender === currentUser._id ? "justify-end" : "justify-start"}`}>
            {msg.message.text && (
              <div
                className={`p-3 rounded-lg max-w-xs ${
                  msg.sender === currentUser._id ? "bg-cyan-400 text-black" : "bg-gray-700 text-white"
                }`}
              >
                <p>{msg.message.text}</p>
              </div>
            )}

            {msg.message.fileUrl && (
              <div className="mt-2 ">
                {msg.message.fileType === "image" && (
                  <div className="my-0.5 mt-2 p-0.5 bg-cyan-400 rounded-lg flex justify-center items-center">
                    <img className="max-w-xs rounded-lg" src={`http://localhost:5000${msg.message.fileUrl}`} alt="Shared" />
                  </div>
                )}
                {msg.message.fileType === "video" && (
                  <div className="my-0.5 mt-2 p-0.5 bg-cyan-400 rounded-lg flex justify-center items-center">
                    <video controls className="max-w-xs rounded-lg" src={`http://localhost:5000${msg.message.fileUrl}`} />
                  </div>
                )}
                {msg.message.fileType === "audio" && (
                  <div className="flex justify-center my-0.5">
                    <audio controls className="max-w-xs" src={`http://localhost:5000${msg.message.fileUrl}`} />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Move the file preview section above the message input */}
      {filePreview && (
        <div className="p-4 bg-black border-t border-gray-700">
          <div className="mb-2 w-full text-center">
            <p className="text-cyan-400 mb-1">Selected File:</p>
            <div className="flex justify-center">
              {filePreview}
              <button
                type="button"
                className="text-red-500 ml-2"
                onClick={removeFile} // Remove file preview on click
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center p-4 bg-black border-t border-gray-700">
        <form className="inline-flex w-full" onSubmit={sendChat}>
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="fileInput" className="text-cyan-400 mr-2 cursor-pointer mt-4">
            <FiPaperclip size={24} /> {/* Icon instead of text */}
          </label>
          <input
            id="fileInput"
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            type="text"
            placeholder={`Message ${selectedContact.username}...`}
            value={messages}
            onChange={(e) => setMessages(e.target.value)} // Updates input value only
            className="flex-1 p-2 border border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 bg-black text-white placeholder-cyan-400"
          />
          <StarBorder as="button" className="custom-class ml-[2.2rem] w-[10%]" color="cyan" speed="5s">
            Send
          </StarBorder>
        </form>
      </div>
    </div>
  );
};

export default MainChat;
