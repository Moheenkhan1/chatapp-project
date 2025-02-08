import React, { useState, useEffect, useContext , useRef} from "react";
import Sidebar from "../components/Sidebar";
import MainChat from "../components/MainChat";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserDataContext } from "../Contexts/UserContext";
import { io } from 'socket.io-client'


const Home = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Access env variable

  const socket = useRef(null);

  const [selectedContact, setSelectedContact] = useState(null);
  const navigate = useNavigate();
  const { user , setUser } = useContext(UserDataContext); // Assuming user context is correctly set
  const [currentUser, setCurrentUser] = useState(null);
  const [contacts, setContacts] = useState([]); // Stores the list of contacts 

  const [showChat, setShowChat] = useState(false); // Controls sidebar/chat visibility for responsive design on phone and tab

// authorizes user and sets current user

useEffect(() => {
  const fetchUser = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/home/auth`, {}, { withCredentials: true });

      console.log(response.data)

      if (response.status === 200) {
        const userData = response.data;
        setCurrentUser(userData);
        setUser(userData); // Update UserContext
      }
    } catch (error) {
      console.error("Error fetching user:", error.response?.data || error.message);
      navigate("/login"); // Redirect if authentication fails
    }
  };

  fetchUser();
}, [navigate, setCurrentUser, setUser]);  // useEffect runs on change of any of these three


  
  // socket connection to establish logged in user
  useEffect(()=>{
    if(currentUser){
      socket.current = io(`${API_BASE_URL}`, { withCredentials: true });
      socket.current.emit("add-user",currentUser._id);
    }
  },[currentUser])


  // Initialize WebSocket connection
  useEffect(() => {
    if (!currentUser || !currentUser._id) return;

    if (!socket.current) {
      socket.current = io(`${API_BASE_URL}`, {
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 5000,
      });

      socket.current.on("connect", () => {
        console.log("Socket connected:", socket.current.id);
        socket.current.emit("add-user", currentUser._id);
      });

      // socket connection for checking online users
      socket.current.on("update-user-status", ({ userId, isOnline }) => {
        console.log(`User ${userId} is now ${isOnline ? "Online" : "Offline"}`);
      });
    }

    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, [currentUser]);

  // Fetch contacts from the server
  useEffect(() => {
    const fetchContacts = async () => {
      if (currentUser) {
        try {
          const response = await axios.get(`${API_BASE_URL}/home/contacts`, { withCredentials: true });
          setContacts(response.data.contacts);
        } catch (error) {
          console.error("Error fetching contacts:", error.response?.data || error.message);
        }
      }
    };

    fetchContacts();
  }, [currentUser]);


  return (
    <div className="flex h-screen">
      <Sidebar setSelectedContact={setSelectedContact} currentUser={currentUser} setCurrentUser={setCurrentUser} contacts={contacts} socket={socket} setShowChat={setShowChat} showChat={showChat} />
      <div className="w-[1px] bg-[#4169E1] "></div>
      <MainChat selectedContact={selectedContact} currentUser={currentUser} socket={socket} setCurrentUser={setCurrentUser} setShowChat={setShowChat} showChat={showChat} />
    </div>
  );
};

export default Home;
