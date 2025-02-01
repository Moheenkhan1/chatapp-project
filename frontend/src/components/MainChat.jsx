import React, { useState, useEffect , useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import StarBorder from "../components/StarBorderButton";

// Initialize socket connection to your backend server
// const socket = io("http://localhost:5000", { withCredentials: true });

const MainChat = ({ selectedContact, currentUser , socket }) => {

  const scrollRef = useRef();

  const [messages, setMessages] = useState("");
  const [chat, setChat] = useState([]);
  const [incomingMsg, setIncomingMsg] = useState("");

  // Fetch messages for the current chat (sender and receiver)
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedContact || !selectedContact._id || !currentUser || !currentUser._id) {
        console.log("Receiver or sender is not set properly.");
        return; // Early return if either selectedContact or currentUser is not set
      }

      try {
        if(selectedContact){
          const response = await axios.get(
            `http://localhost:5000/messages/getMessages/${currentUser._id}/${selectedContact._id}`,
            { withCredentials: true }
          );
          setChat(response.data); // Populate chat with fetched messages

        }
      } catch (error) {
        console.error("Error fetching messages:", error.response?.data || error.message);
      }
    };

    fetchMessages();
  }, [currentUser, selectedContact,chat]); // Only re-run when these change

  const sendChat = async (e) => {
    e.preventDefault();
    if (!messages.trim()) return;

    if (!selectedContact || !selectedContact._id) {
      console.error("Receiver is not selected.");
      return; // Prevent sending if selectedContact is not set
    }

    const newMessage = {
      from: currentUser._id,
      to: selectedContact._id,
      message: messages,
    };

    console.log("Sending message:", newMessage); // Log to debug the values

    try {
      // Emit the message to the server via socket
      socket.current.emit("send-msg", newMessage);

      // Save the message to the backend
      await axios.post("http://localhost:5000/messages/addMessages", newMessage, { withCredentials: true });
      setMessages(""); // Clear the input field
    } catch (error) {
      console.error("Error sending message:", error.response?.data || error.message);
    }
  };

  useEffect(()=>{
    if(socket.current){
      socket.current.on("msg-receive",(msg)=>{
        setIncomingMsg({fromSelf:false,message:msg});
      });
    }
  },[]);

  useEffect(()=>{
    incomingMsg && setChat((prev)=>[...prev,incomingMsg]);
  },[incomingMsg]);

  useEffect(()=>{
    scrollRef.current?.scrollIntoView({behavior:"smooth"});
  },[chat]);

  // If selectedContact or currentUser is not set, show a loading or error message
  if (!selectedContact || !selectedContact._id || !currentUser || !currentUser._id) {
    return (
      <div className="flex flex-col flex-1 bg-black text-white">
        <h2 className="text-lg font-bold text-cyan-400">Please select a contact to start chatting.</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-black">
      <div className="bg-black text-white p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold text-cyan-400">{selectedContact.username}</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto bg-cyan text-white">
        {chat.map((msg, index) => (
          <div key={index} className={msg.sender === currentUser._id ? "text-right" : "text-left"}>
            <p className="p-2 bg-gray-800 inline-block rounded-lg">{msg.message.text}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center p-4 bg-black border-t border-gray-700">
        <form className="inline-flex w-full" onSubmit={sendChat}>
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
