import React, { useState , useEffect } from "react";
import Sidebar from "../components/Sidebar";
import MainChat from "../components/MainChat";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const [selectedContact, setSelectedContact] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await axios.post(
          'http://localhost:5000/user/home', 
          {}, 
          { withCredentials: true } 
        );
  
        if (response.status === 200) {
          navigate('/');
        }
      } catch (error) {
        console.log('Access denied:', error.message);
        if (error.response?.status === 401 || error.response?.status === 400) {
          navigate('/login');
        }
      }
    };
    checkAccess();
  }, []);
  

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <Sidebar setSelectedContact={setSelectedContact}  />
      <div className="w-[1px] bg-cyan-400"></div>
      <MainChat selectedContact={selectedContact}  />
    </div>
  );
};

export default Home;
