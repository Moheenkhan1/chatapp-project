import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import StarBorder from '../components/StarBorderButton';
import axios from 'axios';
import { UserDataContext } from '../Contexts/UserContext';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';


const socket = io('http://localhost:5000' , { withCredentials: true } );

const MainChat = ({ selectedContact , currentUser }) => {
  const [messages, setMessages] = useState('');
  const [chat, setChat] = useState([]);
  const to = selectedContact;


  const sendChat = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/messages/addMessages',{currentUser,to,chat}, { withCredentials: true })
    socket.emit('chat', { messages });
    setMessages(''); 
    console.log(messages)
  };

  useEffect(() => {
    const handleChat = (payload) => {
      console.log('Received payload:', payload);
      setChat((prevChat) => [...prevChat, payload]);
    };
  
    // Attach the listener
    socket.on('chat', handleChat);
    
    return () => {
      socket.off('chat', handleChat);
    };
  }, []);
  


  if (!selectedContact) {
    
    return (
      <div className="flex-1 flex items-center justify-center bg-black text-white relative">
        <div className="text-center relative z-10">
          <h1 className="text-4xl font-bold text-cyan mb-4">
            Chat App Project
          </h1>
          <p className="text-lg text-cyan-400">
            Select a contact to start chatting!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-black">
      {/* Chat  */}
      <div className="bg-black text-white p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold text-cyan-400">{selectedContact}</h2>
      </div>

      {/* Chat Body */}
      <div className="flex-1 p-4 overflow-y-auto bg-cyan text-white">
        <p className="text-center text-cyan-400">
          Start chatting with {selectedContact}.
        </p>
      </div>

      {chat.map((payload, index) => (
        <div key={index}>
          <p>{payload.messages}</p>
        </div>
      ))}

      {/* Input and Send Button */}
      <div className="flex items-center p-4 bg-black border-t border-gray-700">
        <form className=" inline-flex w-full " onSubmit={sendChat} >
        <input
          type="text"
          placeholder={`Message ${selectedContact}...`}
          value={messages}
          onChange={(e) => setMessages(e.target.value)} // Updates input value only
          className="flex-1 p-2 border border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 bg-black text-white placeholder-cyan-400"
        />

        <StarBorder
            as="button"
            className="custom-class ml-[2.2rem] w-[10%] "
            color="cyan"
            speed="5s"
            //onClick=()
          >
            Send
          </StarBorder>
          </form>
      </div>
    </div>
  );
};

export default MainChat;
